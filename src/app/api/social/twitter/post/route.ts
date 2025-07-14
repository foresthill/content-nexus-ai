import { NextRequest, NextResponse } from 'next/server';
import { TwitterAuth } from '@/lib/auth/twitter';

export async function POST(request: NextRequest) {
  try {
    const { text, accessToken, accessTokenSecret } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'テキストが必要です' },
        { status: 400 }
      );
    }

    if (!accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'Twitter認証が必要です' },
        { status: 401 }
      );
    }

    // テキストを280文字に制限（Twitter制限）
    const truncatedText = text.length > 280 ? text.substring(0, 277) + '...' : text;

    const twitterAuth = new TwitterAuth();
    const result = await twitterAuth.postTweet(
      truncatedText,
      [],
      accessToken,
      accessTokenSecret
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Twitter投稿エラー:', error);
    return NextResponse.json(
      { error: 'Twitter投稿に失敗しました' },
      { status: 500 }
    );
  }
}