import Bull from 'bull';
import { PostJobData } from './manager';

export interface DeadLetterEntry {
  id: string;
  jobId: string;
  platform: string;
  data: PostJobData;
  error: {
    message: string;
    code?: string;
    stack?: string;
    attempts: number;
    lastAttempt: Date;
  };
  metadata: {
    addedAt: Date;
    retryCount: number;
    manualRetryAllowed: boolean;
    notes?: string;
  };
}

export interface DeadLetterStats {
  total: number;
  byPlatform: Record<string, number>;
  byError: Record<string, number>;
  oldestEntry: Date | null;
  retryableCount: number;
}

export class DeadLetterQueue {
  private entries: Map<string, DeadLetterEntry> = new Map();
  private maxSize: number = 1000;
  private retentionPeriod: number = 7 * 24 * 60 * 60 * 1000; // 7日間

  // 失敗したジョブを追加
  add(
    job: Bull.Job<PostJobData>,
    error: Error,
    attempts: number
  ): DeadLetterEntry {
    const entry: DeadLetterEntry = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: job.id.toString(),
      platform: job.data.platform,
      data: job.data,
      error: {
        message: error.message,
        code: (error as any).code,
        stack: error.stack,
        attempts,
        lastAttempt: new Date()
      },
      metadata: {
        addedAt: new Date(),
        retryCount: 0,
        manualRetryAllowed: this.isRetryable(error)
      }
    };

    // サイズ制限チェック
    if (this.entries.size >= this.maxSize) {
      this.removeOldest();
    }

    this.entries.set(entry.id, entry);
    this.cleanup();
    
    return entry;
  }

  // 手動リトライ可能かチェック
  private isRetryable(error: Error): boolean {
    const nonRetryableErrors = [
      'INVALID_CREDENTIALS',
      'ACCOUNT_SUSPENDED',
      'CONTENT_POLICY_VIOLATION',
      'INVALID_MEDIA_FORMAT'
    ];

    return !nonRetryableErrors.includes((error as any).code || '');
  }

  // エントリを取得
  get(id: string): DeadLetterEntry | undefined {
    return this.entries.get(id);
  }

  // 全エントリを取得
  getAll(filter?: {
    platform?: string;
    retryable?: boolean;
    since?: Date;
  }): DeadLetterEntry[] {
    let entries = Array.from(this.entries.values());

    if (filter) {
      if (filter.platform) {
        entries = entries.filter(e => e.platform === filter.platform);
      }
      if (filter.retryable !== undefined) {
        entries = entries.filter(e => e.metadata.manualRetryAllowed === filter.retryable);
      }
      if (filter.since) {
        entries = entries.filter(e => e.metadata.addedAt >= filter.since);
      }
    }

    return entries.sort((a, b) => 
      b.metadata.addedAt.getTime() - a.metadata.addedAt.getTime()
    );
  }

  // エントリを削除
  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  // 手動リトライを記録
  recordRetry(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.metadata.retryCount++;
      entry.error.lastAttempt = new Date();
      
      // 3回以上手動リトライした場合は無効化
      if (entry.metadata.retryCount >= 3) {
        entry.metadata.manualRetryAllowed = false;
      }
    }
  }

  // ノートを追加
  addNote(id: string, note: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.metadata.notes = (entry.metadata.notes || '') + '\n' + 
        `[${new Date().toISOString()}] ${note}`;
    }
  }

  // 統計情報を取得
  getStats(): DeadLetterStats {
    const stats: DeadLetterStats = {
      total: this.entries.size,
      byPlatform: {},
      byError: {},
      oldestEntry: null,
      retryableCount: 0
    };

    let oldestTime = Date.now();

    this.entries.forEach(entry => {
      // プラットフォーム別
      stats.byPlatform[entry.platform] = 
        (stats.byPlatform[entry.platform] || 0) + 1;

      // エラー別
      const errorKey = entry.error.code || 'UNKNOWN';
      stats.byError[errorKey] = (stats.byError[errorKey] || 0) + 1;

      // リトライ可能数
      if (entry.metadata.manualRetryAllowed) {
        stats.retryableCount++;
      }

      // 最古エントリ
      const entryTime = entry.metadata.addedAt.getTime();
      if (entryTime < oldestTime) {
        oldestTime = entryTime;
        stats.oldestEntry = entry.metadata.addedAt;
      }
    });

    return stats;
  }

  // 古いエントリをクリーンアップ
  private cleanup(): void {
    const cutoffTime = Date.now() - this.retentionPeriod;
    
    for (const [id, entry] of this.entries) {
      if (entry.metadata.addedAt.getTime() < cutoffTime) {
        this.entries.delete(id);
      }
    }
  }

  // 最も古いエントリを削除
  private removeOldest(): void {
    let oldestId: string | null = null;
    let oldestTime = Date.now();

    for (const [id, entry] of this.entries) {
      if (entry.metadata.addedAt.getTime() < oldestTime) {
        oldestTime = entry.metadata.addedAt.getTime();
        oldestId = id;
      }
    }

    if (oldestId) {
      this.entries.delete(oldestId);
    }
  }

  // エクスポート（デバッグ/分析用）
  export(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      entries: Array.from(this.entries.values()),
      stats: this.getStats()
    };

    return JSON.stringify(data, null, 2);
  }

  // インポート（復元用）
  import(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.entries && Array.isArray(data.entries)) {
        this.entries.clear();
        
        data.entries.forEach((entry: any) => {
          // 日付を復元
          entry.error.lastAttempt = new Date(entry.error.lastAttempt);
          entry.metadata.addedAt = new Date(entry.metadata.addedAt);
          
          this.entries.set(entry.id, entry);
        });
        
        this.cleanup();
      }
    } catch (error) {
      console.error('Failed to import dead letter queue data:', error);
      throw new Error('Invalid import data format');
    }
  }

  // バッチ処理用：リトライ可能なエントリを取得
  getBatchForRetry(limit: number = 10): DeadLetterEntry[] {
    return this.getAll({ retryable: true }).slice(0, limit);
  }

  // パターン分析：よくある失敗パターンを検出
  analyzePatterns(): Array<{
    pattern: string;
    count: number;
    platforms: string[];
    recommendation: string;
  }> {
    const patterns: Map<string, {
      count: number;
      platforms: Set<string>;
    }> = new Map();

    this.entries.forEach(entry => {
      const key = entry.error.code || entry.error.message.split(' ')[0];
      
      if (!patterns.has(key)) {
        patterns.set(key, {
          count: 0,
          platforms: new Set()
        });
      }
      
      const pattern = patterns.get(key)!;
      pattern.count++;
      pattern.platforms.add(entry.platform);
    });

    // 推奨事項を生成
    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        platforms: Array.from(data.platforms),
        recommendation: this.getRecommendation(pattern, data.count)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // パターンに基づく推奨事項
  private getRecommendation(pattern: string, count: number): string {
    const recommendations: Record<string, string> = {
      'RATE_LIMIT': 'Consider implementing better rate limiting or upgrading API tier',
      'TOKEN_EXPIRED': 'Implement automatic token refresh mechanism',
      'NETWORK_ERROR': 'Add network resilience with retries and timeouts',
      'INVALID_MEDIA': 'Validate media before attempting to post',
      'CONTENT_POLICY': 'Review content guidelines and add pre-validation'
    };

    return recommendations[pattern] || 
      (count > 10 ? 'Investigate root cause - high failure rate detected' : 
       'Monitor for patterns');
  }
}

// シングルトンインスタンス
export const deadLetterQueue = new DeadLetterQueue();