import { NextRequest, NextResponse } from 'next/server';
import { analyzeContentQuality } from '@/lib/ai/content-improvement/quality-analyzer';
import { analyzeEngagementPotential } from '@/lib/ai/content-improvement/engagement-analyzer';
import { analyzeReadability } from '@/lib/ai/content-improvement/readability-analyzer';
import { analyzeSentiment } from '@/lib/ai/content-improvement/sentiment-analyzer';
import { generateContentVariations } from '@/lib/ai/content-improvement/variation-generator';
import { generateABTestSuggestions } from '@/lib/ai/content-improvement/ab-test-generator';
import type { ContentAnalysisRequest, ContentImprovement } from '@/types/content-improvement';

export async function POST(request: NextRequest) {
  try {
    const body: ContentAnalysisRequest = await request.json();
    const { content, title, platform, targetAudience, category } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Run all analyses in parallel
    const [quality, engagement, readability, sentiment] = await Promise.all([
      analyzeContentQuality({ content, title, platform, targetAudience, category }),
      analyzeEngagementPotential({ content, title, platform, targetAudience, category }),
      analyzeReadability({ content, targetAudience }),
      analyzeSentiment({ content, platform, targetAudience })
    ]);

    // Generate variations and A/B test suggestions based on analysis
    const variations = await generateContentVariations({
      content,
      title,
      quality,
      engagement,
      readability,
      sentiment,
      platform,
      targetAudience
    });

    const abTests = await generateABTestSuggestions({
      content,
      title,
      variations,
      quality,
      engagement,
      platform,
      targetAudience
    });

    // Generate overall recommendations
    const overallRecommendations = generateOverallRecommendations({
      quality,
      engagement,
      readability,
      sentiment
    });

    // Calculate priority and impact
    const { priority, estimatedImpact, implementationDifficulty } = calculatePriorityAndImpact({
      quality,
      engagement,
      readability,
      sentiment
    });

    const result: ContentImprovement = {
      id: generateId(),
      originalContent: content,
      quality,
      engagement,
      readability,
      sentiment,
      variations,
      abTests,
      overallRecommendations,
      priority,
      estimatedImpact,
      implementationDifficulty,
      createdAt: new Date()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing content for improvement:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content for improvement' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const type = searchParams.get('type');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock data - in production, this would fetch from database
    return NextResponse.json({
      message: 'Content improvement analysis retrieved',
      contentId,
      type
    });
  } catch (error) {
    console.error('Error retrieving content improvement analysis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve content improvement analysis' },
      { status: 500 }
    );
  }
}

function generateOverallRecommendations(analyses: {
  quality: { overall: number };
  engagement: { score: number };
  readability: { score: number };
  sentiment: { confidence: number };
}): string[] {
  const recommendations: string[] = [];
  
  // Quality-based recommendations
  if (analyses.quality.overall < 70) {
    recommendations.push('Improve content structure and clarity for better quality');
  }
  
  // Engagement-based recommendations
  if (analyses.engagement.score < 60) {
    recommendations.push('Add stronger hooks and call-to-actions to boost engagement');
  }
  
  // Readability-based recommendations
  if (analyses.readability.score < 60) {
    recommendations.push('Simplify language and shorten sentences for better readability');
  }
  
  // Sentiment-based recommendations
  if (analyses.sentiment.confidence < 0.7) {
    recommendations.push('Clarify tone and emotional direction for consistent messaging');
  }
  
  return recommendations;
}

function calculatePriorityAndImpact(analyses: {
  quality: { overall: number };
  engagement: { score: number };
  readability: { score: number };
  sentiment: { confidence: number };
}): {
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
} {
  const avgScore = (
    analyses.quality.overall +
    analyses.engagement.score +
    analyses.readability.score +
    (analyses.sentiment.confidence * 100)
  ) / 4;
  
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (avgScore < 50) priority = 'high';
  else if (avgScore > 80) priority = 'low';
  
  const estimatedImpact = Math.max(0, 100 - avgScore);
  
  let implementationDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (estimatedImpact < 20) implementationDifficulty = 'easy';
  else if (estimatedImpact > 60) implementationDifficulty = 'hard';
  
  return { priority, estimatedImpact, implementationDifficulty };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}