import { NextRequest, NextResponse } from 'next/server';
import { TikTokAuth } from '@/lib/auth/tiktok';
import jwt from 'jsonwebtoken';

const tiktokAuth = new TikTokAuth();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // エラーチェック
  if (error) {
    console.error('TikTok auth error:', error, error_description);
    return NextResponse.redirect(`/social?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect('/social?error=invalid_request');
  }

  // CSRF対策: stateの検証
  const savedState = request.cookies.get('tiktok-auth-state')?.value;
  if (state !== savedState) {
    return NextResponse.redirect('/social?error=invalid_state');
  }

  try {
    // アクセストークンを取得
    const tokenData = await tiktokAuth.getAccessToken(code);
    
    // ユーザー情報を取得
    const userInfo = await tiktokAuth.getUserInfo(
      tokenData.access_token,
      tokenData.open_id
    );

    // JWTトークンを生成
    const jwtToken = jwt.sign(
      {
        platform: 'tiktok',
        openId: tokenData.open_id,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.avatar_url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + tokenData.expires_in * 1000
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    );

    // クライアントにトークンを渡してリダイレクト
    const response = NextResponse.redirect('/social?auth=success&platform=tiktok');
    
    // JWTをcookieに保存
    response.cookies.set('sns-auth-tiktok', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30日
    });
    
    // stateクッキーを削除
    response.cookies.delete('tiktok-auth-state');

    return response;
  } catch (error) {
    console.error('TikTok callback error:', error);
    return NextResponse.redirect('/social?error=auth_failed');
  }
}