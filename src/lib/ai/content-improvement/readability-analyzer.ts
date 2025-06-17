import type { ReadabilityAnalysis } from '@/types/content-improvement';

interface ReadabilityAnalysisInput {
  content: string;
  targetAudience?: string;
}

export async function analyzeReadability(input: ReadabilityAnalysisInput): Promise<ReadabilityAnalysis> {
  const { content, targetAudience } = input;

  // Calculate readability metrics
  const metrics = calculateReadabilityMetrics(content);
  
  // Calculate overall readability score
  const score = calculateOverallReadabilityScore(metrics);
  
  // Generate recommendations
  const recommendations = generateReadabilityRecommendations(content, metrics, score);
  
  // Determine target audience characteristics
  const targetAudienceData = determineTargetAudience(targetAudience, score);

  return {
    score,
    metrics,
    recommendations,
    targetAudience: targetAudienceData
  };
}

function calculateReadabilityMetrics(content: string): {
  fleschKincaid: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  complexWords: number;
  passiveVoice: number;
} {
  // Clean and prepare text
  const cleanText = content.replace(/[^\w\s.!?]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Split into words
  const words = cleanText.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Calculate average sentence length
  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const averageWordsPerSentence = averageSentenceLength;
  
  // Calculate syllables and complex words
  let syllableCount = 0;
  let complexWordCount = 0;
  
  words.forEach(word => {
    const syllables = countSyllables(word);
    syllableCount += syllables;
    if (syllables >= 3) {
      complexWordCount++;
    }
  });
  
  // Calculate Flesch-Kincaid Grade Level
  const fleschKincaid = calculateFleschKincaid(wordCount, sentenceCount, syllableCount);
  
  // Calculate complex words percentage
  const complexWords = wordCount > 0 ? (complexWordCount / wordCount) * 100 : 0;
  
  // Calculate passive voice percentage
  const passiveVoice = calculatePassiveVoice(content);

  return {
    fleschKincaid,
    averageSentenceLength,
    averageWordsPerSentence,
    complexWords,
    passiveVoice
  };
}

function calculateOverallReadabilityScore(metrics: {
  fleschKincaid: number;
  averageSentenceLength: number;
  complexWords: number;
  passiveVoice: number;
}): number {
  let score = 100;
  
  // Penalize high grade level (Flesch-Kincaid)
  if (metrics.fleschKincaid > 12) {
    score -= (metrics.fleschKincaid - 12) * 5;
  } else if (metrics.fleschKincaid > 8) {
    score -= (metrics.fleschKincaid - 8) * 2;
  }
  
  // Penalize long sentences
  if (metrics.averageSentenceLength > 20) {
    score -= (metrics.averageSentenceLength - 20) * 2;
  }
  
  // Penalize high percentage of complex words
  if (metrics.complexWords > 15) {
    score -= (metrics.complexWords - 15) * 2;
  }
  
  // Penalize high passive voice usage
  if (metrics.passiveVoice > 25) {
    score -= (metrics.passiveVoice - 25) * 1.5;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateReadabilityRecommendations(
  content: string, 
  metrics: any, 
  score: number
): {
  simplifyLanguage: string[];
  shortenSentences: string[];
  improveFlow: string[];
} {
  const simplifyLanguage: string[] = [];
  const shortenSentences: string[] = [];
  const improveFlow: string[] = [];
  
  // Language simplification recommendations
  if (metrics.complexWords > 15) {
    simplifyLanguage.push('Replace complex words with simpler alternatives when possible');
    simplifyLanguage.push('Define technical terms when they must be used');
  }
  
  if (metrics.fleschKincaid > 12) {
    simplifyLanguage.push('Use shorter, more common words to improve accessibility');
    simplifyLanguage.push('Break down complex concepts into smaller, digestible parts');
  }
  
  // Sentence length recommendations
  if (metrics.averageSentenceLength > 20) {
    shortenSentences.push('Break long sentences into shorter ones (aim for 15-20 words)');
    shortenSentences.push('Use more periods and fewer commas for clearer structure');
  }
  
  if (metrics.averageSentenceLength > 25) {
    shortenSentences.push('Consider using bullet points for lists within sentences');
  }
  
  // Flow improvement recommendations
  if (metrics.passiveVoice > 25) {
    improveFlow.push('Convert passive voice to active voice for more engaging writing');
    improveFlow.push('Use action verbs to make content more dynamic');
  }
  
  if (score < 60) {
    improveFlow.push('Add transition words to improve logical flow between ideas');
    improveFlow.push('Use parallel structure in lists and series');
  }
  
  // Check for specific patterns
  const longSentences = findLongSentences(content);
  if (longSentences.length > 0) {
    shortenSentences.push(`Consider breaking these long sentences: "${longSentences[0].substring(0, 50)}..."`);
  }
  
  const complexWords = findComplexWords(content);
  if (complexWords.length > 0) {
    simplifyLanguage.push(`Consider simpler alternatives for: ${complexWords.slice(0, 3).join(', ')}`);
  }

  return { simplifyLanguage, shortenSentences, improveFlow };
}

function determineTargetAudience(targetAudience?: string, score?: number): {
  readingLevel: string;
  ageGroup: string;
  expertise: string;
} {
  // Default based on readability score
  let readingLevel = 'College';
  let ageGroup = 'Adult';
  let expertise = 'General';
  
  if (score !== undefined) {
    if (score >= 80) {
      readingLevel = 'Middle School';
      ageGroup = '13+';
      expertise = 'Beginner';
    } else if (score >= 60) {
      readingLevel = 'High School';
      ageGroup = '16+';
      expertise = 'Intermediate';
    } else if (score >= 40) {
      readingLevel = 'College';
      ageGroup = '18+';
      expertise = 'Advanced';
    } else {
      readingLevel = 'Graduate';
      ageGroup = '22+';
      expertise = 'Expert';
    }
  }
  
  // Override with provided target audience
  if (targetAudience) {
    const audienceLower = targetAudience.toLowerCase();
    
    if (audienceLower.includes('child') || audienceLower.includes('kid')) {
      readingLevel = 'Elementary';
      ageGroup = '8-12';
      expertise = 'Beginner';
    } else if (audienceLower.includes('teen') || audienceLower.includes('young')) {
      readingLevel = 'Middle School';
      ageGroup = '13-17';
      expertise = 'Beginner';
    } else if (audienceLower.includes('professional') || audienceLower.includes('expert')) {
      readingLevel = 'Graduate';
      ageGroup = '25+';
      expertise = 'Expert';
    } else if (audienceLower.includes('beginner') || audienceLower.includes('intro')) {
      expertise = 'Beginner';
      readingLevel = 'High School';
    }
  }
  
  return { readingLevel, ageGroup, expertise };
}

// Helper functions
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  // Remove silent e
  word = word.replace(/e$/, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g) || [];
  const syllables = vowelGroups.length;
  
  // Minimum 1 syllable
  return Math.max(1, syllables);
}

function calculateFleschKincaid(words: number, sentences: number, syllables: number): number {
  if (sentences === 0 || words === 0) return 0;
  
  const avgSentenceLength = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  // Flesch-Kincaid Grade Level formula
  const gradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  
  return Math.max(0, Math.round(gradeLevel * 10) / 10);
}

function calculatePassiveVoice(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let passiveCount = 0;
  
  const passivePatterns = [
    /\b(was|were|been|being|is|are|am)\s+\w+ed\b/g,
    /\b(was|were|been|being|is|are|am)\s+\w+en\b/g,
    /\bby\s+(the\s+)?\w+\s+(was|were|been|being|is|are|am)/g
  ];
  
  sentences.forEach(sentence => {
    const hasPassive = passivePatterns.some(pattern => pattern.test(sentence.toLowerCase()));
    if (hasPassive) passiveCount++;
  });
  
  return sentences.length > 0 ? Math.round((passiveCount / sentences.length) * 100) : 0;
}

function findLongSentences(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.filter(sentence => {
    const wordCount = sentence.trim().split(/\s+/).length;
    return wordCount > 25;
  }).slice(0, 3); // Return top 3 longest sentences
}

function findComplexWords(content: string): string[] {
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const complexWords = words.filter(word => {
    return countSyllables(word) >= 3 && word.length > 6;
  });
  
  // Remove duplicates and return top 5
  return [...new Set(complexWords)].slice(0, 5);
}