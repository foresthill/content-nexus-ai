import { NextRequest, NextResponse } from 'next/server';
import { AudienceInsights, DemographicData, TimeSeriesData, AnalyticsFilter } from '@/types/analytics';

// Generate realistic demographic data
const generateDemographicData = (): DemographicData => {
  return {
    ageGroups: {
      '13-17': 8,
      '18-24': 32,
      '25-34': 28,
      '35-44': 18,
      '45-54': 10,
      '55-64': 3,
      '65+': 1
    },
    regions: {
      'North America': 45,
      'Europe': 25,
      'Asia': 20,
      'South America': 6,
      'Africa': 3,
      'Oceania': 1
    },
    devices: {
      'mobile': 78,
      'desktop': 15,
      'tablet': 7
    },
    gender: {
      'female': 52,
      'male': 46,
      'non-binary': 2
    },
    interests: {
      'Technology': 35,
      'Entertainment': 28,
      'Lifestyle': 22,
      'Education': 18,
      'Sports': 15,
      'Fashion': 12,
      'Travel': 10,
      'Food': 8
    }
  };
};

// Generate audience growth data
const generateAudienceGrowth = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  let currentFollowers = 10000; // Starting follower count

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Simulate organic growth with some fluctuation
    const dailyGrowth = Math.floor(Math.random() * 50 + 10); // 10-60 new followers per day
    const dailyLoss = Math.floor(Math.random() * 15 + 2);    // 2-17 unfollows per day
    const netGrowth = dailyGrowth - dailyLoss;
    
    currentFollowers += netGrowth;
    
    data.push({
      timestamp: date,
      value: currentFollowers,
      metric: 'total_followers'
    });
    
    // Add engagement data
    data.push({
      timestamp: date,
      value: Math.floor(currentFollowers * (0.1 + Math.random() * 0.05)), // 10-15% active
      metric: 'active_followers'
    });
  }

  return data;
};

// Generate behavior patterns
const generateBehaviorPatterns = () => {
  return {
    mostActiveHours: [8, 12, 17, 19, 21], // Peak activity hours
    mostActiveDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    averageSessionDuration: 4.2, // minutes
    contentPreferences: {
      'video': 45,
      'image': 35,
      'carousel': 15,
      'text': 5
    }
  };
};

// Generate engagement patterns
const generateEngagementPatterns = () => {
  const peakTimes = [
    { hour: 8, day: 'Monday', engagementRate: 6.2 },
    { hour: 12, day: 'Tuesday', engagementRate: 8.5 },
    { hour: 17, day: 'Wednesday', engagementRate: 9.1 },
    { hour: 19, day: 'Thursday', engagementRate: 12.3 },
    { hour: 21, day: 'Friday', engagementRate: 10.8 },
    { hour: 15, day: 'Saturday', engagementRate: 14.2 },
    { hour: 20, day: 'Sunday', engagementRate: 11.7 }
  ];

  return {
    likesToCommentsRatio: 12.5, // 12.5 likes per comment on average
    sharesToLikesRatio: 0.08,   // 8% of likes become shares
    peakEngagementTimes: peakTimes
  };
};

// Analyze audience segments
const analyzeAudienceSegments = (demographics: DemographicData) => {
  const segments = [];
  
  // Primary segment (largest age group + top region)
  const primaryAge = Object.entries(demographics.ageGroups)
    .sort(([,a], [,b]) => b - a)[0];
  const primaryRegion = Object.entries(demographics.regions)
    .sort(([,a], [,b]) => b - a)[0];
  
  segments.push({
    name: 'Primary Audience',
    description: `${primaryAge[0]} years old from ${primaryRegion[0]}`,
    percentage: Math.round((primaryAge[1] * primaryRegion[1]) / 100),
    characteristics: [
      'High engagement rate',
      'Active during evening hours',
      'Prefers video content'
    ]
  });

  // Tech-savvy segment
  segments.push({
    name: 'Tech Enthusiasts',
    description: '25-34 year olds interested in technology',
    percentage: 25,
    characteristics: [
      'Early adopters',
      'Share content frequently',
      'Engage with educational content'
    ]
  });

  // Casual browsers
  segments.push({
    name: 'Casual Viewers',
    description: 'Mobile users with moderate engagement',
    percentage: 35,
    characteristics: [
      'Primarily mobile users',
      'Like content but rarely comment',
      'Active during commute hours'
    ]
  });

  return segments;
};

