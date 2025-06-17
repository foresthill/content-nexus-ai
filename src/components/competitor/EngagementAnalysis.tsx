'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import { EngagementComparison, GapOpportunity, GapThreat } from '@/types/competitor';

interface EngagementAnalysisProps {
  competitors?: string[];
  timeframe?: string;
  platforms?: string[];
  className?: string;
}

const MetricCard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'percentage' | 'currency';
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}> = ({ title, value, change, format = 'number', icon: Icon, color = 'blue' }) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'percentage': return `${val.toFixed(1)}%`;
      case 'currency': return `$${val.toLocaleString()}`;
      default: return val.toLocaleString();
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : change < 0 ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs competitors</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

const EngagementTrends: React.FC<{ data: EngagementComparison['engagementTrends'] }> = ({ data }) => {
  const chartData = data[0]?.trend.map((point, index) => {
    const result: any = {
      date: point.timestamp.toLocaleDateString(),
      label: point.label
    };
    
    data.forEach(competitor => {
      if (competitor.trend[index]) {
        result[competitor.competitorName] = competitor.trend[index].value;
      }
    });
    
    return result;
  }) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rate Trends</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.map((competitor, index) => (
            <Line
              key={competitor.competitorId}
              type="monotone"
              dataKey={competitor.competitorName}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={competitor.competitorId === 'your_brand' ? 3 : 2}
              strokeDasharray={competitor.competitorId === 'your_brand' ? '0' : '5 5'}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PlatformComparison: React.FC<{ data: EngagementComparison['platformComparisons'] }> = ({ data }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const platform = data[selectedPlatform];

  if (!platform) return null;

  const chartData = [
    {
      name: 'Your Brand',
      ...platform.yourMetrics,
      type: 'you'
    },
    ...platform.competitorMetrics.map(comp => ({
      name: comp.competitorName.split(' ')[0],
      ...comp.metrics,
      type: 'competitor'
    })),
    {
      name: 'Benchmark',
      ...platform.benchmark,
      type: 'benchmark'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {data.map((platform, index) => (
            <option key={platform.platform} value={index}>
              {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="likes" fill="#3B82F6" name="Likes" />
          <Bar yAxisId="left" dataKey="comments" fill="#10B981" name="Comments" />
          <Bar yAxisId="left" dataKey="shares" fill="#F59E0B" name="Shares" />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="engagement_rate" 
            stroke="#EF4444" 
            strokeWidth={3}
            name="Engagement Rate (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const ContentTypeAnalysis: React.FC<{ data: EngagementComparison['contentTypeComparison'] }> = ({ data }) => {
  const radarData = data.map(item => ({
    contentType: item.contentType,
    'Your Performance': item.yourPerformance,
    'Competitor Average': item.competitorAverage,
    'Top Performer': item.topPerformer.performance
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type Performance</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="contentType" />
              <PolarRadiusAxis angle={90} domain={[0, 10]} />
              <Radar
                name="Your Performance"
                dataKey="Your Performance"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Competitor Average"
                dataKey="Competitor Average"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Top Performer"
                dataKey="Top Performer"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-4">
          {data.map((item, index) => {
            const performanceGap = ((item.competitorAverage - item.yourPerformance) / item.yourPerformance) * 100;
            const isOutperforming = item.yourPerformance > item.competitorAverage;
            
            return (
              <div key={item.contentType} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{item.contentType}</h4>
                  <div className={`flex items-center text-sm ${
                    isOutperforming ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOutperforming ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(performanceGap).toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Performance:</span>
                    <span className="font-medium">{item.yourPerformance.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competitor Average:</span>
                    <span className="font-medium">{item.competitorAverage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Performer:</span>
                    <span className="font-medium">{item.topPerformer.performance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const GapAnalysis: React.FC<{ 
  opportunities: GapOpportunity[];
  threats: GapThreat[];
  recommendations: string[];
}> = ({ opportunities, threats, recommendations }) => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'threats' | 'recommendations'>('opportunities');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Gap Analysis</h3>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['opportunities', 'threats', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'opportunities' && (
          <>
            {opportunities.map((opportunity, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{opportunity.description}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getImpactColor(opportunity.impact)}`}>
                          {opportunity.impact} impact
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getImpactColor(opportunity.effort)}`}>
                          {opportunity.effort} effort
                        </span>
                      </div>
                    </div>
                    {opportunity.details && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {opportunity.details.currentPerformance && (
                          <div>Current: {opportunity.details.currentPerformance}</div>
                        )}
                        {opportunity.details.competitorBenchmark && (
                          <div>Benchmark: {opportunity.details.competitorBenchmark}</div>
                        )}
                        {opportunity.details.improvementPotential && (
                          <div className="font-medium text-green-600">
                            Potential: +{opportunity.details.improvementPotential}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'threats' && (
          <>
            {threats.map((threat, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{threat.description}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(threat.severity)}`}>
                          {threat.severity} severity
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(threat.urgency)}`}>
                          {threat.urgency}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Source: {threat.competitorName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'recommendations' && (
          <>
            {recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default function EngagementAnalysis({ 
  competitors = [], 
  timeframe = '30d', 
  platforms = [], 
  className = '' 
}: EngagementAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<EngagementComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          timeframe,
          gapAnalysis: 'true',
          recommendations: 'true'
        });
        
        if (competitors.length > 0) {
          params.append('competitors', competitors.join(','));
        }
        
        if (platforms.length > 0) {
          params.append('platforms', platforms.join(','));
        }

        const response = await fetch(`/api/analytics/competitors/engagement-comparison?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch engagement analysis data');
        }
        
        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching engagement analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [competitors, timeframe, platforms]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading engagement analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Failed to load engagement analysis'}</p>
        </div>
      </div>
    );
  }

  const { overallComparison, platformComparisons, contentTypeComparison, engagementTrends, gapAnalysis } = analysisData;

  return (
    <div className={className}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Your Engagement Rate"
          value={overallComparison.yourPerformance.averageEngagementRate}
          format="percentage"
          icon={ArrowTrendingUpIcon}
          color="blue"
        />
        <MetricCard
          title="Total Engagement"
          value={overallComparison.yourPerformance.totalEngagement}
          icon={ArrowTrendingUpIcon}
          color="green"
        />
        <MetricCard
          title="Total Reach"
          value={overallComparison.yourPerformance.totalReach}
          icon={ArrowTrendingUpIcon}
          color="yellow"
        />
        <MetricCard
          title="Follower Growth"
          value={overallComparison.yourPerformance.followerGrowthRate}
          format="percentage"
          icon={ArrowTrendingUpIcon}
          color="red"
        />
      </div>

      {/* Engagement Trends */}
      <div className="mb-8">
        <EngagementTrends data={engagementTrends} />
      </div>

      {/* Platform and Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PlatformComparison data={platformComparisons} />
        <ContentTypeAnalysis data={contentTypeComparison} />
      </div>

      {/* Gap Analysis */}
      {gapAnalysis && (
        <GapAnalysis
          opportunities={gapAnalysis.opportunities}
          threats={gapAnalysis.threats}
          recommendations={gapAnalysis.recommendations}
        />
      )}
    </div>
  );
}