import { SocialPlatform } from '@/types/social';

export interface TimeSlot {
  hour: number; // 0-23
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'all';
  score: number; // 0-1
  engagement: number; // Expected engagement rate
  reason?: string;
}

export interface EngagementPattern {
  hour: number;
  dayOfWeek: string;
  engagementRate: number;
  averageEngagement: number;
  sampleSize: number;
}

export interface PredictionConfig {
  targetAudience?: {
    ageGroup?: '18-24' | '25-34' | '35-44' | '45+';
    primaryRegion?: 'north_america' | 'europe' | 'asia' | 'oceania';
    interests?: string[];
  };
  contentType?: 'educational' | 'entertainment' | 'news' | 'promotional' | 'lifestyle';
  timeZone: string;
  numberOfSlots: number;
}

export interface PostingTimeAnalysis {
  platform: SocialPlatform;
  timeRange: {
    start: Date;
    end: Date;
  };
  posts: PostAnalysis[];
  averageEngagement: number;
  peakTimes: TimeSlot[];
  lowEngagementTimes: TimeSlot[];
}

export interface PostAnalysis {
  postId: string;
  postedAt: Date;
  hour: number;
  dayOfWeek: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  engagementRate: number;
}

export interface OptimalWindow {
  platform: SocialPlatform;
  window: {
    startHour: number;
    endHour: number;
    days: string[];
  };
  expectedEngagement: number;
  confidence: number;
}

export interface PlatformBestPractice {
  platform: SocialPlatform;
  peakHours: number[];
  bestDays: Record<string, number>; // day -> multiplier
  avoidHours: number[];
  averageEngagement: number;
  tips: string[];
}