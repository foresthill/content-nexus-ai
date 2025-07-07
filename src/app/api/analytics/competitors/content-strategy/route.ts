import { NextRequest, NextResponse } from 'next/server';
import { ContentStrategyAnalysis } from '@/types/competitor';

// Mock data for content strategy analysis
const generateContentStrategyAnalysis = (competitorId: string): ContentStrategyAnalysis => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  return {
    competitorId,
    analysisDate: now,
    timeframe: {
      start: thirtyDaysAgo,
      end: now
    },
    postingFrequency: {
      daily: 2.1,
      weekly: 14.7,
      monthly: 63,
      consistency: 0.78
    },
    optimalPostingTimes: [
      {
        platform: 'instagram',
        hours: [9, 12, 15, 18, 21],
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
        timezone: 'PST'
      },
      {
        platform: 'tiktok',
        hours: [16, 18, 20, 22],
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        timezone: 'PST'
      }
    ],
    contentMix: [
      {
        contentType: 'video',
        percentage: 45,
        avgEngagement: 5.2,
        performance: 'high'
      },
      {
        contentType: 'image',
        percentage: 35,
        avgEngagement: 3.8,
        performance: 'medium'
      },
      {
        contentType: 'carousel',
        percentage: 15,
        avgEngagement: 4.1,
        performance: 'medium'
      },
      {
        contentType: 'text',
        percentage: 5,
        avgEngagement: 2.3,
        performance: 'low'
      }
    ],
    topicDistribution: [
      {
        topic: 'lifestyle tips',
        frequency: 18,
        engagement: 4.7,
        trending: true
      },
      {
        topic: 'product reviews',
        frequency: 15,
        engagement: 5.3,
        trending: false
      },
      {
        topic: 'behind the scenes',
        frequency: 12,
        engagement: 6.1,
        trending: true
      },
      {
        topic: 'tutorials',
        frequency: 10,
        engagement: 4.2,
        trending: false
      },
      {
        topic: 'collaborations',
        frequency: 8,
        engagement: 7.8,
        trending: true
      }
    ],
    hashtagStrategy: {
      averageHashtagsPerPost: 12.3,
      mostUsedHashtags: [
        {
          hashtag: '#lifestyle',
          frequency: 45,
          avgEngagement: 4.5
        },
        {
          hashtag: '#dailyvibe',
          frequency: 38,
          avgEngagement: 5.1
        },
        {
          hashtag: '#authenticity',
          frequency: 32,
          avgEngagement: 4.8
        },
        {
          hashtag: '#selfcare',
          frequency: 28,
          avgEngagement: 5.7
        },
        {
          hashtag: '#mindfulness',
          frequency: 25,
          avgEngagement: 4.3
        }
      ],
      hashtagCategories: [
        {
          category: 'branded',
          percentage: 25
        },
        {
          category: 'community',
          percentage: 40
        },
        {
          category: 'trending',
          percentage: 20
        },
        {
          category: 'niche',
          percentage: 15
        }
      ]
    },
    engagementPatterns: {
      averageEngagementRate: 4.8,
      engagementTrend: 'increasing',
      bestPerformingContentTypes: [
        {
          type: 'video',
          avgEngagementRate: 5.2
        },
        {
          type: 'carousel',
          avgEngagementRate: 4.1
        },
        {
          type: 'image',
          avgEngagementRate: 3.8
        }
      ],
      audienceInteraction: {
        respondsToComments: true,
        avgResponseTime: 4.2,
        communityEngagement: 0.82
      }
    }
  };
};

// Mock data for multiple competitors' content strategies
const mockContentStrategies: { [key: string]: ContentStrategyAnalysis } = {
  'comp_1': generateContentStrategyAnalysis('comp_1'),
  'comp_2': {
    ...generateContentStrategyAnalysis('comp_2'),
    contentMix: [
      {
        contentType: 'video',
        percentage: 60,
        avgEngagement: 6.1,
        performance: 'high'
      },
      {
        contentType: 'image',
        percentage: 25,
        avgEngagement: 4.2,
        performance: 'medium'
      },
      {
        contentType: 'text',
        percentage: 10,
        avgEngagement: 3.1,
        performance: 'medium'
      },
      {
        contentType: 'carousel',
        percentage: 5,
        avgEngagement: 3.8,
        performance: 'medium'
      }
    ],
    topicDistribution: [
      {
        topic: 'business strategy',
        frequency: 22,
        engagement: 5.8,
        trending: true
      },
      {
        topic: 'entrepreneurship',
        frequency: 18,
        engagement: 6.2,
        trending: true
      },
      {
        topic: 'marketing tips',
        frequency: 15,
        engagement: 5.1,
        trending: false
      },
      {
        topic: 'industry insights',
        frequency: 12,
        engagement: 4.7,
        trending: false
      },
      {
        topic: 'success stories',
        frequency: 10,
        engagement: 7.3,
        trending: true
      }
    ]
  }
};

