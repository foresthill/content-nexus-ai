'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line
} from 'recharts';
import { DashboardData, KPIMetrics } from '@/types/analytics';

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Alert Component
const AlertCard = ({ alert }: { alert: { type: 'success' | 'warning' | 'info' | 'error'; priority: string; message: string; details: string; timestamp: Date; actionable: string } }) => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    error: ExclamationTriangleIcon
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const Icon = icons[alert.type as keyof typeof icons];

  return (
    <div className={`p-4 rounded-lg border ${colors[alert.type as keyof typeof colors]}`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="font-medium">{alert.message}</h4>
          <p className="text-sm mt-1">{alert.details}</p>
          {alert.actionable && (
            <p className="text-xs mt-2 font-medium">Action: {alert.actionable}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [kpiData, setKpiData] = useState<{
    current: KPIMetrics;
    trends: Array<{ timestamp: Date; value: number; metric: string }>;
    recommendations?: Array<{ category: string; priority: string; title: string; description: string; actions: string[]; expectedImpact: string }>;
    platformBreakdown?: Array<{ platform: string; metrics: { engagement: number; reach: number; revenue: number }; performance: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [alerts, setAlerts] = useState<Array<{ type: 'success' | 'warning' | 'info' | 'error'; priority: string; message: string; details: string; timestamp: Date; actionable: string }>>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch KPI data with alerts and recommendations
        const kpiResponse = await fetch(`/api/analytics/kpi?timeframe=${selectedTimeframe}&alerts=true&recommendations=true&comparison=true&detailed=true`);
        const kpiResult = await kpiResponse.json();
        setKpiData(kpiResult);
        setAlerts(kpiResult.alerts || []);

        // Simulate dashboard data for demo
        const mockDashboardData: DashboardData = {
          kpi: kpiResult.current,
          engagement: kpiResult.trends.filter((t: { metric: string }) => t.metric === 'total_engagement'),
          audience: {
            totalFollowers: kpiResult.current.followersGrowth * 20,
            activeFollowers: Math.floor(kpiResult.current.followersGrowth * 20 * 0.12),
            audienceGrowth: kpiResult.trends.filter((t: { metric: string }) => t.metric === 'followers'),
            demographics: {
              ageGroups: { '18-24': 32, '25-34': 28, '35-44': 18, '45-54': 12, '55+': 10 },
              regions: { 'North America': 45, 'Europe': 25, 'Asia': 20, 'Other': 10 },
              devices: { 'mobile': 78, 'desktop': 15, 'tablet': 7 },
              gender: { 'female': 52, 'male': 46, 'non-binary': 2 }
            },
            behaviorPatterns: {
              mostActiveHours: [8, 12, 17, 19, 21],
              mostActiveDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
              averageSessionDuration: 4.2,
              contentPreferences: { 'video': 45, 'image': 35, 'carousel': 15, 'text': 5 }
            },
            engagementPatterns: {
              likesToCommentsRatio: 12.5,
              sharesToLikesRatio: 0.08,
              peakEngagementTimes: [
                { hour: 19, day: 'Thursday', engagementRate: 12.3 },
                { hour: 21, day: 'Friday', engagementRate: 10.8 }
              ]
            }
          },
          topContent: [],
          predictions: {
            predictedMetrics: {
              estimatedViews: { value: 15000, confidence: 0.85, timeframe: '24h' },
              estimatedEngagement: { value: 8.5, confidence: 0.78, timeframe: '24h' },
              viralProbability: 0.15,
              optimalPostingTime: new Date()
            },
            trendsAnalysis: {
              trendingTopics: ['AI Technology', 'Content Creation', 'Digital Marketing'],
              hashtagRecommendations: ['#contentcreator', '#digitalmarketing', '#ai'],
              contentTypeRecommendations: ['video', 'carousel', 'image'],
              audienceMoodTrend: 'positive'
            }
          },
          lastUpdated: new Date()
        };

        setDashboardData(mockDashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !kpiData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  type ChartDataItem = { 
    date: string; 
    total_engagement?: number; 
    engagement_rate?: number; 
    reach?: number;
    [key: string]: string | number | undefined;
  };

  const engagementChartData = kpiData.trends
    .filter((t) => ['total_engagement', 'engagement_rate', 'reach'].includes(t.metric))
    .reduce((acc: ChartDataItem[], curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing[curr.metric] = curr.value;
      } else {
        const newItem: ChartDataItem = { date };
        newItem[curr.metric] = curr.value;
        acc.push(newItem);
      }
      return acc;
    }, []);

  const demographicsData = Object.entries(dashboardData.audience.demographics.ageGroups)
    .map(([age, percentage]) => ({ name: age, value: percentage }));

  const contentPreferencesData = Object.entries(dashboardData.audience.behaviorPatterns.contentPreferences)
    .map(([type, percentage]) => ({ name: type, value: percentage }));

  const platformData = kpiData.platformBreakdown?.map((p) => ({
    platform: p.platform,
    engagement: p.metrics.engagement,
    reach: p.metrics.reach,
    revenue: p.metrics.revenue
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your content performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Alerts</h2>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Engagement"
            value={kpiData.current.totalEngagement.toLocaleString()}
            change={kpiData.comparison?.changes.engagement.percentage}
            icon={HeartIcon}
            color="blue"
          />
          <KPICard
            title="Engagement Rate"
            value={`${kpiData.current.averageEngagementRate}%`}
            change={kpiData.comparison?.changes.engagementRate.percentage}
            icon={ArrowTrendingUpIcon}
            color="green"
          />
          <KPICard
            title="Total Reach"
            value={kpiData.current.totalReach.toLocaleString()}
            change={kpiData.comparison?.changes.reach.percentage}
            icon={EyeIcon}
            color="purple"
          />
          <KPICard
            title="Revenue Generated"
            value={`$${kpiData.current.revenueGenerated.toLocaleString()}`}
            change={kpiData.comparison?.changes.revenue.percentage}
            icon={SparklesIcon}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={engagementChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total_engagement"
                  fill="#3B82F6"
                  stroke="#3B82F6"
                  fillOpacity={0.3}
                  name="Total Engagement"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagement_rate"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Engagement Rate (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagement" fill="#3B82F6" name="Engagement" />
                <Bar dataKey="reach" fill="#10B981" name="Reach" />
                <Bar dataKey="revenue" fill="#F59E0B" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics and Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Age Demographics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Demographics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={demographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Content Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preferences</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentPreferencesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Patterns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Patterns</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Likes to Comments Ratio</span>
                <span className="font-semibold">{dashboardData.audience.engagementPatterns.likesToCommentsRatio}:1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shares to Likes Ratio</span>
                <span className="font-semibold">{(dashboardData.audience.engagementPatterns.sharesToLikesRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Most Active Hours</h4>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.audience.behaviorPatterns.mostActiveHours.map(hour => (
                    <span key={hour} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Best Days</h4>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.audience.behaviorPatterns.mostActiveDays.map(day => (
                    <span key={day} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Predictive Analytics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Estimated Views (24h)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.predictions.predictedMetrics.estimatedViews.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700">
                    {(dashboardData.predictions.predictedMetrics.estimatedViews.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
                <EyeIcon className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Predicted Engagement Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.predictions.predictedMetrics.estimatedEngagement.value}%
                  </p>
                  <p className="text-sm text-green-700">
                    {(dashboardData.predictions.predictedMetrics.estimatedEngagement.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Viral Probability</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(dashboardData.predictions.predictedMetrics.viralProbability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-700">Based on content analysis</p>
                </div>
                <SparklesIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-4">
              {kpiData.recommendations?.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Expected Impact: {rec.expectedImpact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics & Hashtags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Trending Topics</h4>
              <div className="flex flex-wrap gap-2">
                {dashboardData.predictions.trendsAnalysis.trendingTopics.map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recommended Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {dashboardData.predictions.trendsAnalysis.hashtagRecommendations.map((hashtag, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}