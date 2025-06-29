import { prisma, handlePrismaError } from '@/lib/prisma';
import { AnalyticsData, AnalyticsPeriod, SocialPlatform } from '@prisma/client';
import { Prisma } from '@prisma/client';

// 分析データ作成用の型
export interface CreateAnalyticsInput {
  userId: string;
  platform?: SocialPlatform;
  metric: string;
  value: number;
  metadata?: any;
  period: AnalyticsPeriod;
  periodStart: Date;
  periodEnd: Date;
}

// 分析データ検索条件
export interface AnalyticsSearchParams {
  userId?: string;
  platform?: SocialPlatform;
  metric?: string;
  period?: AnalyticsPeriod;
  fromDate?: Date;
  toDate?: Date;
  skip?: number;
  take?: number;
}

// メトリクス集計結果
export interface MetricAggregation {
  metric: string;
  platform?: SocialPlatform;
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

export class AnalyticsService {
  /**
   * 分析データ保存
   */
  static async saveAnalytics(input: CreateAnalyticsInput): Promise<AnalyticsData> {
    return handlePrismaError(async () => {
      // 同じ期間・メトリクスのデータが既にある場合は更新
      const existing = await prisma.analyticsData.findFirst({
        where: {
          userId: input.userId,
          platform: input.platform,
          metric: input.metric,
          period: input.period,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        },
      });

      if (existing) {
        return prisma.analyticsData.update({
          where: { id: existing.id },
          data: {
            value: input.value,
            metadata: input.metadata,
            capturedAt: new Date(),
          },
        });
      }

      return prisma.analyticsData.create({
        data: input,
      });
    }, 'Failed to save analytics');
  }

  /**
   * 複数の分析データを一括保存
   */
  static async saveAnalyticsBatch(
    inputs: CreateAnalyticsInput[]
  ): Promise<number> {
    return handlePrismaError(async () => {
      const result = await prisma.analyticsData.createMany({
        data: inputs,
        skipDuplicates: true,
      });

      return result.count;
    }, 'Failed to save analytics batch');
  }

  /**
   * 分析データ検索
   */
  static async searchAnalytics(
    params: AnalyticsSearchParams
  ): Promise<{ data: AnalyticsData[]; total: number }> {
    return handlePrismaError(async () => {
      const where: Prisma.AnalyticsDataWhereInput = {};

      if (params.userId) where.userId = params.userId;
      if (params.platform) where.platform = params.platform;
      if (params.metric) where.metric = params.metric;
      if (params.period) where.period = params.period;

      if (params.fromDate || params.toDate) {
        where.periodStart = {};
        if (params.fromDate) where.periodStart.gte = params.fromDate;
        if (params.toDate) where.periodStart.lte = params.toDate;
      }

      const [data, total] = await Promise.all([
        prisma.analyticsData.findMany({
          where,
          skip: params.skip || 0,
          take: params.take || 100,
          orderBy: { periodStart: 'desc' },
        }),
        prisma.analyticsData.count({ where }),
      ]);

      return { data, total };
    }, 'Failed to search analytics');
  }

  /**
   * 最新のメトリクス取得
   */
  static async getLatestMetrics(
    userId: string,
    platform?: SocialPlatform
  ): Promise<Record<string, number>> {
    return handlePrismaError(async () => {
      const where: Prisma.AnalyticsDataWhereInput = { userId };
      if (platform) where.platform = platform;

      // 各メトリクスの最新値を取得
      const metrics = await prisma.analyticsData.findMany({
        where,
        distinct: ['metric'],
        orderBy: { capturedAt: 'desc' },
      });

      const result: Record<string, number> = {};
      metrics.forEach((metric) => {
        result[metric.metric] = metric.value;
      });

      return result;
    }, 'Failed to get latest metrics');
  }

  /**
   * 時系列データ取得
   */
  static async getTimeSeriesData(
    userId: string,
    metric: string,
    period: AnalyticsPeriod,
    fromDate: Date,
    toDate: Date,
    platform?: SocialPlatform
  ): Promise<AnalyticsData[]> {
    return handlePrismaError(async () => {
      const where: Prisma.AnalyticsDataWhereInput = {
        userId,
        metric,
        period,
        periodStart: { gte: fromDate },
        periodEnd: { lte: toDate },
      };

      if (platform) where.platform = platform;

      return prisma.analyticsData.findMany({
        where,
        orderBy: { periodStart: 'asc' },
      });
    }, 'Failed to get time series data');
  }

