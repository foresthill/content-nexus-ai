import type { EngagementPotential } from '@/types/content-improvement';

interface EngagementAnalysisInput {
  content: string;
  title?: string;
  platform?: string;
  targetAudience?: string;
  category?: string;
}

export async function analyzeEngagementPotential(input: EngagementAnalysisInput): Promise<EngagementPotential> {
  const { content, title, platform, targetAudience, category } = input;

  // Analyze engagement factors
  const hooks = analyzeHooks(content, title);
  const callToAction = analyzeCallToAction(content);
  const emotionalAppeal = analyzeEmotionalAppeal(content);
  const trending = await analyzeTrendingPotential(content, platform, category);
  const visualAppeal = analyzeVisualAppeal(content);

  // Calculate overall engagement score
  const score = Math.round((hooks + callToAction + emotionalAppeal + trending + visualAppeal) / 5);

  // Generate engagement predictions
  const predictions = generateEngagementPredictions(score, platform, targetAudience);

  // Generate recommendations
  const recommendations = generateEngagementRecommendations({
    hooks,
    callToAction,
    emotionalAppeal,
    trending,
    visualAppeal,
    content,
    platform
  });

  return {
    score,
    factors: {
      hooks,
      callToAction,
      emotionalAppeal,
      trending,
      visualAppeal
    },
    predictions,
    recommendations
  };
}

function analyzeHooks(content: string, title?: string): number {
  let score = 50; // Base score
  
  // Analyze opening hooks
  const openingLines = content.split('\n').slice(0, 3).join(' ').substring(0, 200);
  
  // Question hooks
  const questionHooks = (openingLines.match(/\?/g) || []).length;
  if (questionHooks > 0) score += 15;
  
  // Shocking statements or statistics
  const numberPattern = /\b\d+(?:\.\d+)?%?\b/g;
  const hasNumbers = (openingLines.match(numberPattern) || []).length > 0;
  if (hasNumbers) score += 10;
  
  // Power words
  const powerWords = [
    'amazing', 'incredible', 'shocking', 'secret', 'revealed',
    'ultimate', 'essential', 'proven', 'guaranteed', 'exclusive'
  ];
  const powerWordCount = powerWords.filter(word => 
    openingLines.toLowerCase().includes(word)
  ).length;
  score += Math.min(powerWordCount * 8, 25);
  
  // Curiosity gaps
  const curiosityWords = ['why', 'how', 'what', 'when', 'where', 'discover', 'learn'];
  const curiosityCount = curiosityWords.filter(word => 
    openingLines.toLowerCase().includes(word)
  ).length;
  score += Math.min(curiosityCount * 5, 20);
  
  // Title hooks (if provided)
  if (title) {
    const titleHooks = analyzeTitleHooks(title);
    score += titleHooks * 0.3;
  }
  
  return Math.max(0, Math.min(100, score));
}

function analyzeCallToAction(content: string): number {
  let score = 30; // Base score
  
  // Explicit CTAs
  const ctaPatterns = [
    /\b(click|tap|visit|check out|read more|learn more|download|subscribe|follow|share|comment|like)\b/gi,
    /\b(try|start|begin|join|sign up|get started|buy now|order now)\b/gi,
    /\b(contact|call|email|reach out)\b/gi
  ];
  
  let ctaCount = 0;
  ctaPatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    ctaCount += matches.length;
  });
  
  score += Math.min(ctaCount * 15, 40);
  
  // Question CTAs (engaging audience)
  const questionCTAs = (content.match(/what do you think\?|share your thoughts|tell us|let us know/gi) || []).length;
  score += questionCTAs * 20;
  
  // Urgency words
  const urgencyWords = ['now', 'today', 'limited time', 'hurry', 'don\'t miss', 'act fast'];
  const urgencyCount = urgencyWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(urgencyCount * 10, 30);
  
  return Math.max(0, Math.min(100, score));
}

function analyzeEmotionalAppeal(content: string): number {
  let score = 40; // Base score
  
  // Positive emotions
  const positiveWords = [
    'amazing', 'fantastic', 'incredible', 'wonderful', 'excellent',
    'brilliant', 'outstanding', 'remarkable', 'extraordinary', 'inspiring',
    'motivating', 'uplifting', 'heartwarming', 'joyful', 'exciting'
  ];
  
  const positiveCount = positiveWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(positiveCount * 8, 30);
  
  // Emotional triggers
  const emotionalTriggers = [
    'struggle', 'challenge', 'overcome', 'achieve', 'success',
    'failure', 'triumph', 'victory', 'breakthrough', 'transformation'
  ];
  
  const triggerCount = emotionalTriggers.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(triggerCount * 10, 25);
  
  // Personal pronouns (creates connection)
  const personalPronouns = content.match(/\b(you|your|we|us|our|i|my|me)\b/gi) || [];
  const personalConnection = Math.min(personalPronouns.length / 10, 1) * 20;
  score += personalConnection;
  
  // Storytelling elements
  const storyElements = ['once', 'when', 'then', 'suddenly', 'finally', 'imagine'];
  const storyCount = storyElements.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(storyCount * 5, 15);
  
  return Math.max(0, Math.min(100, score));
}

