import { NextResponse } from 'next/server';
import { TikTokAuth } from '@/lib/auth/tiktok';
import crypto from 'crypto';

const tiktokAuth = new TikTokAuth();

export async function GET() {
  try {
    // CSRF対策用のstateパラメータを生成
    const state = crypto.randomBytes(16).toString('hex');
    
    // 認証URLを生成
    const authUrl = tiktokAuth.getAuthorizationUrl(state);
    
    // stateをcookieに保存してリダイレクト
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('tiktok-auth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10分
    });
    
    return response;
  } catch (error) {
    console.error('TikTok auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}