import { NextRequest, NextResponse } from 'next/server';
import { KPIMetrics, TimeSeriesData } from '@/types/analytics';

// Generate real-time KPI data
const generateKPIMetrics = (): KPIMetrics => {
  const baseEngagement = Math.floor(Math.random() * 50000 + 20000); // 20k-70k total engagement
  const totalReach = Math.floor(baseEngagement * (15 + Math.random() * 10)); // 15-25x reach multiplier
  const totalImpressions = Math.floor(totalReach * (2 + Math.random() * 1.5)); // 2-3.5x impression multiplier
  const contentPublished = Math.floor(Math.random() * 50 + 30); // 30-80 pieces of content
  const followersGrowth = Math.floor(Math.random() * 1000 + 200); // 200-1200 new followers
  
  // Calculate engagement rate
  const averageEngagementRate = parseFloat(((baseEngagement / totalReach) * 100).toFixed(2));
  
  // Calculate conversion and revenue
  const conversionRate = parseFloat((Math.random() * 3 + 1).toFixed(2)) // 1-4% conversion rate
  const revenueGenerated = Math.floor(totalReach * conversionRate * 0.01 * (Math.random() * 20 + 5)); // $5-25 per conversion
  
  // Determine engagement trend
  const trendFactor = Math.random();
  let engagementTrend: 'up' | 'down' | 'stable';
  if (trendFactor > 0.6) engagementTrend = 'up';
  else if (trendFactor < 0.3) engagementTrend = 'down';
  else engagementTrend = 'stable';
  
  // Calculate growth rate
  const growthRate = parseFloat((Math.random() * 20 - 5).toFixed(1)); // -5% to +15% growth

  // Top performing content IDs
  const topPerformingContent = [
    'content_viral_video_001',
    'content_tutorial_guide_002', 
    'content_behind_scenes_003',
    'content_product_launch_004',
    'content_user_showcase_005'
  ];

  return {
    totalEngagement: baseEngagement,
    averageEngagementRate,
    totalReach,
    totalImpressions,
    followersGrowth,
    conversionRate,
    revenueGenerated,
    contentPublished,
    topPerformingContent,
    engagementTrend,
    growthRate
  };
};

// Generate historical KPI trends
const generateKPITrends = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  const metrics = [
    'total_engagement',
    'engagementRate',
    'reach',
    'impressions',
    'followers',
    'revenue',
    'conversion_rate'
  ];

  // Base values for trend generation
  const baseValues = {
    total_engagement: 25000,
    engagementRate: 8.5,
    reach: 350000,
    impressions: 750000,
    followers: 15000,
    revenue: 2500,
    conversion_rate: 2.3
  };

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    metrics.forEach(metric => {
      // Add some realistic daily variation
      const variation = (Math.random() - 0.5) * 0.2; // ±10% daily variation
      const weekendFactor = [0, 6].includes(date.getDay()) ? 0.85 : 1; // Lower weekend activity
      const trendFactor = 1 + (days - i) * 0.001; // Slight upward trend over time
      
      let value = baseValues[metric as keyof typeof baseValues] * (1 + variation) * weekendFactor * trendFactor;
      
      // Ensure realistic bounds
      if (metric === 'engagementRate') value = Math.max(1, Math.min(25, value));
      if (metric === 'conversion_rate') value = Math.max(0.5, Math.min(8, value));
      
      data.push({
        timestamp: date,
        value: Math.round(value * 100) / 100,
        metric
      });
      
      // Update base value for next day (simulate gradual change)
      baseValues[metric as keyof typeof baseValues] = value;
    });
  }

  return data;
};

