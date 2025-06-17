import crypto from 'crypto';
import axios from 'axios';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  platform: string;
  timestamp: Date;
  data: any;
  signature?: string;
}

export enum WebhookEventType {
  POST_PUBLISHED = 'post.published',
  POST_FAILED = 'post.failed',
  POST_SCHEDULED = 'post.scheduled',
  POST_UPDATED = 'post.updated',
  POST_DELETED = 'post.deleted',
  MEDIA_UPLOADED = 'media.uploaded',
  MEDIA_FAILED = 'media.failed',
  AUTH_SUCCESS = 'auth.success',
  AUTH_FAILED = 'auth.failed',
  AUTH_REVOKED = 'auth.revoked',
  QUEUE_STATUS = 'queue.status'
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  headers?: Record<string, string>;
  retryConfig?: {
    maxAttempts: number;
    initialDelay: number;
  };
}

export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map();

  // Webhookの登録
  registerWebhook(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config);
  }

  // Webhookの削除
  unregisterWebhook(id: string): boolean {
    return this.webhooks.delete(id);
  }

  // イベントの送信
  async sendEvent(event: WebhookEvent): Promise<void> {
    const activeWebhooks = Array.from(this.webhooks.values())
      .filter(webhook => webhook.active && webhook.events.includes(event.type));

    await Promise.allSettled(
      activeWebhooks.map(webhook => this.sendToWebhook(webhook, event))
    );
  }

  // 個別のWebhookへの送信
  private async sendToWebhook(
    webhook: WebhookConfig,
    event: WebhookEvent
  ): Promise<void> {
    const payload = this.preparePayload(event);
    const signature = this.generateSignature(payload, webhook.secret);

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event.type,
      'X-Webhook-Platform': event.platform,
      ...webhook.headers
    };

    const retryConfig = webhook.retryConfig || {
      maxAttempts: 3,
      initialDelay: 1000
    };

    await this.sendWithRetry(
      webhook.url,
      payload,
      headers,
      retryConfig
    );
  }

  // ペイロードの準備
  private preparePayload(event: WebhookEvent): string {
    const payload = {
      id: event.id,
      type: event.type,
      platform: event.platform,
      timestamp: event.timestamp.toISOString(),
      data: event.data
    };

    return JSON.stringify(payload);
  }

  // 署名の生成
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // リトライ付き送信
  private async sendWithRetry(
    url: string,
    payload: string,
    headers: Record<string, string>,
    retryConfig: { maxAttempts: number; initialDelay: number }
  ): Promise<void> {
    let lastError: any;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const response = await axios.post(url, payload, {
          headers,
          timeout: 30000,
          validateStatus: (status) => status < 500
        });

        if (response.status >= 200 && response.status < 300) {
          return;
        }

        throw new Error(`Webhook failed with status ${response.status}`);
      } catch (error) {
        lastError = error;

        if (attempt < retryConfig.maxAttempts) {
          const delay = retryConfig.initialDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('Webhook delivery failed after retries:', lastError);
  }

  // イベントファクトリー
  static createEvent(
    type: WebhookEventType,
    platform: string,
    data: any
  ): WebhookEvent {
    return {
      id: crypto.randomUUID(),
      type,
      platform,
      timestamp: new Date(),
      data
    };
  }

  // 署名の検証（受信側で使用）
  static verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // バッチイベント送信
  async sendBatchEvents(events: WebhookEvent[]): Promise<void> {
    // イベントをタイプ別にグループ化
    const groupedEvents = events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = [];
      }
      acc[event.type].push(event);
      return acc;
    }, {} as Record<WebhookEventType, WebhookEvent[]>);

    // 各グループを並列で送信
    await Promise.allSettled(
      Object.entries(groupedEvents).map(([type, typeEvents]) => {
        const batchEvent: WebhookEvent = {
          id: crypto.randomUUID(),
          type: type as WebhookEventType,
          platform: 'batch',
          timestamp: new Date(),
          data: {
            events: typeEvents,
            count: typeEvents.length
          }
        };
        return this.sendEvent(batchEvent);
      })
    );
  }

  // Webhook設定の取得
  getWebhook(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  // 全Webhook設定の取得
  getAllWebhooks(): Array<{ id: string; config: WebhookConfig }> {
    return Array.from(this.webhooks.entries()).map(([id, config]) => ({
      id,
      config
    }));
  }

  // Webhookのテスト送信
  async testWebhook(id: string): Promise<boolean> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testEvent: WebhookEvent = {
      id: crypto.randomUUID(),
      type: WebhookEventType.QUEUE_STATUS,
      platform: 'test',
      timestamp: new Date(),
      data: {
        message: 'This is a test webhook event',
        testId: crypto.randomUUID()
      }
    };

    try {
      await this.sendToWebhook(webhook, testEvent);
      return true;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}