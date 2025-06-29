import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user';
import { z } from 'zod';

// ログインデータのバリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // ログイン処理
    const result = await UserService.login(email, password);

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
    console.error('Login error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    const status = errorMessage === 'Invalid email or password' ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}