// Generate audience insights recommendations
const generateRecommendations = (insights: AudienceInsights) => {
  const recommendations = [];

  // Content timing recommendations
  const topHour = insights.behaviorPatterns.mostActiveHours[0];
  const topDay = insights.behaviorPatterns.mostActiveDays[0];
  recommendations.push({
    category: 'Content Timing',
    recommendation: `Post at ${topHour}:00 on ${topDay}s for maximum reach`,
    impact: 'High',
    reason: 'Peak audience activity detected'
  });

  // Content type recommendations
  const preferredType = Object.entries(insights.behaviorPatterns.contentPreferences)
    .sort(([,a], [,b]) => b - a)[0];
  recommendations.push({
    category: 'Content Type',
    recommendation: `Focus on ${preferredType[0]} content`,
    impact: 'Medium',
    reason: `${preferredType[1]}% of audience prefers this format`
  });

  // Engagement strategy
  if (insights.engagementPatterns.likesToCommentsRatio > 15) {
    recommendations.push({
      category: 'Engagement',
      recommendation: 'Add more call-to-action prompts to increase comments',
      impact: 'Medium',
      reason: 'High like-to-comment ratio indicates low conversation engagement'
    });
  }

  return recommendations;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const platform = searchParams.get('platform');
    // const segment = searchParams.get('segment'); // Currently unused
    const detailed = searchParams.get('detailed') === 'true';

    // Create filter object
    const filter: AnalyticsFilter = {
      dateRange: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      },
      platforms: platform ? [platform] : ['instagram', 'twitter', 'tiktok', 'youtube']
    };

    const days = Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate audience insights data
    const demographics = generateDemographicData();
    const audienceGrowth = generateAudienceGrowth(days);
    const behaviorPatterns = generateBehaviorPatterns();
    const engagementPatterns = generateEngagementPatterns();

    const currentFollowers = audienceGrowth[audienceGrowth.length - 1]?.value || 0;
    const activeFollowers = Math.floor(currentFollowers * 0.12); // 12% active rate

    const insights: AudienceInsights = {
      totalFollowers: currentFollowers,
      activeFollowers,
      audienceGrowth,
      demographics,
      behaviorPatterns,
      engagementPatterns
    };

    const response = {
      insights,
      segments: analyzeAudienceSegments(demographics),
      recommendations: generateRecommendations(insights),
      ...(detailed && {
        platformBreakdown: filter.platforms?.map(platform => ({
          platform,
          followers: Math.floor(currentFollowers * (Math.random() * 0.4 + 0.2)), // 20-60% per platform
          engagementRate: Math.random() * 10 + 3, // 3-13%
          topContentTypes: ['video', 'image', 'carousel'].slice(0, Math.floor(Math.random() * 2) + 1)
        })),
        cohortAnalysis: {
          newUsers: Math.floor(currentFollowers * 0.15), // 15% new users in period
          returningUsers: Math.floor(currentFollowers * 0.60), // 60% returning
          loyalUsers: Math.floor(currentFollowers * 0.25), // 25% loyal users
        },
        competitorComparison: {
          yourFollowerGrowth: 8.5, // %
          industryAverage: 6.2, // %
          ranking: 'Above Average',
          gapToLeader: -2.3 // %
        }
      }),
      meta: {
        dateRange: filter.dateRange,
        platform: platform || 'all',
        lastUpdated: new Date().toISOString(),
        dataConfidence: 0.85 // 85% confidence in data accuracy
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Audience insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, platform, demographicUpdate } = body;

    // In production, this would update audience data in the database
    // For now, we'll simulate processing and return success
    
    return NextResponse.json({
      success: true,
      userId,
      platform,
      update: demographicUpdate,
      processedAt: new Date().toISOString(),
      message: 'Audience data updated successfully'
    });
  } catch (error) {
    console.error('Update audience data error:', error);
    return NextResponse.json(
      { error: 'Failed to update audience data' },
      { status: 500 }
    );
  }
}