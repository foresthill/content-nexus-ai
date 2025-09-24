import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

interface TwitterConfigRequest {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

// OAuth 1.0a署名生成
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // パラメータをソートして結合
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // ベース文字列を作成
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

  // 署名キーを作成
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // HMAC-SHA1で署名
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  return signature;
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiSecret, accessToken, accessTokenSecret }: TwitterConfigRequest = await request.json();

    // 入力検証
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'すべてのAPIキーが必要です' },
        { status: 400 }
      );
    }

    // Twitter API v2のユーザー情報取得エンドポイントでテスト
    const url = 'https://api.twitter.com/2/users/me';
    const method = 'GET';

    // OAuth 1.0aパラメータ
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_token: accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0',
    };

    // 署名を生成
    const signature = generateOAuthSignature(method, url, oauthParams, apiSecret, accessTokenSecret);
    oauthParams.oauth_signature = signature;

    // Authorizationヘッダーを作成
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    // Twitter APIにリクエスト
    const response = await axios.get(url, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10秒タイムアウト
    });

    if (response.status === 200 && response.data?.data) {
      const userData = response.data.data;
      return NextResponse.json({
        success: true,
        message: '接続テストが成功しました',
        userId: userData.id,
        username: userData.username,
        user: {
          id: userData.id,
          name: userData.name,
          username: userData.username,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Twitter APIからの応答が無効です' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Twitter API接続テストエラー:', error);

    // エラーの詳細を分析
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 401:
          return NextResponse.json(
            { error: 'APIキーまたはアクセストークンが無効です。Twitter Developer Portalで確認してください。' },
            { status: 401 }
          );
        case 403:
          return NextResponse.json(
            { error: 'アクセスが拒否されました。アプリの権限設定を確認してください。' },
            { status: 403 }
          );
        case 429:
          return NextResponse.json(
            { error: 'レート制限に達しました。しばらく待ってから再試行してください。' },
            { status: 429 }
          );
        default:
          return NextResponse.json(
            { 
              error: `Twitter API エラー (${status}): ${errorData?.title || errorData?.error || '不明なエラー'}`,
              details: errorData?.detail || errorData?.error_description 
            },
            { status: status }
          );
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'ネットワーク接続エラーです。インターネット接続を確認してください。' },
        { status: 500 }
      );
    } else if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: '接続がタイムアウトしました。しばらく待ってから再試行してください。' },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: `接続テスト中にエラーが発生しました: ${error.message}` },
        { status: 500 }
      );
    }
  }
}
