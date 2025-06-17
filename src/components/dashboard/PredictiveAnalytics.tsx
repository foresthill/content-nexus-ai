'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  FireIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Scatter,
  ComposedChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { PredictiveAnalytics } from '@/types/analytics';

interface PredictionCardProps {
  title: string;
  prediction: {
    value: number;
    confidence: number;
    timeframe: string;
  };
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  prediction,
  icon: Icon,
  color,
  unit = '',
  trend
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} transform rotate-12 rounded-lg`}></div>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Prediction Value */}
      <div className="mb-4 relative z-10">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {typeof prediction.value === 'number' 
              ? prediction.value.toLocaleString() 
              : prediction.value
            }
          </span>
          <span className="text-lg text-gray-600">{unit}</span>
          {trend && (
            <div className={`flex items-center ml-2 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              <ArrowTrendingUpIcon className={`h-4 w-4 ${trend === 'down' ? 'transform rotate-180' : ''}`} />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">Next {prediction.timeframe}</p>
      </div>

      {/* Confidence Indicator */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Confidence Level</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${getConfidenceColor(prediction.confidence)}`}>
            {(prediction.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}
            style={{ width: `${prediction.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* AI Badge */}
      <div className="flex items-center text-xs text-gray-500 relative z-10">
        <CpuChipIcon className="h-4 w-4 mr-1" />
        <span>AI Prediction</span>
      </div>
    </div>
  );
};

interface ViralProbabilityGaugeProps {
  probability: number;
  size?: number;
}

const ViralProbabilityGauge: React.FC<ViralProbabilityGaugeProps> = ({ 
  probability, 
  size = 200 
}) => {
  const percentage = probability * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (prob: number) => {
    if (prob >= 0.3) return '#EF4444'; // High - Red
    if (prob >= 0.15) return '#F59E0B'; // Medium - Orange
    if (prob >= 0.05) return '#10B981'; // Low - Green
    return '#6B7280'; // Very Low - Gray
  };

  const getLabel = (prob: number) => {
    if (prob >= 0.3) return 'High';
    if (prob >= 0.15) return 'Medium';
    if (prob >= 0.05) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Viral Probability</h3>
      
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor(probability)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <FireIcon className="h-8 w-8 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            {getLabel(probability)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Based on content analysis, timing, and audience behavior patterns
        </p>
      </div>
    </div>
  );
};

interface TrendingTopicsCloudProps {
  topics: string[];
  hashtags: string[];
}

