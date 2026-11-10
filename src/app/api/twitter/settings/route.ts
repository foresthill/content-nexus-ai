import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUserId } from '@/lib/auth/server-user';
import { encryptField, decryptField } from '@/lib/encryption/field';

// Twitter設定を取得
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // DBから設定を取得
    const socialAccount = await prisma.socialAccount.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: 'TWITTER'
        }
      }
    });

    if (!socialAccount) {
      return NextResponse.json({
        isConfigured: false,
        isConnected: false,
        message: 'Twitter設定が見つかりません'
      });
    }

    // 設定は存在する - 実際の認証情報を返す（投稿時に必要）
    return NextResponse.json({
      isConfigured: true,
      isConnected: socialAccount.isActive,
      username: socialAccount.username,
      platformUserId: socialAccount.platformUserId,
      updatedAt: socialAccount.updatedAt,
      // 実際の認証情報を返す（storeで使用）。DBは暗号化保存のため復号して返す。
      config: {
        apiKey: decryptField(socialAccount.apiKey),
        apiSecret: decryptField(socialAccount.apiSecret),
        accessToken: decryptField(socialAccount.accessToken),
        accessTokenSecret: decryptField(socialAccount.accessTokenSecret)
      }
    });

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

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // 認証情報は at-rest 暗号化して保存（自己完結形式でカラムに格納）
    const encApiKey = encryptField(apiKey);
    const encApiSecret = encryptField(apiSecret);
    const encAccessToken = encryptField(accessToken);
    const encAccessTokenSecret = encryptField(accessTokenSecret);

    // DBに保存または更新
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'TWITTER'
        }
      },
      update: {
        apiKey: encApiKey,
        apiSecret: encApiSecret,
        accessToken: encAccessToken,
        accessTokenSecret: encAccessTokenSecret,
        platformUserId: testResult.userId || 'unknown',
        username: testResult.username || null,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        platform: 'TWITTER',
        apiKey: encApiKey,
        apiSecret: encApiSecret,
        accessToken: encAccessToken,
        accessTokenSecret: encAccessTokenSecret,
        platformUserId: testResult.userId || 'unknown',
        username: testResult.username || null,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      isConfigured: true,
      isConnected: true,
      username: socialAccount.username,
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
export async function DELETE() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.socialAccount.deleteMany({
      where: {
        userId,
        platform: 'TWITTER'
      }
    });

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