import { NextRequest, NextResponse } from 'next/server';
import { EngagementMetrics, TimeSeriesData, AnalyticsFilter } from '@/types/analytics';

// Simulated engagement data - In production, this would come from your database
const generateEngagementData = (filter?: AnalyticsFilter): TimeSeriesData[] => {
  const now = new Date();
  const days = filter?.dateRange ? 
    Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 30;
  
  const data: TimeSeriesData[] = [];
  const platforms = filter?.platforms || ['instagram', 'twitter', 'tiktok'];
  const metrics = ['engagementRate', 'likes', 'comments', 'shares', 'saves'];

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    platforms.forEach(platform => {
      metrics.forEach(metric => {
        let value = 0;
        switch (metric) {
          case 'engagementRate':
            value = Math.random() * 15 + 2; // 2-17% engagement rate
            break;
          case 'likes':
            value = Math.floor(Math.random() * 1000 + 100);
            break;
          case 'comments':
            value = Math.floor(Math.random() * 100 + 10);
            break;
          case 'shares':
            value = Math.floor(Math.random() * 50 + 5);
            break;
          case 'saves':
            value = Math.floor(Math.random() * 80 + 15);
            break;
        }

        // Add platform-specific adjustments
        if (platform === 'tiktok' && metric === 'engagementRate') {
          value *= 1.5; // TikTok generally has higher engagement
        } else if (platform === 'twitter' && metric === 'likes') {
          value *= 0.7; // Twitter typically has lower likes
        }

        data.push({
          timestamp: date,
          value: Math.round(value * 100) / 100,
          platform,
          metric
        });
      });
    });
  }

  return data;
};

const calculateEngagementMetrics = (data: TimeSeriesData[]): EngagementMetrics => {
  const likes = data.filter(d => d.metric === 'likes').reduce((sum, d) => sum + d.value, 0);
  const comments = data.filter(d => d.metric === 'comments').reduce((sum, d) => sum + d.value, 0);
  const shares = data.filter(d => d.metric === 'shares').reduce((sum, d) => sum + d.value, 0);
  const saves = data.filter(d => d.metric === 'saves').reduce((sum, d) => sum + d.value, 0);
  const impressions = Math.floor(likes * 8 + comments * 12 + shares * 15); // Estimated impressions
  const reach = Math.floor(impressions * 0.7); // Estimated reach

  return {
    likes: Math.floor(likes),
    shares: Math.floor(shares),
    comments: Math.floor(comments),
    saves: Math.floor(saves),
    impressions,
    reach,
    engagementRate: parseFloat(((likes + comments + shares + saves) / impressions * 100).toFixed(2)),
    clickThroughRate: Math.random() * 5 + 1 // 1-6% CTR
  };
};

const analyzeEngagementTrends = (data: TimeSeriesData[]) => {
  const engagementRates = data
    .filter(d => d.metric === 'engagementRate')
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  if (engagementRates.length < 7) return { trend: 'stable', change: 0 };

  const recentWeek = engagementRates.slice(-7);
  const previousWeek = engagementRates.slice(-14, -7);
  
  const recentAvg = recentWeek.reduce((sum, d) => sum + d.value, 0) / recentWeek.length;
  const previousAvg = previousWeek.reduce((sum, d) => sum + d.value, 0) / previousWeek.length;
  
  const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  return {
    trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
    change: Math.round(change * 100) / 100,
    recentAverage: Math.round(recentAvg * 100) / 100,
    previousAverage: Math.round(previousAvg * 100) / 100
  };
};

const getTopPerformingContent = () => {
  return [
    {
      id: '1',
      title: 'AI-Generated Video Tutorial',
      platform: 'youtube',
      engagementRate: 12.5,
      views: 15420,
      likes: 1890,
      comments: 234
    },
    {
      id: '2', 
      title: 'Behind the Scenes Content',
      platform: 'instagram',
      engagementRate: 8.3,
      views: 8950,
      likes: 742,
      comments: 89
    },
    {
      id: '3',
      title: 'Product Launch Announcement',
      platform: 'twitter',
      engagementRate: 6.7,
      views: 5670,
      likes: 380,
      comments: 45
    }
  ];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const platforms = searchParams.get('platforms')?.split(',');
    const detailed = searchParams.get('detailed') === 'true';

    // Create filter object
    const filter: AnalyticsFilter = {
      dateRange: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      },
      platforms: platforms || ['instagram', 'twitter', 'tiktok', 'youtube']
    };

    // Generate engagement data
    const timeSeriesData = generateEngagementData(filter);
    const overallMetrics = calculateEngagementMetrics(timeSeriesData);
    const trends = analyzeEngagementTrends(timeSeriesData);

    const response = {
      metrics: overallMetrics,
      timeSeries: timeSeriesData,
      trends,
      ...(detailed && {
        topContent: getTopPerformingContent(),
        platformBreakdown: filter.platforms?.map(platform => {
          const platformData = timeSeriesData.filter(d => d.platform === platform);
          return {
            platform,
            metrics: calculateEngagementMetrics(platformData),
            dataPoints: platformData.length
          };
        }),
        insights: [
          'Engagement rates are 23% higher on weekends',
          'Video content performs 35% better than static images',
          'Posts with 3-5 hashtags get optimal engagement',
          'Stories posted between 7-9 PM get highest completion rates'
        ]
      }),
      meta: {
        dateRange: filter.dateRange,
        platforms: filter.platforms,
        totalDataPoints: timeSeriesData.length,
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Engagement analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, platform, metrics } = body;

    // In production, this would update engagement metrics in the database
    // For now, we'll simulate processing and return success
    
    const updatedMetrics: EngagementMetrics = {
      likes: metrics.likes || 0,
      shares: metrics.shares || 0,
      comments: metrics.comments || 0,
      saves: metrics.saves || 0,
      impressions: metrics.impressions || 0,
      reach: metrics.reach || 0,
      engagementRate: metrics.engagementRate || 0,
      clickThroughRate: metrics.clickThroughRate || 0
    };

    return NextResponse.json({
      success: true,
      contentId,
      platform,
      metrics: updatedMetrics,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update engagement metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to update engagement metrics' },
      { status: 500 }
    );
  }
}