// Calculate KPI comparisons and insights
const calculateKPIInsights = (currentMetrics: KPIMetrics, trends: TimeSeriesData[]) => {
  const insights = [];
  
  // Engagement trend analysis
  const recentEngagement = trends
    .filter(d => d.metric === 'total_engagement')
    .slice(-7);
  const previousEngagement = trends
    .filter(d => d.metric === 'total_engagement')
    .slice(-14, -7);
  
  if (recentEngagement.length > 0 && previousEngagement.length > 0) {
    const recentAvg = recentEngagement.reduce((sum, d) => sum + d.value, 0) / recentEngagement.length;
    const previousAvg = previousEngagement.reduce((sum, d) => sum + d.value, 0) / previousEngagement.length;
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    insights.push({
      metric: 'Engagement Trend',
      value: `${change > 0 ? '+' : ''}${Math.round(change)}%`,
      status: change > 5 ? 'positive' : change < -5 ? 'negative' : 'neutral',
      description: `${Math.abs(Math.round(change))}% ${change > 0 ? 'increase' : 'decrease'} vs last week`
    });
  }

  // Revenue performance
  if (currentMetrics.revenueGenerated > 0) {
    const revenuePerContent = Math.round(currentMetrics.revenueGenerated / currentMetrics.contentPublished);
    insights.push({
      metric: 'Revenue per Content',
      value: `$${revenuePerContent}`,
      status: revenuePerContent > 50 ? 'positive' : revenuePerContent > 25 ? 'neutral' : 'negative',
      description: `Average revenue generated per piece of content`
    });
  }

  // Follower growth rate
  const growthRate = currentMetrics.growthRate;
  insights.push({
    metric: 'Growth Rate',
    value: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
    status: growthRate > 5 ? 'positive' : growthRate > 0 ? 'neutral' : 'negative',
    description: 'Monthly follower growth rate'
  });

  // Engagement rate benchmark
  const engagementBenchmark = currentMetrics.averageEngagementRate > 6 ? 'above' : 
                              currentMetrics.averageEngagementRate > 3 ? 'average' : 'below';
  insights.push({
    metric: 'Engagement Quality',
    value: `${currentMetrics.averageEngagementRate}%`,
    status: engagementBenchmark === 'above' ? 'positive' : 
            engagementBenchmark === 'average' ? 'neutral' : 'negative',
    description: `${engagementBenchmark} industry benchmark`
  });

  return insights;
};

// Generate real-time alerts
const generateRealTimeAlerts = (metrics: KPIMetrics) => {
  const alerts = [];
  
  // Viral content alert
  if (Math.random() > 0.7) { // 30% chance of viral content
    alerts.push({
      type: 'success',
      priority: 'high',
      message: 'One of your posts is going viral!',
      details: `"${metrics.topPerformingContent[0]}" has gained 500% more engagement than usual`,
      timestamp: new Date(),
      actionable: 'Consider boosting this content or creating similar content'
    });
  }

  // Engagement drop alert
  if (metrics.averageEngagementRate < 3) {
    alerts.push({
      type: 'warning',
      priority: 'medium',
      message: 'Engagement rate below benchmark',
      details: `Current rate ${metrics.averageEngagementRate}% is below the 3% minimum`,
      timestamp: new Date(),
      actionable: 'Review recent content performance and adjust strategy'
    });
  }

  // Revenue milestone
  if (metrics.revenueGenerated > 5000) {
    alerts.push({
      type: 'success',
      priority: 'low',
      message: 'Revenue milestone reached!',
      details: `You've generated $${metrics.revenueGenerated} this month`,
      timestamp: new Date(),
      actionable: 'Analyze top-performing revenue content for insights'
    });
  }

  // Follower growth surge
  if (metrics.followersGrowth > 800) {
    alerts.push({
      type: 'info',
      priority: 'medium',
      message: 'Exceptional follower growth detected',
      details: `${metrics.followersGrowth} new followers - 200% above average`,
      timestamp: new Date(),
      actionable: 'Identify what content drove this growth and replicate'
    });
  }

  return alerts;
};

