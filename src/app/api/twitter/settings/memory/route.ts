import { NextRequest, NextResponse } from 'next/server';

// インメモリストレージ（開発用）
const twitterSettings = new Map<string, any>();

// Twitter設定を取得
export async function GET(request: NextRequest) {
  try {
    // 仮のユーザーID（実際の実装では認証から取得）
    const userId = 'temp-user-id';

    const settings = twitterSettings.get(userId);
    console.log('[Twitter Settings GET] メモリから設定取得:', settings ? 'あり' : 'なし');

    if (!settings) {
      console.log('[Twitter Settings GET] 設定が見つかりません');
      return NextResponse.json({
        isConfigured: false,
        isConnected: false,
        message: 'Twitter設定が見つかりません'
      });
    }

    // グローバル設定も復元（投稿APIで使用）
    (global as any).twitterConfig = {
      apiKey: settings.apiKey,
      apiSecret: settings.apiSecret,
      accessToken: settings.accessToken,
      accessTokenSecret: settings.accessTokenSecret,
    };
    console.log('[Twitter Settings GET] グローバル設定を復元しました');

    const response = {
      isConfigured: true,
      isConnected: settings.isConnected || false,
      username: settings.username,
      platformUserId: settings.platformUserId,
      updatedAt: settings.updatedAt,
      // 認証情報も返す（UIでは表示しないが、storeで使用）
      config: {
        apiKey: settings.apiKey,
        apiSecret: settings.apiSecret,
        accessToken: settings.accessToken,
        accessTokenSecret: settings.accessTokenSecret
      }
    };

    console.log('[Twitter Settings GET] 設定を返します:', {
      isConfigured: response.isConfigured,
      isConnected: response.isConnected,
      username: response.username
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch Twitter settings:', error);
    return NextResponse.json(
      { error: 'Twitter設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// Twitter設定を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = body;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'すべての認証情報が必要です' },
        { status: 400 }
      );
    }

    // 仮のユーザーID
    const userId = 'temp-user-id';

    // まず接続テストを実行
    const testResponse = await fetch(new URL('/api/twitter/test-connection', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, apiSecret, accessToken, accessTokenSecret }),
    });

    const testResult = await testResponse.json();

    if (!testResponse.ok) {
      return NextResponse.json(
        { error: testResult.error || '接続テストに失敗しました' },
        { status: 400 }
      );
    }

    // インメモリストレージに保存
    const settings = {
      userId,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      platformUserId: testResult.userId || 'unknown',
      username: testResult.username || null,
      isConnected: true,
      updatedAt: new Date().toISOString()
    };

    twitterSettings.set(userId, settings);
    console.log('[Twitter Settings POST] メモリに設定を保存しました:', {
      userId,
      username: settings.username,
      isConnected: settings.isConnected
    });

    // グローバル設定も更新（投稿APIで使用）
    (global as any).twitterConfig = {
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
    };
    console.log('[Twitter Settings POST] グローバル設定を更新しました');

    return NextResponse.json({
      success: true,
      isConfigured: true,
      isConnected: true,
      username: settings.username,
      message: 'Twitter設定を保存しました'
    });

  } catch (error) {
    console.error('Failed to save Twitter settings:', error);
    return NextResponse.json(
      { error: 'Twitter設定の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// Twitter設定を削除
export async function DELETE(request: NextRequest) {
  try {
    // 仮のユーザーID
    const userId = 'temp-user-id';

    twitterSettings.delete(userId);

    // グローバル設定もクリア
    (global as any).twitterConfig = null;

    return NextResponse.json({
      success: true,
      message: 'Twitter設定を削除しました'
    });

  } catch (error) {
    console.error('Failed to delete Twitter settings:', error);
    return NextResponse.json(
      { error: 'Twitter設定の削除に失敗しました' },
      { status: 500 }
    );
  }
}