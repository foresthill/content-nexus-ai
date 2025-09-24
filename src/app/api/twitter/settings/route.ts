import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Twitter設定を取得
export async function GET(request: NextRequest) {
  try {
    // 仮のユーザーID（実際の実装では認証から取得）
    const userId = 'temp-user-id';

    // ユーザーが存在することを確認（なければ作成）
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('temp-password', 10);

      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'temp@example.com',
          password: hashedPassword,
          name: 'Temporary User',
          role: 'USER',
          isActive: true
        }
      });
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
      // 実際の認証情報を返す（storeで使用）
      config: {
        apiKey: socialAccount.apiKey || '',
        apiSecret: socialAccount.apiSecret || '',
        accessToken: socialAccount.accessToken || '',
        accessTokenSecret: socialAccount.accessTokenSecret || ''
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

    // 仮のユーザーID（実際の実装では認証から取得）
    const userId = 'temp-user-id';

    // ユーザーが存在しない場合は作成
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // テスト用ユーザーを作成
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('temp-password', 10);

      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'temp@example.com',
          password: hashedPassword,
          name: 'Temporary User',
          role: 'USER',
          isActive: true
        }
      });
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

    // DBに保存または更新
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId,
          platform: 'TWITTER'
        }
      },
      update: {
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
        platformUserId: testResult.userId || 'unknown',
        username: testResult.username || null,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        platform: 'TWITTER',
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
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
export async function DELETE(request: NextRequest) {
  try {
    // 仮のユーザーID（実際の実装では認証から取得）
    const userId = 'temp-user-id';

    // ユーザーの存在を確認（削除時もユーザーが必要）
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    await prisma.socialAccount.delete({
      where: {
        userId_platform: {
          userId,
          platform: 'TWITTER'
        }
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