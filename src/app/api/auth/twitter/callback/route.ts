import { NextRequest, NextResponse } from 'next/server';
import { TwitterAuth } from '@/lib/auth/twitter';
import jwt from 'jsonwebtoken';

const twitterAuth = new TwitterAuth();

// 一時ストレージ（実際の実装ではRedisを使用）
const tempStorage = new Map<string, string>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const oauth_token = searchParams.get('oauth_token');
  const oauth_verifier = searchParams.get('oauth_verifier');

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.redirect('/social?error=auth_failed');
  }

  try {
    // 保存されたトークンシークレットを取得
    const oauth_token_secret = tempStorage.get(oauth_token);
    if (!oauth_token_secret) {
      throw new Error('Token secret not found');
    }

    // アクセストークンを取得
    const tokens = await twitterAuth.getAccessToken(
      oauth_token,
      oauth_verifier,
      oauth_token_secret
    );

    // JWTトークンを生成（実際の実装ではより安全な方法を使用）
    const jwtToken = jwt.sign(
      {
        platform: 'twitter',
        userId: tokens.user_id,
        screenName: tokens.screen_name,
        accessToken: tokens.oauth_token,
        accessTokenSecret: tokens.oauth_token_secret
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    );

    // クライアントにトークンを渡してリダイレクト
    const response = NextResponse.redirect('/social?auth=success');
    response.cookies.set('sns-auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30日
    });

    // 一時ストレージをクリア
    tempStorage.delete(oauth_token);

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect('/social?error=auth_failed');
  }
}