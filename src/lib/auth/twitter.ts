import axios from 'axios';
import crypto from 'crypto';
import { URLSearchParams } from 'url';

interface TwitterOAuthTokens {
  oauth_token: string;
  oauth_token_secret: string;
  user_id: string;
  screen_name: string;
}

export class TwitterAuth {
  private apiKey: string;
  private apiSecret: string;
  private callbackUrl: string;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/twitter/callback`;
  }

  // OAuth 1.0a署名の生成
  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>
  ): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(
      url
    )}&${encodeURIComponent(paramString)}`;

    const signingKey = `${encodeURIComponent(this.apiSecret)}&`;

    return crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');
  }

  // OAuth認証ヘッダーの生成
  private generateAuthHeader(params: Record<string, string>): string {
    const authParams = Object.keys(params)
      .filter(key => key.startsWith('oauth_'))
      .sort()
      .map(key => `${key}="${encodeURIComponent(params[key])}"`)
      .join(', ');

    return `OAuth ${authParams}`;
  }

  // ステップ1: リクエストトークンの取得
  async getRequestToken(): Promise<{ oauth_token: string; oauth_token_secret: string }> {
    const url = 'https://api.twitter.com/oauth/request_token';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');

    const params = {
      oauth_callback: this.callbackUrl,
      oauth_consumer_key: this.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0'
    };

    const signature = this.generateOAuthSignature('POST', url, params);
    const authHeader = this.generateAuthHeader({
      ...params,
      oauth_signature: signature
    });

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: authHeader
        }
      });

      const result = new URLSearchParams(response.data);
      return {
        oauth_token: result.get('oauth_token') || '',
        oauth_token_secret: result.get('oauth_token_secret') || ''
      };
    } catch (error) {
      console.error('Twitter request token error:', error);
      throw new Error('Failed to get request token');
    }
  }

  // ステップ2: 認証URLの生成
  getAuthorizationUrl(oauth_token: string): string {
    return `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
  }

  // ステップ3: アクセストークンの取得
  async getAccessToken(
    oauth_token: string,
    oauth_verifier: string,
    oauth_token_secret: string
  ): Promise<TwitterOAuthTokens> {
    const url = 'https://api.twitter.com/oauth/access_token';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');

    const params = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
      oauth_version: '1.0'
    };

    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(
      oauth_token_secret
    )}`;

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const baseString = `POST&${encodeURIComponent(url)}&${encodeURIComponent(
      paramString
    )}`;

    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    const authHeader = this.generateAuthHeader({
      ...params,
      oauth_signature: signature
    });

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: authHeader
        }
      });

      const result = new URLSearchParams(response.data);
      return {
        oauth_token: result.get('oauth_token') || '',
        oauth_token_secret: result.get('oauth_token_secret') || '',
        user_id: result.get('user_id') || '',
        screen_name: result.get('screen_name') || ''
      };
    } catch (error) {
      console.error('Twitter access token error:', error);
      throw new Error('Failed to get access token');
    }
  }

  // Twitter API v2でのツイート投稿
  async postTweet(
    text: string,
    mediaIds: string[] = [],
    accessToken: string,
    accessTokenSecret: string
  ): Promise<any> {
    const url = 'https://api.twitter.com/2/tweets';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('base64').replace(/[^\w]/g, '');

    const params = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0'
    };

    const signingKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(
      accessTokenSecret
    )}`;

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const baseString = `POST&${encodeURIComponent(url)}&${encodeURIComponent(
      paramString
    )}`;

    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    const authHeader = this.generateAuthHeader({
      ...params,
      oauth_signature: signature
    });

    const body: any = { text };
    if (mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }

    try {
      const response = await axios.post(url, body, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Twitter post tweet error:', error);
      throw new Error('Failed to post tweet');
    }
  }
}