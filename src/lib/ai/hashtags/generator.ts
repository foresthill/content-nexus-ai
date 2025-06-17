import { SocialPlatform } from '@/types/social';

interface HashtagGeneratorInput {
  content: string;
  platform: SocialPlatform;
  targetAudience?: string;
  category?: string;
}

interface HashtagSuggestion {
  hashtags: string[];
  categories: string[];
  relevanceScores: Record<string, number>;
}

const PLATFORM_HASHTAG_LIMITS = {
  twitter: 3,
  instagram: 30,
  tiktok: 10,
};

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  tech: ['tech', 'technology', 'innovation', 'digital', 'ai', 'coding', 'developer'],
  business: ['business', 'entrepreneur', 'startup', 'marketing', 'growth', 'success'],
  lifestyle: ['lifestyle', 'life', 'daily', 'instagood', 'photooftheday', 'love'],
  fitness: ['fitness', 'gym', 'workout', 'health', 'wellness', 'motivation'],
  food: ['food', 'foodie', 'cooking', 'recipe', 'delicious', 'foodporn'],
  travel: ['travel', 'wanderlust', 'vacation', 'explore', 'adventure', 'travelgram'],
  fashion: ['fashion', 'style', 'ootd', 'fashionista', 'trend', 'outfit'],
  art: ['art', 'artist', 'creative', 'artwork', 'design', 'illustration'],
};

// Simulated AI model for hashtag generation
export async function generateHashtagSuggestions(
  input: HashtagGeneratorInput
): Promise<HashtagSuggestion> {
  const { content, platform, targetAudience, category } = input;
  
  // Extract keywords from content
  const keywords = extractKeywords(content);
  
  // Generate base hashtags from keywords
  const baseHashtags = keywords.map(keyword => 
    keyword.toLowerCase().replace(/\s+/g, '')
  );
  
  // Add category-specific hashtags
  const categoryHashtags = category && CATEGORY_HASHTAGS[category] 
    ? CATEGORY_HASHTAGS[category] 
    : [];
  
  // Generate audience-specific hashtags
  const audienceHashtags = generateAudienceHashtags(targetAudience);
  
  // Combine and deduplicate hashtags
  const allHashtags = [...new Set([
    ...baseHashtags,
    ...categoryHashtags,
    ...audienceHashtags,
  ])];
  
  // Score hashtags based on relevance
  const relevanceScores: Record<string, number> = {};
  allHashtags.forEach(hashtag => {
    relevanceScores[hashtag] = calculateRelevanceScore(hashtag, content, category);
  });
  
  // Sort by relevance and limit based on platform
  const sortedHashtags = allHashtags
    .sort((a, b) => relevanceScores[b] - relevanceScores[a])
    .slice(0, PLATFORM_HASHTAG_LIMITS[platform]);
  
  // Detect categories
  const detectedCategories = detectCategories(content);
  
  return {
    hashtags: sortedHashtags,
    categories: detectedCategories,
    relevanceScores,
  };
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production, use NLP library
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'few', 'more', 'most', 'other', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once']);
  
  return words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10);
}

function generateAudienceHashtags(targetAudience?: string): string[] {
  if (!targetAudience) return [];
  
  const audienceMap: Record<string, string[]> = {
    'young_adults': ['genZ', 'millennial', 'youth', 'young', 'student'],
    'professionals': ['professional', 'career', 'business', 'corporate', 'work'],
    'parents': ['parenting', 'family', 'kids', 'mom', 'dad'],
    'seniors': ['senior', 'retirement', 'wisdom', 'experience', 'life'],
    'entrepreneurs': ['entrepreneur', 'startup', 'founder', 'hustle', 'business'],
  };
  
  return audienceMap[targetAudience] || [];
}

function calculateRelevanceScore(
  hashtag: string, 
  content: string, 
  category?: string
): number {
  let score = 0;
  
  // Check if hashtag appears in content
  if (content.toLowerCase().includes(hashtag)) {
    score += 50;
  }
  
  // Check if hashtag is related to category
  if (category && CATEGORY_HASHTAGS[category]?.includes(hashtag)) {
    score += 30;
  }
  
  // Favor shorter hashtags
  score += Math.max(0, 20 - hashtag.length);
  
  return score;
}

function detectCategories(content: string): string[] {
  const detectedCategories: string[] = [];
  const lowerContent = content.toLowerCase();
  
  Object.entries(CATEGORY_HASHTAGS).forEach(([category, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      lowerContent.includes(keyword)
    ).length;
    
    if (matchCount >= 2) {
      detectedCategories.push(category);
    }
  });
  
  return detectedCategories;
}