// Generate performance recommendations
const generatePerformanceRecommendations = (metrics: KPIMetrics) => {
  const recommendations = [];

  // Based on engagement trend
  if (metrics.engagementTrend === 'down') {
    recommendations.push({
      category: 'Engagement',
      priority: 'high',
      title: 'Boost Engagement Strategy',
      description: 'Your engagement is declining. Consider new content formats.',
      actions: [
        'Experiment with interactive content (polls, Q&As)',
        'Increase posting frequency during peak hours',
        'Engage more actively with your audience comments'
      ],
      expectedImpact: '+15-25% engagement rate'
    });
  }

  // Based on conversion rate
  if (metrics.conversionRate < 2) {
    recommendations.push({
      category: 'Monetization',
      priority: 'medium',
      title: 'Improve Conversion Rate',
      description: 'Your conversion rate is below industry average.',
      actions: [
        'Add stronger call-to-actions in your content',
        'Create more product-focused content',
        'Optimize your bio and link placements'
      ],
      expectedImpact: '+0.5-1.5% conversion rate'
    });
  }

  // Based on reach
  const reachToFollowerRatio = metrics.totalReach / (metrics.followersGrowth * 20); // Estimated follower base
  if (reachToFollowerRatio < 3) {
    recommendations.push({
      category: 'Reach',
      priority: 'medium',
      title: 'Expand Content Reach',
      description: 'Your content isn\'t reaching beyond your core audience.',
      actions: [
        'Use trending hashtags relevant to your niche',
        'Collaborate with other creators',
        'Post when your audience is most active'
      ],
      expectedImpact: '+30-50% reach'
    });
  }

  // Content quantity recommendation
  if (metrics.contentPublished < 40) {
    recommendations.push({
      category: 'Content',
      priority: 'low',
      title: 'Increase Content Volume',
      description: 'Consider publishing more frequently to maintain audience engagement.',
      actions: [
        'Create a content calendar',
        'Batch create content for efficiency',
        'Repurpose content across platforms'
      ],
      expectedImpact: '+20-30% total engagement'
    });
  }

  return recommendations;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const timeframe = searchParams.get('timeframe') || '30d'; // 24h, 7d, 30d
    const includeAlerts = searchParams.get('alerts') === 'true';
    const includeRecommendations = searchParams.get('recommendations') === 'true';
    const includeComparison = searchParams.get('comparison') === 'true';
    const realTime = searchParams.get('real_time') === 'true';

    // Convert timeframe to days
    let days = 30;
    if (timeframe === '24h') days = 1;
    else if (timeframe === '7d') days = 7;
    else if (timeframe === '30d') days = 30;
    else if (timeframe.endsWith('d')) days = parseInt(timeframe.replace('d', ''));

    // Generate current KPI metrics
    const currentMetrics = generateKPIMetrics();
    const trends = generateKPITrends(days);
    const insights = calculateKPIInsights(currentMetrics, trends);

    // Base response
    const response: {
      current: KPIMetrics;
      trends: TimeSeriesData[];
      insights: Array<{ metric: string; value: string; status: string; description: string }>;
      summary: {
        totalMetrics: number;
        timeframe: string;
        lastUpdated: string;
        dataFreshness: string;
      };
      alerts?: Array<{
        type: string;
        priority: string;
        message: string;
        details: string;
        timestamp: Date;
        actionable: string;
      }>;
      recommendations?: Array<{
        category: string;
        priority: string;
        title: string;
        description: string;
        actions: string[];
        expectedImpact: string;
      }>;
      comparison?: {
        previousPeriod: {
          totalEngagement: number;
          averageEngagementRate: number;
          totalReach: number;
          followersGrowth: number;
          revenueGenerated: number;
        };
        changes: {
          engagement: { absolute: number; percentage: number };
          engagementRate: { absolute: number; percentage: number };
          reach: { absolute: number; percentage: number };
          revenue: { absolute: number; percentage: number };
        };
        periodLabel: string;
      };
      platformBreakdown?: Array<{
        platform: string;
        metrics: {
          engagement: number;
          reach: number;
          revenue: number;
        };
        performance: string;
      }>;
    } = {
      current: currentMetrics,
      trends,
      insights,
      summary: {
        totalMetrics: Object.keys(currentMetrics).length,
        timeframe,
        lastUpdated: new Date().toISOString(),
        dataFreshness: realTime ? 'real-time' : '15-minute-delay'
      }
    };

    // Add alerts if requested
    if (includeAlerts) {
      response.alerts = generateRealTimeAlerts(currentMetrics, trends);
    }

    // Add recommendations if requested
    if (includeRecommendations) {
      response.recommendations = generatePerformanceRecommendations(currentMetrics);
    }

    // Add comparison data if requested
    if (includeComparison) {
      // Generate comparison with previous period
      const previousMetrics = {
        totalEngagement: Math.floor(currentMetrics.totalEngagement * (0.85 + Math.random() * 0.3)),
        averageEngagementRate: parseFloat((currentMetrics.averageEngagementRate * (0.9 + Math.random() * 0.2)).toFixed(2)),
        totalReach: Math.floor(currentMetrics.totalReach * (0.8 + Math.random() * 0.4)),
        followersGrowth: Math.floor(currentMetrics.followersGrowth * (0.7 + Math.random() * 0.6)),
        revenueGenerated: Math.floor(currentMetrics.revenueGenerated * (0.6 + Math.random() * 0.8))
      };

      response.comparison = {
        previousPeriod: previousMetrics,
        changes: {
          engagement: {
            absolute: currentMetrics.totalEngagement - previousMetrics.totalEngagement,
            percentage: Math.round(((currentMetrics.totalEngagement - previousMetrics.totalEngagement) / previousMetrics.totalEngagement) * 100)
          },
          engagementRate: {
            absolute: Math.round((currentMetrics.averageEngagementRate - previousMetrics.averageEngagementRate) * 100) / 100,
            percentage: Math.round(((currentMetrics.averageEngagementRate - previousMetrics.averageEngagementRate) / previousMetrics.averageEngagementRate) * 100)
          },
          reach: {
            absolute: currentMetrics.totalReach - previousMetrics.totalReach,
            percentage: Math.round(((currentMetrics.totalReach - previousMetrics.totalReach) / previousMetrics.totalReach) * 100)
          },
          revenue: {
            absolute: currentMetrics.revenueGenerated - previousMetrics.revenueGenerated,
            percentage: Math.round(((currentMetrics.revenueGenerated - previousMetrics.revenueGenerated) / previousMetrics.revenueGenerated) * 100)
          }
        },
        periodLabel: `Previous ${days} days`
      };
    }

    // Add platform breakdown for detailed view
    if (searchParams.get('detailed') === 'true') {
      response.platformBreakdown = [
        {
          platform: 'instagram',
          metrics: {
            engagement: Math.floor(currentMetrics.totalEngagement * 0.4),
            reach: Math.floor(currentMetrics.totalReach * 0.35),
            revenue: Math.floor(currentMetrics.revenueGenerated * 0.45)
          },
          performance: 'high'
        },
        {
          platform: 'tiktok',
          metrics: {
            engagement: Math.floor(currentMetrics.totalEngagement * 0.35),
            reach: Math.floor(currentMetrics.totalReach * 0.4),
            revenue: Math.floor(currentMetrics.revenueGenerated * 0.25)
          },
          performance: 'high'
        },
        {
          platform: 'twitter',
          metrics: {
            engagement: Math.floor(currentMetrics.totalEngagement * 0.15),
            reach: Math.floor(currentMetrics.totalReach * 0.15),
            revenue: Math.floor(currentMetrics.revenueGenerated * 0.2)
          },
          performance: 'medium'
        },
        {
          platform: 'youtube',
          metrics: {
            engagement: Math.floor(currentMetrics.totalEngagement * 0.1),
            reach: Math.floor(currentMetrics.totalReach * 0.1),
            revenue: Math.floor(currentMetrics.revenueGenerated * 0.1)
          },
          performance: 'low'
        }
      ];
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('KPI analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, timestamp } = body;

    // In production, this would update real-time KPI data in the database
    // For now, we'll simulate processing and return success
    
    return NextResponse.json({
      success: true,
      metric,
      value,
      timestamp: timestamp || new Date().toISOString(),
      message: 'KPI metric updated successfully'
    });
  } catch (error) {
    console.error('Update KPI metric error:', error);
    return NextResponse.json(
      { error: 'Failed to update KPI metric' },
      { status: 500 }
    );
  }
}