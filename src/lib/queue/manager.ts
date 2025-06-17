import Bull from 'bull';
import { Redis } from 'ioredis';

export interface PostJobData {
  id: string;
  platform: 'twitter' | 'instagram' | 'tiktok';
  content: {
    text?: string;
    mediaUrls?: string[];
    caption?: string;
    hashtags?: string[];
  };
  scheduledAt?: Date;
  userId: string;
  credentials: {
    accessToken: string;
    accessTokenSecret?: string;
    refreshToken?: string;
    openId?: string;
  };
  metadata?: any;
}

export interface JobResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
  timestamp: Date;
}

export class QueueManager {
  private postQueue: Bull.Queue<PostJobData>;
  private retryQueue: Bull.Queue<PostJobData>;
  private redis: Redis | null = null;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // 投稿キュー
    this.postQueue = new Bull('post-queue', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });

    // リトライ専用キュー
    this.retryQueue = new Bull('retry-queue', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 10,
        attempts: 5,
        backoff: {
          type: 'custom',
          delay: this.calculateRetryDelay
        }
      }
    });
  }

  // カスタムリトライ遅延計算（Smart Retry Engine）
  private calculateRetryDelay(attemptsMade: number, error: any): number {
    // エラーの種類に基づいて遅延を調整
    if (error?.code === 'RATE_LIMIT') {
      return 60000 * attemptsMade; // レート制限: 1分 × 試行回数
    } else if (error?.code === 'MAINTENANCE') {
      return 300000; // メンテナンス: 5分固定
    } else {
      // デフォルト: 指数バックオフ
      return Math.min(300000, Math.pow(2, attemptsMade) * 1000);
    }
  }

  // ジョブの追加
  async addPost(jobData: PostJobData): Promise<Bull.Job<PostJobData>> {
    const options: Bull.JobOptions = {};

    // スケジュール投稿の場合
    if (jobData.scheduledAt) {
      const delay = new Date(jobData.scheduledAt).getTime() - Date.now();
      if (delay > 0) {
        options.delay = delay;
      }
    }

    // プライオリティ設定
    options.priority = this.getPriority(jobData.platform);

    return await this.postQueue.add(jobData, options);
  }

  // バッチジョブの追加
  async addBatchPosts(jobDataArray: PostJobData[]): Promise<Bull.Job<PostJobData>[]> {
    const jobs = jobDataArray.map(jobData => ({
      data: jobData,
      opts: {
        priority: this.getPriority(jobData.platform),
        delay: jobData.scheduledAt 
          ? new Date(jobData.scheduledAt).getTime() - Date.now()
          : 0
      }
    }));

    return await this.postQueue.addBulk(jobs);
  }

  // プラットフォーム別の優先度
  private getPriority(platform: string): number {
    const priorities = {
      twitter: 1,
      instagram: 2,
      tiktok: 3
    };
    return priorities[platform as keyof typeof priorities] || 4;
  }

  // ジョブの状態を取得
  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    result?: JobResult;
    error?: string;
  }> {
    const job = await this.postQueue.getJob(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    const status = await job.getState();
    const progress = job.progress();
    
    return {
      status,
      progress: typeof progress === 'number' ? progress : 0,
      result: job.returnvalue,
      error: job.failedReason
    };
  }

  // 待機中のジョブ一覧
  async getPendingJobs(limit: number = 10): Promise<Bull.Job<PostJobData>[]> {
    return await this.postQueue.getWaiting(0, limit);
  }

  // アクティブなジョブ一覧
  async getActiveJobs(): Promise<Bull.Job<PostJobData>[]> {
    return await this.postQueue.getActive();
  }

  // 完了したジョブ一覧
  async getCompletedJobs(limit: number = 10): Promise<Bull.Job<PostJobData>[]> {
    return await this.postQueue.getCompleted(0, limit);
  }

  // 失敗したジョブ一覧
  async getFailedJobs(limit: number = 10): Promise<Bull.Job<PostJobData>[]> {
    return await this.postQueue.getFailed(0, limit);
  }

  // ジョブのキャンセル
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.postQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  // スケジュールの更新
  async updateSchedule(jobId: string, newScheduledAt: Date): Promise<void> {
    const job = await this.postQueue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // 既存のジョブをキャンセル
    await job.remove();

    // 新しいスケジュールで再追加
    const jobData = job.data;
    jobData.scheduledAt = newScheduledAt;
    await this.addPost(jobData);
  }

  // キューの統計情報
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.postQueue.getWaitingCount(),
      this.postQueue.getActiveCount(),
      this.postQueue.getCompletedCount(),
      this.postQueue.getFailedCount(),
      this.postQueue.getDelayedCount()
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  // キューのクリーンアップ
  async cleanQueues(olderThan: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const grace = Date.now() - olderThan;
    
    await Promise.all([
      this.postQueue.clean(grace, 'completed'),
      this.postQueue.clean(grace, 'failed'),
      this.retryQueue.clean(grace, 'completed'),
      this.retryQueue.clean(grace, 'failed')
    ]);
  }

  // 失敗したジョブのリトライ
  async retryFailedJob(jobId: string): Promise<Bull.Job<PostJobData>> {
    const job = await this.postQueue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const state = await job.getState();
    if (state !== 'failed') {
      throw new Error('Job is not in failed state');
    }

    // リトライキューに追加
    return await this.retryQueue.add(job.data, {
      priority: 0 // リトライは最高優先度
    });
  }

  // キューのパージ（全削除）
  async purgeQueue(queueName: 'post' | 'retry' = 'post'): Promise<void> {
    const queue = queueName === 'post' ? this.postQueue : this.retryQueue;
    await queue.empty();
  }

  // グレースフルシャットダウン
  async close(): Promise<void> {
    await Promise.all([
      this.postQueue.close(),
      this.retryQueue.close()
    ]);
  }
}