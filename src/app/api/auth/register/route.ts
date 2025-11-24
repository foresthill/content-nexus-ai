/**
 * User Registration API Endpoint
 *
 * POST /api/auth/register
 * 新規ユーザー登録処理（NextAuth対応版）
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * 登録リクエストのバリデーションスキーマ
 */
const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で設定してください')
    .regex(/[a-z]/, 'パスワードには小文字を含めてください')
    .regex(/[A-Z]/, 'パスワードには大文字を含めてください')
    .regex(/[0-9]/, 'パスワードには数字を含めてください'),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください'),
});

export async function POST(request: NextRequest) {
  try {
    // リクエストボディのパース
    const body = await request.json();

    // バリデーション
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.errors[0].message,
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    // パスワードのハッシュ化（ソルトラウンド: 10）
    const hashedPassword = await hash(password, 10);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // デフォルトロール
        isActive: true,
      },
    });

    // 監査ログの記録
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        changes: {
          email: user.email,
          name: user.name,
          role: user.role,
          registeredAt: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    // 成功レスポンス（パスワードを除外）
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'アカウントが正常に作成されました',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // データベースエラーの詳細を隠す
    return NextResponse.json(
      {
        error: 'アカウント作成中にエラーが発生しました。もう一度お試しください。',
      },
      { status: 500 }
    );
  }
}