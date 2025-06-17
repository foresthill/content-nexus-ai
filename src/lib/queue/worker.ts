import Bull from 'bull';
import { PostJobData } from './manager';
import { processPost } from './processors';
import { WebhookManager, WebhookEventType } from '../webhooks/manager';
import { ErrorHandler } from '../errors/handler';

const webhookManager = new WebhookManager();

// ワーカープロセスの初期化と開始
export function startWorker() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // 投稿キューのワーカー
  const postQueue = new Bull<PostJobData>('post-queue', redisUrl);
  
  // ジョブの処理
  postQueue.process(5, async (job) => {
    console.log(`Processing job ${job.id} for platform ${job.data.platform}`);
    
    try {
      const result = await processPost(job);
      
      // 成功時のWebhook送信
      await webhookManager.sendEvent(
        WebhookManager.createEvent(
          WebhookEventType.POST_PUBLISHED,
          job.data.platform,
          {
            jobId: job.id,
            postId: result.postId,
            userId: job.data.userId,
            content: job.data.content,
            publishedAt: result.timestamp
          }
        )
      );
      
      return result;
    } catch (error) {
      const appError = ErrorHandler.classify(error, job.data.platform);
      console.error(ErrorHandler.formatErrorLog(appError));
      
      // 失敗時のWebhook送信
      await webhookManager.sendEvent(
        WebhookManager.createEvent(
          WebhookEventType.POST_FAILED,
          job.data.platform,
          {
            jobId: job.id,
            userId: job.data.userId,
            content: job.data.content,
            error: {
              code: appError.code,
              message: appError.message,
              isRetryable: appError.isRetryable
            },
            failedAt: new Date()
          }
        )
      );
      
      throw appError;
    }
  });
  
  // イベントリスナー
  postQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });
  
  postQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });
  
  postQueue.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
  });
  
  postQueue.on('stalled', (job) => {
    console.warn(`Job ${job.id} stalled`);
  });
  
  // グレースフルシャットダウン
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing queue...');
    await postQueue.close();
    process.exit(0);
  });
  
  console.log('Worker started successfully');
}