  /**
   * メトリクス集計
   */
  static async aggregateMetrics(
    userId: string,
    metric: string,
    fromDate: Date,
    toDate: Date,
    platform?: SocialPlatform
  ): Promise<MetricAggregation> {
    return handlePrismaError(async () => {
      const where: Prisma.AnalyticsDataWhereInput = {
        userId,
        metric,
        periodStart: { gte: fromDate },
        periodEnd: { lte: toDate },
      };

      if (platform) where.platform = platform;

      const aggregation = await prisma.analyticsData.aggregate({
        where,
        _sum: { value: true },
        _avg: { value: true },
        _min: { value: true },
        _max: { value: true },
        _count: true,
      });

      return {
        metric,
        platform,
        total: aggregation._sum.value || 0,
        average: aggregation._avg.value || 0,
        min: aggregation._min.value || 0,
        max: aggregation._max.value || 0,
        count: aggregation._count,
      };
    }, 'Failed to aggregate metrics');
  }

  /**
   * プラットフォーム比較データ取得
   */
  static async comparePlatforms(
    userId: string,
    metric: string,
    period: AnalyticsPeriod,
    fromDate: Date,
    toDate: Date
  ): Promise<Record<SocialPlatform, MetricAggregation>> {
    return handlePrismaError(async () => {
      const platforms = Object.values(SocialPlatform);
      const comparisons = await Promise.all(
        platforms.map((platform) =>
          this.aggregateMetrics(userId, metric, fromDate, toDate, platform)
        )
      );

      const result: Record<SocialPlatform, MetricAggregation> = {} as any;
      platforms.forEach((platform, index) => {
        result[platform] = comparisons[index];
      });

      return result;
    }, 'Failed to compare platforms');
  }

  /**
   * 成長率計算
   */
  static async calculateGrowthRate(
    userId: string,
    metric: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
    platform?: SocialPlatform
  ): Promise<{ current: number; previous: number; growthRate: number }> {
    return handlePrismaError(async () => {
      const [currentData, previousData] = await Promise.all([
        this.aggregateMetrics(userId, metric, currentPeriodStart, currentPeriodEnd, platform),
        this.aggregateMetrics(userId, metric, previousPeriodStart, previousPeriodEnd, platform),
      ]);

      const current = currentData.average;
      const previous = previousData.average;
      const growthRate = previous === 0 ? 0 : ((current - previous) / previous) * 100;

      return {
        current,
        previous,
        growthRate,
      };
    }, 'Failed to calculate growth rate');
  }

  /**
   * トップメトリクス取得
   */
  static async getTopMetrics(
    userId: string,
    limit = 5,
    period: AnalyticsPeriod = AnalyticsPeriod.DAY
  ): Promise<{ metric: string; value: number; platform?: SocialPlatform }[]> {
    return handlePrismaError(async () => {
      // 過去7日間のデータを対象
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);

      const data = await prisma.analyticsData.findMany({
        where: {
          userId,
          period,
          periodStart: { gte: fromDate },
          periodEnd: { lte: toDate },
        },
        orderBy: { value: 'desc' },
        take: limit,
        select: {
          metric: true,
          value: true,
          platform: true,
        },
      });

      return data;
    }, 'Failed to get top metrics');
  }

  /**
   * 古いデータのクリーンアップ
   */
  static async cleanupOldData(daysToKeep = 90): Promise<number> {
    return handlePrismaError(async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.analyticsData.deleteMany({
        where: {
          capturedAt: { lt: cutoffDate },
        },
      });

      return result.count;
    }, 'Failed to cleanup old data');
  }

  /**
   * カスタムメトリクス定義の保存
   */
  static async defineCustomMetric(
    name: string,
    description: string,
    formula?: string
  ): Promise<void> {
    // カスタムメトリクスの定義はmetadataフィールドを使用して保存
    return handlePrismaError(async () => {
      await prisma.analyticsData.create({
        data: {
          userId: 'system', // システム定義として保存
          metric: `custom_metric_definition_${name}`,
          value: 0,
          period: AnalyticsPeriod.YEAR,
          periodStart: new Date('2000-01-01'),
          periodEnd: new Date('2999-12-31'),
          metadata: {
            type: 'metric_definition',
            name,
            description,
            formula,
          },
        },
      });
    }, 'Failed to define custom metric');
  }
}