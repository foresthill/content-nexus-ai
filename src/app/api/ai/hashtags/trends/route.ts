import { NextRequest, NextResponse } from 'next/server';
import { analyzeHashtagTrends } from '@/lib/ai/hashtags/trends';
import { SocialPlatform } from '@/types/social';

interface TrendRequest {
  platform: SocialPlatform;
  category?: string;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as SocialPlatform;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    if (!platform || !['twitter', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform is required (twitter, instagram, or tiktok)' },
        { status: 400 }
      );
    }

    // Get current trends
    const trends = await analyzeHashtagTrends([], platform, category);

    return NextResponse.json({
      platform,
      category,
      trends: trends.topTrends.slice(0, limit),
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

export async function POST(request: NextRequest) {
  try {
    const body: TrendRequest = await request.json();
    const { platform, category, limit = 20 } = body;

    if (!platform || !['twitter', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform is required' },
        { status: 400 }
      );
    }

    // Analyze trends with additional context
    const trends = await analyzeHashtagTrends([], platform, category);

    // Group trends by growth rate
    const groupedTrends = {
      rising: trends.topTrends.filter(t => t.growthRate > 15),
      stable: trends.topTrends.filter(t => t.growthRate >= 5 && t.growthRate <= 15),
      declining: trends.topTrends.filter(t => t.growthRate < 5),
    };

    return NextResponse.json({
      platform,
      category,
      trends: {
        all: trends.topTrends.slice(0, limit),
        rising: groupedTrends.rising.slice(0, 5),
        stable: groupedTrends.stable.slice(0, 5),
        declining: groupedTrends.declining.slice(0, 5),
      },
      categories: trends.categories,
      insights: generateTrendInsights(groupedTrends, platform),
      lastUpdated: trends.lastUpdated,
    });
  } catch (error) {
    console.error('Error analyzing hashtag trends:', error);
    return NextResponse.json(
      { error: 'Failed to analyze hashtag trends' },
      { status: 500 }
    );
  }
}

function generateTrendInsights(
  groupedTrends: {
    rising: Array<{ hashtag: string; growthRate: number; volume: number }>;
    stable: Array<{ hashtag: string; growthRate: number; volume: number }>;
    declining: Array<{ hashtag: string; growthRate: number; volume: number }>;
  },
  platform: SocialPlatform
): string[] {
  const insights: string[] = [];

  // Rising trends insight
  if (groupedTrends.rising.length > 0) {
    const topRising = groupedTrends.rising.slice(0, 3).map(t => `#${t.hashtag}`).join(', ');
    insights.push(`急上昇トレンド: ${topRising} が${platform}で注目を集めています`);
  }

  // Engagement insight
  const highEngagement = [...groupedTrends.rising, ...groupedTrends.stable]
    .filter(t => t.engagementRate && t.engagementRate > 10)
    .slice(0, 3);
  
  if (highEngagement.length > 0) {
    const avgEngagement = (
      highEngagement.reduce((sum, t) => sum + t.engagementRate, 0) / highEngagement.length
    ).toFixed(1);
    insights.push(`高エンゲージメント率: 平均${avgEngagement}%の反応率を記録`);
  }

  // Platform-specific insights
  const platformInsights = {
    twitter: 'リアルタイムの話題性を重視したハッシュタグ選定が効果的',
    instagram: '視覚的コンテンツと関連性の高いハッシュタグの組み合わせを推奨',
    tiktok: 'トレンドに敏感なプラットフォーム。新しいハッシュタグへの対応が重要',
  };

  insights.push(platformInsights[platform]);

  return insights;
}