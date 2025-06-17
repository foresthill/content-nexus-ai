import { AppError, ErrorCode } from './handler';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onRetry?: (error: AppError, attempt: number) => void;
}

export class RetryManager {
  private static defaultOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true
  };

  // 指数バックオフでリトライ
  static async withExponentialBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: AppError;

    for (let attempt = 1; attempt <= opts.maxAttempts!; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as AppError;

        // リトライ不可能なエラーの場合は即座に失敗
        if (!this.isRetryable(lastError)) {
          throw lastError;
        }

        // 最後の試行の場合
        if (attempt === opts.maxAttempts) {
          throw lastError;
        }

        // リトライコールバック
        if (opts.onRetry) {
          opts.onRetry(lastError, attempt);
        }

        // 遅延時間の計算
        const delay = this.calculateDelay(lastError, attempt, opts);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  // Circuit Breakerパターンの実装
  static createCircuitBreaker(threshold: number = 5, resetTime: number = 60000) {
    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return {
      async execute<T>(fn: () => Promise<T>): Promise<T> {
        // Circuit が開いている場合
        if (isOpen) {
          if (Date.now() - lastFailureTime > resetTime) {
            // リセット時間が経過したら半開状態に
            isOpen = false;
            failures = 0;
          } else {
            throw new Error('Circuit breaker is open');
          }
        }

        try {
          const result = await fn();
          // 成功したらカウンターをリセット
          failures = 0;
          return result;
        } catch (error) {
          failures++;
          lastFailureTime = Date.now();

          if (failures >= threshold) {
            isOpen = true;
          }

          throw error;
        }
      },

      getState(): 'closed' | 'open' | 'half-open' {
        if (isOpen) {
          return Date.now() - lastFailureTime > resetTime ? 'half-open' : 'open';
        }
        return 'closed';
      },

      reset(): void {
        failures = 0;
        isOpen = false;
        lastFailureTime = 0;
      }
    };
  }

  // エラーがリトライ可能かどうかを判定
  private static isRetryable(error: AppError): boolean {
    // 明示的にリトライ可能とマークされている場合
    if (error.isRetryable !== undefined) {
      return error.isRetryable;
    }

    // エラーコードによる判定
    const retryableCodes = [
      ErrorCode.RATE_LIMIT,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT,
      ErrorCode.API_ERROR,
      ErrorCode.PLATFORM_MAINTENANCE,
      ErrorCode.MEDIA_UPLOAD_FAILED
    ];

    return retryableCodes.includes(error.code);
  }

  // 遅延時間の計算
  private static calculateDelay(
    error: AppError,
    attempt: number,
    options: RetryOptions
  ): number {
    let delay: number;

    // エラーに具体的なリトライ時間が指定されている場合
    if (error.retryAfter) {
      delay = error.retryAfter;
    } else {
      // 指数バックオフ
      delay = Math.min(
        options.initialDelay! * Math.pow(options.backoffMultiplier!, attempt - 1),
        options.maxDelay!
      );
    }

    // ジッターの追加（リトライの同期を防ぐ）
    if (options.jitter) {
      const jitterRange = delay * 0.2;
      delay += Math.random() * jitterRange - jitterRange / 2;
    }

    return Math.max(delay, 0);
  }

  // スリープ関数
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // プラットフォーム別のリトライ戦略
  static getRetryStrategy(platform: string): RetryOptions {
    switch (platform) {
      case 'twitter':
        return {
          maxAttempts: 3,
          initialDelay: 5000,
          maxDelay: 300000, // 5分
          backoffMultiplier: 2
        };
      
      case 'instagram':
        return {
          maxAttempts: 5,
          initialDelay: 10000,
          maxDelay: 600000, // 10分
          backoffMultiplier: 1.5
        };
      
      case 'tiktok':
        return {
          maxAttempts: 4,
          initialDelay: 3000,
          maxDelay: 180000, // 3分
          backoffMultiplier: 3
        };
      
      default:
        return this.defaultOptions;
    }
  }

  // バルクヘッドパターン（リソース隔離）
  static createBulkhead(maxConcurrent: number = 10) {
    let running = 0;
    const queue: Array<() => void> = [];

    return {
      async execute<T>(fn: () => Promise<T>): Promise<T> {
        // 同時実行数が上限に達している場合は待機
        if (running >= maxConcurrent) {
          await new Promise<void>(resolve => {
            queue.push(resolve);
          });
        }

        running++;

        try {
          return await fn();
        } finally {
          running--;
          
          // 待機中のタスクがあれば実行
          const next = queue.shift();
          if (next) {
            next();
          }
        }
      },

      getStats() {
        return {
          running,
          queued: queue.length,
          available: maxConcurrent - running
        };
      }
    };
  }
}