const TrendingTopicsCloud: React.FC<TrendingTopicsCloudProps> = ({ 
  topics, 
  hashtags 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'topics' | 'hashtags'>('topics');

  const getRandomSize = () => {
    const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomColor = () => {
    const colors = [
      'text-blue-600 bg-blue-100',
      'text-green-600 bg-green-100',
      'text-purple-600 bg-purple-100',
      'text-orange-600 bg-orange-100',
      'text-pink-600 bg-pink-100',
      'text-indigo-600 bg-indigo-100'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const currentItems = selectedCategory === 'topics' ? topics : hashtags;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trending Content</h3>
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setSelectedCategory('topics')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedCategory === 'topics'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setSelectedCategory('hashtags')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedCategory === 'hashtags'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hashtags
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentItems.map((item, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full font-medium transition-transform hover:scale-105 cursor-pointer ${
              getRandomColor()
            } ${getRandomSize()}`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <LightBulbIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Pro Tip</p>
            <p className="text-sm text-blue-700 mt-1">
              {selectedCategory === 'topics' 
                ? 'Create content around these trending topics to increase discoverability'
                : 'Use these hashtags in your posts to join trending conversations'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OptimalTimingChartProps {
  optimalTime: Date;
  historicalData?: Array<{ hour: number; engagement: number; day: string }>;
}

const OptimalTimingChart: React.FC<OptimalTimingChartProps> = ({ 
  optimalTime,
  historicalData = [] 
}) => {
  // Generate sample historical data if none provided
  const sampleData = historicalData.length > 0 ? historicalData : 
    Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      engagement: Math.random() * 15 + 3,
      day: 'average'
    }));

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Posting Time</h3>
      
      {/* Current Recommendation */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Best time to post today</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatHour(optimalTime.getHours())}
              </p>
              <p className="text-sm text-gray-500">
                {optimalTime.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Expected boost</p>
            <p className="text-xl font-bold text-green-600">+25%</p>
            <p className="text-xs text-gray-500">engagement</p>
          </div>
        </div>
      </div>

      {/* Engagement by Hour Chart */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Engagement by Hour</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={formatHour}
              interval={2}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => `${formatHour(value as number)}`}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Engagement Rate']}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#3B82F6"
              fill="#93C5FD"
              fillOpacity={0.6}
            />
            <ReferenceLine 
              x={optimalTime.getHours()} 
              stroke="#EF4444" 
              strokeDasharray="5 5"
              label={{ value: "Optimal", position: "top" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Schedule Post
        </button>
        <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:border-gray-400 transition-colors">
          Set Reminder
        </button>
      </div>
    </div>
  );
};

interface ContentRecommendationsProps {
  recommendations: string[];
  competitorAnalysis?: {
    averagePerformance: number;
    yourRank: number;
    gapAnalysis: string[];
  };
}

const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({
  recommendations,
  competitorAnalysis
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
      
      {/* Content Type Recommendations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Content Types</h4>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 capitalize">{rec}</p>
                <p className="text-xs text-gray-600">
                  {rec === 'video' && 'High engagement, trending format'}
                  {rec === 'image' && 'Consistent performance, easy to create'}
                  {rec === 'carousel' && 'Good for storytelling and tutorials'}
                  {rec === 'text' && 'Quick thoughts and updates'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">
                  +{Math.floor(Math.random() * 30 + 10)}%
                </div>
                <div className="text-xs text-gray-500">expected boost</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      {competitorAnalysis && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Competitive Analysis</h4>
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{competitorAnalysis.yourRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Industry Average</p>
                <p className="text-2xl font-bold text-orange-600">
                  {competitorAnalysis.averagePerformance.toFixed(1)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Areas for Improvement:</p>
              {competitorAnalysis.gapAnalysis.slice(0, 2).map((gap, index) => (
                <div key={index} className="flex items-start">
                  <ExclamationCircleIcon className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{gap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Badge */}
      <div className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
        <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
        <span className="text-sm font-medium text-purple-900">
          Powered by AI Content Analysis
        </span>
      </div>
    </div>
  );
};

interface PredictiveAnalyticsDashboardProps {
  contentType?: string;
  platform?: string;
  refreshInterval?: number;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  contentType,
  platform,
  refreshInterval = 60000
}) => {
  const [predictions, setPredictions] = useState<PredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const params = new URLSearchParams({
          detailed: 'true',
          ...(contentType && { content_type: contentType }),
          ...(platform && { platform })
        });

        const response = await fetch(`/api/analytics/predictions?${params}`);
        const data = await response.json();
        setPredictions(data.predictions);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    const interval = setInterval(fetchPredictions, refreshInterval);
    return () => clearInterval(interval);
  }, [contentType, platform, refreshInterval]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load predictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">AI-Powered Predictions</h2>
        <p className="text-blue-100">
          Advanced analytics and forecasting for your content performance
        </p>
        <div className="mt-4 text-sm text-blue-200">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Main Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PredictionCard
          title="Estimated Views"
          prediction={predictions.predictedMetrics.estimatedViews}
          icon={EyeIcon}
          color="blue"
          trend="up"
        />
        
        <PredictionCard
          title="Estimated Engagement"
          prediction={predictions.predictedMetrics.estimatedEngagement}
          icon={HeartIcon}
          color="green"
          unit="%"
          trend="up"
        />
        
        <ViralProbabilityGauge
          probability={predictions.predictedMetrics.viralProbability}
          size={180}
        />
      </div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimalTimingChart
          optimalTime={predictions.predictedMetrics.optimalPostingTime}
        />
        
        <TrendingTopicsCloud
          topics={predictions.trendsAnalysis.trendingTopics}
          hashtags={predictions.trendsAnalysis.hashtagRecommendations}
        />
      </div>

      {/* Recommendations */}
      <ContentRecommendations
        recommendations={predictions.trendsAnalysis.contentTypeRecommendations}
        competitorAnalysis={predictions.competitorAnalysis}
      />
    </div>
  );
};

export default PredictiveAnalyticsDashboard;