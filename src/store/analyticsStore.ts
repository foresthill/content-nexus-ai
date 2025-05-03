import { create } from 'zustand';
import { AnalyticsData } from '../types/analytics';

// モックデータの生成
const generateMockAnalytics = (): AnalyticsData[] => {
  // コンテンツ分析データ
  const contentAnalytics: AnalyticsData = {
    id: 'analytics1',
    contentId: '1',
    totalViews: 1250,
    views: [
      { date: new Date('2025-04-10'), count: 120 },
      { date: new Date('2025-04-11'), count: 145 },
      { date: new Date('2025-04-12'), count: 95 },
      { date: new Date('2025-04-13'), count: 110 },
      { date: new Date('2025-04-14'), count: 180 },
      { date: new Date('2025-04-15'), count: 220 },
      { date: new Date('2025-04-16'), count: 130 },
      { date: new Date('2025-04-17'), count: 90 },
      { date: new Date('2025-04-18'), count: 160 },
    ],
    engagement: {
      likes: 85,
      shares: 42,
      comments: 36,
      bounceRate: 0.35,
    },
    demographics: {
      ageGroups: {
        '18-24': 15,
        '25-34': 40,
        '35-44': 25,
        '45-54': 12,
        '55+': 8
      },
      regions: {
        'Tokyo': 30,
        'Osaka': 15,
        'Nagoya': 10,
        'Other Japan': 25,
        'International': 20
      },
      devices: {
        'mobile': 65,
        'desktop': 30,
        'tablet': 5
      }
    },
    conversionRate: 0.028,
    revenue: 1250
  };

  // 動画分析データ
  const videoAnalytics: AnalyticsData = {
    id: 'analytics2',
    videoId: '1',
    totalViews: 4500,
    views: [
      { date: new Date('2025-04-10'), count: 420 },
      { date: new Date('2025-04-11'), count: 645 },
      { date: new Date('2025-04-12'), count: 495 },
      { date: new Date('2025-04-13'), count: 510 },
      { date: new Date('2025-04-14'), count: 380 },
      { date: new Date('2025-04-15'), count: 520 },
      { date: new Date('2025-04-16'), count: 430 },
      { date: new Date('2025-04-17'), count: 390 },
      { date: new Date('2025-04-18'), count: 710 },
    ],
    engagement: {
      likes: 350,
      shares: 125,
      comments: 78,
      averageViewDuration: 480, // 8分（12分の動画の平均視聴時間）
    },
    demographics: {
      ageGroups: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 20,
        '45-54': 12,
        '55+': 8
      },
      regions: {
        'Tokyo': 25,
        'Osaka': 12,
        'Nagoya': 8,
        'Other Japan': 30,
        'International': 25
      },
      devices: {
        'mobile': 70,
        'desktop': 25,
        'tablet': 5
      }
    }
  };

  return [contentAnalytics, videoAnalytics];
};

interface AnalyticsStore {
  analyticsData: AnalyticsData[];
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
  getContentAnalytics: (contentId: string) => AnalyticsData | undefined;
  getVideoAnalytics: (videoId: string) => AnalyticsData | undefined;
}

const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  analyticsData: [],
  isLoading: false,
  error: null,
  
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // APIから取得する代わりにモックデータを使用
      const mockAnalytics = generateMockAnalytics();
      set({ analyticsData: mockAnalytics, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  getContentAnalytics: (contentId: string) => {
    return get().analyticsData.find(data => data.contentId === contentId);
  },
  
  getVideoAnalytics: (videoId: string) => {
    return get().analyticsData.find(data => data.videoId === videoId);
  }
}));

export default useAnalyticsStore;