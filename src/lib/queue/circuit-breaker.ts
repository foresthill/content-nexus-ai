export enum CircuitState {
  CLOSED = 'CLOSED',      // 正常動作中
  OPEN = 'OPEN',          // 遮断中
  HALF_OPEN = 'HALF_OPEN' // テスト中
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // 失敗回数の閾値
  resetTimeout: number;          // リセットまでの時間（ミリ秒）
  monitoringPeriod: number;      // 監視期間（ミリ秒）
  halfOpenRequests: number;      // HALF_OPEN状態での許可リクエスト数
  onStateChange?: (oldState: CircuitState, newState: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenRequestCount: number = 0;
  private stateChangeTime: number = Date.now();
  
  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  // 実行を試みる
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    // 状態を確認
    this.checkState();
    
    if (this.state === CircuitState.OPEN) {
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit breaker is OPEN for ${this.name}`);
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenRequestCount >= this.config.halfOpenRequests) {
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker is testing, please retry later`);
      }
      this.halfOpenRequestCount++;
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  // 成功時の処理
  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      // HALF_OPEN状態で全リクエストが成功したら復旧
      if (this.successCount >= this.config.halfOpenRequests) {
        this.setState(CircuitState.CLOSED);
        this.reset();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // 監視期間外の失敗はリセット
      if (Date.now() - this.lastFailureTime > this.config.monitoringPeriod) {
        this.failureCount = 0;
      }
    }
  }

  // 失敗時の処理
  private onFailure() {
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      // HALF_OPEN状態で失敗したら即座にOPENに戻る
      this.setState(CircuitState.OPEN);
      this.reset();
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      
      // 閾値を超えたらOPENにする
      if (this.failureCount >= this.config.failureThreshold) {
        this.setState(CircuitState.OPEN);
      }
    }
  }

  // 状態をチェックして必要に応じて変更
  private checkState() {
    if (
      this.state === CircuitState.OPEN &&
      Date.now() - this.stateChangeTime >= this.config.resetTimeout
    ) {
      // タイムアウト後にHALF_OPENに移行
      this.setState(CircuitState.HALF_OPEN);
      this.halfOpenRequestCount = 0;
      this.successCount = 0;
    }
  }

  // 状態を変更
  private setState(newState: CircuitState) {
    const oldState = this.state;
    this.state = newState;
    this.stateChangeTime = Date.now();
    
    if (this.config.onStateChange && oldState !== newState) {
      this.config.onStateChange(oldState, newState);
    }
    
    console.log(`Circuit breaker ${this.name}: ${oldState} -> ${newState}`);
  }

  // カウンターをリセット
  private reset() {
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenRequestCount = 0;
  }

  // 現在の状態を取得
  getState(): CircuitState {
    this.checkState();
    return this.state;
  }

  // 統計情報を取得
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      stateChangeTime: this.stateChangeTime,
      uptime: this.state === CircuitState.CLOSED 
        ? Date.now() - this.stateChangeTime 
        : 0
    };
  }

  // 手動でリセット
  manualReset() {
    this.setState(CircuitState.CLOSED);
    this.reset();
  }

  // 手動で遮断
  manualOpen() {
    this.setState(CircuitState.OPEN);
  }
}

// プラットフォーム別のCircuit Breaker設定
export const platformCircuitConfigs: Record<string, CircuitBreakerConfig> = {
  twitter: {
    failureThreshold: 5,        // 5回失敗で遮断
    resetTimeout: 60000,        // 1分後に再試行
    monitoringPeriod: 300000,   // 5分間の監視
    halfOpenRequests: 3,        // テスト時は3リクエストまで
    onStateChange: (old, next) => {
      console.log(`Twitter circuit: ${old} -> ${next}`);
    }
  },
  
  instagram: {
    failureThreshold: 3,        // 3回失敗で遮断（厳しめ）
    resetTimeout: 120000,       // 2分後に再試行
    monitoringPeriod: 600000,   // 10分間の監視
    halfOpenRequests: 2,        // テスト時は2リクエストまで
  },
  
  tiktok: {
    failureThreshold: 7,        // 7回失敗で遮断（緩め）
    resetTimeout: 90000,        // 1.5分後に再試行
    monitoringPeriod: 300000,   // 5分間の監視
    halfOpenRequests: 4,        // テスト時は4リクエストまで
  }
};

// Circuit Breaker Manager
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();
  
  // Circuit Breakerを取得または作成
  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breakerConfig = config || platformCircuitConfigs[name] || {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 300000,
        halfOpenRequests: 3
      };
      
      this.breakers.set(name, new CircuitBreaker(name, breakerConfig));
    }
    
    return this.breakers.get(name)!;
  }

  // 全てのCircuit Breakerの状態を取得
  getAllStats() {
    const stats: Record<string, any> = {};
    
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    
    return stats;
  }

  // ヘルスチェック
  isHealthy(platform?: string): boolean {
    if (platform) {
      const breaker = this.breakers.get(platform);
      return !breaker || breaker.getState() === CircuitState.CLOSED;
    }
    
    // 全プラットフォームをチェック
    for (const [, breaker] of this.breakers) {
      if (breaker.getState() !== CircuitState.CLOSED) {
        return false;
      }
    }
    
    return true;
  }

  // 特定のプラットフォームをリセット
  resetPlatform(platform: string) {
    const breaker = this.breakers.get(platform);
    if (breaker) {
      breaker.manualReset();
    }
  }

  // 全てリセット
  resetAll() {
    this.breakers.forEach(breaker => breaker.manualReset());
  }
}

// シングルトンインスタンス
export const circuitBreakerManager = new CircuitBreakerManager();