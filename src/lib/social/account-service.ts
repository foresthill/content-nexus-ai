import { prisma, handlePrismaError } from '@/lib/prisma';
import { SocialAccount, SocialPlatform } from '@prisma/client';

// SNSアカウント作成用の型
export interface CreateSocialAccountInput {
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username?: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenSecret?: string;
  tokenExpiresAt?: Date;
}

// SNSアカウント更新用の型
export interface UpdateSocialAccountInput {
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenSecret?: string;
  tokenExpiresAt?: Date;
  isActive?: boolean;
}

export class SocialAccountService {
  /**
   * SNSアカウント接続
   */
  static async connectAccount(input: CreateSocialAccountInput): Promise<SocialAccount> {
    return handlePrismaError(async () => {
      // 既存の接続を確認
      const existing = await prisma.socialAccount.findUnique({
        where: {
          userId_platform: {
            userId: input.userId,
            platform: input.platform,
          },
        },
      });

      if (existing) {
        // 既存の接続を更新
        return prisma.socialAccount.update({
          where: { id: existing.id },
          data: {
            platformUserId: input.platformUserId,
            username: input.username,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            accessTokenSecret: input.accessTokenSecret,
            tokenExpiresAt: input.tokenExpiresAt,
            isActive: true,
          },
        });
      }

      // 新規接続を作成
      return prisma.socialAccount.create({
        data: input,
      });
    }, 'Failed to connect social account');
  }

  /**
   * SNSアカウント切断
   */
  static async disconnectAccount(
    userId: string,
    platform: SocialPlatform
  ): Promise<void> {
    return handlePrismaError(async () => {
      await prisma.socialAccount.update({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
        data: { isActive: false },
      });
    }, 'Failed to disconnect social account');
  }

  /**
   * ユーザーのSNSアカウント一覧取得
   */
  static async getUserAccounts(userId: string): Promise<SocialAccount[]> {
    return handlePrismaError(async () => {
      return prisma.socialAccount.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }, 'Failed to get user social accounts');
  }

  /**
   * アクティブなSNSアカウント取得
   */
  static async getActiveAccount(
    userId: string,
    platform: SocialPlatform
  ): Promise<SocialAccount | null> {
    return handlePrismaError(async () => {
      return prisma.socialAccount.findFirst({
        where: {
          userId,
          platform,
          isActive: true,
        },
      });
    }, 'Failed to get active social account');
  }

  /**
   * トークン更新
   */
  static async updateTokens(
    userId: string,
    platform: SocialPlatform,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      accessTokenSecret?: string;
      tokenExpiresAt?: Date;
    }
  ): Promise<SocialAccount> {
    return handlePrismaError(async () => {
      return prisma.socialAccount.update({
        where: {
          userId_platform: {
            userId,
            platform,
          },
        },
        data: tokens,
      });
    }, 'Failed to update tokens');
  }

  /**
   * トークンの有効性確認
   */
  static async isTokenValid(
    userId: string,
    platform: SocialPlatform
  ): Promise<boolean> {
    const account = await this.getActiveAccount(userId, platform);
    
    if (!account || !account.isActive) {
      return false;
    }

    // トークン期限がない場合は有効とみなす（Twitter OAuth 1.0a など）
    if (!account.tokenExpiresAt) {
      return true;
    }

    // 期限の5分前にリフレッシュを促す
    const bufferTime = 5 * 60 * 1000; // 5分
    return account.tokenExpiresAt.getTime() > Date.now() + bufferTime;
  }

  /**
   * プラットフォーム別の統計情報取得
   */
  static async getPlatformStats(userId: string): Promise<Record<string, number>> {
    return handlePrismaError(async () => {
      const accounts = await prisma.socialAccount.groupBy({
        by: ['platform'],
        where: {
          userId,
          isActive: true,
        },
        _count: {
          platform: true,
        },
      });

      const stats: Record<string, number> = {};
      accounts.forEach((account) => {
        stats[account.platform] = account._count.platform;
      });

      return stats;
    }, 'Failed to get platform stats');
  }

  /**
   * 複数ユーザーのアカウント情報取得（管理者用）
   */
  static async getAllAccounts(
    skip = 0,
    take = 10,
    platform?: SocialPlatform
  ): Promise<{ accounts: SocialAccount[]; total: number }> {
    return handlePrismaError(async () => {
      const where = platform ? { platform } : {};

      const [accounts, total] = await Promise.all([
        prisma.socialAccount.findMany({
          where,
          skip,
          take,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.socialAccount.count({ where }),
      ]);

      return { accounts, total };
    }, 'Failed to get all accounts');
  }
}