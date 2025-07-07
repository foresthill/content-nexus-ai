import Bull from 'bull';
import { 
  processTwitterPost, 
  processInstagramPost, 
  processTikTokPost, 
  processPost 
} from '../processors';
import { TwitterAuth } from '../../auth/twitter';
import { InstagramAuth } from '../../auth/instagram';
import { TikTokAuth } from '../../auth/tiktok';
import { n8nService } from '../../n8n/service';
import { PostJobData } from '../manager';

// Mock dependencies
jest.mock('../../auth/twitter');
jest.mock('../../auth/instagram');
jest.mock('../../auth/tiktok');
jest.mock('../../n8n/service');

describe('Queue Processors', () => {
  let mockJob: jest.Mocked<Bull.Job<PostJobData>>;
  let mockTwitterAuth: jest.Mocked<TwitterAuth>;
  let mockInstagramAuth: jest.Mocked<InstagramAuth>;
  let mockTikTokAuth: jest.Mocked<TikTokAuth>;

  beforeEach(() => {
    // Create mock job
    mockJob = {
      id: 'job-123',
      data: {
        id: 'post-123',
        platform: 'twitter',
        content: {
          text: 'Test tweet',
          mediaUrls: []
        },
        credentials: {
          accessToken: 'token',
          accessTokenSecret: 'secret'
        },
        userId: 'user123'
      },
      progress: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Get mocked instances
    mockTwitterAuth = (TwitterAuth as jest.MockedClass<typeof TwitterAuth>).mock.instances[0] as jest.Mocked<TwitterAuth>;
    mockInstagramAuth = (InstagramAuth as jest.MockedClass<typeof InstagramAuth>).mock.instances[0] as jest.Mocked<InstagramAuth>;
    mockTikTokAuth = (TikTokAuth as jest.MockedClass<typeof TikTokAuth>).mock.instances[0] as jest.Mocked<TikTokAuth>;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('processTwitterPost', () => {
    it('should successfully post a tweet', async () => {
      const mockResponse = {
        data: {
          id: 'tweet-456'
        }
      };

      mockTwitterAuth.postTweet.mockResolvedValue(mockResponse);

      const result = await processTwitterPost(mockJob);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('twitter');
      expect(result.postId).toBe('tweet-456');

      expect(mockTwitterAuth.postTweet).toHaveBeenCalledWith(
        'Test tweet',
        [],
        'token',
        'secret'
      );

      expect(mockJob.progress).toHaveBeenCalledWith(10);
      expect(mockJob.progress).toHaveBeenCalledWith(100);

      // Check n8n event was triggered
      expect(n8nService.onPostPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'post-123',
          platform: 'twitter',
          content: 'Test tweet'
        })
      );
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = {
        response: {
          status: 429
        }
      };

      mockTwitterAuth.postTweet.mockRejectedValue(rateLimitError);

      await expect(processTwitterPost(mockJob)).rejects.toEqual({
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded'
      });
    });

    it('should propagate other errors', async () => {
      const genericError = new Error('Network error');
      mockTwitterAuth.postTweet.mockRejectedValue(genericError);

      await expect(processTwitterPost(mockJob)).rejects.toThrow('Network error');
    });
  });

  describe('processInstagramPost', () => {
    beforeEach(() => {
      mockJob.data.platform = 'instagram';
      mockJob.data.content = {
        caption: 'Test caption',
        mediaUrls: ['https://example.com/image.jpg']
      };
    });

    it('should successfully post a single image', async () => {
      mockInstagramAuth.createMediaContainer.mockResolvedValue('container-123');
      mockInstagramAuth.publishMedia.mockResolvedValue({ id: 'media-456' });

      const result = await processInstagramPost(mockJob);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('instagram');
      expect(result.postId).toBe('media-456');

      expect(mockInstagramAuth.createMediaContainer).toHaveBeenCalledWith(
        'token',
        'IMAGE',
        'https://example.com/image.jpg',
        'Test caption'
      );

      expect(mockInstagramAuth.publishMedia).toHaveBeenCalledWith(
        'token',
        'container-123'
      );

      // Check n8n event was triggered
      expect(n8nService.onPostPublished).toHaveBeenCalled();
    });

    it('should successfully post a carousel', async () => {
      mockJob.data.content.mediaUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ];

      mockInstagramAuth.createCarouselChild
        .mockResolvedValueOnce('child-1')
        .mockResolvedValueOnce('child-2');
      mockInstagramAuth.createMediaContainer.mockResolvedValue('container-123');
      mockInstagramAuth.publishMedia.mockResolvedValue({ id: 'media-456' });

      const result = await processInstagramPost(mockJob);

      expect(result.success).toBe(true);
      expect(mockInstagramAuth.createCarouselChild).toHaveBeenCalledTimes(2);
      expect(mockInstagramAuth.createMediaContainer).toHaveBeenCalledWith(
        'token',
        'CAROUSEL_ALBUM',
        '',
        'Test caption',
        { children: ['child-1', 'child-2'] }
      );
    });

    it('should handle token expiration', async () => {
      const tokenError = {
        response: {
          data: {
            error: {
              code: 190
            }
          }
        }
      };

      mockInstagramAuth.createMediaContainer.mockRejectedValue(tokenError);

      await expect(processInstagramPost(mockJob)).rejects.toEqual({
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired'
      });
    });

    it('should reject when no media provided', async () => {
      mockJob.data.content.mediaUrls = [];

      await expect(processInstagramPost(mockJob)).rejects.toThrow(
        'Instagram requires at least one media'
      );
    });
  });

  describe('processTikTokPost', () => {
    beforeEach(() => {
      mockJob.data.platform = 'tiktok';
      mockJob.data.content = {
        caption: 'Test video',
        mediaUrls: ['https://example.com/video.mp4']
      };
      mockJob.data.credentials = {
        accessToken: 'token',
        openId: 'open123'
      };
      mockJob.data.metadata = {
        videoSize: 1000000
      };
    });

    it('should successfully post a video', async () => {
      mockTikTokAuth.initializeVideoUpload.mockResolvedValue({
        upload_id: 'upload-123'
      });

      mockTikTokAuth.publishVideo.mockResolvedValue({
        share_id: 'share-123'
      });

      mockTikTokAuth.checkPublishStatus.mockResolvedValue({
        status: 'published',
        video_id: 'video-456'
      });

      const result = await processTikTokPost(mockJob);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('tiktok');
      expect(result.postId).toBe('video-456');

      expect(mockTikTokAuth.initializeVideoUpload).toHaveBeenCalledWith(
        'token',
        'open123',
        1000000
      );

      expect(mockTikTokAuth.publishVideo).toHaveBeenCalledWith(
        'token',
        'open123',
        'upload-123',
        'Test video'
      );

      // Check n8n event was triggered
      expect(n8nService.onPostPublished).toHaveBeenCalled();
    });

    it('should handle token refresh', async () => {
      const tokenError = new Error('Invalid token');
      mockJob.data.credentials.refreshToken = 'refresh-token';

      mockTikTokAuth.initializeVideoUpload.mockRejectedValue(tokenError);
      mockTikTokAuth.refreshAccessToken.mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'new-refresh'
      });

      await expect(processTikTokPost(mockJob)).rejects.toEqual({
        code: 'TOKEN_REFRESH_NEEDED',
        message: 'Token refresh required',
        newTokens: {
          access_token: 'new-token',
          refresh_token: 'new-refresh'
        }
      });
    });

    it('should reject when no video provided', async () => {
      mockJob.data.content.mediaUrls = [];

      await expect(processTikTokPost(mockJob)).rejects.toThrow(
        'TikTok requires video media'
      );
    });

    it('should timeout if video processing takes too long', async () => {
      mockTikTokAuth.initializeVideoUpload.mockResolvedValue({
        upload_id: 'upload-123'
      });

      mockTikTokAuth.publishVideo.mockResolvedValue({
        share_id: 'share-123'
      });

      // Always return processing status
      mockTikTokAuth.checkPublishStatus.mockResolvedValue({
        status: 'processing'
      });

      const result = await processTikTokPost(mockJob);

      // Should still succeed but without video_id
      expect(result.success).toBe(true);
      expect(result.postId).toBeUndefined();
      expect(mockTikTokAuth.checkPublishStatus).toHaveBeenCalledTimes(10);
    });
  });

  describe('processPost', () => {
    it('should route to correct processor based on platform', async () => {
      // Twitter
      mockJob.data.platform = 'twitter';
      mockTwitterAuth.postTweet.mockResolvedValue({ data: { id: 'tweet-123' } });
      
      await processPost(mockJob);
      expect(mockTwitterAuth.postTweet).toHaveBeenCalled();

      // Instagram
      mockJob.data.platform = 'instagram';
      mockJob.data.content.mediaUrls = ['image.jpg'];
      mockInstagramAuth.createMediaContainer.mockResolvedValue('container-123');
      mockInstagramAuth.publishMedia.mockResolvedValue({ id: 'media-123' });
      
      await processPost(mockJob);
      expect(mockInstagramAuth.createMediaContainer).toHaveBeenCalled();

      // TikTok
      mockJob.data.platform = 'tiktok';
      mockJob.data.content.mediaUrls = ['video.mp4'];
      mockJob.data.credentials.openId = 'open123';
      mockTikTokAuth.initializeVideoUpload.mockResolvedValue({ upload_id: 'up-123' });
      mockTikTokAuth.publishVideo.mockResolvedValue({ share_id: 'share-123' });
      mockTikTokAuth.checkPublishStatus.mockResolvedValue({ 
        status: 'published', 
        video_id: 'vid-123' 
      });
      
      await processPost(mockJob);
      expect(mockTikTokAuth.initializeVideoUpload).toHaveBeenCalled();
    });

    it('should reject unsupported platforms', async () => {
      mockJob.data.platform = 'unsupported' as any;
      
      await expect(processPost(mockJob)).rejects.toThrow(
        'Unsupported platform: unsupported'
      );
    });

    it('should log and propagate errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockJob.data.platform = 'twitter';
      const error = new Error('API Error');
      mockTwitterAuth.postTweet.mockRejectedValue(error);
      
      await expect(processPost(mockJob)).rejects.toThrow('API Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to process twitter post:',
        error
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});