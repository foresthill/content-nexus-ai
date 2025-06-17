import { SocialPlatform } from '@/types/social';

interface OptimizationInput {
  hashtags: string[];
  trends: any;
  targetAudience?: string;
  platform: SocialPlatform;
}

interface OptimizationResult {
  hashtags: string[];
  performanceScore: number;
  reasoning: string[];
}

interface HashtagMetrics {
  hashtag: string;
  score: number;
  competitionLevel: 'low' | 'medium' | 'high';
  audienceRelevance: number;
  trendAlignment: number;
}

// ML Model simulation for hashtag optimization
export async function optimizeHashtags(
  input: OptimizationInput
): Promise<OptimizationResult> {
  const { hashtags, trends, targetAudience, platform } = input;
  
  // Analyze each hashtag
  const hashtagMetrics = await analyzeHashtags(hashtags, trends, targetAudience, platform);
  
  // Apply optimization algorithm
  const optimizedHashtags = applyOptimizationStrategy(hashtagMetrics, platform);
  
  // Calculate performance score
  const performanceScore = calculatePerformanceScore(optimizedHashtags);
  
  // Generate reasoning
  const reasoning = generateOptimizationReasoning(hashtagMetrics, optimizedHashtags, platform);
  
  return {
    hashtags: optimizedHashtags.map(m => m.hashtag),
    performanceScore,
    reasoning,
  };
}

async function analyzeHashtags(
  hashtags: string[],
  trends: any,
  targetAudience: string | undefined,
  platform: SocialPlatform
): Promise<HashtagMetrics[]> {
  return hashtags.map(hashtag => {
    // Find trend data for this hashtag
    const trendData = trends.topTrends?.find(
      (t: any) => t.hashtag.toLowerCase() === hashtag.toLowerCase()
    );
    
    // Calculate competition level based on trend score
    const competitionLevel = getCompetitionLevel(trendData?.trendScore || 50);
    
    // Calculate audience relevance
    const audienceRelevance = calculateAudienceRelevance(hashtag, targetAudience);
    
    // Calculate trend alignment
    const trendAlignment = trendData ? trendData.trendScore / 100 : 0.3;
    
    // Calculate overall score
    const score = calculateHashtagScore({
      competitionLevel,
      audienceRelevance,
      trendAlignment,
      engagementRate: trendData?.engagementRate || 5,
      platform,
    });
    
    return {
      hashtag,
      score,
      competitionLevel,
      audienceRelevance,
      trendAlignment,
    };
  });
}

function getCompetitionLevel(trendScore: number): 'low' | 'medium' | 'high' {
  if (trendScore >= 80) return 'high';
  if (trendScore >= 50) return 'medium';
  return 'low';
}

function calculateAudienceRelevance(hashtag: string, targetAudience?: string): number {
  if (!targetAudience) return 0.5;
  
  const audienceKeywords: Record<string, string[]> = {
    'young_adults': ['gen', 'young', 'student', 'college', 'youth'],
    'professionals': ['business', 'career', 'professional', 'work', 'corporate'],
    'parents': ['parent', 'family', 'kids', 'children', 'mom', 'dad'],
    'seniors': ['senior', 'elder', 'retirement', 'wisdom'],
    'entrepreneurs': ['startup', 'entrepreneur', 'founder', 'business', 'hustle'],
  };
  
  const keywords = audienceKeywords[targetAudience] || [];
  const matches = keywords.filter(keyword => 
    hashtag.toLowerCase().includes(keyword)
  ).length;
  
  return Math.min(1, matches * 0.3 + 0.4);
}

function calculateHashtagScore(params: {
  competitionLevel: 'low' | 'medium' | 'high';
  audienceRelevance: number;
  trendAlignment: number;
  engagementRate: number;
  platform: SocialPlatform;
}): number {
  const { competitionLevel, audienceRelevance, trendAlignment, engagementRate, platform } = params;
  
  // Platform-specific weights
  const weights = {
    twitter: {
      competition: 0.2,
      audience: 0.3,
      trend: 0.4,
      engagement: 0.1,
    },
    instagram: {
      competition: 0.15,
      audience: 0.25,
      trend: 0.3,
      engagement: 0.3,
    },
    tiktok: {
      competition: 0.1,
      audience: 0.2,
      trend: 0.5,
      engagement: 0.2,
    },
  };
  
  const platformWeights = weights[platform];
  
  // Competition score (inverse - lower competition is better)
  const competitionScore = competitionLevel === 'low' ? 1 : 
                          competitionLevel === 'medium' ? 0.6 : 0.3;
  
  // Normalize engagement rate
  const normalizedEngagement = Math.min(1, engagementRate / 30);
  
  // Calculate weighted score
  const score = 
    competitionScore * platformWeights.competition +
    audienceRelevance * platformWeights.audience +
    trendAlignment * platformWeights.trend +
    normalizedEngagement * platformWeights.engagement;
  
  return score;
}

