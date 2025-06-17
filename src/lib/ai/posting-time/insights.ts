import { PostingTimeAnalysis, OptimalWindow } from './types';
import { SocialPlatform } from '@/types/social';

export class PostingTimeInsights {
  async generateInsights(
    engagementData: PostingTimeAnalysis[]
  ): Promise<PostingTimeAnalysis> {
    // Merge insights from multiple platforms if needed
    if (engagementData.length === 1) {
      return engagementData[0];
    }

    // Combine data from multiple platforms
    const combined = this.combineAnalyses(engagementData);
    return combined;
  }

  calculateOptimalWindows(analysis: PostingTimeAnalysis): OptimalWindow[] {
    const windows: OptimalWindow[] = [];
    
    // Group peak times by proximity
    const groupedTimes = this.groupConsecutiveHours(analysis.peakTimes);
    
    groupedTimes.forEach(group => {
      const startHour = Math.min(...group.map(t => t.hour));
      const endHour = Math.max(...group.map(t => t.hour));
      const avgEngagement = group.reduce((sum, t) => sum + t.engagement, 0) / group.length;
      const avgScore = group.reduce((sum, t) => sum + t.score, 0) / group.length;
      
      windows.push({
        platform: analysis.platform,
        window: {
          startHour,
          endHour: endHour === startHour ? endHour + 1 : endHour,
          days: this.getOptimalDays(analysis)
        },
        expectedEngagement: avgEngagement,
        confidence: this.calculateConfidence(avgScore, group.length)
      });
    });

    return windows.sort((a, b) => b.confidence - a.confidence);
  }

  private groupConsecutiveHours(times: any[]): any[][] {
    if (times.length === 0) return [];
    
    const sorted = times.sort((a, b) => a.hour - b.hour);
    const groups: any[][] = [[sorted[0]]];
    
    for (let i = 1; i < sorted.length; i++) {
      const lastGroup = groups[groups.length - 1];
      const lastHour = lastGroup[lastGroup.length - 1].hour;
      
      if (sorted[i].hour - lastHour <= 2) {
        lastGroup.push(sorted[i]);
      } else {
        groups.push([sorted[i]]);
      }
    }
    
    return groups;
  }

  private getOptimalDays(analysis: PostingTimeAnalysis): string[] {
    // Analyze day-of-week patterns
    const dayStats = new Map<string, number>();
    
    analysis.posts.forEach(post => {
      const current = dayStats.get(post.dayOfWeek) || 0;
      dayStats.set(post.dayOfWeek, current + post.engagementRate);
    });
    
    // Get average for each day
    const dayAverages = Array.from(dayStats.entries()).map(([day, total]) => {
      const count = analysis.posts.filter(p => p.dayOfWeek === day).length;
      return { day, average: total / count };
    });
    
    // Sort by average engagement
    dayAverages.sort((a, b) => b.average - a.average);
    
    // Return top performing days (above median)
    const median = dayAverages[Math.floor(dayAverages.length / 2)].average;
    return dayAverages
      .filter(d => d.average >= median)
      .map(d => d.day);
  }

  private calculateConfidence(score: number, sampleSize: number): number {
    // Base confidence on score
    let confidence = score;
    
    // Adjust based on sample size
    if (sampleSize < 5) {
      confidence *= 0.7;
    } else if (sampleSize < 10) {
      confidence *= 0.85;
    } else if (sampleSize < 20) {
      confidence *= 0.95;
    }
    
    return Math.min(confidence, 0.95);
  }

  getRecommendations(analysis: PostingTimeAnalysis): string[] {
    const recommendations: string[] = [];
    
    // Peak time recommendations
    if (analysis.peakTimes.length > 0) {
      const topTime = analysis.peakTimes[0];
      recommendations.push(
        `Your best posting time is ${this.formatHour(topTime.hour)} with ${(topTime.score * 100).toFixed(1)}% engagement rate`
      );
    }
    
    // Avoid time recommendations
    if (analysis.lowEngagementTimes.length > 0) {
      const worstTime = analysis.lowEngagementTimes[0];
      recommendations.push(
        `Avoid posting at ${this.formatHour(worstTime.hour)} (only ${(worstTime.score * 100).toFixed(1)}% engagement)`
      );
    }
    
    // Platform-specific tips
    recommendations.push(...this.getPlatformSpecificTips(analysis.platform));
    
    // Consistency recommendation
    if (analysis.posts.length > 20) {
      recommendations.push(
        'Maintain consistent posting times to build audience expectations'
      );
    }
    
    return recommendations;
  }

  private getPlatformSpecificTips(platform: SocialPlatform): string[] {
    const tips: Record<SocialPlatform, string[]> = {
      twitter: [
        'Tweet during commute hours for maximum visibility',
        'Use Twitter Analytics to refine these recommendations'
      ],
      instagram: [
        'Post Reels in the evening for 22% higher engagement',
        'Use Instagram Insights to track your specific audience activity'
      ],
      tiktok: [
        'Post multiple times per day to maximize reach',
        'Track trending sounds and use them during peak hours'
      ]
    };
    
    return tips[platform] || [];
  }

  async getUserHistoricalPerformance(params: {
    userId: string;
    platform?: SocialPlatform;
    limit: number;
  }): Promise<any> {
    // In a real implementation, fetch from database
    // For now, return simulated data
    return {
      userId: params.userId,
      platform: params.platform,
      totalPosts: params.limit,
      averageEngagement: 0.067,
      bestPerformingHours: [18, 19, 20],
      worstPerformingHours: [2, 3, 4],
      consistency: 0.75
    };
  }

  summarizePerformance(performance: any): any {
    return {
      overallScore: performance.averageEngagement * performance.consistency,
      insights: [
        `Your average engagement rate is ${(performance.averageEngagement * 100).toFixed(1)}%`,
        `You post most consistently during ${performance.bestPerformingHours.join(', ')} hours`,
        `Your posting consistency is ${(performance.consistency * 100).toFixed(0)}%`
      ],
      recommendations: [
        'Increase posting frequency during your best performing hours',
        'Experiment with content types during off-peak hours',
        'Use scheduling to maintain consistency'
      ]
    };
  }

  private combineAnalyses(analyses: PostingTimeAnalysis[]): PostingTimeAnalysis {
    // Combine multiple platform analyses into one
    const allPosts = analyses.flatMap(a => a.posts);
    const avgEngagement = analyses.reduce((sum, a) => sum + a.averageEngagement, 0) / analyses.length;
    
    // Combine peak times
    const allPeakTimes = analyses.flatMap(a => a.peakTimes);
    const topPeaks = allPeakTimes
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      platform: 'twitter', // Default, should be 'all' in a real implementation
      timeRange: {
        start: analyses[0].timeRange.start,
        end: analyses[0].timeRange.end
      },
      posts: allPosts,
      averageEngagement: avgEngagement,
      peakTimes: topPeaks,
      lowEngagementTimes: analyses[0].lowEngagementTimes
    };
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}