import { NextRequest, NextResponse } from 'next/server';
import { InstagramAuth } from '@/lib/auth/instagram';
import jwt from 'jsonwebtoken';

const instagramAuth = new InstagramAuth();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // エラーチェック
  if (error) {
    return NextResponse.redirect(`/social?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect('/social?error=invalid_request');
  }

  // CSRF対策: stateの検証
  const savedState = request.cookies.get('instagram-auth-state')?.value;
  if (state !== savedState) {
    return NextResponse.redirect('/social?error=invalid_state');
  }

  try {
    // アクセストークンを取得
    const tokenData = await instagramAuth.getAccessToken(code);
    
    // ユーザー情報を取得
    const userInfo = await instagramAuth.getUserInfo(tokenData.access_token);

    // JWTトークンを生成
    const jwtToken = jwt.sign(
      {
        platform: 'instagram',
        userId: tokenData.user_id,
        username: userInfo.username,
        accountType: userInfo.account_type,
        accessToken: tokenData.access_token
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '60d' } // Instagramトークンは60日有効
    );

    // クライアントにトークンを渡してリダイレクト
    const response = NextResponse.redirect('/social?auth=success&platform=instagram');
    
    // JWTをcookieに保存
    response.cookies.set('sns-auth-instagram', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 24 * 60 * 60 // 60日
    });
    
    // stateクッキーを削除
    response.cookies.delete('instagram-auth-state');

    return response;
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect('/social?error=auth_failed');
  }
}