function applyOptimizationStrategy(
  metrics: HashtagMetrics[],
  platform: SocialPlatform
): HashtagMetrics[] {
  // Sort by score
  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  
  // Platform-specific hashtag mix strategies
  const strategies = {
    twitter: {
      maxHashtags: 3,
      highCompetition: 1,
      mediumCompetition: 1,
      lowCompetition: 1,
    },
    instagram: {
      maxHashtags: 30,
      highCompetition: 5,
      mediumCompetition: 15,
      lowCompetition: 10,
    },
    tiktok: {
      maxHashtags: 10,
      highCompetition: 3,
      mediumCompetition: 5,
      lowCompetition: 2,
    },
  };
  
  const strategy = strategies[platform];
  const optimized: HashtagMetrics[] = [];
  
  // Apply mix strategy
  const byCompetition = {
    high: sorted.filter(m => m.competitionLevel === 'high'),
    medium: sorted.filter(m => m.competitionLevel === 'medium'),
    low: sorted.filter(m => m.competitionLevel === 'low'),
  };
  
  // Add hashtags based on strategy
  optimized.push(...byCompetition.high.slice(0, strategy.highCompetition));
  optimized.push(...byCompetition.medium.slice(0, strategy.mediumCompetition));
  optimized.push(...byCompetition.low.slice(0, strategy.lowCompetition));
  
  // Fill remaining slots with highest scoring hashtags
  const remaining = strategy.maxHashtags - optimized.length;
  if (remaining > 0) {
    const usedHashtags = new Set(optimized.map(m => m.hashtag));
    const unused = sorted.filter(m => !usedHashtags.has(m.hashtag));
    optimized.push(...unused.slice(0, remaining));
  }
  
  return optimized.slice(0, strategy.maxHashtags);
}

function calculatePerformanceScore(metrics: HashtagMetrics[]): number {
  if (metrics.length === 0) return 0;
  
  const avgScore = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
  const diversityBonus = calculateDiversityBonus(metrics);
  
  return Math.round((avgScore * 0.8 + diversityBonus * 0.2) * 100);
}

function calculateDiversityBonus(metrics: HashtagMetrics[]): number {
  const competitionLevels = new Set(metrics.map(m => m.competitionLevel));
  const diversityScore = competitionLevels.size / 3; // Max 3 levels
  
  return diversityScore;
}

function generateOptimizationReasoning(
  allMetrics: HashtagMetrics[],
  optimized: HashtagMetrics[],
  platform: SocialPlatform
): string[] {
  const reasoning: string[] = [];
  
  // Competition mix explanation
  const competitionCounts = {
    high: optimized.filter(m => m.competitionLevel === 'high').length,
    medium: optimized.filter(m => m.competitionLevel === 'medium').length,
    low: optimized.filter(m => m.competitionLevel === 'low').length,
  };
  
  reasoning.push(
    `Optimized hashtag mix: ${competitionCounts.high} high-competition (broad reach), ` +
    `${competitionCounts.medium} medium-competition (balanced), ` +
    `${competitionCounts.low} low-competition (niche targeting)`
  );
  
  // Platform-specific insights
  const platformInsights = {
    twitter: 'Limited to 3 hashtags for optimal engagement on Twitter',
    instagram: 'Using mix of popular and niche hashtags for Instagram discovery',
    tiktok: 'Focused on trending hashtags to maximize TikTok algorithm visibility',
  };
  
  reasoning.push(platformInsights[platform]);
  
  // Top performers
  const topPerformers = optimized.slice(0, 3).map(m => m.hashtag);
  reasoning.push(`Top performing hashtags: ${topPerformers.join(', ')}`);
  
  // Audience alignment
  const avgAudienceRelevance = optimized.reduce((sum, m) => sum + m.audienceRelevance, 0) / optimized.length;
  if (avgAudienceRelevance > 0.7) {
    reasoning.push('Strong alignment with target audience preferences');
  } else if (avgAudienceRelevance > 0.5) {
    reasoning.push('Moderate alignment with target audience');
  }
  
  return reasoning;
}