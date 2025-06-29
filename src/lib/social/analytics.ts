import { TwitterAuth } from '../auth/twitter';
import { InstagramAuth } from '../auth/instagram';
import { TikTokAuth } from '../auth/tiktok';
import { n8nService } from '../n8n/service';

export interface PlatformMetrics {
  platform: 'twitter' | 'instagram' | 'tiktok';
  followers: number;
  following: number;
  posts: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  growth: {
    followersChange: number;
    engagementRate: number;
  };
}

export interface PostMetrics {
  id: string;
  platform: 'twitter' | 'instagram' | 'tiktok';
  content: string;
  publishedAt: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    reach?: number;
    impressions?: number;
    saves?: number;
  };
  performance: {
    engagementRate: number;
    virality: number;
  };
}

export class SocialAnalyticsService {
  private twitterAuth: TwitterAuth;
  private instagramAuth: InstagramAuth;
  private tiktokAuth: TikTokAuth;

  constructor() {
    this.twitterAuth = new TwitterAuth();
    this.instagramAuth = new InstagramAuth();
    this.tiktokAuth = new TikTokAuth();
  }

  /**
   * Get analytics for all platforms
   */
  async getAllPlatformMetrics(credentials: {
    twitter?: { userId: string; accessToken: string; accessTokenSecret: string };
    instagram?: { accessToken: string };
    tiktok?: { openId: string; accessToken: string };
  }): Promise<PlatformMetrics[]> {
    const metrics: PlatformMetrics[] = [];

    // Twitter metrics
    if (credentials.twitter) {
      try {
        const twitterMetrics = await this.getTwitterMetrics(
          credentials.twitter.userId,
          credentials.twitter.accessToken,
          credentials.twitter.accessTokenSecret
        );
        metrics.push(twitterMetrics);
      } catch (error) {
        console.error('Failed to get Twitter metrics:', error);
      }
    }

    // Instagram metrics
    if (credentials.instagram) {
      try {
        const instagramMetrics = await this.getInstagramMetrics(
          credentials.instagram.accessToken
        );
        metrics.push(instagramMetrics);
      } catch (error) {
        console.error('Failed to get Instagram metrics:', error);
      }
    }

    // TikTok metrics
    if (credentials.tiktok) {
      try {
        const tiktokMetrics = await this.getTikTokMetrics(
          credentials.tiktok.openId,
          credentials.tiktok.accessToken
        );
        metrics.push(tiktokMetrics);
      } catch (error) {
        console.error('Failed to get TikTok metrics:', error);
      }
    }

    // Trigger n8n event with analytics update
    for (const metric of metrics) {
      await n8nService.onAnalyticsUpdated(metric.platform, {
        engagement: metric.engagement.likes + metric.engagement.comments + metric.engagement.shares,
        reach: metric.engagement.views || 0,
        followers: metric.followers,
        growth: metric.growth.followersChange
      });
    }

    return metrics;
  }

  /**
   * Get Twitter metrics
   */
  private async getTwitterMetrics(
    userId: string,
    accessToken: string,
    accessTokenSecret: string
  ): Promise<PlatformMetrics> {
    // Get user info
    const userInfo = await this.twitterAuth.getUserInfo(userId, accessToken, accessTokenSecret);
    
    // Get recent tweets
    const tweets = await this.twitterAuth.getUserTweets(
      userId,
      accessToken,
      accessTokenSecret,
      { max_results: 100 }
    );

    // Calculate engagement
    let totalLikes = 0;
    let totalRetweets = 0;
    let totalReplies = 0;
    let totalImpressions = 0;

    if (tweets.data) {
      for (const tweet of tweets.data) {
        if (tweet.public_metrics) {
          totalLikes += tweet.public_metrics.like_count || 0;
          totalRetweets += tweet.public_metrics.retweet_count || 0;
          totalReplies += tweet.public_metrics.reply_count || 0;
          totalImpressions += tweet.public_metrics.impression_count || 0;
        }
      }
    }

    const followers = userInfo.data?.public_metrics?.followers_count || 0;
    const following = userInfo.data?.public_metrics?.following_count || 0;
    const tweetsCount = userInfo.data?.public_metrics?.tweet_count || 0;

    return {
      platform: 'twitter',
      followers,
      following,
      posts: tweetsCount,
      engagement: {
        likes: totalLikes,
        comments: totalReplies,
        shares: totalRetweets,
        views: totalImpressions
      },
      growth: {
        followersChange: 0, // Would need historical data
        engagementRate: followers > 0 ? ((totalLikes + totalRetweets + totalReplies) / followers) * 100 : 0
      }
    };
  }

