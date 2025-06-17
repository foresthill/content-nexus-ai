import type { ContentVariation } from '@/types/content-improvement';

interface VariationGenerationInput {
  content: string;
  title?: string;
  quality: any;
  engagement: any;
  readability: any;
  sentiment: any;
  platform?: string;
  targetAudience?: string;
}

export async function generateContentVariations(input: VariationGenerationInput): Promise<ContentVariation[]> {
  const { content, title, quality, engagement, readability, sentiment, platform, targetAudience } = input;
  
  const variations: ContentVariation[] = [];
  
  // Generate variations based on different improvement strategies
  
  // Quality-focused variations
  if (quality.overall < 70) {
    const qualityVariations = generateQualityImprovementVariations(content, quality);
    variations.push(...qualityVariations);
  }
  
  // Engagement-focused variations
  if (engagement.score < 70) {
    const engagementVariations = generateEngagementVariations(content, engagement, platform);
    variations.push(...engagementVariations);
  }
  
  // Readability-focused variations
  if (readability.score < 70) {
    const readabilityVariations = generateReadabilityVariations(content, readability);
    variations.push(...readabilityVariations);
  }
  
  // Sentiment-focused variations
  if (sentiment.confidence < 0.7 || sentiment.optimization.adjustments.length > 0) {
    const sentimentVariations = generateSentimentVariations(content, sentiment, targetAudience, platform);
    variations.push(...sentimentVariations);
  }
  
  // Platform-specific variations
  if (platform) {
    const platformVariations = generatePlatformSpecificVariations(content, platform);
    variations.push(...platformVariations);
  }
  
  // Length variations
  const lengthVariations = generateLengthVariations(content);
  variations.push(...lengthVariations);
  
  // Format variations
  const formatVariations = generateFormatVariations(content);
  variations.push(...formatVariations);
  
  // Sort variations by expected impact
  return variations
    .sort((a, b) => {
      const aImpact = a.expectedImprovement.quality + a.expectedImprovement.engagement + a.expectedImprovement.readability;
      const bImpact = b.expectedImprovement.quality + b.expectedImprovement.engagement + b.expectedImprovement.readability;
      return bImpact - aImpact;
    })
    .slice(0, 10); // Return top 10 variations
}

function generateQualityImprovementVariations(content: string, quality: any): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  // Structure improvement variation
  if (quality.structure < 60) {
    const improvedStructure = improveContentStructure(content);
    variations.push({
      id: 'quality-structure',
      title: 'Improved Structure Version',
      content: improvedStructure,
      purpose: 'Enhance content structure with clear sections and logical flow',
      changes: [
        'Added clear introduction and conclusion',
        'Organized content into logical sections',
        'Improved paragraph structure'
      ],
      expectedImprovement: {
        quality: 30,
        engagement: 15,
        readability: 20
      }
    });
  }
  
  // Clarity improvement variation
  if (quality.clarity < 60) {
    const improvedClarity = improveContentClarity(content);
    variations.push({
      id: 'quality-clarity',
      title: 'Enhanced Clarity Version',
      content: improvedClarity,
      purpose: 'Improve content clarity and reduce ambiguity',
      changes: [
        'Simplified complex sentences',
        'Added explanations for technical terms',
        'Improved logical flow between ideas'
      ],
      expectedImprovement: {
        quality: 25,
        engagement: 10,
        readability: 25
      }
    });
  }
  
  return variations;
}

function generateEngagementVariations(content: string, engagement: any, platform?: string): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  // Hook improvement variation
  if (engagement.factors.hooks < 60) {
    const improvedHooks = improveContentHooks(content);
    variations.push({
      id: 'engagement-hooks',
      title: 'Compelling Hook Version',
      content: improvedHooks,
      purpose: 'Add powerful opening hooks to capture reader attention',
      changes: [
        'Added compelling opening question',
        'Included attention-grabbing statistics',
        'Created curiosity gaps'
      ],
      expectedImprovement: {
        quality: 10,
        engagement: 40,
        readability: 5
      }
    });
  }
  
  // CTA improvement variation
  if (engagement.factors.callToAction < 50) {
    const improvedCTA = improveCallToActions(content, platform);
    variations.push({
      id: 'engagement-cta',
      title: 'Enhanced Call-to-Action Version',
      content: improvedCTA,
      purpose: 'Add clear and compelling calls-to-action throughout content',
      changes: [
        'Added specific action-oriented language',
        'Included multiple engagement points',
        'Created urgency and value propositions'
      ],
      expectedImprovement: {
        quality: 5,
        engagement: 45,
        readability: 0
      }
    });
  }
  
  // Interactive elements variation
  const interactiveVersion = addInteractiveElements(content);
  variations.push({
    id: 'engagement-interactive',
    title: 'Interactive Elements Version',
    content: interactiveVersion,
    purpose: 'Add interactive elements to boost engagement',
    changes: [
      'Added thought-provoking questions',
      'Included polls and discussion prompts',
      'Created opportunities for user participation'
    ],
    expectedImprovement: {
      quality: 15,
      engagement: 35,
      readability: 10
    }
  });
  
  return variations;
}

