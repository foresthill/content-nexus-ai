import { NextRequest, NextResponse } from 'next/server';
import { ContentPerformanceMetrics, EngagementMetrics, AnalyticsFilter } from '@/types/analytics';

// Generate realistic content performance data
const generateContentPerformance = (count: number = 20): ContentPerformanceMetrics[] => {
  const contentTypes: ('video' | 'image' | 'text' | 'carousel')[] = ['video', 'image', 'text', 'carousel'];
  const platforms = ['instagram', 'twitter', 'tiktok', 'youtube'];
  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  
  const sampleTitles = [
    'Ultimate Guide to AI Content Creation',
    'Behind the Scenes: My Creative Process',
    '5 Tips for Better Social Media Engagement',
    'Product Launch: Revolutionary New Feature',
    'Day in the Life: Content Creator Edition',
    'Tutorial: Advanced Photo Editing Techniques',
    'Q&A: Your Questions Answered',
    'Trending Now: Latest Industry Updates',
    'Collaboration with Top Influencer',
    'Monthly Recap: Best Performing Content',
    'Live Stream Highlights',
    'User Generated Content Showcase',
    'Breaking: Major Platform Update',
    'Educational Series: Part 1',
    'Motivational Monday: Success Stories',
    'Flash Sale Announcement',
    'Community Spotlight: Featured Creator',
    'Throwback Thursday: Old vs New',
    'Weekend Vibes: Relaxing Content',
    'Tech Review: Latest Gadgets'
  ];

  const hashtagSets = [
    ['#contentcreator', '#socialmedia', '#digital'],
    ['#photography', '#art', '#creative'],
    ['#tech', '#innovation', '#future'],
    ['#lifestyle', '#motivation', '#success'],
    ['#education', '#learning', '#tutorial'],
    ['#business', '#entrepreneur', '#growth'],
    ['#travel', '#adventure', '#explore'],
    ['#food', '#cooking', '#recipe'],
    ['#fitness', '#health', '#wellness'],
    ['#fashion', '#style', '#trending']
  ];

  const emotionOptions = ['joy', 'excitement', 'curiosity', 'inspiration', 'surprise', 'love', 'admiration'];

  return Array.from({ length: count }, (_, index) => {
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const publishedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    // Generate engagement metrics based on content type and platform
    let baseEngagement = Math.random() * 1000 + 100;
    if (contentType === 'video') baseEngagement *= 1.5;
    if (platform === 'tiktok') baseEngagement *= 2;
    
    const likes = Math.floor(baseEngagement * (0.8 + Math.random() * 0.4));
    const comments = Math.floor(likes * (0.05 + Math.random() * 0.1));
    const shares = Math.floor(likes * (0.02 + Math.random() * 0.05));
    const saves = Math.floor(likes * (0.03 + Math.random() * 0.07));
    const impressions = Math.floor(likes * (8 + Math.random() * 12));
    const reach = Math.floor(impressions * (0.6 + Math.random() * 0.3));

    const engagement: EngagementMetrics = {
      likes,
      shares,
      comments,
      saves,
      impressions,
      reach,
      engagementRate: parseFloat(((likes + comments + shares + saves) / impressions * 100).toFixed(2)),
      clickThroughRate: Math.random() * 5 + 1,
      ...(contentType === 'video' && {
        averageViewDuration: Math.random() * 120 + 30 // 30-150 seconds
      })
    };

    // Calculate performance score based on various factors
    const engagementScore = Math.min(engagement.engagementRate * 10, 40);
    const reachScore = Math.min((reach / impressions) * 100, 30);
    const viralityScore = shares > likes * 0.1 ? 20 : shares > likes * 0.05 ? 10 : 0;
    const recencyBonus = (30 - Math.floor((Date.now() - publishedAt.getTime()) / (24 * 60 * 60 * 1000))) * 0.5;
    
    const performanceScore = Math.min(
      Math.max(engagementScore + reachScore + viralityScore + recencyBonus, 0),
      100
    );

    // Determine performance category
    let category: 'viral' | 'high' | 'medium' | 'low';
    if (performanceScore >= 80) category = 'viral';
    else if (performanceScore >= 60) category = 'high';
    else if (performanceScore >= 40) category = 'medium';
    else category = 'low';

    // Generate emotion breakdown
    const emotionBreakdown: { [emotion: string]: number } = {};
    const selectedEmotions = emotionOptions.slice(0, Math.floor(Math.random() * 4) + 2);
    let total = 0;
    selectedEmotions.forEach((emotion) => {
      const value = Math.random() * 30 + 5;
      emotionBreakdown[emotion] = Math.round(value);
      total += emotionBreakdown[emotion];
    });
    
    // Normalize to 100%
    Object.keys(emotionBreakdown).forEach(key => {
      emotionBreakdown[key] = Math.round((emotionBreakdown[key] / total) * 100);
    });

    return {
      contentId: `content_${index + 1}`,
      title: sampleTitles[index % sampleTitles.length],
      platform,
      contentType,
      publishedAt,
      engagement,
      performance: {
        score: Math.round(performanceScore * 100) / 100,
        rank: index + 1,
        category
      },
      audienceReaction: {
        sentiment,
        emotionBreakdown
      },
      hashtags: hashtagSets[Math.floor(Math.random() * hashtagSets.length)],
      mentions: Math.random() > 0.7 ? [`@user${Math.floor(Math.random() * 100)}`] : undefined
    };
  }).sort((a, b) => b.performance.score - a.performance.score);
};

