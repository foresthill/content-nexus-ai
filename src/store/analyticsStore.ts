import { create } from 'zustand';
import { AnalyticsData } from '../types/analytics';

// モックデータの生成
const generateMockAnalytics = (): AnalyticsData[] => {
  // 日付の生成ヘルパー関数
  const generateDateRange = (days: number): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // 過去30日間の日付を生成
  const dates = generateDateRange(30);
  
  // コンテンツ分析データの詳細化
  const contentAnalytics1: AnalyticsData = {
    id: 'analytics1',
    contentId: '1',
    totalViews: 3250,
    views: dates.map((date, index) => {
      // トレンドを付けて自然な増減を再現
      const baseViews = 80;
      const weekPattern = Math.sin(index / 7 * Math.PI) * 40; // 週次のパターン
      const randomVariation = Math.random() * 30 - 15; // ランダム変動
      const trend = index * 1.5; // 上昇トレンド
      
      return {
        date: new Date(date),
        count: Math.max(20, Math.round(baseViews + weekPattern + randomVariation + trend))
      };
    }),
    engagement: {
      likes: 185,
      shares: 92,
      comments: 76,
      bounceRate: 0.32,
      engagementRate: 4.2,
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
    conversionRate: 0.032,
    revenue: 3250
  };
  
  // SEO記事の分析データ
  const contentAnalytics2: AnalyticsData = {
    id: 'analytics2',
    contentId: '2',
    totalViews: 2100,
    views: dates.map((date, index) => {
      // SEO記事は最初は低く、後半に上昇するパターン
      const baseViews = 30;
      const growth = Math.pow(index / 15, 2) * 80; // 指数関数的な成長
      const randomVariation = Math.random() * 20 - 10;
      
      return {
        date: new Date(date),
        count: Math.max(10, Math.round(baseViews + growth + randomVariation))
      };
    }),
    engagement: {
      likes: 120,
      shares: 68,
      comments: 42,
      bounceRate: 0.28,
      engagementRate: 3.8,
    },
    demographics: {
      ageGroups: {
        '18-24': 10,
        '25-34': 45,
        '35-44': 30,
        '45-54': 10,
        '55+': 5
      },
      regions: {
        'Tokyo': 25,
        'Osaka': 18,
        'Nagoya': 12,
        'Other Japan': 30,
        'International': 15
      },
      devices: {
        'mobile': 55,
        'desktop': 40,
        'tablet': 5
      }
    },
    conversionRate: 0.045,
    revenue: 4200
  };

  // 動画分析データ
  const videoAnalytics1: AnalyticsData = {
    id: 'analytics3',
    videoId: '1',
    totalViews: 8500,
    views: dates.map((date, index) => {
      // 動画は公開直後に急上昇し、その後安定するパターン
      const baseViews = 150;
      const initialSpike = index < 7 ? Math.max(0, 500 - index * 70) : 0;
      const stabilizedViews = index >= 7 ? 200 + Math.random() * 50 : 0;
      
      return {
        date: new Date(date),
        count: Math.round(baseViews + initialSpike + stabilizedViews)
      };
    }),
    engagement: {
      likes: 720,
      shares: 350,
      comments: 180,
      averageViewDuration: 480, // 8分（12分の動画の平均視聴時間）
      engagementRate: 5.1,
    },
    demographics: {
      ageGroups: {
        '18-24': 30,
        '25-34': 35,
        '35-44': 20,
        '45-54': 10,
        '55+': 5
      },
      regions: {
        'Tokyo': 25,
        'Osaka': 12,
        'Nagoya': 8,
        'Other Japan': 30,
        'International': 25
      },
      devices: {
        'mobile': 75,
        'desktop': 20,
        'tablet': 5
      }
    },
    conversionRate: 0.015,
    revenue: 1800
  };
  
  // ショート動画の分析データ
  const videoAnalytics2: AnalyticsData = {
    id: 'analytics4',
    videoId: '2',
    totalViews: 12800,
    views: dates.map((date, index) => {
      // ショート動画はバイラル的に急成長するパターン
      const baseViews = 50;
      const viralGrowth = index > 5 && index < 15 ? Math.pow(index - 5, 2) * 10 : 0;
      const decline = index >= 15 ? Math.max(0, 1000 - (index - 15) * 100) : 0;
      
      return {
        date: new Date(date),
        count: Math.round(baseViews + viralGrowth + decline)
      };
    }),
    engagement: {
      likes: 1850,
      shares: 980,
      comments: 320,
      averageViewDuration: 40, // 40秒（45秒の動画の平均視聴時間）
      engagementRate: 4.5,
    },
    demographics: {
      ageGroups: {
        '18-24': 45,
        '25-34': 30,
        '35-44': 15,
        '45-54': 7,
        '55+': 3
      },
      regions: {
        'Tokyo': 30,
        'Osaka': 15,
        'Nagoya': 10,
        'Other Japan': 25,
        'International': 20
      },
      devices: {
        'mobile': 90,
        'desktop': 8,
        'tablet': 2
      }
    }
  };

  return [contentAnalytics1, contentAnalytics2, videoAnalytics1, videoAnalytics2];
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