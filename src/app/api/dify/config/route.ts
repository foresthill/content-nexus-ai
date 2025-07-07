import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dify設定を保存するAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, baseUrl, appId } = body;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'API KeyとBase URLは必須です' },
        { status: 400 }
      );
    }

    // Cookieに設定を保存（httpOnlyで安全に）
    const config = { apiKey, baseUrl, appId };
    const cookieStore = await cookies();
    
    cookieStore.set('dify-config', JSON.stringify(config), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30日間
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config save error:', error);
    return NextResponse.json(
      { error: '設定の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// Dify設定を取得するAPI
export async function GET() {
  try {
    const cookieStore = await cookies();
    const configCookie = cookieStore.get('dify-config');
    
    if (!configCookie) {
      return NextResponse.json(
        { error: '設定が見つかりません' },
        { status: 404 }
      );
    }

    const config = JSON.parse(configCookie.value);
    
    // API Keyは一部のみ返す（セキュリティのため）
    return NextResponse.json({
      hasConfig: true,
      apiKeyPrefix: config.apiKey?.substring(0, 10) + '...',
      baseUrl: config.baseUrl,
      appId: config.appId,
    });
  } catch (error) {
    console.error('Config get error:', error);
    return NextResponse.json(
      { error: '設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// Dify設定を削除するAPI
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('dify-config');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config delete error:', error);
    return NextResponse.json(
      { error: '設定の削除に失敗しました' },
      { status: 500 }
    );
  }
}