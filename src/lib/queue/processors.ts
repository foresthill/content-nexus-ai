import Bull from 'bull';
import { PostJobData, JobResult } from './manager';
import { TwitterAuth } from '../auth/twitter';
import { InstagramAuth } from '../auth/instagram';
import { TikTokAuth } from '../auth/tiktok';

// プロセッサーのインスタンス
const twitterAuth = new TwitterAuth();
const instagramAuth = new InstagramAuth();
const tiktokAuth = new TikTokAuth();

// Twitter投稿プロセッサー
export const processTwitterPost = async (job: Bull.Job<PostJobData>): Promise<JobResult> => {
  const { content, credentials } = job.data;
  
  try {
    // 進捗更新
    await job.progress(10);
    
    // ツイート投稿
    const result = await twitterAuth.postTweet(
      content.text || '',
      content.mediaUrls || [],
      credentials.accessToken,
      credentials.accessTokenSecret || ''
    );
    
    await job.progress(100);
    
    return {
      success: true,
      platform: 'twitter',
      postId: result.data.id,
      timestamp: new Date()
    };
  } catch (error: any) {
    console.error('Twitter post error:', error);
    
    // エラーの種類を判定してリトライ戦略に使用
    if (error.response?.status === 429) {
      throw { code: 'RATE_LIMIT', message: 'Rate limit exceeded' };
    }
    
    throw error;
  }
};

// Instagram投稿プロセッサー
export const processInstagramPost = async (job: Bull.Job<PostJobData>): Promise<JobResult> => {
  const { content, credentials } = job.data;
  
  try {
    await job.progress(10);
    
    // メディアコンテナの作成
    let containerId: string;
    
    if (content.mediaUrls && content.mediaUrls.length > 1) {
      // カルーセル投稿
      const childIds = await Promise.all(
        content.mediaUrls.map(url => 
          instagramAuth.createCarouselChild(
            credentials.accessToken,
            'IMAGE',
            url
          )
        )
      );
      
      await job.progress(50);
      
      containerId = await instagramAuth.createMediaContainer(
        credentials.accessToken,
        'CAROUSEL_ALBUM',
        '',
        content.caption || '',
        { children: childIds }
      );
    } else if (content.mediaUrls && content.mediaUrls.length === 1) {
      // 単一画像投稿
      containerId = await instagramAuth.createMediaContainer(
        credentials.accessToken,
        'IMAGE',
        content.mediaUrls[0],
        content.caption || ''
      );
    } else {
      throw new Error('Instagram requires at least one media');
    }
    
    await job.progress(70);
    
    // メディアの公開
    const publishResult = await instagramAuth.publishMedia(
      credentials.accessToken,
      containerId
    );
    
    await job.progress(100);
    
    return {
      success: true,
      platform: 'instagram',
      postId: publishResult.id,
      timestamp: new Date()
    };
  } catch (error: any) {
    console.error('Instagram post error:', error);
    
    if (error.response?.data?.error?.code === 190) {
      throw { code: 'TOKEN_EXPIRED', message: 'Access token expired' };
    }
    
    throw error;
  }
};

// TikTok投稿プロセッサー
export const processTikTokPost = async (job: Bull.Job<PostJobData>): Promise<JobResult> => {
  const { content, credentials, metadata } = job.data;
  
  try {
    await job.progress(10);
    
    if (!content.mediaUrls || content.mediaUrls.length === 0) {
      throw new Error('TikTok requires video media');
    }
    
    // 動画アップロードの初期化
    const { upload_id } = await tiktokAuth.initializeVideoUpload(
      credentials.accessToken,
      credentials.openId || '',
      metadata.videoSize || 0
    );
    
    await job.progress(30);
    
    // 動画のアップロード（実際の実装では動画データを取得してチャンクアップロード）
    // ここでは簡略化
    
    await job.progress(70);
    
    // 動画の公開
    const publishResult = await tiktokAuth.publishVideo(
      credentials.accessToken,
      credentials.openId || '',
      upload_id,
      content.caption || ''
    );
    
    await job.progress(90);
    
    // 公開状態の確認
    let retries = 0;
    let status;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await tiktokAuth.checkPublishStatus(
        credentials.accessToken,
        credentials.openId || '',
        publishResult.share_id
      );
      retries++;
    } while (status.status === 'processing' && retries < 10);
    
    await job.progress(100);
    
    return {
      success: true,
      platform: 'tiktok',
      postId: status.video_id,
      timestamp: new Date()
    };
  } catch (error: any) {
    console.error('TikTok post error:', error);
    
    if (error.message?.includes('token')) {
      // トークンリフレッシュが必要
      if (credentials.refreshToken) {
        try {
          const newTokens = await tiktokAuth.refreshAccessToken(credentials.refreshToken);
          // 新しいトークンで再試行するためエラーをスロー
          throw { 
            code: 'TOKEN_REFRESH_NEEDED', 
            message: 'Token refresh required',
            newTokens 
          };
        } catch {
          throw { code: 'TOKEN_REFRESH_FAILED', message: 'Failed to refresh token' };
        }
      }
    }
    
    throw error;
  }
};

// メインプロセッサー
export const processPost = async (job: Bull.Job<PostJobData>): Promise<JobResult> => {
  const { platform } = job.data;
  
  console.log(`Processing ${platform} post job ${job.id}`);
  
  try {
    switch (platform) {
      case 'twitter':
        return await processTwitterPost(job);
      
      case 'instagram':
        return await processInstagramPost(job);
      
      case 'tiktok':
        return await processTikTokPost(job);
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Failed to process ${platform} post:`, error);
    throw error;
  }
};