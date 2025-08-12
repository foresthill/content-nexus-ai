import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';
import { SocialPostService } from '@/lib/social/post-service';
import { SocialPlatform, PostStatus } from '@prisma/client';

interface TwitterPostRequest {
  text: string;
  userId?: string; // 一時的にオプショナル
}

// ハッシュタグを抽出する関数
function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g);
  return hashtags ? hashtags.map(tag => tag.slice(1)) : []; // #を除去
}

export async function POST(request: NextRequest) {
  let draftPost: any = null;
  
  try {
    const { text, userId }: TwitterPostRequest = await request.json();

    // 入力検証
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'ツイート内容が必要です' },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: 'ツイートは280文字以内で入力してください' },
        { status: 400 }
      );
    }

    // 一時的なユーザーID（認証システム実装後に更新）
    const tempUserId = userId || 'temp-user-001';

    // 環境変数の確認
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { 
          error: '🔧 Twitter API設定が不完全です',
          help: '環境変数を設定してください',
          details: {
            missing: [
              !apiKey && 'TWITTER_API_KEY',
              !apiSecret && 'TWITTER_API_SECRET',
              !accessToken && 'TWITTER_ACCESS_TOKEN', 
              !accessTokenSecret && 'TWITTER_ACCESS_TOKEN_SECRET'
            ].filter(Boolean),
            guide: 'https://developer.twitter.com/en/portal/dashboard'
          }
        },
        { status: 500 }
      );
    }

    // OAuth 1.0a 署名の生成
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');

    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_token: accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    // パラメータ文字列の作成
    const paramString = Object.keys(oauthParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(oauthParams[key as keyof typeof oauthParams])}`)
      .join('&');

    // ベース文字列の作成
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

    // 署名キーの作成
    const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`;

    // HMAC-SHA1署名の生成
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    // Authorizationヘッダーの作成
    const authHeader = `OAuth ${Object.entries({
      ...oauthParams,
      oauth_signature: signature
    })
      .map(([key, value]) => `${key}="${encodeURIComponent(value as string)}"`)
      .join(', ')}`;

    try {
      // まずドラフト投稿をデータベースに作成
      draftPost = await SocialPostService.createPost({
        userId: tempUserId,
        socialAccountId: 'temp-twitter-account', // 一時的なアカウントID
        platform: SocialPlatform.TWITTER,
        content: text,
        hashtags: extractHashtags(text),
      });

      console.log('📝 投稿がドラフトとして保存されました:', draftPost.id);
    } catch (dbError) {
      console.warn('⚠️ ドラフト保存に失敗、API投稿を続行:', dbError);
    }

    // ログ出力（デバッグ用）
    console.log('🐦 Twitter API投稿開始:', {
      textLength: text.length,
      postId: draftPost?.id,
      timestamp: new Date().toISOString()
    });

    // Twitter APIへの投稿
    const response = await axios.post(
      url,
      { text },
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'ToolPlus/1.0 (X-Post-System)'
        },
        timeout: 15000 // 15秒タイムアウト
      }
    );

    const platformPostId = response.data.data.id;
    console.log('✅ Twitter API投稿成功:', {
      id: platformPostId,
      postId: draftPost?.id,
      timestamp: new Date().toISOString()
    });

    // 投稿成功時、データベースを更新
    if (draftPost) {
      try {
        await SocialPostService.updatePostResult(draftPost.id, {
          platformPostId: platformPostId,
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
        });
        console.log('✅ 投稿状態がPUBLISHEDに更新されました');
      } catch (updateError) {
        console.error('❌ 投稿状態更新に失敗:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      id: platformPostId,
      postId: draftPost?.id,
      text: response.data.data.text,
      message: '🎉 ツイートが正常に投稿されました！',
      url: `https://twitter.com/i/web/status/${platformPostId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Twitter投稿エラー:', error);

    // 投稿失敗時、データベースを更新
    if (draftPost) {
      try {
        const errorMessage = error.response?.data?.detail || 
                           (error.response?.data?.errors && error.response.data.errors[0]?.message) ||
                           error.message || 
                           'Unknown error';
        
        await SocialPostService.updatePostResult(draftPost.id, {
          status: PostStatus.FAILED,
          failedAt: new Date(),
          failureReason: errorMessage,
        });
        console.log('📝 投稿失敗状態がデータベースに記録されました');
      } catch (updateError) {
        console.error('❌ 失敗状態更新に失敗:', updateError);
      }
    }

    // Twitter APIエラーの詳細処理
    if (error.response?.data) {
      const twitterError = error.response.data;
      console.error('Twitter API Error Details:', JSON.stringify(twitterError, null, 2));
      
      let errorMessage = 'Twitter APIエラーが発生しました';
      let helpMessage = '';
      let statusCode = error.response.status;
      
      // エラータイプの判定と日本語メッセージ生成
      const errorDetails = twitterError.detail || 
                         (twitterError.errors && twitterError.errors[0]?.message) ||
                         twitterError.title;
      
      if (errorDetails) {
        if (errorDetails.includes('duplicate') || errorDetails.includes('duplicated')) {
          errorMessage = '📝 同じ内容のツイートが既に投稿されています';
          helpMessage = '少し時間をおくか、内容を変更してお試しください。';
        } else if (errorDetails.includes('rate limit') || errorDetails.includes('Too Many Requests')) {
          errorMessage = '⏰ APIの使用制限に達しました';
          helpMessage = 'しばらく時間をおいてから再度お試しください（通常15分で回復します）。';
        } else if (errorDetails.includes('authentication') || errorDetails.includes('Unauthorized') || statusCode === 401) {
          errorMessage = '🔐 Twitter APIの認証に失敗しました';
          helpMessage = '環境変数のAPIキーとアクセストークンを確認してください。';
        } else if (errorDetails.includes('forbidden') || errorDetails.includes('Forbidden') || statusCode === 403) {
          errorMessage = '🚫 Twitter APIへのアクセスが拒否されました';
          helpMessage = 'アプリの権限設定で「Read and Write」が有効になっているか確認してください。';
        } else if (errorDetails.includes('not found') || statusCode === 404) {
          errorMessage = '🔍 Twitter API エンドポイントが見つかりません';
          helpMessage = 'APIのバージョンやエンドポイントを確認してください。';
        } else if (statusCode === 400) {
          errorMessage = '📄 リクエストの形式に問題があります';
          helpMessage = 'ツイート内容や文字数を確認してください。';
        } else {
          errorMessage = `🐦 Twitter API エラー (${statusCode}): ${errorDetails}`;
          helpMessage = 'エラーが続く場合は、Twitter Developer Portalで設定を確認してください。';
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          help: helpMessage,
          details: {
            status: statusCode,
            response: errorDetails,
            timestamp: new Date().toISOString()
          }
        },
        { status: Math.min(statusCode, 500) } // 5xx エラーは500に統一
      );
    }

    // ネットワーク関連エラー
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: '⏱️ Twitter APIへの接続がタイムアウトしました',
          help: 'ネットワーク接続を確認して再度お試しください。',
          details: {
            error: 'Connection timeout',
            timestamp: new Date().toISOString()
          }
        },
        { status: 408 }
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: '🌐 ネットワーク接続エラーが発生しました',
          help: 'インターネット接続を確認してください。',
          details: {
            error: error.code,
            timestamp: new Date().toISOString()
          }
        },
        { status: 503 }
      );
    }

    // その他の予期しないエラー
    return NextResponse.json(
      { 
        error: '🔧 サーバーエラーが発生しました',
        help: 'しばらく時間をおいて再度お試しください。問題が続く場合は管理者にお問い合わせください。',
        details: {
          error: error.message || 'Unknown server error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}