import { prisma, handlePrismaError } from '@/lib/prisma';
import { Content, ContentStatus, ContentVersion } from '@prisma/client';
import { Prisma } from '@prisma/client';

// コンテンツ作成用の型
export interface CreateContentInput {
  userId: string;
  teamId?: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  metadata?: any;
}

// コンテンツ更新用の型
export interface UpdateContentInput {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: ContentStatus;
  tags?: string[];
  metadata?: any;
}

// コンテンツ検索条件
export interface ContentSearchParams {
  userId?: string;
  teamId?: string;
  status?: ContentStatus;
  tags?: string[];
  search?: string;
  skip?: number;
  take?: number;
}

export class ContentService {
  /**
   * コンテンツ作成
   */
  static async createContent(input: CreateContentInput): Promise<Content> {
    return handlePrismaError(async () => {
      const content = await prisma.content.create({
        data: {
          ...input,
          status: ContentStatus.DRAFT,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: true,
        },
      });

      // 初期バージョンを作成
      await prisma.contentVersion.create({
        data: {
          contentId: content.id,
          userId: input.userId,
          version: 1,
          title: content.title,
          content: content.content,
        },
      });

      return content;
    }, 'Failed to create content');
  }

  /**
   * コンテンツ更新
   */
  static async updateContent(
    contentId: string,
    userId: string,
    input: UpdateContentInput
  ): Promise<Content> {
    return handlePrismaError(async () => {
      // 現在のコンテンツを取得
      const currentContent = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!currentContent) {
        throw new Error('Content not found');
      }

      // 更新を実行
      const updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          ...input,
          publishedAt: input.status === ContentStatus.PUBLISHED 
            ? currentContent.publishedAt || new Date()
            : currentContent.publishedAt,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: true,
        },
      });

      // バージョン履歴を作成（内容が変更された場合）
      if (input.content || input.title) {
        const lastVersion = await prisma.contentVersion.findFirst({
          where: { contentId },
          orderBy: { version: 'desc' },
        });

        await prisma.contentVersion.create({
          data: {
            contentId,
            userId,
            version: (lastVersion?.version || 0) + 1,
            title: updatedContent.title,
            content: updatedContent.content,
            changes: {
              previous: {
                title: currentContent.title,
                content: currentContent.content,
              },
              updated: {
                title: input.title,
                content: input.content,
              },
            },
          },
        });
      }

      return updatedContent;
    }, 'Failed to update content');
  }

  /**
   * コンテンツ取得
   */
  static async getContent(contentId: string): Promise<Content | null> {
    return handlePrismaError(async () => {
      return prisma.content.findUnique({
        where: { id: contentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: true,
          contentMedia: true,
          _count: {
            select: {
              socialPosts: true,
              versions: true,
            },
          },
        },
      });
    }, 'Failed to get content');
  }

  /**
   * コンテンツ検索
   */
  static async searchContents(
    params: ContentSearchParams
  ): Promise<{ contents: Content[]; total: number }> {
    return handlePrismaError(async () => {
      const where: Prisma.ContentWhereInput = {};

      if (params.userId) where.userId = params.userId;
      if (params.teamId) where.teamId = params.teamId;
      if (params.status) where.status = params.status;
      
      if (params.tags && params.tags.length > 0) {
        where.tags = { hasSome: params.tags };
      }

      if (params.search) {
        where.OR = [
          { title: { contains: params.search, mode: 'insensitive' } },
          { content: { contains: params.search, mode: 'insensitive' } },
          { excerpt: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      const [contents, total] = await Promise.all([
        prisma.content.findMany({
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
            team: true,
            _count: {
              select: {
                socialPosts: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.content.count({ where }),
      ]);

      return { contents, total };
    }, 'Failed to search contents');
  }

  /**
   * コンテンツ削除（アーカイブ）
   */
  static async deleteContent(contentId: string): Promise<void> {
    return handlePrismaError(async () => {
      await prisma.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.ARCHIVED },
      });
    }, 'Failed to delete content');
  }

  /**
   * コンテンツ統計情報取得
   */
  static async getContentStats(userId: string): Promise<Record<ContentStatus, number>> {
    return handlePrismaError(async () => {
      const stats = await prisma.content.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true,
        },
      });

      const result: Record<ContentStatus, number> = {
        [ContentStatus.DRAFT]: 0,
        [ContentStatus.REVIEW]: 0,
        [ContentStatus.PUBLISHED]: 0,
        [ContentStatus.ARCHIVED]: 0,
      };

      stats.forEach((stat) => {
        result[stat.status] = stat._count.status;
      });

      return result;
    }, 'Failed to get content stats');
  }

  /**
   * バージョン履歴取得
   */
  static async getContentVersions(
    contentId: string
  ): Promise<ContentVersion[]> {
    return handlePrismaError(async () => {
      return prisma.contentVersion.findMany({
        where: { contentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { version: 'desc' },
      });
    }, 'Failed to get content versions');
  }

  /**
   * 特定バージョンに復元
   */
  static async restoreVersion(
    contentId: string,
    versionId: string,
    userId: string
  ): Promise<Content> {
    return handlePrismaError(async () => {
      const version = await prisma.contentVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || version.contentId !== contentId) {
        throw new Error('Version not found');
      }

      return this.updateContent(contentId, userId, {
        title: version.title,
        content: version.content,
      });
    }, 'Failed to restore version');
  }

  /**
   * 人気タグ取得
   */
  static async getPopularTags(limit = 10): Promise<{ tag: string; count: number }[]> {
    return handlePrismaError(async () => {
      const contents = await prisma.content.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { tags: true },
      });

      // タグを集計
      const tagCounts = new Map<string, number>();
      contents.forEach((content) => {
        content.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      // ソートして上位を返す
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }, 'Failed to get popular tags');
  }
}