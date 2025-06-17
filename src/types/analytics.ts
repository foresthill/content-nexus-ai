export interface ViewCount {
  date: Date;
  count: number;
  platform?: string;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
  averageViewDuration?: number; // 動画のみ
  bounceRate?: number;          // ブログのみ
  engagementRate: number;
  clickThroughRate?: number;
}

export interface DemographicData {
  ageGroups: {
    [key: string]: number;     // "18-24": 30 など
  };
  regions: {
    [key: string]: number;     // "Tokyo": 45 など
  };
  devices: {
    [key: string]: number;     // "mobile": 65 など
  };
  gender?: {
    [key: string]: number;     // "male": 40, "female": 60
  };
  interests?: {
    [key: string]: number;     // Top interests by percentage
  };
}

export interface AnalyticsData {
  id: string;
  contentId?: string;
  videoId?: string;
  views: ViewCount[];
  totalViews: number;
  engagement: EngagementMetrics;
  demographics: DemographicData;
  conversionRate?: number;     // アフィリエイトリンクのコンバージョン率
  revenue?: number;            // 収益（アフィリエイト経由）
  platform: string;
  contentType: 'video' | 'image' | 'text' | 'carousel';
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced interfaces for advanced analytics

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  platform?: string;
  metric: string;
}

export interface KPIMetrics {
  totalEngagement: number;
  averageEngagementRate: number;
  totalReach: number;
  totalImpressions: number;
  followersGrowth: number;
  conversionRate: number;
  revenueGenerated: number;
  contentPublished: number;
  topPerformingContent: string[];
  engagementTrend: 'up' | 'down' | 'stable';
  growthRate: number;
}

export interface ContentPerformanceMetrics {
  contentId: string;
  title: string;
  platform: string;
  contentType: 'video' | 'image' | 'text' | 'carousel';
  publishedAt: Date;
  engagement: EngagementMetrics;
  performance: {
    score: number; // 0-100 performance score
    rank: number;  // Rank among all content
    category: 'viral' | 'high' | 'medium' | 'low';
  };
  audienceReaction: {
    sentiment: 'positive' | 'neutral' | 'negative';
    emotionBreakdown: {
      [emotion: string]: number;
    };
  };
  hashtags?: string[];
  mentions?: string[];
}

export interface AudienceInsights {
  totalFollowers: number;
  activeFollowers: number;
  audienceGrowth: TimeSeriesData[];
  demographics: DemographicData;
  behaviorPatterns: {
    mostActiveHours: number[];
    mostActiveDays: string[];
    averageSessionDuration: number;
    contentPreferences: {
      [contentType: string]: number;
    };
  };
  engagementPatterns: {
    likesToCommentsRatio: number;
    sharesToLikesRatio: number;
    peakEngagementTimes: {
      hour: number;
      day: string;
      engagementRate: number;
    }[];
  };
}

export interface PredictiveAnalytics {
  contentId?: string;
  predictedMetrics: {
    estimatedViews: {
      value: number;
      confidence: number; // 0-1
      timeframe: '24h' | '7d' | '30d';
    };
    estimatedEngagement: {
      value: number;
      confidence: number;
      timeframe: '24h' | '7d' | '30d';
    };
    viralProbability: number; // 0-1
    optimalPostingTime: Date;
  };
  trendsAnalysis: {
    trendingTopics: string[];
    hashtagRecommendations: string[];
    contentTypeRecommendations: string[];
    audienceMoodTrend: 'positive' | 'neutral' | 'negative';
  };
  competitorAnalysis?: {
    averagePerformance: number;
    yourRank: number;
    gapAnalysis: string[];
  };
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  platforms?: string[];
  contentTypes?: string[];
  metrics?: string[];
  compareWith?: 'previous_period' | 'last_year' | 'industry_average';
}

export interface DashboardData {
  kpi: KPIMetrics;
  engagement: TimeSeriesData[];
  audience: AudienceInsights;
  topContent: ContentPerformanceMetrics[];
  predictions: PredictiveAnalytics;
  lastUpdated: Date;
}