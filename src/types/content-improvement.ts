export interface ContentAnalysisRequest {
  content: string;
  title?: string;
  platform?: string;
  targetAudience?: string;
  category?: string;
  existingTags?: string[];
}

export interface ContentQualityScore {
  overall: number; // 0-100
  clarity: number;
  structure: number;
  relevance: number;
  originalityScore: number;
  details: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface EngagementPotential {
  score: number; // 0-100
  factors: {
    hooks: number;
    callToAction: number;
    emotionalAppeal: number;
    trending: number;
    visualAppeal: number;
  };
  predictions: {
    expectedLikes: number;
    expectedShares: number;
    expectedComments: number;
    confidence: number;
  };
  recommendations: string[];
}

export interface ReadabilityAnalysis {
  score: number; // 0-100
  metrics: {
    fleschKincaid: number;
    averageSentenceLength: number;
    averageWordsPerSentence: number;
    complexWords: number;
    passiveVoice: number;
  };
  recommendations: {
    simplifyLanguage: string[];
    shortenSentences: string[];
    improveFlow: string[];
  };
  targetAudience: {
    readingLevel: string;
    ageGroup: string;
    expertise: string;
  };
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    trust: number;
  };
  tone: {
    formal: number;
    casual: number;
    professional: number;
    friendly: number;
  };
  optimization: {
    currentTone: string;
    suggestedTone: string;
    adjustments: string[];
  };
}

export interface ContentVariation {
  id: string;
  title: string;
  content: string;
  purpose: string;
  changes: string[];
  expectedImprovement: {
    quality: number;
    engagement: number;
    readability: number;
  };
}

export interface ABTestSuggestion {
  id: string;
  testType: 'title' | 'hook' | 'cta' | 'structure' | 'tone';
  variations: ContentVariation[];
  hypothesis: string;
  metrics: string[];
  duration: number; // days
  confidence: number;
  potentialLift: number; // percentage
}

export interface ContentImprovement {
  id: string;
  originalContent: string;
  quality: ContentQualityScore;
  engagement: EngagementPotential;
  readability: ReadabilityAnalysis;
  sentiment: SentimentAnalysis;
  variations: ContentVariation[];
  abTests: ABTestSuggestion[];
  overallRecommendations: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number; // 0-100
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface ImprovementSuggestion {
  type: 'quality' | 'engagement' | 'readability' | 'sentiment';
  title: string;
  description: string;
  impact: number; // 0-100
  effort: number; // 0-100
  before: string;
  after: string;
  reasoning: string;
  category: string;
}

export interface ContentOptimizationRequest {
  contentId: string;
  improvements: string[];
  targetMetrics: {
    quality?: number;
    engagement?: number;
    readability?: number;
  };
  constraints?: {
    maxLength?: number;
    tone?: string;
    keywords?: string[];
  };
}

export interface ContentOptimizationResult {
  originalContent: string;
  optimizedContent: string;
  improvements: ImprovementSuggestion[];
  metrics: {
    qualityImprovement: number;
    engagementImprovement: number;
    readabilityImprovement: number;
  };
  confidence: number;
  reasoning: string[];
}