async function analyzeTrendingPotential(content: string, platform?: string, category?: string): Promise<number> {
  let score = 50; // Base score
  
  // Trending topics (simplified - in production, this would use real trend data)
  const trendingTopics = [
    'ai', 'artificial intelligence', 'machine learning', 'crypto', 'blockchain',
    'sustainability', 'climate change', 'remote work', 'digital transformation',
    'mental health', 'wellness', 'productivity', 'automation'
  ];
  
  const trendingCount = trendingTopics.filter(topic => 
    content.toLowerCase().includes(topic)
  ).length;
  score += Math.min(trendingCount * 15, 40);
  
  // Platform-specific trending factors
  if (platform) {
    const platformTrends = getPlatformTrendingFactors(platform, content);
    score += platformTrends;
  }
  
  // Current events and seasonality (simplified)
  const timelyWords = ['2024', '2025', 'new', 'latest', 'recent', 'current', 'now'];
  const timelyCount = timelyWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(timelyCount * 8, 20);
  
  return Math.max(0, Math.min(100, score));
}

function analyzeVisualAppeal(content: string): number {
  let score = 60; // Base score
  
  // Content formatting indicators
  const hasLists = /^\s*[-*•]\s/.test(content) || /^\s*\d+\.\s/.test(content);
  if (hasLists) score += 15;
  
  // Headers and subheaders
  const hasHeaders = /^#+\s/.test(content) || /^[A-Z][^.!?]*:/.test(content);
  if (hasHeaders) score += 10;
  
  // Short paragraphs (visual appeal)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  if (avgParagraphLength < 200) score += 10;
  
  // Mentions of visual elements
  const visualElements = ['image', 'photo', 'video', 'chart', 'graph', 'infographic'];
  const visualCount = visualElements.filter(element => 
    content.toLowerCase().includes(element)
  ).length;
  score += Math.min(visualCount * 8, 20);
  
  // Quotes or highlights
  const hasQuotes = content.includes('"') || content.includes("'");
  if (hasQuotes) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function generateEngagementPredictions(score: number, platform?: string, targetAudience?: string): {
  expectedLikes: number;
  expectedShares: number;
  expectedComments: number;
  confidence: number;
} {
  // Base predictions based on engagement score
  const baseMultiplier = score / 100;
  
  // Platform-specific multipliers
  const platformMultipliers = {
    twitter: { likes: 1.2, shares: 1.5, comments: 0.8 },
    facebook: { likes: 1.0, shares: 0.8, comments: 1.2 },
    instagram: { likes: 1.5, shares: 0.6, comments: 1.0 },
    linkedin: { likes: 0.8, shares: 1.3, comments: 0.9 },
    blog: { likes: 0.5, shares: 1.0, comments: 1.5 }
  };
  
  const multiplier = platform ? platformMultipliers[platform as keyof typeof platformMultipliers] || { likes: 1, shares: 1, comments: 1 } : { likes: 1, shares: 1, comments: 1 };
  
  return {
    expectedLikes: Math.round(baseMultiplier * 100 * multiplier.likes),
    expectedShares: Math.round(baseMultiplier * 50 * multiplier.shares),
    expectedComments: Math.round(baseMultiplier * 25 * multiplier.comments),
    confidence: Math.min(score / 100 * 0.8 + 0.2, 0.95)
  };
}

function generateEngagementRecommendations(factors: {
  hooks: number;
  callToAction: number;
  emotionalAppeal: number;
  trending: number;
  visualAppeal: number;
  content: string;
  platform?: string;
}): string[] {
  const recommendations: string[] = [];
  
  if (factors.hooks < 60) {
    recommendations.push('Add a compelling hook in the opening - try starting with a question, statistic, or bold statement');
  }
  
  if (factors.callToAction < 50) {
    recommendations.push('Include clear call-to-actions to guide reader engagement - ask questions, request shares, or prompt specific actions');
  }
  
  if (factors.emotionalAppeal < 50) {
    recommendations.push('Increase emotional connection by using personal pronouns, storytelling, or addressing common pain points');
  }
  
  if (factors.trending < 60) {
    recommendations.push('Incorporate trending topics or current events relevant to your audience');
  }
  
  if (factors.visualAppeal < 60) {
    recommendations.push('Improve visual structure with bullet points, shorter paragraphs, and clear headings');
  }
  
  // Platform-specific recommendations
  if (factors.platform === 'twitter') {
    recommendations.push('Consider breaking content into a Twitter thread for better engagement');
  } else if (factors.platform === 'instagram') {
    recommendations.push('Add visual storytelling elements and engaging captions for Instagram');
  } else if (factors.platform === 'linkedin') {
    recommendations.push('Focus on professional insights and industry-specific value');
  }
  
  return recommendations;
}

function analyzeTitleHooks(title: string): number {
  let score = 50;
  
  // Numbers in title
  if (/\d+/.test(title)) score += 20;
  
  // Power words in title
  const powerWords = ['ultimate', 'complete', 'essential', 'proven', 'secret', 'amazing'];
  const powerWordCount = powerWords.filter(word => 
    title.toLowerCase().includes(word)
  ).length;
  score += powerWordCount * 15;
  
  // Question in title
  if (title.includes('?')) score += 15;
  
  return Math.max(0, Math.min(100, score));
}

function getPlatformTrendingFactors(platform: string, content: string): number {
  const platformKeywords = {
    twitter: ['thread', 'viral', 'trending', 'breaking'],
    instagram: ['story', 'reel', 'aesthetic', 'lifestyle'],
    linkedin: ['professional', 'career', 'industry', 'business'],
    tiktok: ['trend', 'challenge', 'viral', 'popular'],
    facebook: ['community', 'group', 'event', 'local']
  };
  
  const keywords = platformKeywords[platform as keyof typeof platformKeywords] || [];
  const keywordCount = keywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  ).length;
  
  return Math.min(keywordCount * 10, 30);
}