import { SocialAnalyticsService } from '../analytics';
import { TwitterAuth } from '../../auth/twitter';
import { InstagramAuth } from '../../auth/instagram';
import { TikTokAuth } from '../../auth/tiktok';
import { n8nService } from '../../n8n/service';

// Mock dependencies
jest.mock('../../auth/twitter');
jest.mock('../../auth/instagram');
jest.mock('../../auth/tiktok');
jest.mock('../../n8n/service');

describe('SocialAnalyticsService', () => {
  let service: SocialAnalyticsService;
  let mockTwitterAuth: jest.Mocked<TwitterAuth>;
  let mockInstagramAuth: jest.Mocked<InstagramAuth>;
  let mockTikTokAuth: jest.Mocked<TikTokAuth>;

  beforeEach(() => {
    service = new SocialAnalyticsService();
    
    // Get mocked instances
    mockTwitterAuth = (TwitterAuth as jest.MockedClass<typeof TwitterAuth>).mock.instances[0] as jest.Mocked<TwitterAuth>;
    mockInstagramAuth = (InstagramAuth as jest.MockedClass<typeof InstagramAuth>).mock.instances[0] as jest.Mocked<InstagramAuth>;
    mockTikTokAuth = (TikTokAuth as jest.MockedClass<typeof TikTokAuth>).mock.instances[0] as jest.Mocked<TikTokAuth>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllPlatformMetrics', () => {
    it('should fetch metrics from all authenticated platforms', async () => {
      // Mock Twitter data
      mockTwitterAuth.getUserInfo.mockResolvedValue({
        data: {
          public_metrics: {
            followers_count: 1000,
            following_count: 500,
            tweet_count: 100
          }
        }
      });

      mockTwitterAuth.getUserTweets.mockResolvedValue({
        data: [
          {
            public_metrics: {
              like_count: 10,
              retweet_count: 5,
              reply_count: 2,
              impression_count: 100
            }
          }
        ]
      });

      // Mock Instagram data
      mockInstagramAuth.getAccountInfo.mockResolvedValue({
        followers_count: 2000,
        follows_count: 800,
        media_count: 200
      });

      mockInstagramAuth.getMedia.mockResolvedValue({
        data: [
          {
            like_count: 50,
            comments_count: 10,
            saved: 5,
            impressions: 500,
            reach: 300
          }
        ]
      });

      mockInstagramAuth.getAccountInsights.mockResolvedValue({
        data: []
      });

      // Mock TikTok data
      mockTikTokAuth.getUserInfo.mockResolvedValue({
        follower_count: 5000,
        following_count: 200,
        video_count: 50
      });

      mockTikTokAuth.getUserVideos.mockResolvedValue({
        videos: [
          {
            like_count: 100,
            comment_count: 20,
            share_count: 10,
            view_count: 1000
          }
        ]
      });

      const credentials = {
        twitter: {
          userId: 'user123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        },
        instagram: {
          accessToken: 'token'
        },
        tiktok: {
          openId: 'open123',
          accessToken: 'token'
        }
      };

      const result = await service.getAllPlatformMetrics(credentials);

      expect(result).toHaveLength(3);
      
      // Check Twitter metrics
      const twitterMetrics = result.find(m => m.platform === 'twitter');
      expect(twitterMetrics).toBeDefined();
      expect(twitterMetrics?.followers).toBe(1000);
      expect(twitterMetrics?.engagement.likes).toBe(10);

      // Check Instagram metrics
      const instagramMetrics = result.find(m => m.platform === 'instagram');
      expect(instagramMetrics).toBeDefined();
      expect(instagramMetrics?.followers).toBe(2000);
      expect(instagramMetrics?.engagement.likes).toBe(50);

      // Check TikTok metrics
      const tiktokMetrics = result.find(m => m.platform === 'tiktok');
      expect(tiktokMetrics).toBeDefined();
      expect(tiktokMetrics?.followers).toBe(5000);
      expect(tiktokMetrics?.engagement.views).toBe(1000);

      // Check n8n service was called
      expect(n8nService.onAnalyticsUpdated).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully for individual platforms', async () => {
      // Twitter fails
      mockTwitterAuth.getUserInfo.mockRejectedValue(new Error('Twitter API error'));

      // Instagram succeeds
      mockInstagramAuth.getAccountInfo.mockResolvedValue({
        followers_count: 2000,
        follows_count: 800,
        media_count: 200
      });
      mockInstagramAuth.getMedia.mockResolvedValue({ data: [] });
      mockInstagramAuth.getAccountInsights.mockResolvedValue({ data: [] });

      const credentials = {
        twitter: {
          userId: 'user123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        },
        instagram: {
          accessToken: 'token'
        }
      };

      const result = await service.getAllPlatformMetrics(credentials);

      // Should only have Instagram metrics
      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe('instagram');
    });

    it('should return empty array when no credentials provided', async () => {
      const result = await service.getAllPlatformMetrics({});
      expect(result).toHaveLength(0);
    });
  });

  describe('getPostPerformance', () => {
    it('should fetch performance metrics for specified posts', async () => {
      // Mock Twitter post data
      mockTwitterAuth.getTweetMetrics.mockResolvedValue({
        data: {
          id: 'tweet123',
          text: 'Test tweet',
          created_at: '2024-01-01T00:00:00Z',
          public_metrics: {
            like_count: 100,
            reply_count: 20,
            retweet_count: 50,
            impression_count: 1000
          }
        }
      });

      // Mock TikTok video data
      mockTikTokAuth.getVideoInfo.mockResolvedValue([
        {
          id: 'video123',
          title: 'Test video',
          create_time: 1704067200, // 2024-01-01
          like_count: 500,
          comment_count: 100,
          share_count: 50,
          view_count: 5000
        }
      ]);

      const postIds = {
        twitter: {
          tweetId: 'tweet123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        },
        tiktok: {
          videoId: 'video123',
          openId: 'open123',
          accessToken: 'token'
        }
      };

      const result = await service.getPostPerformance(postIds);

      expect(result).toHaveLength(2);

      // Check Twitter post metrics
      const twitterPost = result.find(p => p.platform === 'twitter');
      expect(twitterPost).toBeDefined();
      expect(twitterPost?.id).toBe('tweet123');
      expect(twitterPost?.metrics.likes).toBe(100);
      expect(twitterPost?.performance.engagementRate).toBeGreaterThan(0);

      // Check TikTok post metrics
      const tiktokPost = result.find(p => p.platform === 'tiktok');
      expect(tiktokPost).toBeDefined();
      expect(tiktokPost?.id).toBe('video123');
      expect(tiktokPost?.metrics.views).toBe(5000);
      expect(tiktokPost?.performance.engagementRate).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      mockTwitterAuth.getTweetMetrics.mockRejectedValue(new Error('API error'));

      const postIds = {
        twitter: {
          tweetId: 'tweet123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        }
      };

      const result = await service.getPostPerformance(postIds);
      
      // Should return empty array on error
      expect(result).toHaveLength(0);
    });
  });

  describe('Engagement calculations', () => {
    it('should calculate correct engagement rates', async () => {
      mockTwitterAuth.getUserInfo.mockResolvedValue({
        data: {
          public_metrics: {
            followers_count: 1000,
            following_count: 100,
            tweet_count: 50
          }
        }
      });

      mockTwitterAuth.getUserTweets.mockResolvedValue({
        data: [
          {
            public_metrics: {
              like_count: 50,
              retweet_count: 20,
              reply_count: 10,
              impression_count: 500
            }
          },
          {
            public_metrics: {
              like_count: 30,
              retweet_count: 10,
              reply_count: 5,
              impression_count: 300
            }
          }
        ]
      });

      const credentials = {
        twitter: {
          userId: 'user123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        }
      };

      const result = await service.getAllPlatformMetrics(credentials);
      const twitterMetrics = result[0];

      // Total engagement: (50+30) + (20+10) + (10+5) = 125
      // Engagement rate: (125 / 1000) * 100 = 12.5%
      expect(twitterMetrics.growth.engagementRate).toBe(12.5);
    });

    it('should handle zero followers gracefully', async () => {
      mockTwitterAuth.getUserInfo.mockResolvedValue({
        data: {
          public_metrics: {
            followers_count: 0,
            following_count: 0,
            tweet_count: 0
          }
        }
      });

      mockTwitterAuth.getUserTweets.mockResolvedValue({
        data: []
      });

      const credentials = {
        twitter: {
          userId: 'user123',
          accessToken: 'token',
          accessTokenSecret: 'secret'
        }
      };

      const result = await service.getAllPlatformMetrics(credentials);
      const twitterMetrics = result[0];

      expect(twitterMetrics.growth.engagementRate).toBe(0);
    });
  });
});