  /**
   * Get Instagram metrics
   */
  private async getInstagramMetrics(accessToken: string): Promise<PlatformMetrics> {
    // Get account info
    const accountInfo = await this.instagramAuth.getAccountInfo(accessToken);
    
    // Get recent media
    const media = await this.instagramAuth.getMedia(accessToken, { limit: 50 });
    
    // Get account insights
    const insights = await this.instagramAuth.getAccountInsights(
      accessToken,
      'days_28'
    );

    // Calculate engagement
    let totalLikes = 0;
    let totalComments = 0;
    let totalSaves = 0;
    let totalImpressions = 0;
    let totalReach = 0;

    if (media.data) {
      for (const post of media.data) {
        totalLikes += post.like_count || 0;
        totalComments += post.comments_count || 0;
        totalSaves += post.saved || 0;
        totalImpressions += post.impressions || 0;
        totalReach += post.reach || 0;
      }
    }

    const followers = accountInfo.followers_count || 0;
    const following = accountInfo.follows_count || 0;
    const postsCount = accountInfo.media_count || 0;

    // Extract growth from insights
    let followersChange = 0;
    if (insights.data) {
      const followerMetric = insights.data.find((m: any) => m.name === 'follower_count');
      if (followerMetric && followerMetric.values && followerMetric.values.length > 1) {
        const latestValue = followerMetric.values[followerMetric.values.length - 1].value;
        const previousValue = followerMetric.values[0].value;
        followersChange = latestValue - previousValue;
      }
    }

    return {
      platform: 'instagram',
      followers,
      following,
      posts: postsCount,
      engagement: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalSaves, // Instagram uses saves instead of shares
        views: totalReach
      },
      growth: {
        followersChange,
        engagementRate: followers > 0 ? ((totalLikes + totalComments + totalSaves) / followers) * 100 : 0
      }
    };
  }

  /**
   * Get TikTok metrics
   */
  private async getTikTokMetrics(
    openId: string,
    accessToken: string
  ): Promise<PlatformMetrics> {
    // Get user info
    const userInfo = await this.tiktokAuth.getUserInfo(accessToken, openId);
    
    // Get recent videos
    const videos = await this.tiktokAuth.getUserVideos(
      accessToken,
      openId,
      { max_count: 50 }
    );

    // Calculate engagement
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;

    if (videos.videos) {
      for (const video of videos.videos) {
        totalLikes += video.like_count || 0;
        totalComments += video.comment_count || 0;
        totalShares += video.share_count || 0;
        totalViews += video.view_count || 0;
      }
    }

    const followers = userInfo.follower_count || 0;
    const following = userInfo.following_count || 0;
    const videosCount = userInfo.video_count || 0;

    return {
      platform: 'tiktok',
      followers,
      following,
      posts: videosCount,
      engagement: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        views: totalViews
      },
      growth: {
        followersChange: 0, // Would need historical data
        engagementRate: followers > 0 ? ((totalLikes + totalComments + totalShares) / followers) * 100 : 0
      }
    };
  }

  /**
   * Get post performance across platforms
   */
  async getPostPerformance(
    postIds: {
      twitter?: { tweetId: string; accessToken: string; accessTokenSecret: string };
      instagram?: { mediaId: string; accessToken: string };
      tiktok?: { videoId: string; openId: string; accessToken: string };
    }
  ): Promise<PostMetrics[]> {
    const metrics: PostMetrics[] = [];

    // Twitter post metrics
    if (postIds.twitter) {
      try {
        const tweet = await this.twitterAuth.getTweetMetrics(
          postIds.twitter.tweetId,
          postIds.twitter.accessToken,
          postIds.twitter.accessTokenSecret
        );

        if (tweet.data) {
          metrics.push({
            id: tweet.data.id,
            platform: 'twitter',
            content: tweet.data.text || '',
            publishedAt: new Date(tweet.data.created_at),
            metrics: {
              likes: tweet.data.public_metrics?.like_count || 0,
              comments: tweet.data.public_metrics?.reply_count || 0,
              shares: tweet.data.public_metrics?.retweet_count || 0,
              views: tweet.data.public_metrics?.impression_count || 0
            },
            performance: {
              engagementRate: this.calculateEngagementRate(tweet.data.public_metrics),
              virality: this.calculateVirality(tweet.data.public_metrics)
            }
          });
        }
      } catch (error) {
        console.error('Failed to get Twitter post metrics:', error);
      }
    }

    // Instagram post metrics
    if (postIds.instagram) {
      try {
        const insights = await this.instagramAuth.getMediaInsights(
          postIds.instagram.accessToken,
          postIds.instagram.mediaId
        );

        // Would need additional call to get basic media info
        // This is simplified for now
        if (insights.data) {
          const engagementMetric = insights.data.find((m: any) => m.name === 'engagement');
          const impressionsMetric = insights.data.find((m: any) => m.name === 'impressions');
          const reachMetric = insights.data.find((m: any) => m.name === 'reach');
          
          metrics.push({
            id: postIds.instagram.mediaId,
            platform: 'instagram',
            content: '', // Would need separate API call
            publishedAt: new Date(),
            metrics: {
              likes: 0, // Would need separate API call
              comments: 0,
              shares: 0,
              reach: reachMetric?.values?.[0]?.value || 0,
              impressions: impressionsMetric?.values?.[0]?.value || 0
            },
            performance: {
              engagementRate: engagementMetric?.values?.[0]?.value || 0,
              virality: 0
            }
          });
        }
      } catch (error) {
        console.error('Failed to get Instagram post metrics:', error);
      }
    }

    // TikTok post metrics
    if (postIds.tiktok) {
      try {
        const videoInfo = await this.tiktokAuth.getVideoInfo(
          postIds.tiktok.accessToken,
          postIds.tiktok.openId,
          [postIds.tiktok.videoId]
        );

        if (videoInfo && videoInfo[0]) {
          const video = videoInfo[0];
          metrics.push({
            id: video.id,
            platform: 'tiktok',
            content: video.title || '',
            publishedAt: new Date(video.create_time * 1000),
            metrics: {
              likes: video.like_count || 0,
              comments: video.comment_count || 0,
              shares: video.share_count || 0,
              views: video.view_count || 0
            },
            performance: {
              engagementRate: this.calculateTikTokEngagementRate(video),
              virality: this.calculateTikTokVirality(video)
            }
          });
        }
      } catch (error) {
        console.error('Failed to get TikTok post metrics:', error);
      }
    }

    return metrics;
  }

  /**
   * Calculate engagement rate for Twitter
   */
  private calculateEngagementRate(metrics: any): number {
    if (!metrics) return 0;
    const impressions = metrics.impression_count || 0;
    if (impressions === 0) return 0;
    
    const engagements = (metrics.like_count || 0) + 
                       (metrics.retweet_count || 0) + 
                       (metrics.reply_count || 0) +
                       (metrics.quote_count || 0);
    
    return (engagements / impressions) * 100;
  }

  /**
   * Calculate virality score
   */
  private calculateVirality(metrics: any): number {
    if (!metrics) return 0;
    const shares = metrics.retweet_count || 0;
    const impressions = metrics.impression_count || 0;
    
    if (impressions === 0) return 0;
    return (shares / impressions) * 100;
  }

  /**
   * Calculate TikTok engagement rate
   */
  private calculateTikTokEngagementRate(video: any): number {
    const views = video.view_count || 0;
    if (views === 0) return 0;
    
    const engagements = (video.like_count || 0) + 
                       (video.comment_count || 0) + 
                       (video.share_count || 0);
    
    return (engagements / views) * 100;
  }

  /**
   * Calculate TikTok virality
   */
  private calculateTikTokVirality(video: any): number {
    const views = video.view_count || 0;
    const shares = video.share_count || 0;
    
    if (views === 0) return 0;
    return (shares / views) * 100;
  }
}

export const socialAnalyticsService = new SocialAnalyticsService();