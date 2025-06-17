'use client';

import React, { useState } from 'react';
import { SocialPlatform } from '@/types/social';
import PostingTimeRecommendations from './PostingTimeRecommendations';
import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PostingTimeSchedulerProps {
  postId?: string;
  platforms: SocialPlatform[];
  onScheduleComplete?: (scheduledTime: Date, platform: SocialPlatform) => void;
}

export default function PostingTimeScheduler({
  postId,
  platforms,
  onScheduleComplete
}: PostingTimeSchedulerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(platforms[0]);
  const [scheduledTimes, setScheduledTimes] = useState<Record<string, Date>>({});
  const [targetAudience, setTargetAudience] = useState({
    ageGroup: '',
    primaryRegion: ''
  });
  const [contentType, setContentType] = useState('');

  const handleSchedule = async (time: Date) => {
    try {
      // Update local state
      setScheduledTimes(prev => ({
        ...prev,
        [selectedPlatform]: time
      }));

      // If we have a postId, update the scheduling via API
      if (postId) {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledAt: time,
            platform: selectedPlatform
          })
        });

        if (!response.ok) {
          throw new Error('Failed to schedule post');
        }
      }

      // Notify parent component
      if (onScheduleComplete) {
        onScheduleComplete(time, selectedPlatform);
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      // Remove from scheduled times on error
      setScheduledTimes(prev => {
        const updated = { ...prev };
        delete updated[selectedPlatform];
        return updated;
      });
    }
  };

  const formatScheduledTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          Schedule Your Post
        </h2>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platform
          </label>
          <div className="flex gap-2">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                {scheduledTimes[platform] && (
                  <CheckCircleIcon className="inline-block ml-2 h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience Configuration */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience Age
            </label>
            <select
              value={targetAudience.ageGroup}
              onChange={(e) => setTargetAudience(prev => ({ ...prev, ageGroup: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Ages</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Region
            </label>
            <select
              value={targetAudience.primaryRegion}
              onChange={(e) => setTargetAudience(prev => ({ ...prev, primaryRegion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Global</option>
              <option value="north_america">North America</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="oceania">Oceania</option>
            </select>
          </div>
        </div>

        {/* Content Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">General</option>
            <option value="educational">Educational</option>
            <option value="entertainment">Entertainment</option>
            <option value="news">News</option>
            <option value="promotional">Promotional</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        {/* Scheduled Time Display */}
        {scheduledTimes[selectedPlatform] && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Scheduled for:</p>
                <p className="text-lg text-green-900">
                  {formatScheduledTime(scheduledTimes[selectedPlatform])}
                </p>
              </div>
              <button
                onClick={() => {
                  setScheduledTimes(prev => {
                    const updated = { ...prev };
                    delete updated[selectedPlatform];
                    return updated;
                  });
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <PostingTimeRecommendations
          platform={selectedPlatform}
          targetAudience={targetAudience.ageGroup || targetAudience.primaryRegion ? targetAudience : undefined}
          contentType={contentType || undefined}
          onSchedule={handleSchedule}
        />
      </div>

      {/* Summary of All Scheduled Times */}
      {Object.keys(scheduledTimes).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Scheduled Posts Summary</h3>
          <div className="space-y-2">
            {Object.entries(scheduledTimes).map(([platform, time]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="font-medium capitalize">{platform}</span>
                <span className="text-gray-600">{formatScheduledTime(time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}