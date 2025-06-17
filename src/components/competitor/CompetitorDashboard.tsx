'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  TrendingUpIcon,
  UserGroupIcon,
  StarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { CompetitorDashboardData, CompetitiveIntelligence, EngagementComparison } from '@/types/competitor';

interface CompetitorDashboardProps {
  className?: string;
}

// Sub-components
const PerformanceSnapshot: React.FC<{data: CompetitorDashboardData['performanceSnapshot']}> = ({ data }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Ranking</h3>
    <div className="flex items-center justify-center mb-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">#{data.yourRank}</div>
        <div className="text-sm text-gray-600">Your Rank</div>
        <div className="text-xs text-gray-500">out of {data.totalRanked} competitors</div>
      </div>
    </div>
    
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700">Top Performers</h4>
      {data.topPerformers.map((performer, index) => (
        <div key={performer.competitorId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
            }`}>
              {index + 1}
            </div>
            <span className="font-medium">{performer.competitorName}</span>
          </div>
          <span className="text-sm font-semibold text-gray-600">{performer.score}/100</span>
        </div>
      ))}
    </div>
  </div>
);

const RecentInsights: React.FC<{insights: CompetitiveIntelligence['keyInsights']}> = ({ insights }) => {
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'opportunity': return LightBulbIcon;
      case 'threat': return ExclamationTriangleIcon;
      case 'trend': return TrendingUpIcon;
      default: return InformationCircleIcon;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
      <div className="space-y-4">
        {insights.slice(0, 4).map((insight, index) => {
          const Icon = getInsightIcon(insight.category);
          return (
            <div key={index} className={`p-4 border rounded-lg ${getInsightColor(insight.priority)}`}>
              <div className="flex items-start">
                <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.insight}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded">
                      {insight.category}
                    </span>
                    {insight.actionable && (
                      <span className="ml-2 px-2 py-1 bg-white bg-opacity-60 rounded">
                        Actionable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EngagementComparison: React.FC<{data: EngagementComparison['overallComparison']}> = ({ data }) => {
  const comparisonData = [
    {
      name: 'Your Brand',
      engagement: data.yourPerformance.totalEngagement,
      rate: data.yourPerformance.averageEngagementRate,
      reach: data.yourPerformance.totalReach,
      type: 'you'
    },
    ...data.competitors.slice(0, 3).map(comp => ({
      name: comp.competitorName?.split(' ')[0] || 'Competitor',
      engagement: comp.totalEngagement,
      rate: comp.averageEngagementRate,
      reach: comp.totalReach,
      type: 'competitor'
    })),
    ...(data.industryAverage ? [{
      name: 'Industry Avg',
      engagement: data.industryAverage.totalEngagement,
      rate: data.industryAverage.averageEngagementRate,
      reach: data.industryAverage.totalReach,
      type: 'industry'
    }] : [])
  ];


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="engagement" 
            fill="#3B82F6" 
            name="Total Engagement"
            opacity={0.8}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="rate" 
            stroke="#F59E0B" 
            strokeWidth={3}
            name="Engagement Rate (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const TrendingTopics: React.FC<{topics: any[]}> = ({ topics }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h3>
      <div className="grid grid-cols-1 gap-4">
        {topics.slice(0, 3).map((topic, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{topic.topic}</h4>
              <div className="flex items-center text-green-600 text-sm">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {topic.growth.toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Volume: {topic.volume.toLocaleString()} | Sentiment: {topic.sentiment}
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Top Participants:</div>
              {topic.competitorParticipation.slice(0, 2).map((participant: any, pIndex: number) => (
                <div key={pIndex} className="flex items-center justify-between text-xs">
                  <span>{participant.competitorName}</span>
                  <div className="flex items-center">
                    <span className="mr-2">{participant.shareOfVoice.toFixed(1)}% share</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(participant.shareOfVoice * 4, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompetitorOverview: React.FC<{overview: CompetitorDashboardData['overview']}> = ({ overview }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Competitors</p>
          <p className="text-2xl font-bold text-gray-900">{overview.totalCompetitors}</p>
        </div>
        <UserGroupIcon className="h-8 w-8 text-blue-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Active Competitors</p>
          <p className="text-2xl font-bold text-gray-900">{overview.activeCompetitors}</p>
        </div>
        <StarIcon className="h-8 w-8 text-green-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Platforms Covered</p>
          <p className="text-2xl font-bold text-gray-900">{overview.platformsCovered}</p>
        </div>
        <ChartBarIcon className="h-8 w-8 text-purple-500" />
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Last Analysis</p>
          <p className="text-sm font-bold text-gray-900">
            {overview.lastAnalysisDate.toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {overview.lastAnalysisDate.toLocaleTimeString()}
          </p>
        </div>
        <EyeIcon className="h-8 w-8 text-orange-500" />
      </div>
    </div>
  </div>
);

export default function CompetitorDashboard({ className = '' }: CompetitorDashboardProps) {
  const [dashboardData, setDashboardData] = useState<CompetitorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics/competitors?action=dashboard&timeframe=${selectedTimeframe}`);
        if (!response.ok) {
          throw new Error('Failed to fetch competitor dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching competitor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className={`${className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competitor analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className={`${className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Failed to load competitor data'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis Dashboard</h1>
              <p className="text-gray-600">Monitor competitor performance and market insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <CompetitorOverview overview={dashboardData.overview} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Snapshot */}
          <PerformanceSnapshot data={dashboardData.performanceSnapshot} />
          
          {/* Recent Insights */}
          <RecentInsights insights={dashboardData.recentInsights} />
        </div>

        {/* Engagement Comparison and Trending Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EngagementComparison data={dashboardData.engagementComparison} />
          <TrendingTopics topics={dashboardData.trendingTopics} />
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.recommendations.slice(0, 6).map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 ${
                    rec.impact === 'high' ? 'bg-red-100 text-red-600' :
                    rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <LightBulbIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{rec.recommendation}</h4>
                    <div className="mt-2 flex items-center text-xs">
                      <span className={`px-2 py-1 rounded ${
                        rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                        rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.impact} impact
                      </span>
                      <span className="ml-2 text-gray-500">{rec.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}