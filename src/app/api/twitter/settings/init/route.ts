import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 初期ユーザーを作成（開発用）
export async function GET(request: NextRequest) {
  try {
    const userId = 'temp-user-id';

    // 既存のユーザーを確認
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'ユーザーは既に存在します',
        userId: existingUser.id
      });
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('temp-password', 10);

    // 新しいユーザーを作成
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: 'temp@example.com',
        password: hashedPassword,
        name: 'Temporary User',
        role: 'USER',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'テスト用ユーザーを作成しました',
      userId: user.id
    });

  } catch (error) {
    console.error('Failed to create test user:', error);
    return NextResponse.json(
      { error: 'テストユーザーの作成に失敗しました' },
      { status: 500 }
    );
  }
}