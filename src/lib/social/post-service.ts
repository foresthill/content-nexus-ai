import { prisma, handlePrismaError } from '@/lib/prisma';
import { SocialPost, PostStatus, SocialPlatform, PostMetrics } from '@prisma/client';
import { Prisma } from '@prisma/client';

// 投稿作成用の型
export interface CreateSocialPostInput {
  userId: string;
  teamId?: string;
  contentId?: string;
  socialAccountId: string;
  platform: SocialPlatform;
  content: string;
  hashtags?: string[];
  scheduledFor?: Date;
  metadata?: any;
  mediaIds?: string[];
}

// 投稿更新用の型
export interface UpdateSocialPostInput {
  content?: string;
  hashtags?: string[];
  status?: PostStatus;
  scheduledFor?: Date;
  metadata?: any;
}

// 投稿検索条件
export interface PostSearchParams {
  userId?: string;
  teamId?: string;
  platform?: SocialPlatform;
  status?: PostStatus;
  contentId?: string;
  fromDate?: Date;
  toDate?: Date;
  skip?: number;
  take?: number;
}

// 投稿結果更新
export interface PostResultInput {
  platformPostId?: string;
  status: PostStatus;
  publishedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export class SocialPostService {
  /**
   * SNS投稿作成
   */
  static async createPost(input: CreateSocialPostInput): Promise<SocialPost> {
    return handlePrismaError(async () => {
      // SNSアカウントの検証
      const socialAccount = await prisma.socialAccount.findUnique({
        where: { id: input.socialAccountId },
      });

      if (!socialAccount || socialAccount.platform !== input.platform) {
        throw new Error('Invalid social account');
      }

      // 投稿を作成
      const post = await prisma.socialPost.create({
        data: {
          userId: input.userId,
          teamId: input.teamId,
          contentId: input.contentId,
          socialAccountId: input.socialAccountId,
          platform: input.platform,
          content: input.content,
          hashtags: input.hashtags || [],
          status: input.scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT,
          scheduledFor: input.scheduledFor,
          metadata: input.metadata,
        },
        include: {
          socialAccount: true,
          sourceContent: true,
          media: {
            include: {
              media: true,
            },
          },
        },
      });

      // メディアを関連付け
      if (input.mediaIds && input.mediaIds.length > 0) {
        await prisma.socialPostMedia.createMany({
          data: input.mediaIds.map((mediaId, index) => ({
            socialPostId: post.id,
            mediaId,
            order: index,
          })),
        });
      }

      return post;
    }, 'Failed to create social post');
  }

  /**
   * 投稿更新
   */
  static async updatePost(
    postId: string,
    input: UpdateSocialPostInput
  ): Promise<SocialPost> {
    return handlePrismaError(async () => {
      const post = await prisma.socialPost.update({
        where: { id: postId },
        data: input,
        include: {
          socialAccount: true,
          sourceContent: true,
          media: {
            include: {
              media: true,
            },
          },
        },
      });

      return post;
    }, 'Failed to update social post');
  }

  /**
   * 投稿結果更新
   */
  static async updatePostResult(
    postId: string,
    result: PostResultInput
  ): Promise<SocialPost> {
    return handlePrismaError(async () => {
      const updateData: Prisma.SocialPostUpdateInput = {
        status: result.status,
        platformPostId: result.platformPostId,
      };

      if (result.status === PostStatus.PUBLISHED) {
        updateData.publishedAt = result.publishedAt || new Date();
      } else if (result.status === PostStatus.FAILED) {
        updateData.failedAt = result.failedAt || new Date();
        updateData.failureReason = result.failureReason;
        updateData.retryCount = { increment: 1 };
      }

      return prisma.socialPost.update({
        where: { id: postId },
        data: updateData,
      });
    }, 'Failed to update post result');
  }

  /**
   * 投稿取得
   */
  static async getPost(postId: string): Promise<SocialPost | null> {
    return handlePrismaError(async () => {
      return prisma.socialPost.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: true,
          sourceContent: true,
          socialAccount: true,
          media: {
            include: {
              media: true,
            },
            orderBy: { order: 'asc' },
          },
          metrics: {
            orderBy: { capturedAt: 'desc' },
            take: 1,
          },
        },
      });
    }, 'Failed to get post');
  }

  /**
   * 投稿検索
   */
  static async searchPosts(
    params: PostSearchParams
  ): Promise<{ posts: SocialPost[]; total: number }> {
    return handlePrismaError(async () => {
      const where: Prisma.SocialPostWhereInput = {};

      if (params.userId) where.userId = params.userId;
      if (params.teamId) where.teamId = params.teamId;
      if (params.platform) where.platform = params.platform;
      if (params.status) where.status = params.status;
      if (params.contentId) where.contentId = params.contentId;

      if (params.fromDate || params.toDate) {
        where.createdAt = {};
        if (params.fromDate) where.createdAt.gte = params.fromDate;
        if (params.toDate) where.createdAt.lte = params.toDate;
      }

      const [posts, total] = await Promise.all([
        prisma.socialPost.findMany({
          where,
          skip: params.skip || 0,
          take: params.take || 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            socialAccount: true,
            metrics: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.socialPost.count({ where }),
      ]);

      return { posts, total };
    }, 'Failed to search posts');
  }

  /**
   * 予約投稿取得
   */
  static async getScheduledPosts(
    platform?: SocialPlatform
  ): Promise<SocialPost[]> {
    return handlePrismaError(async () => {
      const where: Prisma.SocialPostWhereInput = {
        status: PostStatus.SCHEDULED,
        scheduledFor: {
          lte: new Date(),
        },
      };

      if (platform) where.platform = platform;

      return prisma.socialPost.findMany({
        where,
        include: {
          socialAccount: true,
          media: {
            include: {
              media: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { scheduledFor: 'asc' },
      });
    }, 'Failed to get scheduled posts');
  }

  /**
   * メトリクス更新
   */
  static async updateMetrics(
    postId: string,
    metrics: Omit<PostMetrics, 'id' | 'socialPostId' | 'capturedAt'>
  ): Promise<PostMetrics> {
    return handlePrismaError(async () => {
      return prisma.postMetrics.create({
        data: {
          socialPostId: postId,
          ...metrics,
        },
      });
    }, 'Failed to update metrics');
  }

  /**
   * メトリクス履歴取得
   */
  static async getMetricsHistory(
    postId: string,
    days = 7
  ): Promise<PostMetrics[]> {
    return handlePrismaError(async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      return prisma.postMetrics.findMany({
        where: {
          socialPostId: postId,
          capturedAt: { gte: fromDate },
        },
        orderBy: { capturedAt: 'asc' },
      });
    }, 'Failed to get metrics history');
  }

  /**
   * 投稿削除
   */
  static async deletePost(postId: string): Promise<void> {
    return handlePrismaError(async () => {
      await prisma.socialPost.update({
        where: { id: postId },
        data: { status: PostStatus.DELETED },
      });
    }, 'Failed to delete post');
  }

  /**
   * プラットフォーム別統計
   */
  static async getPlatformStats(
    userId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Record<SocialPlatform, { total: number; published: number; failed: number }>> {
    return handlePrismaError(async () => {
      const where: Prisma.SocialPostWhereInput = { userId };
      
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = fromDate;
        if (toDate) where.createdAt.lte = toDate;
      }

      const stats = await prisma.socialPost.groupBy({
        by: ['platform', 'status'],
        where,
        _count: {
          status: true,
        },
      });

      const result: Record<SocialPlatform, { total: number; published: number; failed: number }> = {
        [SocialPlatform.TWITTER]: { total: 0, published: 0, failed: 0 },
        [SocialPlatform.INSTAGRAM]: { total: 0, published: 0, failed: 0 },
        [SocialPlatform.TIKTOK]: { total: 0, published: 0, failed: 0 },
      };

      stats.forEach((stat) => {
        if (!result[stat.platform]) {
          result[stat.platform] = { total: 0, published: 0, failed: 0 };
        }
        
        result[stat.platform].total += stat._count.status;
        
        if (stat.status === PostStatus.PUBLISHED) {
          result[stat.platform].published = stat._count.status;
        } else if (stat.status === PostStatus.FAILED) {
          result[stat.platform].failed = stat._count.status;
        }
      });

      return result;
    }, 'Failed to get platform stats');
  }

  /**
   * ベストパフォーマンス投稿取得
   */
  static async getTopPosts(
    userId: string,
    platform?: SocialPlatform,
    metric: keyof Pick<PostMetrics, 'likes' | 'comments' | 'shares' | 'engagement'> = 'engagement',
    limit = 10
  ): Promise<(SocialPost & { latestMetrics: PostMetrics })[]> {
    return handlePrismaError(async () => {
      const where: Prisma.SocialPostWhereInput = {
        userId,
        status: PostStatus.PUBLISHED,
      };

      if (platform) where.platform = platform;

      const posts = await prisma.socialPost.findMany({
        where,
        include: {
          metrics: {
            orderBy: { capturedAt: 'desc' },
            take: 1,
          },
          socialAccount: true,
          sourceContent: true,
        },
      });

      // 最新のメトリクスでソート
      const sortedPosts = posts
        .filter((post) => post.metrics.length > 0)
        .sort((a, b) => {
          const aValue = a.metrics[0][metric] as number;
          const bValue = b.metrics[0][metric] as number;
          return bValue - aValue;
        })
        .slice(0, limit);

      return sortedPosts.map((post) => ({
        ...post,
        latestMetrics: post.metrics[0],
      }));
    }, 'Failed to get top posts');
  }
}