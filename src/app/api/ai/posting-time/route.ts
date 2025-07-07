import { NextRequest, NextResponse } from 'next/server';
import { PostingTimePredictor } from '@/lib/ai/posting-time/predictor';
import { EngagementAnalyzer } from '@/lib/ai/posting-time/analyzer';
import { SocialPlatform } from '@/types/social';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, targetAudience, contentType, historicalData } = body;

    if (!platform || !['twitter', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform specified' },
        { status: 400 }
      );
    }

    // Initialize predictor with historical data
    const predictor = new PostingTimePredictor(platform as SocialPlatform);
    
    // Analyze historical engagement if provided
    if (historicalData && historicalData.length > 0) {
      const analyzer = new EngagementAnalyzer();
      const patterns = await analyzer.analyzeEngagementPatterns(historicalData);
      predictor.updateWithHistoricalPatterns(patterns);
    }

    // Get optimal posting times
    const predictions = await predictor.predictOptimalTimes({
      targetAudience,
      contentType,
      timeZone: body.timeZone || 'UTC',
      numberOfSlots: body.numberOfSlots || 3
    });

    return NextResponse.json({
      platform,
      predictions,
      confidence: predictor.getConfidenceScore(),
      factors: predictor.getInfluencingFactors()
    });

  } catch (error) {
    console.error('Error predicting optimal posting times:', error);
    return NextResponse.json(
      { error: 'Failed to predict optimal posting times' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as SocialPlatform;

    if (!platform || !['twitter', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform specified' },
        { status: 400 }
      );
    }

    // Get general best practices for the platform
    const predictor = new PostingTimePredictor(platform);
    const generalRecommendations = predictor.getGeneralRecommendations();

    return NextResponse.json({
      platform,
      generalRecommendations,
      timeZones: predictor.getSupportedTimeZones()
    });

  } catch (error) {
    console.error('Error getting posting time recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get posting time recommendations' },
      { status: 500 }
    );
  }
}