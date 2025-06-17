import type { ContentQualityScore } from '@/types/content-improvement';

interface QualityAnalysisInput {
  content: string;
  title?: string;
  platform?: string;
  targetAudience?: string;
  category?: string;
}

export async function analyzeContentQuality(input: QualityAnalysisInput): Promise<ContentQualityScore> {
  const { content, title, platform, targetAudience, category } = input;

  // Analyze different aspects of content quality
  const clarity = analyzeClarityScore(content);
  const structure = analyzeStructureScore(content);
  const relevance = analyzeRelevanceScore(content, title, category);
  const originalityScore = await analyzeOriginalityScore(content);

  // Calculate overall score
  const overall = Math.round((clarity + structure + relevance + originalityScore) / 4);

  // Generate detailed feedback
  const details = generateQualityDetails(content, {
    clarity,
    structure,
    relevance,
    originalityScore
  });

  return {
    overall,
    clarity,
    structure,
    relevance,
    originalityScore,
    details
  };
}

function analyzeClarityScore(content: string): number {
  let score = 80; // Base score
  
  // Check for clear topic introduction
  const hasIntroduction = checkForIntroduction(content);
  if (!hasIntroduction) score -= 15;
  
  // Check for logical flow
  const hasLogicalFlow = checkLogicalFlow(content);
  if (!hasLogicalFlow) score -= 10;
  
  // Check for jargon and complex terms
  const jargonLevel = calculateJargonLevel(content);
  score -= jargonLevel * 10;
  
  // Check for clear conclusions
  const hasConclusion = checkForConclusion(content);
  if (!hasConclusion) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function analyzeStructureScore(content: string): number {
  let score = 75; // Base score
  
  // Check for proper paragraphing
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) score -= 20;
  
  // Check for headings/subheadings
  const hasHeadings = /^#+\s/.test(content) || /^[A-Z][^.!?]*:/.test(content);
  if (hasHeadings) score += 15;
  
  // Check for bullet points or lists
  const hasLists = /^\s*[-*•]\s/.test(content) || /^\s*\d+\.\s/.test(content);
  if (hasLists) score += 10;
  
  // Check paragraph length
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  if (avgParagraphLength > 500) score -= 15;
  if (avgParagraphLength < 50) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function analyzeRelevanceScore(content: string, title?: string, category?: string): number {
  let score = 70; // Base score
  
  // Check title-content alignment
  if (title) {
    const titleWords = title.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    const matchingWords = titleWords.filter(word => 
      word.length > 3 && contentLower.includes(word)
    );
    const titleAlignment = (matchingWords.length / titleWords.length) * 100;
    score += (titleAlignment - 50) * 0.3;
  }
  
  // Check for topic consistency
  const topicConsistency = calculateTopicConsistency(content);
  score += (topicConsistency - 50) * 0.4;
  
  // Category relevance
  if (category) {
    const categoryRelevance = calculateCategoryRelevance(content, category);
    score += (categoryRelevance - 50) * 0.3;
  }
  
  return Math.max(0, Math.min(100, score));
}

async function analyzeOriginalityScore(content: string): Promise<number> {
  // Simulate originality check - in production, this would use AI models
  // to check for plagiarism and content uniqueness
  let score = 85; // Base score
  
  // Check for common phrases
  const commonPhrases = [
    'in conclusion',
    'first and foremost',
    'last but not least',
    'it goes without saying',
    'needless to say'
  ];
  
  const commonPhrasesFound = commonPhrases.filter(phrase => 
    content.toLowerCase().includes(phrase)
  ).length;
  
  score -= commonPhrasesFound * 5;
  
  // Check for clichés
  const cliches = [
    'think outside the box',
    'low hanging fruit',
    'game changer',
    'at the end of the day',
    'move the needle'
  ];
  
  const clichesFound = cliches.filter(cliche => 
    content.toLowerCase().includes(cliche)
  ).length;
  
  score -= clichesFound * 8;
  
  return Math.max(0, Math.min(100, score));
}

function generateQualityDetails(content: string, scores: {
  clarity: number;
  structure: number;
  relevance: number;
  originalityScore: number;
}): {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  // Analyze strengths
  if (scores.clarity > 80) {
    strengths.push('Content is clear and easy to understand');
  }
  if (scores.structure > 80) {
    strengths.push('Well-structured with good flow');
  }
  if (scores.relevance > 80) {
    strengths.push('Highly relevant to the topic');
  }
  if (scores.originalityScore > 80) {
    strengths.push('Original and unique perspective');
  }
  
  // Analyze weaknesses and suggestions
  if (scores.clarity < 60) {
    weaknesses.push('Content lacks clarity in some areas');
    suggestions.push('Simplify complex sentences and explain technical terms');
  }
  if (scores.structure < 60) {
    weaknesses.push('Poor content structure');
    suggestions.push('Add clear headings and break content into logical sections');
  }
  if (scores.relevance < 60) {
    weaknesses.push('Content may drift from the main topic');
    suggestions.push('Stay focused on the main topic and remove tangential content');
  }
  if (scores.originalityScore < 60) {
    weaknesses.push('Content contains common phrases and clichés');
    suggestions.push('Replace clichés with fresh, original expressions');
  }
  
  return { strengths, weaknesses, suggestions };
}

// Helper functions
function checkForIntroduction(content: string): boolean {
  const firstParagraph = content.split('\n\n')[0];
  const introWords = ['introduce', 'explore', 'discuss', 'examine', 'today', 'this article'];
  return introWords.some(word => firstParagraph.toLowerCase().includes(word));
}

function checkLogicalFlow(content: string): boolean {
  const transitionWords = ['however', 'therefore', 'furthermore', 'additionally', 'consequently', 'meanwhile'];
  const transitionCount = transitionWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  return transitionCount >= 2;
}

function calculateJargonLevel(content: string): number {
  const jargonWords = [
    'utilize', 'leverage', 'synergy', 'paradigm', 'optimize',
    'streamline', 'facilitate', 'implement', 'methodologies'
  ];
  const jargonCount = jargonWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  return Math.min(jargonCount / 10, 1);
}

function checkForConclusion(content: string): boolean {
  const lastParagraph = content.split('\n\n').slice(-1)[0];
  const conclusionWords = ['conclusion', 'summary', 'finally', 'ultimately', 'overall'];
  return conclusionWords.some(word => lastParagraph.toLowerCase().includes(word));
}

function calculateTopicConsistency(content: string): number {
  // Simplified topic consistency check
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  
  words.forEach(word => {
    if (word.length > 4) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });
  
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const consistencyScore = topWords.reduce((sum, [, freq]) => sum + freq, 0) / words.length * 100;
  return Math.min(consistencyScore * 10, 100);
}

function calculateCategoryRelevance(content: string, category: string): number {
  const categoryWords = category.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  const matches = categoryWords.filter(word => contentLower.includes(word)).length;
  return (matches / categoryWords.length) * 100;
}