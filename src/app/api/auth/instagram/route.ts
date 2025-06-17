import { NextResponse } from 'next/server';
import { InstagramAuth } from '@/lib/auth/instagram';
import crypto from 'crypto';

const instagramAuth = new InstagramAuth();

export async function GET() {
  try {
    // CSRF対策用のstateパラメータを生成
    const state = crypto.randomBytes(16).toString('hex');
    
    // セッションに保存（実際の実装ではRedisなどを使用）
    const response = NextResponse.redirect(
      instagramAuth.getAuthorizationUrl(state)
    );
    
    // stateをcookieに保存
    response.cookies.set('instagram-auth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10分
    });
    
    return response;
  } catch (error) {
    console.error('Instagram auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}