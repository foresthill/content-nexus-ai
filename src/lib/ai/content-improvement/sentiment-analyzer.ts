import type { SentimentAnalysis } from '@/types/content-improvement';

interface SentimentAnalysisInput {
  content: string;
  platform?: string;
  targetAudience?: string;
}

export async function analyzeSentiment(input: SentimentAnalysisInput): Promise<SentimentAnalysis> {
  const { content, platform, targetAudience } = input;

  // Analyze overall sentiment
  const overall = analyzeOverallSentiment(content);
  const confidence = calculateSentimentConfidence(content, overall);
  
  // Analyze specific emotions
  const emotions = analyzeEmotions(content);
  
  // Analyze tone
  const tone = analyzeTone(content);
  
  // Generate optimization suggestions
  const optimization = generateSentimentOptimization(content, overall, emotions, tone, platform, targetAudience);

  return {
    overall,
    confidence,
    emotions,
    tone,
    optimization
  };
}

function analyzeOverallSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = [
    'amazing', 'excellent', 'fantastic', 'great', 'wonderful', 'brilliant',
    'outstanding', 'remarkable', 'incredible', 'awesome', 'perfect', 'beautiful',
    'love', 'enjoy', 'happy', 'excited', 'thrilled', 'delighted', 'pleased',
    'satisfied', 'grateful', 'appreciate', 'celebrate', 'success', 'achievement',
    'victory', 'triumph', 'breakthrough', 'opportunity', 'benefit', 'advantage',
    'improve', 'enhance', 'optimize', 'upgrade', 'progress', 'advance',
    'inspire', 'motivate', 'encourage', 'empower', 'support', 'help'
  ];
  
  const negativeWords = [
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'dislike',
    'disgusting', 'disappointing', 'frustrated', 'angry', 'upset', 'sad',
    'depressed', 'worried', 'anxious', 'concerned', 'stressed', 'overwhelmed',
    'difficult', 'challenging', 'problem', 'issue', 'trouble', 'struggle',
    'fail', 'failure', 'mistake', 'error', 'wrong', 'broken', 'damage',
    'loss', 'decline', 'decrease', 'reduce', 'risk', 'danger', 'threat',
    'crisis', 'disaster', 'catastrophe', 'emergency', 'urgent', 'critical'
  ];
  
  const words = content.toLowerCase().split(/\s+/);
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveScore++;
    } else if (negativeWords.includes(word)) {
      negativeScore++;
    }
  });
  
  // Add weight for intensity modifiers
  const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally'];
  words.forEach((word, index) => {
    if (intensifiers.includes(word) && index < words.length - 1) {
      const nextWord = words[index + 1];
      if (positiveWords.includes(nextWord)) {
        positiveScore += 0.5;
      } else if (negativeWords.includes(nextWord)) {
        negativeScore += 0.5;
      }
    }
  });
  
  const scoreDifference = positiveScore - negativeScore;
  const threshold = Math.max(words.length * 0.01, 1); // Dynamic threshold based on content length
  
  if (scoreDifference > threshold) {
    return 'positive';
  } else if (scoreDifference < -threshold) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

function calculateSentimentConfidence(content: string, overall: 'positive' | 'negative' | 'neutral'): number {
  const words = content.toLowerCase().split(/\s+/);
  const sentimentWords = countSentimentWords(content);
  
  // Base confidence on the ratio of sentiment words to total words
  const sentimentRatio = sentimentWords / words.length;
  
  // Higher ratio means higher confidence
  let confidence = Math.min(sentimentRatio * 10, 0.95);
  
  // Neutral sentiment typically has lower confidence
  if (overall === 'neutral') {
    confidence = Math.max(confidence * 0.7, 0.3);
  }
  
  // Minimum confidence threshold
  confidence = Math.max(confidence, 0.2);
  
  return Math.round(confidence * 100) / 100;
}

function analyzeEmotions(content: string): {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
  trust: number;
} {
  const emotionWords = {
    joy: ['happy', 'joy', 'celebrate', 'excited', 'thrilled', 'delighted', 'cheerful', 'elated', 'euphoric', 'blissful', 'content', 'satisfied', 'pleased', 'glad', 'merry'],
    anger: ['angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'frustrated', 'outraged', 'livid', 'incensed', 'hostile', 'aggressive', 'bitter', 'resentful'],
    fear: ['afraid', 'scared', 'fear', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'dread', 'apprehensive', 'concerned', 'uneasy', 'alarmed', 'frightened'],
    sadness: ['sad', 'depressed', 'grief', 'sorrow', 'melancholy', 'disappointed', 'heartbroken', 'miserable', 'gloomy', 'dejected', 'despondent', 'downhearted', 'mournful'],
    surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'bewildered', 'astounded', 'flabbergasted', 'dumbfounded', 'startled', 'unexpected', 'sudden'],
    trust: ['trust', 'reliable', 'confident', 'secure', 'safe', 'dependable', 'faithful', 'loyal', 'honest', 'genuine', 'authentic', 'credible', 'believable', 'trustworthy']
  };
  
  const words = content.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  
  const emotions = {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0,
    trust: 0
  };
  
  Object.entries(emotionWords).forEach(([emotion, wordList]) => {
    const matches = words.filter(word => wordList.includes(word)).length;
    emotions[emotion as keyof typeof emotions] = Math.round((matches / totalWords) * 1000) / 10; // Percentage with 1 decimal
  });
  
  return emotions;
}