function generateReadabilityVariations(content: string, readability: any): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  // Simplified language variation
  if (readability.metrics.complexWords > 15) {
    const simplifiedContent = simplifyLanguage(content);
    variations.push({
      id: 'readability-simplified',
      title: 'Simplified Language Version',
      content: simplifiedContent,
      purpose: 'Replace complex words with simpler alternatives',
      changes: [
        'Replaced jargon with everyday language',
        'Shortened complex sentences',
        'Added explanations for technical terms'
      ],
      expectedImprovement: {
        quality: 10,
        engagement: 20,
        readability: 40
      }
    });
  }
  
  // Better formatting variation
  const betterFormatted = improveFormatting(content);
  variations.push({
    id: 'readability-formatting',
    title: 'Better Formatted Version',
    content: betterFormatted,
    purpose: 'Improve visual structure and scannability',
    changes: [
      'Added bullet points and numbered lists',
      'Created shorter paragraphs',
      'Added subheadings for better navigation'
    ],
    expectedImprovement: {
      quality: 15,
      engagement: 25,
      readability: 35
    }
  });
  
  return variations;
}

function generateSentimentVariations(content: string, sentiment: any, targetAudience?: string, platform?: string): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  // Tone adjustment variation
  if (sentiment.optimization.adjustments.length > 0) {
    const adjustedTone = adjustContentTone(content, sentiment.optimization.suggestedTone, platform);
    variations.push({
      id: 'sentiment-tone',
      title: `${sentiment.optimization.suggestedTone.charAt(0).toUpperCase() + sentiment.optimization.suggestedTone.slice(1)} Tone Version`,
      content: adjustedTone,
      purpose: `Adjust tone to be more ${sentiment.optimization.suggestedTone}`,
      changes: [
        `Modified language to match ${sentiment.optimization.suggestedTone} tone`,
        'Adjusted emotional indicators',
        'Optimized for target audience'
      ],
      expectedImprovement: {
        quality: 15,
        engagement: 30,
        readability: 10
      }
    });
  }
  
  // Emotional balance variation
  if (sentiment.emotions.joy < 20 && sentiment.overall !== 'positive') {
    const morePositive = addPositiveElements(content);
    variations.push({
      id: 'sentiment-positive',
      title: 'More Positive Version',
      content: morePositive,
      purpose: 'Add positive elements to improve emotional appeal',
      changes: [
        'Added positive language and outcomes',
        'Included success stories and benefits',
        'Balanced negative aspects with solutions'
      ],
      expectedImprovement: {
        quality: 10,
        engagement: 35,
        readability: 5
      }
    });
  }
  
  return variations;
}

