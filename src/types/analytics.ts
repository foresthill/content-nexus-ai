export interface ViewCount {
  date: Date;
  count: number;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  averageViewDuration?: number; // 動画のみ
  bounceRate?: number;          // ブログのみ
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
}