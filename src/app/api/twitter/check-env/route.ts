import { NextResponse } from 'next/server';

export async function GET() {
  // 環境変数からTwitter API設定を確認
  const isConfigured = !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );

  if (!isConfigured) {
    return NextResponse.json({
      isConfigured: false,
      isConnected: false,
      error: 'Twitter API環境変数が設定されていません',
    });
  }

  // 簡易的な接続チェック（環境変数が設定されていれば接続済みとみなす）
  return NextResponse.json({
    isConfigured: true,
    isConnected: true,
    error: null,
  });
}