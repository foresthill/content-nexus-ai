import { NextRequest, NextResponse } from 'next/server';
import { generateHashtagSuggestions } from '@/lib/ai/hashtags/generator';
import { analyzeHashtagTrends } from '@/lib/ai/hashtags/trends';
import { optimizeHashtags } from '@/lib/ai/hashtags/optimizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platform, targetAudience, category } = body;

    if (!content || !platform) {
      return NextResponse.json(
        { error: 'Content and platform are required' },
        { status: 400 }
      );
    }

    // Generate AI-based hashtag suggestions
    const suggestions = await generateHashtagSuggestions({
      content,
      platform,
      targetAudience,
      category,
    });

    // Analyze current trends
    const trends = await analyzeHashtagTrends(suggestions.hashtags, platform);

    // Optimize hashtags based on ML model
    const optimized = await optimizeHashtags({
      hashtags: suggestions.hashtags,
      trends,
      targetAudience,
      platform,
    });

    return NextResponse.json({
      suggestions: optimized.hashtags,
      trends: trends.topTrends,
      performance: optimized.performanceScore,
      reasoning: optimized.reasoning,
    });
  } catch (error) {
    console.error('Error generating hashtag suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtag suggestions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Get trending hashtags for the platform
    const trends = await analyzeHashtagTrends([], platform as string, category || undefined);

    return NextResponse.json({
      trends: trends.topTrends,
      categories: trends.categories,
      lastUpdated: trends.lastUpdated,
    });
  } catch (error) {
    console.error('Error fetching hashtag trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hashtag trends' },
      { status: 500 }
    );
  }
}