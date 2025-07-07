import { NextRequest, NextResponse } from 'next/server';
import { WebhookManager } from '@/lib/webhooks/manager';

const webhookManager = new WebhookManager();

// Webhook設定の取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhook = webhookManager.getWebhook(id);
    
    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // セキュリティのためsecretは返さない
    return NextResponse.json({
      id: id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      headers: webhook.headers
    });
  } catch (error) {
    console.error('Get webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook' },
      { status: 500 }
    );
  }
}

// Webhook設定の更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const webhook = webhookManager.getWebhook(id);
    
    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // 更新可能なフィールドのみ更新
    if (body.url !== undefined) {
      try {
        new URL(body.url);
        webhook.url = body.url;
      } catch {
        return NextResponse.json(
          { error: 'Invalid webhook URL' },
          { status: 400 }
        );
      }
    }

    if (body.events !== undefined) {
      webhook.events = body.events;
    }

    if (body.active !== undefined) {
      webhook.active = body.active;
    }

    if (body.headers !== undefined) {
      webhook.headers = body.headers;
    }

    // 更新されたWebhookを再登録
    webhookManager.registerWebhook(id, webhook);

    return NextResponse.json({
      id: id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      headers: webhook.headers
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// Webhookの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = webhookManager.unregisterWebhook(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted'
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}

// Webhookのテスト
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action !== 'test') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const success = await webhookManager.testWebhook(id);
    
    return NextResponse.json({
      success,
      message: success ? 'Test webhook sent successfully' : 'Test webhook failed'
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    
    if (error instanceof Error && error.message === 'Webhook not found') {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}