// GET - Retrieve content strategy analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitorId');
    const compare = searchParams.get('compare') === 'true';
    // const timeframe = searchParams.get('timeframe') || '30d'; // Currently unused

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Get strategy analysis for the specified competitor
    const strategy = mockContentStrategies[competitorId];
    if (!strategy) {
      return NextResponse.json(
        { error: 'Content strategy analysis not found for this competitor' },
        { status: 404 }
      );
    }

    // If comparison is requested, include other competitors' data
    if (compare) {
      const allStrategies = Object.entries(mockContentStrategies)
        .filter(([id]) => id !== competitorId)
        .map(([id, strategy]) => ({
          competitorId: id,
          strategy
        }));

      return NextResponse.json({
        target: strategy,
        comparisons: allStrategies,
        insights: generateStrategyInsights(strategy, allStrategies.map(c => c.strategy))
      });
    }

    return NextResponse.json(strategy);

  } catch (error) {
    console.error('Error fetching content strategy analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content strategy analysis' },
      { status: 500 }
    );
  }
}

// POST - Generate new content strategy analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId } = body;
    // const forceRefresh = false; // Currently unused

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would trigger analysis of competitor's content
    // For now, we'll generate or refresh mock data
    const analysis = generateContentStrategyAnalysis(competitorId);
    mockContentStrategies[competitorId] = analysis;

    return NextResponse.json({
      message: 'Content strategy analysis generated successfully',
      analysis,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error generating content strategy analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate content strategy analysis' },
      { status: 500 }
    );
  }
}

// Helper function to generate strategy insights
function generateStrategyInsights(
  targetStrategy: ContentStrategyAnalysis, 
  comparisons: ContentStrategyAnalysis[]
): string[] {
  const insights: string[] = [];

  // Posting frequency insights
  const avgFrequency = comparisons.reduce((sum, c) => sum + c.postingFrequency.daily, 0) / comparisons.length;
  if (targetStrategy.postingFrequency.daily > avgFrequency * 1.2) {
    insights.push(`Posts ${Math.round(((targetStrategy.postingFrequency.daily / avgFrequency) - 1) * 100)}% more frequently than competitors`);
  } else if (targetStrategy.postingFrequency.daily < avgFrequency * 0.8) {
    insights.push(`Posts ${Math.round((1 - (targetStrategy.postingFrequency.daily / avgFrequency)) * 100)}% less frequently than competitors`);
  }

  // Content mix insights
  const topContentType = targetStrategy.contentMix.reduce((prev, current) => 
    prev.percentage > current.percentage ? prev : current
  );
  insights.push(`Focuses heavily on ${topContentType.contentType} content (${topContentType.percentage}% of posts)`);

  // Engagement insights
  const avgEngagement = comparisons.reduce((sum, c) => sum + c.engagementPatterns.averageEngagementRate, 0) / comparisons.length;
  if (targetStrategy.engagementPatterns.averageEngagementRate > avgEngagement) {
    insights.push(`Achieves ${Math.round(((targetStrategy.engagementPatterns.averageEngagementRate / avgEngagement) - 1) * 100)}% higher engagement than average`);
  }

  // Topic insights
  const trendingTopics = targetStrategy.topicDistribution.filter(t => t.trending);
  if (trendingTopics.length > 0) {
    insights.push(`Actively covers ${trendingTopics.length} trending topics`);
  }

  // Hashtag strategy insights
  if (targetStrategy.hashtagStrategy.averageHashtagsPerPost > 15) {
    insights.push('Uses extensive hashtag strategy with high tag density');
  } else if (targetStrategy.hashtagStrategy.averageHashtagsPerPost < 8) {
    insights.push('Uses minimal hashtag strategy, focusing on quality over quantity');
  }

  // Community engagement insights
  if (targetStrategy.engagementPatterns.audienceInteraction.communityEngagement > 0.8) {
    insights.push('Maintains strong community engagement with active audience interaction');
  }

  return insights;
}