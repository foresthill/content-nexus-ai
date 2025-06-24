import { NextRequest, NextResponse } from 'next/server';
// import { DashboardData } from '@/types/analytics'; // Currently unused

/**
 * Unified Analytics API Endpoint
 * 
 * This endpoint serves as a central hub for all analytics data,
 * aggregating information from various specialized endpoints.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const timeframe = searchParams.get('timeframe') || '30d';
    const includeKPI = searchParams.get('kpi') !== 'false';
    const includeEngagement = searchParams.get('engagement') !== 'false';
    const includeAudience = searchParams.get('audience') !== 'false';
    const includePerformance = searchParams.get('performance') !== 'false';
    const includePredictions = searchParams.get('predictions') !== 'false';
    const detailed = searchParams.get('detailed') === 'true';

    const baseUrl = request.url.split('/api/analytics')[0];
    const apiBase = `${baseUrl}/api/analytics`;

    // Prepare promises for parallel data fetching
    const promises: Promise<Response>[] = [];
    
    if (includeKPI) {
      promises.push(
        fetch(`${apiBase}/kpi?timeframe=${timeframe}&alerts=true&recommendations=true&detailed=${detailed}`)
      );
    }
    
    if (includeEngagement) {
      promises.push(
        fetch(`${apiBase}/engagement?detailed=${detailed}`)
      );
    }
    
    if (includeAudience) {
      promises.push(
        fetch(`${apiBase}/audience?detailed=${detailed}`)
      );
    }
    
    if (includePerformance) {
      promises.push(
        fetch(`${apiBase}/performance?limit=10&detailed=${detailed}`)
      );
    }
    
    if (includePredictions) {
      promises.push(
        fetch(`${apiBase}/predictions?detailed=${detailed}`)
      );
    }

    // Execute all requests in parallel
    const responses = await Promise.allSettled(promises);
    
    // Process responses
    const data: {
      meta: {
        timeframe: string;
        lastUpdated: string;
        requestedSections: {
          kpi: boolean;
          engagement: boolean;
          audience: boolean;
          performance: boolean;
          predictions: boolean;
        };
        detailed: boolean;
      };
      kpi?: unknown;
      engagement?: unknown;
      audience?: unknown;
      performance?: unknown;
      predictions?: unknown;
      errors?: Array<{ section: string; error: string }>;
    } = {
      meta: {
        timeframe,
        lastUpdated: new Date().toISOString(),
        requestedSections: {
          kpi: includeKPI,
          engagement: includeEngagement,
          audience: includeAudience,
          performance: includePerformance,
          predictions: includePredictions
        },
        detailed
      }
    };

    let responseIndex = 0;

    if (includeKPI && responses[responseIndex]) {
      const result = responses[responseIndex];
      if (result.status === 'fulfilled') {
        try {
          const kpiData = await result.value.json();
          data.kpi = kpiData;
        } catch {
          data.errors = data.errors || [];
          data.errors.push({ section: 'kpi', error: 'Failed to parse KPI data' });
        }
      } else {
        data.errors = data.errors || [];
        data.errors.push({ section: 'kpi', error: 'Failed to fetch KPI data' });
      }
      responseIndex++;
    }

    if (includeEngagement && responses[responseIndex]) {
      const result = responses[responseIndex];
      if (result.status === 'fulfilled') {
        try {
          const engagementData = await result.value.json();
          data.engagement = engagementData;
        } catch {
          data.errors = data.errors || [];
          data.errors.push({ section: 'engagement', error: 'Failed to parse engagement data' });
        }
      } else {
        data.errors = data.errors || [];
        data.errors.push({ section: 'engagement', error: 'Failed to fetch engagement data' });
      }
      responseIndex++;
    }

    if (includeAudience && responses[responseIndex]) {
      const result = responses[responseIndex];
      if (result.status === 'fulfilled') {
        try {
          const audienceData = await result.value.json();
          data.audience = audienceData;
        } catch {
          data.errors = data.errors || [];
          data.errors.push({ section: 'audience', error: 'Failed to parse audience data' });
        }
      } else {
        data.errors = data.errors || [];
        data.errors.push({ section: 'audience', error: 'Failed to fetch audience data' });
      }
      responseIndex++;
    }

    if (includePerformance && responses[responseIndex]) {
      const result = responses[responseIndex];
      if (result.status === 'fulfilled') {
        try {
          const performanceData = await result.value.json();
          data.performance = performanceData;
        } catch {
          data.errors = data.errors || [];
          data.errors.push({ section: 'performance', error: 'Failed to parse performance data' });
        }
      } else {
        data.errors = data.errors || [];
        data.errors.push({ section: 'performance', error: 'Failed to fetch performance data' });
      }
      responseIndex++;
    }

    if (includePredictions && responses[responseIndex]) {
      const result = responses[responseIndex];
      if (result.status === 'fulfilled') {
        try {
          const predictionsData = await result.value.json();
          data.predictions = predictionsData;
        } catch {
          data.errors = data.errors || [];
          data.errors.push({ section: 'predictions', error: 'Failed to parse predictions data' });
        }
      } else {
        data.errors = data.errors || [];
        data.errors.push({ section: 'predictions', error: 'Failed to fetch predictions data' });
      }
      responseIndex++;
    }

    // Generate summary insights
    let summary = null;
    if (data.kpi && data.engagement && data.performance) {
      const kpiData = data.kpi as any;
      summary = {
        totalMetrics: {
          engagement: kpiData.current?.totalEngagement || 0,
          reach: kpiData.current?.totalReach || 0,
          revenue: kpiData.current?.revenueGenerated || 0,
          contentPublished: kpiData.current?.contentPublished || 0
        },
        trends: {
          engagement: kpiData.current?.engagementTrend || 'stable',
          growth: kpiData.current?.growthRate || 0
        },
        topInsights: [
          `Your content reached ${(kpiData.current?.totalReach || 0).toLocaleString()} people`,
          `Generated $${(kpiData.current?.revenueGenerated || 0).toLocaleString()} in revenue`,
          `${kpiData.current?.engagementTrend === 'up' ? 'Engagement is trending upward' : 
            kpiData.current?.engagementTrend === 'down' ? 'Engagement needs attention' : 
            'Engagement is stable'}`
        ].filter(insight => insight.includes('0') === false)
      };
    }

    // Add performance recommendations if available
    let actionableInsights = null;
    if (data.kpi && data.performance) {
      const kpiData = data.kpi as any;
      const perfData = data.performance as any;
      if (kpiData.recommendations && perfData.insights) {
        actionableInsights = [
          ...kpiData.recommendations.slice(0, 2),
          ...perfData.insights.slice(0, 2)
        ].slice(0, 3);
      }
    }

    // Construct final response
    const finalResponse = {
      ...data,
      ...(summary && { summary }),
      ...(actionableInsights && { actionableInsights })
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Unified analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data: requestData } = body;

    switch (action) {
      case 'refresh_all':
        // Trigger refresh of all analytics data
        return NextResponse.json({
          success: true,
          message: 'All analytics data refresh initiated',
          timestamp: new Date().toISOString()
        });

      case 'export_report':
        // Generate export report
        const reportData = {
          generatedAt: new Date().toISOString(),
          timeframe: requestData.timeframe || '30d',
          sections: requestData.sections || ['kpi', 'engagement', 'audience', 'performance'],
          format: requestData.format || 'json'
        };
        
        return NextResponse.json({
          success: true,
          reportId: `report_${Date.now()}`,
          downloadUrl: `/api/analytics/export/${reportData.timeframe}`,
          reportData
        });

      case 'set_alerts':
        // Configure analytics alerts
        return NextResponse.json({
          success: true,
          alertsConfigured: requestData.alerts || [],
          message: 'Alert configuration updated'
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Analytics action error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}