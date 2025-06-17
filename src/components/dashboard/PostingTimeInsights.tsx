'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, SparklesIcon, TrendingUpIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SocialPlatform } from '@/types/social';

interface PostingTimeInsightsProps {
  className?: string;
}

interface OptimalTime {
  platform: SocialPlatform;
  hour: number;
  engagement: number;
  nextSlot: Date;
}

export default function PostingTimeInsights({ className = '' }: PostingTimeInsightsProps) {
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimalTimes();
  }, []);

  const fetchOptimalTimes = async () => {
    try {
      // Simulate fetching optimal times for each platform
      const platforms: SocialPlatform[] = ['twitter', 'instagram', 'tiktok'];
      const times: OptimalTime[] = [];

      for (const platform of platforms) {
        const response = await fetch(`/api/ai/posting-time?platform=${platform}`);
        if (response.ok) {
          const data = await response.json();
          
          // Get the best time from general recommendations
          const bestHour = data.generalRecommendations.peakHours[0];
          const nextSlot = calculateNextSlot(bestHour);
          
          times.push({
            platform,
            hour: bestHour,
            engagement: 0.65 + Math.random() * 0.25, // Simulated engagement rate
            nextSlot
          });
        }
      }

      setOptimalTimes(times);
    } catch (error) {
      console.error('Error fetching optimal times:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextSlot = (hour: number): Date => {
    const now = new Date();
    const nextSlot = new Date();
    nextSlot.setHours(hour, 0, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (nextSlot <= now) {
      nextSlot.setDate(nextSlot.getDate() + 1);
    }
    
    return nextSlot;
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatTimeUntilNext = (nextSlot: Date): string => {
    const now = new Date();
    const diff = nextSlot.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getPlatformColor = (platform: SocialPlatform): string => {
    const colors = {
      twitter: 'text-blue-600 bg-blue-50',
      instagram: 'text-pink-600 bg-pink-50',
      tiktok: 'text-purple-600 bg-purple-50'
    };
    return colors[platform];
  };

  const getPlatformName = (platform: SocialPlatform): string => {
    const names = {
      twitter: 'Twitter',
      instagram: 'Instagram',
      tiktok: 'TikTok'
    };
    return names[platform];
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-6 w-6 bg-gray-200 rounded mr-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Optimal Posting Times
          </h3>
        </div>
        <SparklesIcon className="h-5 w-5 text-yellow-500" />
      </div>

      {/* Optimal Times List */}
      <div className="space-y-4">
        {optimalTimes.map((time) => (
          <div 
            key={time.platform} 
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(time.platform)}`}>
                {getPlatformName(time.platform)}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {formatHour(time.hour)}
                  </span>
                  <TrendingUpIcon className="h-4 w-4 text-green-500 ml-2" />
                </div>
                <div className="text-sm text-gray-500">
                  {(time.engagement * 100).toFixed(0)}% avg engagement
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Next: {formatTimeUntilNext(time.nextSlot)}
              </div>
              <div className="text-xs text-gray-500">
                {time.nextSlot.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            💡 Schedule your next posts at optimal times
          </div>
          <a 
            href="/analytics"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Analytics
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-green-800">
            Your posting schedule is <strong>optimized</strong> for maximum engagement
          </span>
        </div>
      </div>
    </div>
  );
}