// Analyze performance trends
const analyzePerformanceTrends = (content: ContentPerformanceMetrics[]) => {
  const last7Days = content.filter(c => 
    c.publishedAt.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  const previous7Days = content.filter(c => 
    c.publishedAt.getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000 &&
    c.publishedAt.getTime() <= Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const currentAvg = last7Days.length > 0 
    ? last7Days.reduce((sum, c) => sum + c.performance.score, 0) / last7Days.length 
    : 0;
  const previousAvg = previous7Days.length > 0 
    ? previous7Days.reduce((sum, c) => sum + c.performance.score, 0) / previous7Days.length 
    : 0;

  const trend = currentAvg > previousAvg * 1.05 ? 'improving' : 
                currentAvg < previousAvg * 0.95 ? 'declining' : 'stable';

  return {
    trend,
    currentPeriodAverage: Math.round(currentAvg * 100) / 100,
    previousPeriodAverage: Math.round(previousAvg * 100) / 100,
    change: previousAvg > 0 ? Math.round(((currentAvg - previousAvg) / previousAvg) * 100 * 100) / 100 : 0,
    totalContentAnalyzed: content.length,
    recentContentCount: last7Days.length
  };
};

// Generate content insights
const generateContentInsights = (content: ContentPerformanceMetrics[]) => {
  const insights = [];

  // Best performing content type
  const typePerformance = content.reduce((acc, c) => {
    acc[c.contentType] = acc[c.contentType] || { total: 0, count: 0 };
    acc[c.contentType].total += c.performance.score;
    acc[c.contentType].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const bestType = Object.entries(typePerformance)
    .map(([type, data]) => ({ type, average: data.total / data.count }))
    .sort((a, b) => b.average - a.average)[0];

  if (bestType) {
    insights.push({
      type: 'content_type',
      title: 'Best Performing Content Type',
      description: `${bestType.type} content performs ${Math.round(bestType.average)}% better on average`,
      actionable: `Focus on creating more ${bestType.type} content`,
      impact: 'high'
    });
  }

  // Platform performance
  const platformPerformance = content.reduce((acc, c) => {
    acc[c.platform] = acc[c.platform] || { total: 0, count: 0 };
    acc[c.platform].total += c.engagement.engagementRate;
    acc[c.platform].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const bestPlatform = Object.entries(platformPerformance)
    .map(([platform, data]) => ({ platform, average: data.total / data.count }))
    .sort((a, b) => b.average - a.average)[0];

  if (bestPlatform) {
    insights.push({
      type: 'platform',
      title: 'Top Performing Platform',
      description: `${bestPlatform.platform} has ${Math.round(bestPlatform.average * 100) / 100}% average engagement rate`,
      actionable: `Increase posting frequency on ${bestPlatform.platform}`,
      impact: 'medium'
    });
  }

  // Hashtag analysis
  const hashtagPerformance = new Map<string, { scores: number[], count: number }>();
  content.forEach(c => {
    c.hashtags?.forEach(hashtag => {
      if (!hashtagPerformance.has(hashtag)) {
        hashtagPerformance.set(hashtag, { scores: [], count: 0 });
      }
      hashtagPerformance.get(hashtag)!.scores.push(c.performance.score);
      hashtagPerformance.get(hashtag)!.count += 1;
    });
  });

  const topHashtag = Array.from(hashtagPerformance.entries())
    .filter(([, data]) => data.count >= 2) // Only hashtags used multiple times
    .map(([hashtag, data]) => ({
      hashtag,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      usage: data.count
    }))
    .sort((a, b) => b.averageScore - a.averageScore)[0];

  if (topHashtag) {
    insights.push({
      type: 'hashtag',
      title: 'Best Performing Hashtag',
      description: `${topHashtag.hashtag} drives ${Math.round(topHashtag.averageScore)} average performance score`,
      actionable: `Use ${topHashtag.hashtag} more frequently in your posts`,
      impact: 'low'
    });
  }

  // Time-based insights
  const hourlyPerformance = content.reduce((acc, c) => {
    const hour = c.publishedAt.getHours();
    acc[hour] = acc[hour] || { total: 0, count: 0 };
    acc[hour].total += c.performance.score;
    acc[hour].count += 1;
    return acc;
  }, {} as Record<number, { total: number; count: number }>);

  const bestHour = Object.entries(hourlyPerformance)
    .map(([hour, data]) => ({ hour: parseInt(hour), average: data.total / data.count }))
    .sort((a, b) => b.average - a.average)[0];

  if (bestHour) {
    insights.push({
      type: 'timing',
      title: 'Optimal Posting Time',
      description: `Content posted at ${bestHour.hour}:00 performs ${Math.round(bestHour.average)}% better`,
      actionable: `Schedule more content around ${bestHour.hour}:00`,
      impact: 'medium'
    });
  }

  return insights;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const platform = searchParams.get('platform');
    const contentType = searchParams.get('content_type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sort_by') || 'score';
    const category = searchParams.get('category'); // viral, high, medium, low
    const detailed = searchParams.get('detailed') === 'true';

    // Create filter object
    const filter: AnalyticsFilter = {
      dateRange: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date()
      },
      platforms: platform ? [platform] : undefined,
      contentTypes: contentType ? [contentType] : undefined
    };

    // Generate content performance data
    let contentPerformance = generateContentPerformance(Math.min(limit * 2, 100));

    // Apply filters
    contentPerformance = contentPerformance.filter(content => {
      const withinDateRange = content.publishedAt >= filter.dateRange.start && 
                             content.publishedAt <= filter.dateRange.end;
      const matchesPlatform = !filter.platforms || filter.platforms.includes(content.platform);
      const matchesContentType = !filter.contentTypes || filter.contentTypes.includes(content.contentType);
      const matchesCategory = !category || content.performance.category === category;
      
      return withinDateRange && matchesPlatform && matchesContentType && matchesCategory;
    });

    // Sort results
    if (sortBy === 'score') {
      contentPerformance.sort((a, b) => b.performance.score - a.performance.score);
    } else if (sortBy === 'engagement') {
      contentPerformance.sort((a, b) => b.engagement.engagementRate - a.engagement.engagementRate);
    } else if (sortBy === 'date') {
      contentPerformance.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }

    // Limit results
    const limitedContent = contentPerformance.slice(0, limit);
    const trends = analyzePerformanceTrends(contentPerformance);
    const insights = generateContentInsights(contentPerformance);

    const response = {
      content: limitedContent,
      trends,
      insights,
      summary: {
        totalContent: contentPerformance.length,
        averageScore: contentPerformance.length > 0 
          ? Math.round((contentPerformance.reduce((sum, c) => sum + c.performance.score, 0) / contentPerformance.length) * 100) / 100
          : 0,
        topPerformer: limitedContent[0] || null,
        categoryBreakdown: {
          viral: contentPerformance.filter(c => c.performance.category === 'viral').length,
          high: contentPerformance.filter(c => c.performance.category === 'high').length,
          medium: contentPerformance.filter(c => c.performance.category === 'medium').length,
          low: contentPerformance.filter(c => c.performance.category === 'low').length
        }
      },
      ...(detailed && {
        platformBreakdown: ['instagram', 'twitter', 'tiktok', 'youtube'].map(platform => {
          const platformContent = contentPerformance.filter(c => c.platform === platform);
          return {
            platform,
            contentCount: platformContent.length,
            averageScore: platformContent.length > 0 
              ? Math.round((platformContent.reduce((sum, c) => sum + c.performance.score, 0) / platformContent.length) * 100) / 100
              : 0,
            bestPerformer: platformContent[0] || null
          };
        }),
        contentTypeBreakdown: ['video', 'image', 'text', 'carousel'].map(type => {
          const typeContent = contentPerformance.filter(c => c.contentType === type);
          return {
            contentType: type,
            contentCount: typeContent.length,
            averageScore: typeContent.length > 0 
              ? Math.round((typeContent.reduce((sum, c) => sum + c.performance.score, 0) / typeContent.length) * 100) / 100
              : 0,
            averageEngagement: typeContent.length > 0 
              ? Math.round((typeContent.reduce((sum, c) => sum + c.engagement.engagementRate, 0) / typeContent.length) * 100) / 100
              : 0
          };
        })
      }),
      meta: {
        filter,
        sortBy,
        limit,
        category,
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Content performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content performance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, performanceData } = body;

    // In production, this would update content performance data in the database
    // For now, we'll simulate processing and return success
    
    return NextResponse.json({
      success: true,
      contentId,
      updatedMetrics: performanceData,
      processedAt: new Date().toISOString(),
      message: 'Content performance data updated successfully'
    });
  } catch (error) {
    console.error('Update content performance error:', error);
    return NextResponse.json(
      { error: 'Failed to update content performance data' },
      { status: 500 }
    );
  }
}