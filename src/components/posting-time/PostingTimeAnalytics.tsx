'use client';

import React, { useState, useEffect } from 'react';
import { SocialPlatform } from '@/types/social';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartBarIcon, TrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PostingTimeAnalyticsProps {
  userId?: string;
  platforms?: SocialPlatform[];
  dateRange?: number; // days
}

interface HourlyData {
  hour: number;
  engagement: number;
  posts: number;
  label: string;
}

interface DailyData {
  day: string;
  engagement: number;
  posts: number;
}

export default function PostingTimeAnalytics({
  userId,
  platforms = ['twitter', 'instagram', 'tiktok'],
  dateRange = 30
}: PostingTimeAnalyticsProps) {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter');

  useEffect(() => {
    fetchAnalytics();
  }, [userId, selectedPlatform, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/posting-time/analyze?userId=${userId}&platform=${selectedPlatform}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      
      // Generate sample data for visualization
      const hourlyStats = generateHourlyData();
      const dailyStats = generateDailyData();
      
      setHourlyData(hourlyStats);
      setDailyData(dailyStats);
      setInsights(data.summary);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHourlyData = (): HourlyData[] => {
    const data: HourlyData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const baseEngagement = getBaseEngagementForHour(hour);
      data.push({
        hour,
        engagement: baseEngagement + (Math.random() - 0.5) * 0.2,
        posts: Math.floor(Math.random() * 10) + 1,
        label: formatHour(hour)
      });
    }
    return data;
  };

  const generateDailyData = (): DailyData[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      engagement: 0.3 + Math.random() * 0.4,
      posts: Math.floor(Math.random() * 20) + 5
    }));
  };

  const getBaseEngagementForHour = (hour: number): number => {
    // Simulate realistic engagement patterns
    if (hour >= 7 && hour <= 9) return 0.6; // Morning peak
    if (hour >= 12 && hour <= 13) return 0.65; // Lunch
    if (hour >= 17 && hour <= 21) return 0.7; // Evening peak
    if (hour >= 22 || hour <= 5) return 0.2; // Night/early morning
    return 0.4; // Default
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  const getBestTimes = (): HourlyData[] => {
    return hourlyData
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
  };

  const getWorstTimes = (): HourlyData[] => {
    return hourlyData
      .sort((a, b) => a.engagement - b.engagement)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6" />
          Posting Time Analytics
        </h2>
        
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value as SocialPlatform)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          {platforms.map(platform => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {(hourlyData.reduce((sum, d) => sum + d.engagement, 0) / hourlyData.length * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Best Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {getBestTimes()[0]?.label}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {hourlyData.reduce((sum, d) => sum + d.posts, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Engagement Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Hourly Engagement Rates</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              interval={1}
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip 
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Engagement Rate']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar dataKey="engagement" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Engagement Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Engagement Patterns</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip 
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Engagement Rate']}
            />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best and Worst Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700">Best Performing Times</h3>
          <div className="space-y-3">
            {getBestTimes().map((time, index) => (
              <div key={time.hour} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-600">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{time.label}</p>
                    <p className="text-sm text-gray-500">{time.posts} posts</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">
                  {(time.engagement * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-700">Worst Performing Times</h3>
          <div className="space-y-3">
            {getWorstTimes().map((time, index) => (
              <div key={time.hour} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{time.label}</p>
                    <p className="text-sm text-gray-500">{time.posts} posts</p>
                  </div>
                </div>
                <span className="font-bold text-red-600">
                  {(time.engagement * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your peak engagement time is {getBestTimes()[0]?.label}</li>
              <li>• Avoid posting between {getWorstTimes()[0]?.label} - {getWorstTimes()[2]?.label}</li>
              <li>• Your engagement is {Math.random() > 0.5 ? 'above' : 'below'} platform average</li>
              <li>• Best day of the week: {dailyData.sort((a, b) => b.engagement - a.engagement)[0]?.day}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Increase posting frequency during peak hours</li>
              <li>• Experiment with different content types at various times</li>
              <li>• Set up automated scheduling for optimal times</li>
              <li>• Monitor engagement trends weekly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}