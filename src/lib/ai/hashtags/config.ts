// Configuration for hashtag AI services
export const HASHTAG_CONFIG = {
  // External API endpoints (to be implemented)
  apis: {
    twitter: {
      trends: process.env.TWITTER_TRENDS_API_URL || '',
      apiKey: process.env.TWITTER_API_KEY || '',
    },
    instagram: {
      graphApi: process.env.INSTAGRAM_GRAPH_API_URL || '',
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    },
    tiktok: {
      openApi: process.env.TIKTOK_OPEN_API_URL || '',
      apiKey: process.env.TIKTOK_API_KEY || '',
    },
    // Third-party trend analysis services
    trendAnalysis: {
      rapidApi: process.env.RAPIDAPI_KEY || '',
      googleTrends: process.env.GOOGLE_TRENDS_API_KEY || '',
    },
  },

  // Machine Learning Model Configuration
  ml: {
    modelEndpoint: process.env.ML_MODEL_ENDPOINT || '/api/ai/hashtags/model',
    modelVersion: process.env.ML_MODEL_VERSION || '1.0.0',
    features: {
      useContentAnalysis: true,
      useHistoricalData: true,
      useCompetitorAnalysis: false,
      useSentimentAnalysis: true,
    },
  },

  // Hashtag optimization rules
  optimization: {
    // Minimum performance score threshold
    minPerformanceScore: 60,
    
    // Weight factors for different metrics
    weights: {
      trendScore: 0.3,
      relevance: 0.25,
      competition: 0.2,
      engagement: 0.25,
    },
    
    // Platform-specific rules
    platforms: {
      twitter: {
        maxHashtags: 3,
        preferTrending: true,
        includeGeneric: false,
      },
      instagram: {
        maxHashtags: 30,
        optimalRange: [15, 25],
        mixStrategy: {
          popular: 0.3,   // 30% popular hashtags
          medium: 0.5,    // 50% medium competition
          niche: 0.2,     // 20% niche hashtags
        },
      },
      tiktok: {
        maxHashtags: 10,
        preferTrending: true,
        includeChallenge: true,
      },
    },
  },

  // Cache configuration
  cache: {
    trendsExpiry: 3600, // 1 hour in seconds
    suggestionsExpiry: 1800, // 30 minutes
    enabled: process.env.NODE_ENV === 'production',
  },
};

// Target audience categories
export const TARGET_AUDIENCES = [
  { value: 'young_adults', label: '若年層 (18-24歳)' },
  { value: 'professionals', label: 'ビジネスパーソン' },
  { value: 'parents', label: '子育て世代' },
  { value: 'seniors', label: 'シニア層' },
  { value: 'entrepreneurs', label: '起業家・経営者' },
  { value: 'students', label: '学生' },
  { value: 'creators', label: 'クリエイター' },
  { value: 'general', label: '一般' },
];

// Content categories
export const CONTENT_CATEGORIES = [
  { value: 'tech', label: 'テクノロジー' },
  { value: 'business', label: 'ビジネス' },
  { value: 'lifestyle', label: 'ライフスタイル' },
  { value: 'fitness', label: 'フィットネス・健康' },
  { value: 'food', label: '食べ物・料理' },
  { value: 'travel', label: '旅行' },
  { value: 'fashion', label: 'ファッション' },
  { value: 'art', label: 'アート・デザイン' },
  { value: 'education', label: '教育' },
  { value: 'entertainment', label: 'エンターテインメント' },
  { value: 'general', label: '一般' },
];