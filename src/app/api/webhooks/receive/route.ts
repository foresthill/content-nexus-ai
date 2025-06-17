import { NextRequest, NextResponse } from 'next/server';
import { WebhookManager } from '@/lib/webhooks/manager';

// Webhook受信エンドポイント（外部サービスからのコールバック用）
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const eventType = request.headers.get('x-webhook-event');
    const platform = request.headers.get('x-webhook-platform');
    
    if (!signature || !eventType) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    const body = await request.text();
    
    // 署名の検証（実際の実装では適切なシークレットを使用）
    const isValid = WebhookManager.verifySignature(
      body,
      signature,
      process.env.WEBHOOK_SECRET || 'default-secret'
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    
    // イベントの処理（実際の実装ではイベントタイプに応じた処理）
    console.log('Received webhook event:', {
      type: eventType,
      platform,
      data: payload
    });

    // 処理結果に応じたアクション
    switch (eventType) {
      case 'post.status':
        // 投稿ステータスの更新処理
        break;
      case 'media.processed':
        // メディア処理完了の処理
        break;
      case 'error.occurred':
        // エラー発生時の処理
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed'
    });
  } catch (error) {
    console.error('Webhook receive error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}