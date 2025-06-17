import { EngagementMetrics, DemographicData, TimeSeriesData } from './analytics';

// Base competitor information
export interface CompetitorProfile {
  id: string;
  name: string;
  brandName?: string;
  platforms: CompetitorPlatformInfo[];
  industry: string;
  niche: string[];
  targetAudience: string[];
  location?: string;
  establishedDate?: Date;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  addedAt: Date;
  lastUpdatedAt: Date;
}

export interface CompetitorPlatformInfo {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin';
  handle: string;
  url: string;
  followerCount?: number;
  verified: boolean;
  isActive: boolean;
  lastChecked?: Date;
}

// Content analysis types
export interface CompetitorContent {
  id: string;
  competitorId: string;
  platform: string;
  contentId: string; // Platform-specific content ID
  contentType: 'video' | 'image' | 'text' | 'carousel' | 'story' | 'reel';
  title?: string;
  description?: string;
  hashtags: string[];
  mentions: string[];
  publishedAt: Date;
  thumbnailUrl?: string;
  contentUrl?: string;
  duration?: number; // For videos
  engagement: EngagementMetrics;
  rawMetrics: {
    views?: number;
    plays?: number;
    impressions?: number;
    reach?: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  isSponsored: boolean;
  adType?: 'organic' | 'paid' | 'partnership';
  performance: {
    score: number; // 0-100
    category: 'viral' | 'high' | 'medium' | 'low';
    viralityIndex: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Content strategy analysis
export interface ContentStrategyAnalysis {
  competitorId: string;
  analysisDate: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  
  // Posting patterns
  postingFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    consistency: number; // 0-1 score
  };
  
  optimalPostingTimes: {
    platform: string;
    hours: number[];
    days: string[];
    timezone: string;
  }[];
  
  // Content mix analysis
  contentMix: {
    contentType: string;
    percentage: number;
    avgEngagement: number;
    performance: 'high' | 'medium' | 'low';
  }[];
  
  // Topic analysis
  topicDistribution: {
    topic: string;
    frequency: number;
    engagement: number;
    trending: boolean;
  }[];
  
  // Hashtag strategy
  hashtagStrategy: {
    averageHashtagsPerPost: number;
    mostUsedHashtags: {
      hashtag: string;
      frequency: number;
      avgEngagement: number;
    }[];
    hashtagCategories: {
      category: string;
      percentage: number;
    }[];
  };
  
  // Engagement patterns
  engagementPatterns: {
    averageEngagementRate: number;
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
    bestPerformingContentTypes: {
      type: string;
      avgEngagementRate: number;
    }[];
    audienceInteraction: {
      respondsToComments: boolean;
      avgResponseTime?: number; // in hours
      communityEngagement: number; // 0-1 score
    };
  };
}

// Engagement comparison data
export interface EngagementComparison {
  id: string;
  analysisDate: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  
  // Overall performance comparison
  overallComparison: {
    yourPerformance: CompetitorPerformanceMetrics;
    competitors: CompetitorPerformanceMetrics[];
    industryAverage?: CompetitorPerformanceMetrics;
  };
  
  // Platform-specific comparisons
  platformComparisons: {
    platform: string;
    yourMetrics: EngagementMetrics;
    competitorMetrics: {
      competitorId: string;
      competitorName: string;
      metrics: EngagementMetrics;
    }[];
    benchmark: EngagementMetrics;
  }[];
  
  // Content type performance
  contentTypeComparison: {
    contentType: string;
    yourPerformance: number;
    competitorAverage: number;
    topPerformer: {
      competitorId: string;
      performance: number;
    };
  }[];
  
  // Engagement rate trends
  engagementTrends: {
    competitorId: string;
    competitorName: string;
    trend: TimeSeriesData[];
    growthRate: number; // percentage
  }[];
  
  // Gap analysis
  gapAnalysis: {
    opportunities: GapOpportunity[];
    threats: GapThreat[];
    recommendations: string[];
  };
}

export interface CompetitorPerformanceMetrics {
  competitorId?: string;
  competitorName?: string;
  totalEngagement: number;
  averageEngagementRate: number;
  totalReach: number;
  followerGrowthRate: number;
  contentVolume: number;
  viralContent: number;
  brandMentions: number;
  shareOfVoice: number; // percentage of total industry mentions
}

export interface GapOpportunity {
  type: 'content_type' | 'topic' | 'hashtag' | 'posting_time' | 'platform';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  details: {
    currentPerformance?: number;
    competitorBenchmark?: number;
    improvementPotential?: number;
  };
}

export interface GapThreat {
  type: 'performance_gap' | 'trending_content' | 'audience_overlap' | 'market_share';
  description: string;
  severity: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'near_term' | 'long_term';
  competitorId: string;
  competitorName: string;
}

// Trending topics monitoring
export interface TrendingTopicsAnalysis {
  id: string;
  analysisDate: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  
  // Industry trending topics
  industryTrends: {
    topic: string;
    volume: number;
    growth: number; // percentage change
    sentiment: 'positive' | 'neutral' | 'negative';
    platforms: {
      platform: string;
      volume: number;
      engagement: number;
    }[];
    competitorParticipation: {
      competitorId: string;
      competitorName: string;
      contentCount: number;
      avgEngagement: number;
      shareOfVoice: number;
    }[];
  }[];
  
  // Hashtag trends
  hashtagTrends: {
    hashtag: string;
    volume: number;
    growth: number;
    difficulty: 'low' | 'medium' | 'high'; // competition level
    opportunityScore: number; // 0-100
    competitorUsage: {
      competitorId: string;
      frequency: number;
      performance: number;
    }[];
  }[];
  
  // Emerging opportunities
  emergingOpportunities: {
    trend: string;
    description: string;
    opportunityLevel: 'high' | 'medium' | 'low';
    timeToCapitalize: 'immediate' | 'short_term' | 'long_term';
    competitorActivity: number; // 0-1 scale
    recommendations: string[];
  }[];
  
  // Content format trends
  formatTrends: {
    format: string;
    growthRate: number;
    competitorAdoption: {
      competitorId: string;
      adoptionRate: number;
      performance: number;
    }[];
  }[];
}

// Market positioning analysis
export interface MarketPositioning {
  competitorId: string;
  analysisDate: Date;
  
  // Brand positioning
  brandPosition: {
    primaryCategory: string;
    subcategories: string[];
    brandPersonality: string[];
    valueProposition: string;
    differentiators: string[];
  };
  
  // Audience positioning
  audiencePosition: {
    primaryDemographic: DemographicData;
    audienceOverlap: {
      competitorId: string;
      overlapPercentage: number;
    }[];
    uniqueAudiencePercentage: number;
  };
  
  // Content positioning
  contentPosition: {
    contentPillars: {
      pillar: string;
      percentage: number;
      performance: number;
    }[];
    contentQuality: {
      productionValue: 'high' | 'medium' | 'low';
      consistency: number; // 0-1
      uniqueness: number; // 0-1
    };
    messagingTone: string[];
  };
  
  // Competitive advantages
  competitiveAdvantages: {
    advantage: string;
    strength: 'high' | 'medium' | 'low';
    sustainability: 'high' | 'medium' | 'low';
    description: string;
  }[];
  
  // Market share and positioning
  marketShare: {
    estimatedShare: number; // percentage
    shareOfVoice: number; // percentage
    mindShare: number; // brand awareness/recall
    positionRank: number;
    movementTrend: 'up' | 'down' | 'stable';
  };
}

// Competitive intelligence insights
export interface CompetitiveIntelligence {
  id: string;
  generatedAt: Date;
  analysisType: 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc';
  
  // Key insights summary
  keyInsights: {
    insight: string;
    category: 'opportunity' | 'threat' | 'trend' | 'performance';
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    relatedCompetitors: string[];
  }[];
  
  // Performance benchmarking
  benchmarking: {
    metric: string;
    yourValue: number;
    industryAverage: number;
    topPerformer: {
      competitorId: string;
      value: number;
    };
    percentileRank: number; // Your position in percentile
  }[];
  
  // Strategic recommendations
  recommendations: {
    recommendation: string;
    category: 'content' | 'timing' | 'platform' | 'engagement' | 'targeting';
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: 'immediate' | 'short_term' | 'long_term';
    success_metrics: string[];
  }[];
  
  // Competitive landscape changes
  landscapeChanges: {
    change: string;
    changeType: 'new_competitor' | 'strategy_shift' | 'performance_change' | 'trend_adoption';
    impact: 'positive' | 'negative' | 'neutral';
    competitorId?: string;
    description: string;
    detectedAt: Date;
  }[];
  
  // Market dynamics
  marketDynamics: {
    competitionLevel: 'low' | 'medium' | 'high';
    marketSaturation: number; // 0-1
    barrierToEntry: 'low' | 'medium' | 'high';
    innovationRate: 'low' | 'medium' | 'high';
    trendVolatility: 'low' | 'medium' | 'high';
  };
}

// Analysis filters and configurations
export interface CompetitorAnalysisFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  competitors?: string[]; // competitor IDs
  platforms?: string[];
  contentTypes?: string[];
  metrics?: string[];
  includeIndustryBenchmarks?: boolean;
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

export interface CompetitorTrackingConfig {
  competitorId: string;
  trackingEnabled: boolean;
  platforms: {
    platform: string;
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    lastUpdated?: Date;
  }[];
  alertThresholds: {
    metric: string;
    threshold: number;
    operator: 'greater_than' | 'less_than' | 'percentage_change';
    enabled: boolean;
  }[];
  analysisTypes: {
    contentStrategy: boolean;
    engagementTracking: boolean;
    trendMonitoring: boolean;
    performanceBenchmarking: boolean;
  };
}

// Dashboard and UI types
export interface CompetitorDashboardData {
  overview: {
    totalCompetitors: number;
    activeCompetitors: number;
    platformsCovered: number;
    lastAnalysisDate: Date;
  };
  performanceSnapshot: {
    yourRank: number;
    totalRanked: number;
    topPerformers: {
      competitorId: string;
      competitorName: string;
      score: number;
    }[];
  };
  recentInsights: CompetitiveIntelligence['keyInsights'];
  trendingTopics: TrendingTopicsAnalysis['industryTrends'];
  engagementComparison: EngagementComparison['overallComparison'];
  recommendations: CompetitiveIntelligence['recommendations'];
}

export interface CompetitorSearchResult {
  platform: string;
  handle: string;
  name: string;
  followerCount?: number;
  verified: boolean;
  profileImage?: string;
  description?: string;
  estimatedEngagementRate?: number;
  niche?: string[];
  relevanceScore: number; // 0-1 based on search query
}

// ML Model types for competitive intelligence
export interface CompetitorMLPrediction {
  competitorId: string;
  predictionType: 'engagement_forecast' | 'trend_adoption' | 'content_performance' | 'market_share';
  timeframe: '1w' | '1m' | '3m' | '6m';
  prediction: {
    value: number;
    confidence: number; // 0-1
    factors: {
      factor: string;
      importance: number; // 0-1
      impact: 'positive' | 'negative';
    }[];
  };
  generatedAt: Date;
  modelVersion: string;
}

export interface ContentStrategyRecommendation {
  type: 'content_type' | 'topic' | 'timing' | 'hashtag' | 'format';
  recommendation: string;
  basedOnCompetitor?: string;
  confidence: number; // 0-1
  expectedImpact: {
    metric: string;
    estimatedChange: number; // percentage
  }[];
  implementationDifficulty: 'low' | 'medium' | 'high';
  timeline: 'immediate' | 'short_term' | 'long_term';
}