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

  // ビジネスアカウント情報の取得
  async getAccountInfo(accessToken: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}`,
        {
          params: {
            fields: 'id,username,media_count,followers_count,follows_count,biography,website,profile_picture_url',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get account info error:', error);
      throw new Error('Failed to get account info');
    }
  }

  // メディア（投稿）一覧の取得
  async getMedia(
    accessToken: string,
    options: {
      limit?: number;
      after?: string;
      since?: string;
      until?: string;
    } = {}
  ) {
    try {
      const params: any = {
        fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,impressions,reach,saved',
        access_token: accessToken,
        limit: options.limit || 25
      };

      if (options.after) params.after = options.after;
      if (options.since) params.since = options.since;
      if (options.until) params.until = options.until;

      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get media error:', error);
      throw new Error('Failed to get media');
    }
  }

  // 特定のメディアの詳細情報取得
  async getMediaInsights(accessToken: string, mediaId: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${mediaId}/insights`,
        {
          params: {
            metric: 'engagement,impressions,reach,saved,comments,likes,shares',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get media insights error:', error);
      throw new Error('Failed to get media insights');
    }
  }

  // アカウントインサイトの取得
  async getAccountInsights(
    accessToken: string,
    period: 'day' | 'week' | 'days_28' = 'day',
    since?: string,
    until?: string
  ) {
    try {
      const params: any = {
        metric: 'impressions,reach,profile_views,follower_count,email_contacts,get_directions_clicks,phone_call_clicks,text_message_clicks,website_clicks',
        period,
        access_token: accessToken
      };

      if (since) params.since = since;
      if (until) params.until = until;

      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get account insights error:', error);
      throw new Error('Failed to get account insights');
    }
  }

  // ストーリーズのインサイト取得
  async getStoriesInsights(accessToken: string, storyId: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${storyId}/insights`,
        {
          params: {
            metric: 'exits,impressions,reach,replies,taps_forward,taps_back',
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get stories insights error:', error);
      throw new Error('Failed to get stories insights');
    }
  }

  // ハッシュタグ検索
  async searchHashtag(accessToken: string, hashtag: string) {
    try {
      const response = await axios.get(
        'https://graph.instagram.com/v12.0/ig_hashtag_search',
        {
          params: {
            user_id: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
            q: hashtag,
            access_token: accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram search hashtag error:', error);
      throw new Error('Failed to search hashtag');
    }
  }

  // ハッシュタグの投稿取得
  async getHashtagMedia(
    accessToken: string, 
    hashtagId: string,
    options: {
      user_id?: string;
      fields?: string;
      limit?: number;
      after?: string;
    } = {}
  ) {
    try {
      const params: any = {
        user_id: options.user_id || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
        fields: options.fields || 'id,media_type,media_url,permalink,caption,timestamp',
        access_token: accessToken,
        limit: options.limit || 25
      };

      if (options.after) params.after = options.after;

      const response = await axios.get(
        `https://graph.instagram.com/v12.0/${hashtagId}/recent_media`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Instagram get hashtag media error:', error);
      throw new Error('Failed to get hashtag media');
    }
  }
}