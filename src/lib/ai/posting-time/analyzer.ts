import { PostAnalysis, EngagementPattern, PostingTimeAnalysis } from './types';
import { SocialPlatform } from '@/types/social';

export class EngagementAnalyzer {
  async fetchEngagementData(params: {
    postIds: string[];
    dateRange: { days: number };
    platforms: SocialPlatform[];
  }): Promise<PostingTimeAnalysis[]> {
    // In a real implementation, this would fetch from your database
    // For now, we'll simulate with realistic data
    const analyses: PostingTimeAnalysis[] = [];

    for (const platform of params.platforms) {
      const posts = await this.simulatePostData(platform, params.postIds.length);
      const analysis = this.analyzePostData(platform, posts, params.dateRange);
      analyses.push(analysis);
    }

    return analyses;
  }

  private async simulatePostData(platform: SocialPlatform, count: number): Promise<PostAnalysis[]> {
    const posts: PostAnalysis[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hour = Math.floor(Math.random() * 24);
      const postedAt = new Date(now);
      postedAt.setDate(postedAt.getDate() - daysAgo);
      postedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

      const baseEngagement = this.getBaseEngagement(platform, hour);
      const variance = (Math.random() - 0.5) * 0.4; // ±20% variance

      posts.push({
        postId: `${platform}-${i}`,
        postedAt,
        hour,
        dayOfWeek: this.getDayName(postedAt.getDay()),
        engagement: {
          likes: Math.floor(baseEngagement.likes * (1 + variance)),
          shares: Math.floor(baseEngagement.shares * (1 + variance)),
          comments: Math.floor(baseEngagement.comments * (1 + variance)),
          views: Math.floor(baseEngagement.views * (1 + variance))
        },
        engagementRate: baseEngagement.rate * (1 + variance)
      });
    }

    return posts;
  }

  private getBaseEngagement(platform: SocialPlatform, hour: number) {
    const hourMultipliers: Record<number, number> = {
      6: 0.8, 7: 1.0, 8: 1.2, 9: 1.1, 10: 0.9,
      11: 1.0, 12: 1.2, 13: 0.9, 14: 0.8, 15: 0.9,
      16: 1.0, 17: 1.2, 18: 1.3, 19: 1.4, 20: 1.3,
      21: 1.1, 22: 0.8, 23: 0.6, 0: 0.4, 1: 0.2,
      2: 0.1, 3: 0.1, 4: 0.2, 5: 0.4
    };

    const multiplier = hourMultipliers[hour] || 0.5;

    const baseStats = {
      twitter: { likes: 50, shares: 10, comments: 5, views: 1000, rate: 0.045 },
      instagram: { likes: 200, shares: 30, comments: 15, views: 2000, rate: 0.068 },
      tiktok: { likes: 500, shares: 100, comments: 50, views: 5000, rate: 0.18 }
    };

    const base = baseStats[platform];

    return {
      likes: base.likes * multiplier,
      shares: base.shares * multiplier,
      comments: base.comments * multiplier,
      views: base.views * multiplier,
      rate: base.rate * multiplier
    };
  }

  private analyzePostData(
    platform: SocialPlatform, 
    posts: PostAnalysis[], 
    dateRange: { days: number }
  ): PostingTimeAnalysis {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - dateRange.days);

    // Filter posts within date range
    const filteredPosts = posts.filter(p => p.postedAt >= startDate);

    // Calculate average engagement
    const totalEngagement = filteredPosts.reduce(
      (sum, post) => sum + post.engagementRate, 0
    );
    const averageEngagement = totalEngagement / filteredPosts.length;

    // Find peak and low engagement times
    const hourlyStats = this.calculateHourlyStats(filteredPosts);
    const peakTimes = this.findPeakTimes(hourlyStats);
    const lowTimes = this.findLowEngagementTimes(hourlyStats);

    return {
      platform,
      timeRange: { start: startDate, end: now },
      posts: filteredPosts,
      averageEngagement,
      peakTimes,
      lowEngagementTimes: lowTimes
    };
  }

  private calculateHourlyStats(posts: PostAnalysis[]): Map<number, EngagementPattern> {
    const hourlyData = new Map<number, EngagementPattern>();

    for (let hour = 0; hour < 24; hour++) {
      const hourPosts = posts.filter(p => p.hour === hour);
      
      if (hourPosts.length > 0) {
        const avgEngagement = hourPosts.reduce(
          (sum, p) => sum + p.engagementRate, 0
        ) / hourPosts.length;

        const totalEngagement = hourPosts.reduce(
          (sum, p) => sum + p.engagement.likes + p.engagement.shares + p.engagement.comments, 0
        ) / hourPosts.length;

        hourlyData.set(hour, {
          hour,
          dayOfWeek: 'all',
          engagementRate: avgEngagement,
          averageEngagement: totalEngagement,
          sampleSize: hourPosts.length
        });
      }
    }

    return hourlyData;
  }

  private findPeakTimes(hourlyStats: Map<number, EngagementPattern>): any[] {
    const sorted = Array.from(hourlyStats.values())
      .sort((a, b) => b.engagementRate - a.engagementRate);

    return sorted.slice(0, 5).map(stat => ({
      hour: stat.hour,
      dayOfWeek: 'all',
      score: stat.engagementRate,
      engagement: stat.averageEngagement,
      reason: 'High historical engagement'
    }));
  }

  private findLowEngagementTimes(hourlyStats: Map<number, EngagementPattern>): any[] {
    const sorted = Array.from(hourlyStats.values())
      .sort((a, b) => a.engagementRate - b.engagementRate);

    return sorted.slice(0, 3).map(stat => ({
      hour: stat.hour,
      dayOfWeek: 'all',
      score: stat.engagementRate,
      engagement: stat.averageEngagement,
      reason: 'Low historical engagement'
    }));
  }

  analyzeEngagementPatterns(historicalData: any[]): EngagementPattern[] {
    const patterns: EngagementPattern[] = [];
    
    // Group data by hour and day
    const grouped = new Map<string, any[]>();
    
    historicalData.forEach(data => {
      const key = `${data.hour}-${data.dayOfWeek}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(data);
    });

    // Calculate patterns
    grouped.forEach((dataPoints, key) => {
      const [hour, dayOfWeek] = key.split('-');
      
      const avgEngagementRate = dataPoints.reduce(
        (sum, d) => sum + d.engagementRate, 0
      ) / dataPoints.length;
      
      const avgEngagement = dataPoints.reduce(
        (sum, d) => sum + d.totalEngagement, 0
      ) / dataPoints.length;

      patterns.push({
        hour: parseInt(hour),
        dayOfWeek,
        engagementRate: avgEngagementRate,
        averageEngagement: avgEngagement,
        sampleSize: dataPoints.length
      });
    });

    return patterns;
  }

  private getDayName(dayIndex: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }
}