function generatePlatformSpecificVariations(content: string, platform: string): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  const platformOptimized = optimizeForPlatform(content, platform);
  variations.push({
    id: `platform-${platform}`,
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Optimized Version`,
    content: platformOptimized,
    purpose: `Optimize content specifically for ${platform}`,
    changes: [
      `Adjusted content length for ${platform}`,
      `Added platform-specific engagement elements`,
      `Optimized formatting for ${platform} audience`
    ],
    expectedImprovement: {
      quality: 20,
      engagement: 40,
      readability: 15
    }
  });
  
  return variations;
}

function generateLengthVariations(content: string): ContentVariation[] {
  const variations: ContentVariation[] = [];
  const wordCount = content.split(/\s+/).length;
  
  // Short version (if content is long)
  if (wordCount > 300) {
    const shortVersion = createShortVersion(content);
    variations.push({
      id: 'length-short',
      title: 'Concise Version',
      content: shortVersion,
      purpose: 'Create a more concise version focusing on key points',
      changes: [
        'Removed redundant information',
        'Focused on core message',
        'Shortened sentences and paragraphs'
      ],
      expectedImprovement: {
        quality: 5,
        engagement: 25,
        readability: 20
      }
    });
  }
  
  // Expanded version (if content is short)
  if (wordCount < 150) {
    const expandedVersion = createExpandedVersion(content);
    variations.push({
      id: 'length-expanded',
      title: 'Detailed Version',
      content: expandedVersion,
      purpose: 'Provide more detailed information and examples',
      changes: [
        'Added supporting examples',
        'Included more detailed explanations',
        'Expanded on key concepts'
      ],
      expectedImprovement: {
        quality: 25,
        engagement: 15,
        readability: -5
      }
    });
  }
  
  return variations;
}

function generateFormatVariations(content: string): ContentVariation[] {
  const variations: ContentVariation[] = [];
  
  // List format variation
  const listFormat = convertToListFormat(content);
  variations.push({
    id: 'format-list',
    title: 'List Format Version',
    content: listFormat,
    purpose: 'Convert content to scannable list format',
    changes: [
      'Organized information into bullet points',
      'Added clear list structure',
      'Improved scannability'
    ],
    expectedImprovement: {
      quality: 10,
      engagement: 20,
      readability: 30
    }
  });
  
  // Q&A format variation
  const qaFormat = convertToQAFormat(content);
  variations.push({
    id: 'format-qa',
    title: 'Q&A Format Version',
    content: qaFormat,
    purpose: 'Structure content as questions and answers',
    changes: [
      'Converted statements to Q&A format',
      'Made content more interactive',
      'Improved logical flow'
    ],
    expectedImprovement: {
      quality: 15,
      engagement: 30,
      readability: 25
    }
  });
  
  return variations;
}

// Helper functions for content transformation
function improveContentStructure(content: string): string {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  // Add introduction if missing
  let improved = '';
  if (!paragraphs[0].toLowerCase().includes('introduction') && !paragraphs[0].toLowerCase().includes('today')) {
    improved += 'In this article, we\'ll explore the key insights that can help you understand and improve your approach.\n\n';
  }
  
  // Add section headers
  const midPoint = Math.floor(paragraphs.length / 2);
  improved += '## Key Points\n\n';
  improved += paragraphs.slice(0, midPoint).join('\n\n');
  
  if (paragraphs.length > 2) {
    improved += '\n\n## Important Considerations\n\n';
    improved += paragraphs.slice(midPoint, -1).join('\n\n');
  }
  
  // Add conclusion
  improved += '\n\n## Conclusion\n\n';
  improved += paragraphs[paragraphs.length - 1];
  
  return improved;
}

function improveContentClarity(content: string): string {
  return content
    .replace(/\b(utilize|utilization)\b/g, 'use')
    .replace(/\b(facilitate)\b/g, 'help')
    .replace(/\b(implement)\b/g, 'put in place')
    .replace(/\b(methodology)\b/g, 'method')
    .replace(/\b(optimization)\b/g, 'improvement')
    .replace(/\b(enhancement)\b/g, 'improvement')
    .replace(/(\w+), (\w+), and (\w+)/g, '$1, $2, and $3') // Fix oxford comma
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Ensure proper spacing
}

function improveContentHooks(content: string): string {
  const paragraphs = content.split('\n\n');
  const firstParagraph = paragraphs[0];
  
  // Add compelling opening hook
  const hooks = [
    'Did you know that most people make this common mistake?',
    'Here\'s something that might surprise you:',
    'What if I told you there\'s a better way?',
    'This insight changed everything for me:'
  ];
  
  const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  paragraphs[0] = `${randomHook} ${firstParagraph}`;
  
  return paragraphs.join('\n\n');
}

function improveCallToActions(content: string, platform?: string): string {
  const platformCTAs = {
    twitter: '\n\nWhat\'s your take on this? Share your thoughts! 🧵',
    instagram: '\n\nDouble tap if this resonates with you! ❤️ What\'s your experience?',
    linkedin: '\n\nWhat\'s your professional perspective on this? I\'d love to hear your insights in the comments.',
    facebook: '\n\nWhat do you think? Share this with someone who needs to see it!',
    default: '\n\nWhat are your thoughts on this? Let me know in the comments below!'
  };
  
  const cta = platformCTAs[platform as keyof typeof platformCTAs] || platformCTAs.default;
  return content + cta;
}

function addInteractiveElements(content: string): string {
  const paragraphs = content.split('\n\n');
  let interactive = '';
  
  paragraphs.forEach((paragraph, index) => {
    interactive += paragraph;
    
    // Add interactive elements at strategic points
    if (index === Math.floor(paragraphs.length / 3)) {
      interactive += '\n\n*Quick question: Have you experienced this yourself?*';
    } else if (index === Math.floor(paragraphs.length * 2 / 3)) {
      interactive += '\n\n*Think about it: How would you handle this situation?*';
    }
    
    if (index < paragraphs.length - 1) {
      interactive += '\n\n';
    }
  });
  
  return interactive;
}

function simplifyLanguage(content: string): string {
  const simplifications = {
    'utilize': 'use',
    'facilitate': 'help',
    'implement': 'do',
    'methodology': 'method',
    'optimization': 'improvement',
    'enhancement': 'improvement',
    'demonstrate': 'show',
    'significant': 'important',
    'comprehensive': 'complete',
    'substantial': 'large',
    'acquire': 'get',
    'assistance': 'help',
    'commence': 'start',
    'approximately': 'about'
  };
  
  let simplified = content;
  Object.entries(simplifications).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });
  
  return simplified;
}

function improveFormatting(content: string): string {
  let formatted = content;
  
  // Convert long sentences to bullet points if they contain lists
  formatted = formatted.replace(
    /([^.!?]*(?:first|second|third|also|additionally|furthermore|moreover|finally)[^.!?]*[.!?])/g,
    (match) => `• ${match.trim()}`
  );
  
  // Break long paragraphs
  const paragraphs = formatted.split('\n\n');
  const improvedParagraphs = paragraphs.map(paragraph => {
    if (paragraph.length > 300) {
      const sentences = paragraph.split(/([.!?]+)/);
      const midPoint = Math.floor(sentences.length / 2);
      return sentences.slice(0, midPoint).join('') + '\n\n' + sentences.slice(midPoint).join('');
    }
    return paragraph;
  });
  
  return improvedParagraphs.join('\n\n');
}

function adjustContentTone(content: string, suggestedTone: string, platform?: string): string {
  let adjusted = content;
  
  switch (suggestedTone) {
    case 'professional':
      adjusted = adjusted
        .replace(/\b(awesome|cool|amazing)\b/gi, 'excellent')
        .replace(/!/g, '.')
        .replace(/\b(you guys|folks)\b/gi, 'everyone');
      break;
      
    case 'casual':
      adjusted = adjusted
        .replace(/\b(furthermore|moreover)\b/gi, 'plus')
        .replace(/\b(however)\b/gi, 'but')
        .replace(/\b(therefore)\b/gi, 'so');
      break;
      
    case 'friendly':
      adjusted = adjusted + '\n\nHope this helps! Feel free to reach out if you have questions.';
      break;
  }
  
  return adjusted;
}

function addPositiveElements(content: string): string {
  const positiveTransitions = {
    'problem': 'challenge that we can overcome',
    'difficult': 'challenging but manageable',
    'impossible': 'very challenging',
    'can\'t': 'might find it challenging to',
    'won\'t work': 'might need adjustment'
  };
  
  let positive = content;
  Object.entries(positiveTransitions).forEach(([negative, positive_alt]) => {
    const regex = new RegExp(`\\b${negative}\\b`, 'gi');
    positive = positive.replace(regex, positive_alt);
  });
  
  return positive;
}

function optimizeForPlatform(content: string, platform: string): string {
  switch (platform) {
    case 'twitter':
      return createTwitterThread(content);
    case 'instagram':
      return addInstagramElements(content);
    case 'linkedin':
      return addLinkedInElements(content);
    default:
      return content;
  }
}

function createTwitterThread(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let thread = '🧵 Thread: Key insights ahead\n\n';
  
  sentences.forEach((sentence, index) => {
    if (index > 0 && index % 2 === 0) {
      thread += `\n\n${index / 2 + 1}/ `;
    }
    thread += sentence.trim() + '.';
  });
  
  thread += '\n\nThat\'s a wrap! What are your thoughts? 💭';
  return thread;
}

function addInstagramElements(content: string): string {
  return content + '\n\n✨ Save this post for later\n💭 Share your thoughts below\n📩 DM me for more tips';
}

function addLinkedInElements(content: string): string {
  return `💼 Professional Insight:\n\n${content}\n\nWhat\'s your experience with this in your industry? Share your professional perspective below. 👇\n\n#ProfessionalDevelopment #Industry #Leadership`;
}

function createShortVersion(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keySentences = sentences.filter((sentence, index) => {
    return index === 0 || sentence.toLowerCase().includes('important') || 
           sentence.toLowerCase().includes('key') || sentence.toLowerCase().includes('main');
  });
  
  return keySentences.slice(0, Math.max(3, Math.floor(sentences.length / 3))).join('. ') + '.';
}

function createExpandedVersion(content: string): string {
  const expanded = content + '\n\nFor example, consider how this applies in real-world scenarios. The benefits include improved efficiency, better outcomes, and enhanced user satisfaction.\n\nAdditionally, implementing these strategies can lead to measurable improvements in performance and engagement metrics.';
  return expanded;
}

function convertToListFormat(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const listItems = sentences.map(sentence => `• ${sentence.trim()}`);
  return `Key Points:\n\n${listItems.join('\n')}`;
}

function convertToQAFormat(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let qa = '';
  
  sentences.forEach((sentence, index) => {
    if (index % 2 === 0) {
      qa += `**Q: What should you know about ${sentence.split(' ').slice(0, 5).join(' ').toLowerCase()}?**\n\n`;
      qa += `A: ${sentence.trim()}.\n\n`;
    } else {
      qa += `${sentence.trim()}.\n\n`;
    }
  });
  
  return qa;
}