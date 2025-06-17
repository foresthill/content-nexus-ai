import { PlatformBestPractice } from './types';

export const platformBestPractices: Record<string, PlatformBestPractice> = {
  twitter: {
    platform: 'twitter',
    peakHours: [8, 9, 12, 17, 18, 19],
    bestDays: {
      monday: 1.0,
      tuesday: 1.1,
      wednesday: 1.15,
      thursday: 1.1,
      friday: 0.9,
      saturday: 0.8,
      sunday: 0.85
    },
    avoidHours: [0, 1, 2, 3, 4, 5, 23],
    averageEngagement: 0.045, // 4.5% engagement rate
    tips: [
      'Tweet during commute hours (7-9 AM, 5-7 PM)',
      'Lunchtime (12-1 PM) sees high engagement',
      'B2B content performs best on weekdays',
      'Use threads for higher engagement',
      'Include relevant hashtags (1-2 max)'
    ]
  },
  instagram: {
    platform: 'instagram',
    peakHours: [7, 8, 11, 12, 17, 18, 19, 20],
    bestDays: {
      monday: 1.0,
      tuesday: 1.05,
      wednesday: 1.1,
      thursday: 1.05,
      friday: 1.0,
      saturday: 0.95,
      sunday: 0.9
    },
    avoidHours: [0, 1, 2, 3, 4, 5, 22, 23],
    averageEngagement: 0.068, // 6.8% engagement rate
    tips: [
      'Morning posts (7-9 AM) perform well',
      'Lunch break (11 AM-1 PM) is prime time',
      'Evening leisure time (5-8 PM) sees peak engagement',
      'Stories perform best in the evening',
      'Reels get 22% more engagement than regular posts'
    ]
  },
  tiktok: {
    platform: 'tiktok',
    peakHours: [6, 7, 10, 19, 20, 21, 22],
    bestDays: {
      monday: 1.0,
      tuesday: 1.15,
      wednesday: 1.1,
      thursday: 1.2,
      friday: 1.15,
      saturday: 1.0,
      sunday: 0.95
    },
    avoidHours: [0, 1, 2, 3, 4, 5, 11, 12, 13, 14],
    averageEngagement: 0.18, // 18% engagement rate
    tips: [
      'Early morning (6-7 AM) catches early scrollers',
      'Mid-morning (10 AM) is good for reaching students/workers on break',
      'Prime time is evening (7-10 PM)',
      'Thursday has the highest engagement',
      'Post 3-5 times per day for maximum reach'
    ]
  }
};