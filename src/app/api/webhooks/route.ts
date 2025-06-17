import { NextRequest, NextResponse } from 'next/server';
import { WebhookManager, WebhookConfig, WebhookEventType } from '@/lib/webhooks/manager';
import crypto from 'crypto';

const webhookManager = new WebhookManager();

// Webhook設定の登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events, secret, headers } = body;

    // バリデーション
    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid webhook configuration' },
        { status: 400 }
      );
    }

    // URLの検証
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // イベントタイプの検証
    const validEvents = Object.values(WebhookEventType);
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: 'Invalid event types', invalidEvents },
        { status: 400 }
      );
    }

    // Webhook設定の作成
    const webhookId = crypto.randomUUID();
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
    
    const config: WebhookConfig = {
      url,
      secret: webhookSecret,
      events,
      active: true,
      headers: headers || {},
      retryConfig: {
        maxAttempts: 3,
        initialDelay: 1000
      }
    };

    webhookManager.registerWebhook(webhookId, config);

    return NextResponse.json({
      id: webhookId,
      secret: webhookSecret,
      url,
      events,
      active: true
    });
  } catch (error) {
    console.error('Webhook registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register webhook' },
      { status: 500 }
    );
  }
}

// Webhook一覧の取得
export async function GET() {
  try {
    const webhooks = webhookManager.getAllWebhooks();
    
    // セキュリティのためsecretは返さない
    const sanitizedWebhooks = webhooks.map(({ id, config }) => ({
      id,
      url: config.url,
      events: config.events,
      active: config.active,
      headers: config.headers
    }));

    return NextResponse.json(sanitizedWebhooks);
  } catch (error) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { error: 'Failed to get webhooks' },
      { status: 500 }
    );
  }
}