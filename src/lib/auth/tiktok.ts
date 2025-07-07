import axios from 'axios';

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  open_id: string;
  scope: string;
  expires_in: number;
  refresh_expires_in: number;
}

interface TikTokUserInfo {
  open_id: string;
  union_id: string;
  avatar_url: string;
  display_name: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

export class TikTokAuth {
  private clientKey: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    this.redirectUri = process.env.TIKTOK_REDIRECT_URI || '';
  }

  // ステップ1: 認証URLを生成
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,video.list,video.upload',
      state: state
    });

    return `https://www.tiktok.com/auth/authorize?${params.toString()}`;
  }

  // ステップ2: 認証コードをアクセストークンに交換
  async getAccessToken(code: string): Promise<TikTokTokenResponse> {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri
    });

    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/oauth/access_token/',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok access token error:', error);
      throw new Error('Failed to get TikTok access token');
    }
  }

  // リフレッシュトークンでアクセストークンを更新
  async refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/oauth/refresh_token/',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok refresh token error:', error);
      throw new Error('Failed to refresh TikTok access token');
    }
  }

  // ユーザー情報を取得
  async getUserInfo(accessToken: string, openId: string): Promise<TikTokUserInfo> {
    try {
      const response = await axios.get(
        'https://open-api.tiktok.com/user/info/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            open_id: openId,
            fields: 'open_id,union_id,avatar_url,display_name'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data.user;
    } catch (error) {
      console.error('TikTok user info error:', error);
      throw new Error('Failed to get TikTok user info');
    }
  }

  // 動画投稿の初期化
  async initializeVideoUpload(
    accessToken: string,
    openId: string,
    videoSize: number
  ): Promise<{ upload_id: string; upload_url: string }> {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/share/video/upload/',
        {
          open_id: openId,
          video_size: videoSize
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok video upload init error:', error);
      throw new Error('Failed to initialize video upload');
    }
  }

  // 動画のアップロード（チャンク）
  async uploadVideoChunk(
    uploadUrl: string,
    videoData: Buffer,
    startByte: number,
    endByte: number,
    totalSize: number
  ): Promise<void> {
    try {
      await axios.put(
        uploadUrl,
        videoData,
        {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes ${startByte}-${endByte}/${totalSize}`
          }
        }
      );
    } catch (error) {
      console.error('TikTok video chunk upload error:', error);
      throw new Error('Failed to upload video chunk');
    }
  }

  // 動画投稿の確認と公開
  async publishVideo(
    accessToken: string,
    openId: string,
    uploadId: string,
    caption: string,
    privacyLevel: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY' = 'PUBLIC_TO_EVERYONE'
  ): Promise<{ share_id: string }> {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/share/video/publish/',
        {
          open_id: openId,
          upload_id: uploadId,
          caption: caption,
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_stitch: false,
          disable_comment: false
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok video publish error:', error);
      throw new Error('Failed to publish video');
    }
  }

  // 投稿状態の確認
  async checkPublishStatus(
    accessToken: string,
    openId: string,
    shareId: string
  ): Promise<{ status: string; video_id?: string }> {
    try {
      const response = await axios.get(
        'https://open-api.tiktok.com/share/video/query/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            open_id: openId,
            share_id: shareId
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok publish status error:', error);
      throw new Error('Failed to check publish status');
    }
  }

  // ユーザー統計情報の取得
  async getUserStats(accessToken: string, openId: string) {
    try {
      const response = await axios.get(
        'https://open-api.tiktok.com/user/info/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            open_id: openId,
            fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data.user;
    } catch (error) {
      console.error('TikTok get user info error:', error);
      throw new Error('Failed to get user info');
    }
  }

  // 動画リストの取得
  async getUserVideos(
    accessToken: string,
    openId: string,
    options: {
      cursor?: number;
      max_count?: number;
    } = {}
  ) {
    try {
      const params: any = {
        open_id: openId,
        cursor: options.cursor || 0,
        max_count: options.max_count || 20,
        fields: 'cover_image_url,create_time,share_url,video_id,title,like_count,comment_count,share_count,view_count'
      };

      const response = await axios.get(
        'https://open-api.tiktok.com/video/list/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok get user videos error:', error);
      throw new Error('Failed to get user videos');
    }
  }

  // 動画の詳細情報取得
  async getVideoInfo(
    accessToken: string,
    openId: string,
    videoIds: string[]
  ) {
    try {
      const response = await axios.post(
        'https://open-api.tiktok.com/video/data/',
        {
          open_id: openId,
          filters: {
            video_ids: videoIds
          },
          fields: 'id,title,create_time,cover_image_url,share_url,view_count,like_count,comment_count,share_count,download_count,duration'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data.videos;
    } catch (error) {
      console.error('TikTok get video info error:', error);
      throw new Error('Failed to get video info');
    }
  }

  // 動画のコメント取得
  async getVideoComments(
    accessToken: string,
    openId: string,
    videoId: string,
    options: {
      cursor?: number;
      count?: number;
    } = {}
  ) {
    try {
      const response = await axios.get(
        'https://open-api.tiktok.com/comment/list/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            open_id: openId,
            video_id: videoId,
            cursor: options.cursor || 0,
            count: options.count || 20
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok get video comments error:', error);
      throw new Error('Failed to get video comments');
    }
  }

  // 動画分析データ取得
  async getVideoAnalytics(
    accessToken: string,
    openId: string,
    videoId: string
  ) {
    try {
      const response = await axios.get(
        'https://open-api.tiktok.com/video/analytics/',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            open_id: openId,
            video_id: videoId,
            metrics: 'view_count,like_count,comment_count,share_count,save_count,completion_rate,average_watch_time'
          }
        }
      );

      if (response.data.data.error_code) {
        throw new Error(response.data.data.description);
      }

      return response.data.data;
    } catch (error) {
      console.error('TikTok get video analytics error:', error);
      throw new Error('Failed to get video analytics');
    }
  }
}