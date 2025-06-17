// Test data generator for posting time prediction system

import { PostAnalysis, EngagementPattern } from './types';
import { SocialPlatform } from '@/types/social';

export function generateTestEngagementData(
  platform: SocialPlatform,
  numberOfPosts: number = 100,
  daysBack: number = 30
): PostAnalysis[] {
  const posts: PostAnalysis[] = [];
  const now = new Date();

  for (let i = 0; i < numberOfPosts; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    const hour = Math.floor(Math.random() * 24);
    const postedAt = new Date(now);
    postedAt.setDate(postedAt.getDate() - daysAgo);
    postedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const baseEngagement = getRealisticEngagement(platform, hour, postedAt.getDay());
    const variance = (Math.random() - 0.5) * 0.4; // ±20% variance

    posts.push({
      postId: `${platform}-test-${i}`,
      postedAt,
      hour,
      dayOfWeek: getDayName(postedAt.getDay()),
      engagement: {
        likes: Math.floor(baseEngagement.likes * (1 + variance)),
        shares: Math.floor(baseEngagement.shares * (1 + variance)),
        comments: Math.floor(baseEngagement.comments * (1 + variance)),
        views: Math.floor(baseEngagement.views * (1 + variance))
      },
      engagementRate: baseEngagement.rate * (1 + variance)
    });
  }

  return posts.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
}

function getRealisticEngagement(platform: SocialPlatform, hour: number, dayOfWeek: number) {
  // Hour multipliers based on realistic social media usage patterns
  const hourMultipliers: Record<number, number> = {
    0: 0.3, 1: 0.2, 2: 0.1, 3: 0.1, 4: 0.2, 5: 0.4,
    6: 0.7, 7: 1.0, 8: 1.2, 9: 1.1, 10: 0.9, 11: 1.0,
    12: 1.3, 13: 1.0, 14: 0.8, 15: 0.9, 16: 1.0, 17: 1.2,
    18: 1.4, 19: 1.5, 20: 1.3, 21: 1.1, 22: 0.8, 23: 0.6
  };

  // Day of week multipliers (0 = Sunday, 6 = Saturday)
  const dayMultipliers: Record<number, number> = {
    0: 0.8, // Sunday
    1: 1.0, // Monday
    2: 1.1, // Tuesday
    3: 1.15, // Wednesday
    4: 1.1, // Thursday
    5: 0.9, // Friday
    6: 0.85 // Saturday
  };

  const hourMultiplier = hourMultipliers[hour] || 0.5;
  const dayMultiplier = dayMultipliers[dayOfWeek] || 1.0;
  const combinedMultiplier = hourMultiplier * dayMultiplier;

  // Platform-specific base engagement rates and patterns
  const platformData = {
    twitter: {
      baseLikes: 45,
      baseShares: 8,
      baseComments: 4,
      baseViews: 800,
      baseRate: 0.045,
      // Twitter has higher engagement during commute and lunch hours
      platformMultiplier: hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 1.2 : 1.0
    },
    instagram: {
      baseLikes: 180,
      baseShares: 25,
      baseComments: 12,
      baseViews: 1500,
      baseRate: 0.068,
      // Instagram performs well during leisure hours
      platformMultiplier: hour >= 11 && hour <= 13 || hour >= 19 && hour <= 21 ? 1.3 : 1.0
    },
    tiktok: {
      baseLikes: 420,
      baseShares: 85,
      baseComments: 35,
      baseViews: 3500,
      baseRate: 0.18,
      // TikTok has high engagement in evening hours
      platformMultiplier: hour >= 19 && hour <= 22 ? 1.4 : 1.0
    }
  };

  const data = platformData[platform];
  const finalMultiplier = combinedMultiplier * data.platformMultiplier;

  return {
    likes: Math.max(1, Math.floor(data.baseLikes * finalMultiplier)),
    shares: Math.max(0, Math.floor(data.baseShares * finalMultiplier)),
    comments: Math.max(0, Math.floor(data.baseComments * finalMultiplier)),
    views: Math.max(10, Math.floor(data.baseViews * finalMultiplier)),
    rate: Math.max(0.01, data.baseRate * finalMultiplier)
  };
}

function getDayName(dayIndex: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
}

export function generateEngagementPatterns(testData: PostAnalysis[]): EngagementPattern[] {
  const patterns: EngagementPattern[] = [];
  
  // Group by hour and day
  const grouped = new Map<string, PostAnalysis[]>();
  
  testData.forEach(post => {
    const key = `${post.hour}-${post.dayOfWeek}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(post);
  });

  // Calculate patterns
  grouped.forEach((posts, key) => {
    const [hour, dayOfWeek] = key.split('-');
    
    if (posts.length >= 3) { // Only create patterns with sufficient data
      const avgEngagementRate = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;
      const avgTotalEngagement = posts.reduce((sum, p) => 
        sum + p.engagement.likes + p.engagement.shares + p.engagement.comments, 0
      ) / posts.length;

      patterns.push({
        hour: parseInt(hour),
        dayOfWeek,
        engagementRate: avgEngagementRate,
        averageEngagement: avgTotalEngagement,
        sampleSize: posts.length
      });
    }
  });

  return patterns.sort((a, b) => b.engagementRate - a.engagementRate);
}

// Test scenarios for different content types and audiences
export const testScenarios = {
  youngAdultTwitter: {
    platform: 'twitter' as SocialPlatform,
    targetAudience: { ageGroup: '18-24', primaryRegion: 'north_america' },
    contentType: 'entertainment',
    expectedPeakHours: [20, 21, 22] // Evening hours for young adults
  },
  
  professionalLinkedIn: {
    platform: 'twitter' as SocialPlatform, // Using Twitter as proxy for professional content
    targetAudience: { ageGroup: '25-34', primaryRegion: 'north_america' },
    contentType: 'educational',
    expectedPeakHours: [8, 9, 17, 18] // Business hours
  },
  
  lifestyleInstagram: {
    platform: 'instagram' as SocialPlatform,
    targetAudience: { ageGroup: '25-34', primaryRegion: 'north_america' },
    contentType: 'lifestyle',
    expectedPeakHours: [11, 12, 19, 20] // Lunch and evening leisure
  },
  
  viralTikTok: {
    platform: 'tiktok' as SocialPlatform,
    targetAudience: { ageGroup: '18-24', primaryRegion: 'north_america' },
    contentType: 'entertainment',
    expectedPeakHours: [19, 20, 21, 22] // Prime entertainment hours
  }
};

// Utility function to test prediction accuracy
export function validatePredictions(
  predictions: any[],
  expectedHours: number[],
  tolerance: number = 2
): { accuracy: number; details: any[] } {
  const details: any[] = [];
  let correctPredictions = 0;

  predictions.forEach((prediction, index) => {
    const isCorrect = expectedHours.some(hour => 
      Math.abs(prediction.hour - hour) <= tolerance
    );
    
    if (isCorrect) {
      correctPredictions++;
    }

    details.push({
      prediction: prediction.hour,
      expected: expectedHours,
      correct: isCorrect,
      score: prediction.score
    });
  });

  return {
    accuracy: correctPredictions / predictions.length,
    details
  };
}