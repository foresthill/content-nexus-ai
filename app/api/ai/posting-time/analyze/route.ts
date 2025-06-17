import { NextRequest, NextResponse } from 'next/server';
import { EngagementAnalyzer } from '@/lib/ai/posting-time/analyzer';
import { PostingTimeInsights } from '@/lib/ai/posting-time/insights';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postIds, dateRange, platforms } = body;

    if (!postIds || postIds.length === 0) {
      return NextResponse.json(
        { error: 'No post IDs provided for analysis' },
        { status: 400 }
      );
    }

    const analyzer = new EngagementAnalyzer();
    const insights = new PostingTimeInsights();

    // Fetch and analyze engagement data for the specified posts
    const engagementData = await analyzer.fetchEngagementData({
      postIds,
      dateRange: dateRange || { days: 30 },
      platforms: platforms || ['twitter', 'instagram', 'tiktok']
    });

    // Generate insights from the engagement data
    const analysis = await insights.generateInsights(engagementData);

    // Calculate optimal time windows based on analysis
    const optimalWindows = insights.calculateOptimalWindows(analysis);

    return NextResponse.json({
      analysis,
      optimalWindows,
      recommendations: insights.getRecommendations(analysis),
      performanceMetrics: {
        averageEngagement: analysis.averageEngagement,
        peakEngagementTimes: analysis.peakTimes,
        worstPerformingTimes: analysis.lowEngagementTimes
      }
    });

  } catch (error) {
    console.error('Error analyzing posting times:', error);
    return NextResponse.json(
      { error: 'Failed to analyze posting times' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const insights = new PostingTimeInsights();
    
    // Get user's historical posting performance
    const historicalPerformance = await insights.getUserHistoricalPerformance({
      userId,
      platform: platform || undefined,
      limit: 100
    });

    return NextResponse.json({
      userId,
      platform,
      historicalPerformance,
      summary: insights.summarizePerformance(historicalPerformance)
    });

  } catch (error) {
    console.error('Error getting historical performance:', error);
    return NextResponse.json(
      { error: 'Failed to get historical performance' },
      { status: 500 }
    );
  }
}