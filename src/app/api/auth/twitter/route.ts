import { NextResponse } from 'next/server';
import { TwitterAuth } from '@/lib/auth/twitter';

const twitterAuth = new TwitterAuth();

// セッションストレージ（実際の実装ではRedisなどを使用）
const tempStorage = new Map<string, string>();

export async function GET() {
  try {
    // リクエストトークンを取得
    const { oauth_token, oauth_token_secret } = await twitterAuth.getRequestToken();
    
    // 一時的にトークンシークレットを保存
    tempStorage.set(oauth_token, oauth_token_secret);
    
    // 認証URLを生成してリダイレクト
    const authUrl = twitterAuth.getAuthorizationUrl(oauth_token);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}