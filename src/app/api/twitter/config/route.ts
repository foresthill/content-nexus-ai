import { NextRequest, NextResponse } from 'next/server';

interface TwitterConfigRequest {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiSecret, accessToken, accessTokenSecret }: TwitterConfigRequest = await request.json();

    // 入力検証
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'すべてのAPIキーが必要です' },
        { status: 400 }
      );
    }

    // 基本的な形式チェック
    if (typeof apiKey !== 'string' || typeof apiSecret !== 'string' || 
        typeof accessToken !== 'string' || typeof accessTokenSecret !== 'string') {
      return NextResponse.json(
        { error: '無効なAPIキー形式です' },
        { status: 400 }
      );
    }

    // 設定を一時的にメモリに保存（実際のアプリではデータベースに保存）
    // 今後、ユーザー認証システムが実装されたら、ユーザーIDと紐付けて保存
    global.twitterConfig = {
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Twitter API設定が保存されました',
    });

  } catch (error) {
    console.error('Twitter API設定の保存エラー:', error);
    return NextResponse.json(
      { error: '設定の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // 設定の取得（実際のアプリではユーザーIDで絞り込み）
    const config = global.twitterConfig;
    
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: 'Twitter API設定が見つかりません',
      });
    }

    // セキュリティのため、実際のキー値は返さない
    return NextResponse.json({
      configured: true,
      hasApiKey: !!config.apiKey,
      hasApiSecret: !!config.apiSecret,
      hasAccessToken: !!config.accessToken,
      hasAccessTokenSecret: !!config.accessTokenSecret,
      updatedAt: config.updatedAt,
    });

  } catch (error) {
    console.error('Twitter API設定の取得エラー:', error);
    return NextResponse.json(
      { error: '設定の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
