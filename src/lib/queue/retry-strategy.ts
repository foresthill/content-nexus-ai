import { Job } from 'bull';

export interface RetryStrategy {
  maxRetries: number;
  backoffType: 'fixed' | 'exponential' | 'linear' | 'fibonacci';
  backoffDelay: number;
  shouldRetry: (error: any, attemptNumber: number) => boolean;
  onRetry?: (error: any, attemptNumber: number) => void;
}

export interface PlatformRetryConfig {
  twitter: RetryStrategy;
  instagram: RetryStrategy;
  tiktok: RetryStrategy;
}

// プラットフォーム別のリトライ戦略
export const platformRetryStrategies: PlatformRetryConfig = {
  twitter: {
    maxRetries: 5,
    backoffType: 'exponential',
    backoffDelay: 5000, // 5秒から開始
    shouldRetry: (error, attempt) => {
      // レート制限の場合は必ずリトライ
      if (error.code === 'RATE_LIMIT' || error.response?.status === 429) {
        return attempt <= 5;
      }
      // ネットワークエラーはリトライ
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return attempt <= 3;
      }
      // 認証エラーはリトライしない
      if (error.response?.status === 401) {
        return false;
      }
      // その他のエラーは3回まで
      return attempt <= 3;
    },
    onRetry: (error, attempt) => {
      console.log(`Twitter retry attempt ${attempt}:`, error.message);
    }
  },
  
  instagram: {
    maxRetries: 4,
    backoffType: 'exponential',
    backoffDelay: 10000, // 10秒から開始（Instagramは厳しいレート制限）
    shouldRetry: (error, attempt) => {
      // トークン期限切れはリフレッシュ後1回だけリトライ
      if (error.code === 'TOKEN_EXPIRED') {
        return attempt === 1;
      }
      // レート制限
      if (error.response?.status === 429) {
        return attempt <= 4;
      }
      // API一時的エラー
      if (error.response?.status >= 500) {
        return attempt <= 3;
      }
      return attempt <= 2;
    }
  },
  
  tiktok: {
    maxRetries: 6,
    backoffType: 'fibonacci',
    backoffDelay: 3000, // 3秒から開始
    shouldRetry: (error, attempt) => {
      // トークンリフレッシュが必要
      if (error.code === 'TOKEN_REFRESH_NEEDED') {
        return attempt === 1;
      }
      // 動画処理中は長めに待つ
      if (error.message?.includes('processing')) {
        return attempt <= 6;
      }
      // レート制限
      if (error.response?.status === 429) {
        return attempt <= 4;
      }
      return attempt <= 3;
    }
  }
};

// バックオフ時間を計算
export function calculateBackoff(
  strategy: RetryStrategy,
  attemptNumber: number
): number {
  const { backoffType, backoffDelay } = strategy;
  
  switch (backoffType) {
    case 'fixed':
      return backoffDelay;
      
    case 'exponential':
      return backoffDelay * Math.pow(2, attemptNumber - 1);
      
    case 'linear':
      return backoffDelay * attemptNumber;
      
    case 'fibonacci':
      return fibonacciBackoff(backoffDelay, attemptNumber);
      
    default:
      return backoffDelay;
  }
}

// フィボナッチ数列によるバックオフ
function fibonacciBackoff(baseDelay: number, n: number): number {
  if (n <= 1) return baseDelay;
  if (n === 2) return baseDelay * 2;
  
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return baseDelay * b;
}

// Smart Retry Manager
export class SmartRetryManager {
  private failureHistory: Map<string, FailureRecord[]> = new Map();
  private adaptiveStrategies: Map<string, RetryStrategy> = new Map();

  // 失敗履歴を記録
  recordFailure(platform: string, error: any, context: any) {
    const key = `${platform}:${error.code || error.message}`;
    const history = this.failureHistory.get(key) || [];
    
    history.push({
      timestamp: Date.now(),
      error: error.code || error.message,
      context,
      resolved: false
    });
    
    // 直近100件のみ保持
    if (history.length > 100) {
      history.shift();
    }
    
    this.failureHistory.set(key, history);
    this.adaptStrategy(platform, key);
  }

  // 成功を記録
  recordSuccess(platform: string, errorType: string) {
    const key = `${platform}:${errorType}`;
    const history = this.failureHistory.get(key);
    
    if (history && history.length > 0) {
      history[history.length - 1].resolved = true;
    }
  }

  // 戦略を適応的に調整
  private adaptStrategy(platform: string, key: string) {
    const history = this.failureHistory.get(key) || [];
    const recentFailures = history.filter(
      f => Date.now() - f.timestamp < 3600000 // 1時間以内
    );
    
    const baseStrategy = platformRetryStrategies[platform as keyof PlatformRetryConfig];
    if (!baseStrategy) return;
    
    // 失敗率が高い場合は戦略を調整
    if (recentFailures.length > 10) {
      const adaptedStrategy: RetryStrategy = {
        ...baseStrategy,
        maxRetries: Math.max(baseStrategy.maxRetries - 1, 1),
        backoffDelay: baseStrategy.backoffDelay * 1.5
      };
      
      this.adaptiveStrategies.set(platform, adaptedStrategy);
    }
  }

  // 最適な戦略を取得
  getStrategy(platform: string): RetryStrategy {
    return this.adaptiveStrategies.get(platform) || 
           platformRetryStrategies[platform as keyof PlatformRetryConfig] ||
           defaultRetryStrategy;
  }

  // 失敗パターン分析
  analyzeFailurePatterns(): FailureAnalysis {
    const patterns: FailureAnalysis = {
      byPlatform: {},
      byError: {},
      recommendations: []
    };

    this.failureHistory.forEach((history, key) => {
      const [platform, error] = key.split(':');
      
      if (!patterns.byPlatform[platform]) {
        patterns.byPlatform[platform] = { total: 0, resolved: 0 };
      }
      
      if (!patterns.byError[error]) {
        patterns.byError[error] = { total: 0, platforms: new Set() };
      }
      
      patterns.byPlatform[platform].total += history.length;
      patterns.byPlatform[platform].resolved += history.filter(h => h.resolved).length;
      
      patterns.byError[error].total += history.length;
      patterns.byError[error].platforms.add(platform);
    });

    // 推奨事項を生成
    Object.entries(patterns.byError).forEach(([error, data]) => {
      if (data.total > 20) {
        patterns.recommendations.push({
          error,
          severity: 'high',
          suggestion: `Error "${error}" is occurring frequently across ${data.platforms.size} platforms. Consider implementing specific handling.`
        });
      }
    });

    return patterns;
  }
}

// デフォルトのリトライ戦略
const defaultRetryStrategy: RetryStrategy = {
  maxRetries: 3,
  backoffType: 'exponential',
  backoffDelay: 1000,
  shouldRetry: (error, attempt) => attempt <= 3
};

// 型定義
interface FailureRecord {
  timestamp: number;
  error: string;
  context: any;
  resolved: boolean;
}

interface FailureAnalysis {
  byPlatform: Record<string, { total: number; resolved: number }>;
  byError: Record<string, { total: number; platforms: Set<string> }>;
  recommendations: Array<{
    error: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;
}

// シングルトンインスタンス
export const smartRetryManager = new SmartRetryManager();