'use client';

import React, { useState, useEffect } from 'react';
import { SocialPlatform } from '@/types/social';
import { ClockIcon, ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface TimeSlot {
  hour: number;
  dayOfWeek: string;
  score: number;
  engagement: number;
  reason?: string;
}

interface PostingTimeRecommendationsProps {
  platform: SocialPlatform;
  targetAudience?: {
    ageGroup?: string;
    primaryRegion?: string;
  };
  contentType?: string;
  onSchedule?: (time: Date) => void;
}

export default function PostingTimeRecommendations({
  platform,
  targetAudience,
  contentType,
  onSchedule
}: PostingTimeRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [selectedTimeZone, setSelectedTimeZone] = useState('UTC');

  useEffect(() => {
    fetchRecommendations();
  }, [platform, targetAudience, contentType, selectedTimeZone]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/posting-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          targetAudience,
          contentType,
          timeZone: selectedTimeZone,
          numberOfSlots: 5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.predictions);
      setConfidence(data.confidence);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDayAbbreviation = (day: string): string => {
    if (day === 'all') return 'Any Day';
    return day.substring(0, 3).toUpperCase();
  };

  const handleScheduleClick = (slot: TimeSlot) => {
    if (!onSchedule) return;

    const now = new Date();
    const scheduledDate = new Date();
    
    // Find next occurrence of the recommended time
    if (slot.dayOfWeek !== 'all') {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(slot.dayOfWeek.toLowerCase());
      const currentDay = now.getDay();
      
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }
      
      scheduledDate.setDate(scheduledDate.getDate() + daysUntilTarget);
    }
    
    scheduledDate.setHours(slot.hour, 0, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    onSchedule(scheduledDate);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Optimal Posting Times
        </h3>
        
        <select
          value={selectedTimeZone}
          onChange={(e) => setSelectedTimeZone(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="UTC">UTC</option>
          <option value="EST">EST</option>
          <option value="CST">CST</option>
          <option value="MST">MST</option>
          <option value="PST">PST</option>
          <option value="JST">JST</option>
          <option value="CET">CET</option>
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800">
            Confidence: {(confidence * 100).toFixed(0)}% based on platform best practices
            {targetAudience && ' and audience demographics'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((slot, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleScheduleClick(slot)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatHour(slot.hour)}</div>
                  <div className="text-sm text-gray-500">{getDayAbbreviation(slot.dayOfWeek)}</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ChartBarIcon className="h-4 w-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(slot.score)}`}>
                      {(slot.score * 100).toFixed(0)}% engagement
                    </span>
                  </div>
                  {slot.reason && (
                    <p className="text-sm text-gray-600">{slot.reason}</p>
                  )}
                </div>
              </div>
              
              {onSchedule && (
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  Schedule
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Platform Tips for {platform}</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {platform === 'twitter' && (
            <>
              <li>• Tweet during commute hours (7-9 AM, 5-7 PM)</li>
              <li>• Lunchtime (12-1 PM) sees high engagement</li>
              <li>• Use threads for higher engagement</li>
            </>
          )}
          {platform === 'instagram' && (
            <>
              <li>• Morning posts (7-9 AM) perform well</li>
              <li>• Evening leisure time (5-8 PM) sees peak engagement</li>
              <li>• Reels get 22% more engagement than regular posts</li>
            </>
          )}
          {platform === 'tiktok' && (
            <>
              <li>• Early morning (6-7 AM) catches early scrollers</li>
              <li>• Prime time is evening (7-10 PM)</li>
              <li>• Post 3-5 times per day for maximum reach</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}