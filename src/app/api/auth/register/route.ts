import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user';
import { z } from 'zod';

// 登録データのバリデーションスキーマ
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // ユーザー作成
    const result = await UserService.createUser({
      email,
      password,
      name,
    });

    // レスポンスにトークンを含める
    const response = NextResponse.json({
      user: result.user,
      token: result.token,
    });

    // HTTPOnlyクッキーとしてもトークンを設定
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    const status = errorMessage === 'This record already exists' ? 409 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}