function analyzeTone(content: string): {
  formal: number;
  casual: number;
  professional: number;
  friendly: number;
} {
  const toneIndicators = {
    formal: {
      words: ['furthermore', 'moreover', 'consequently', 'therefore', 'thus', 'hence', 'accordingly', 'nevertheless', 'nonetheless', 'notwithstanding'],
      patterns: [/\b(shall|ought|must)\b/g, /\b(one|oneself)\b/g, /\b(whom|whose)\b/g]
    },
    casual: {
      words: ['yeah', 'okay', 'cool', 'awesome', 'stuff', 'things', 'kinda', 'sorta', 'gonna', 'wanna', 'gotta'],
      patterns: [/\b(don't|won't|can't|isn't|aren't)\b/g, /\b(you|your)\b/g]
    },
    professional: {
      words: ['utilize', 'implement', 'facilitate', 'optimize', 'leverage', 'synergy', 'paradigm', 'methodology', 'strategic', 'innovative'],
      patterns: [/\b(we|our|organization|company|team)\b/g, /\b(solution|approach|strategy)\b/g]
    },
    friendly: {
      words: ['thanks', 'please', 'welcome', 'help', 'support', 'together', 'community', 'share', 'enjoy', 'love'],
      patterns: [/\b(you|your|we|us|our)\b/g, /[!]+/g, /[?]+/g]
    }
  };
  
  const contentLower = content.toLowerCase();
  const words = contentLower.split(/\s+/);
  const totalWords = words.length;
  
  const tones = {
    formal: 0,
    casual: 0,
    professional: 0,
    friendly: 0
  };
  
  Object.entries(toneIndicators).forEach(([tone, indicators]) => {
    let score = 0;
    
    // Count word matches
    indicators.words.forEach(word => {
      const matches = words.filter(w => w === word).length;
      score += matches;
    });
    
    // Count pattern matches
    indicators.patterns.forEach(pattern => {
      const matches = contentLower.match(pattern) || [];
      score += matches.length * 0.5; // Patterns have less weight
    });
    
    tones[tone as keyof typeof tones] = Math.round((score / totalWords) * 1000) / 10; // Percentage with 1 decimal
  });
  
  return tones;
}

function generateSentimentOptimization(
  content: string,
  overall: 'positive' | 'negative' | 'neutral',
  emotions: any,
  tone: any,
  platform?: string,
  targetAudience?: string
): {
  currentTone: string;
  suggestedTone: string;
  adjustments: string[];
} {
  // Determine current dominant tone
  const currentTone = Object.entries(tone).reduce((a, b) => tone[a[0]] > tone[b[0]] ? a : b)[0];
  
  // Suggest optimal tone based on platform and audience
  let suggestedTone = currentTone;
  const adjustments: string[] = [];
  
  // Platform-specific tone suggestions
  if (platform === 'linkedin') {
    suggestedTone = 'professional';
    if (tone.professional < 30) {
      adjustments.push('Use more professional language and industry terminology');
    }
  } else if (platform === 'instagram' || platform === 'tiktok') {
    suggestedTone = 'casual';
    if (tone.casual < 30) {
      adjustments.push('Make the tone more casual and conversational');
    }
  } else if (platform === 'twitter') {
    suggestedTone = 'friendly';
    if (tone.friendly < 30) {
      adjustments.push('Add more engaging and interactive language');
    }
  }
  
  // Audience-specific adjustments
  if (targetAudience?.toLowerCase().includes('professional')) {
    suggestedTone = 'professional';
  } else if (targetAudience?.toLowerCase().includes('young') || targetAudience?.toLowerCase().includes('teen')) {
    suggestedTone = 'casual';
  }
  
  // Sentiment-based adjustments
  if (overall === 'negative' && emotions.sadness > 20) {
    adjustments.push('Balance negative sentiment with hopeful or solution-oriented language');
  } else if (overall === 'neutral' && emotions.joy < 10) {
    adjustments.push('Add more positive and engaging emotional language');
  } else if (overall === 'positive' && emotions.joy > 50) {
    adjustments.push('Maintain enthusiasm while ensuring credibility');
  }
  
  // Tone-specific adjustments
  if (tone.formal > 50 && suggestedTone !== 'formal') {
    adjustments.push('Reduce formal language and use more conversational tone');
  } else if (tone.casual > 50 && suggestedTone === 'professional') {
    adjustments.push('Replace casual expressions with professional alternatives');
  }
  
  // Emotional balance suggestions
  if (emotions.anger > 30) {
    adjustments.push('Reduce aggressive language and focus on constructive messaging');
  } else if (emotions.fear > 30) {
    adjustments.push('Address concerns while maintaining reassuring tone');
  } else if (emotions.trust < 20 && platform !== 'casual') {
    adjustments.push('Add trust-building language and credibility indicators');
  }
  
  return {
    currentTone,
    suggestedTone,
    adjustments
  };
}

function countSentimentWords(content: string): number {
  const sentimentWords = [
    // Positive
    'amazing', 'excellent', 'fantastic', 'great', 'wonderful', 'brilliant',
    'love', 'enjoy', 'happy', 'excited', 'success', 'achievement',
    // Negative
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate',
    'frustrated', 'angry', 'sad', 'problem', 'fail', 'wrong',
    // Neutral but emotional
    'important', 'significant', 'critical', 'essential', 'necessary'
  ];
  
  const words = content.toLowerCase().split(/\s+/);
  return words.filter(word => sentimentWords.includes(word)).length;
}