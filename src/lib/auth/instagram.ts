import axios from 'axios';

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
}

interface InstagramUserInfo {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export class InstagramAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID || '';
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || '';
  }

  // ステップ1: 認証URLを生成
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media,instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: state
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  // ステップ2: 認証コードをアクセストークンに交換
  async getAccessToken(code: string): Promise<InstagramTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code: code
    });

    try {
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: response.data.access_token,
        user_id: response.data.user_id
      };
    } catch (error) {
      console.error('Instagram access token error:', error);
      throw new Error('Failed to get Instagram access token');
    }
  }

  // ユーザー情報を取得
  async getUserInfo(accessToken: string): Promise<InstagramUserInfo> {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );

      return response.data;
    } catch (error) {
      console.error('Instagram user info error:', error);
      throw new Error('Failed to get Instagram user info');
    }
  }

  // コンテナIDを作成（画像/動画投稿の準備）
  async createMediaContainer(
    accessToken: string,
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
    mediaUrl: string,
    caption: string,
    additionalParams?: any
  ): Promise<string> {
    const params: any = {
      media_type: mediaType,
      caption: caption,
      access_token: accessToken
    };

    if (mediaType === 'IMAGE') {
      params.image_url = mediaUrl;
    } else if (mediaType === 'VIDEO') {
      params.video_url = mediaUrl;
    }

    if (additionalParams) {
      Object.assign(params, additionalParams);
    }

    try {
      const response = await axios.post(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        params
      );

      return response.data.id;
    } catch (error) {
      console.error('Instagram create media container error:', error);
      throw new Error('Failed to create media container');
    }
  }

  // メディアを公開
  async publishMedia(
    accessToken: string,
    creationId: string
  ): Promise<{ id: string }> {
    try {
      const response = await axios.post(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram publish media error:', error);
      throw new Error('Failed to publish media');
    }
  }

  // カルーセル（複数画像）投稿用の子メディアを作成
  async createCarouselChild(
    accessToken: string,
    mediaType: 'IMAGE' | 'VIDEO',
    mediaUrl: string
  ): Promise<string> {
    const params: any = {
      media_type: mediaType,
      access_token: accessToken
    };

    if (mediaType === 'IMAGE') {
      params.image_url = mediaUrl;
    } else {
      params.video_url = mediaUrl;
    }

    try {
      const response = await axios.post(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        params
      );

      return response.data.id;
    } catch (error) {
      console.error('Instagram create carousel child error:', error);
      throw new Error('Failed to create carousel child');
    }
  }

  // ストーリーズ投稿
  async postStory(
    accessToken: string,
    mediaType: 'IMAGE' | 'VIDEO',
    mediaUrl: string
  ): Promise<{ id: string }> {
    const params: any = {
      media_type: mediaType,
      access_token: accessToken
    };

    if (mediaType === 'IMAGE') {
      params.image_url = mediaUrl;
    } else {
      params.video_url = mediaUrl;
    }

    try {
      // ストーリーズ用のメディアコンテナを作成
      const containerResponse = await axios.post(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        params
      );

      // すぐに公開
      const publishResponse = await axios.post(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
        {
          creation_id: containerResponse.data.id,
          access_token: accessToken
        }
      );

      return publishResponse.data;
    } catch (error) {
      console.error('Instagram post story error:', error);
      throw new Error('Failed to post story');
    }
  }
}