'use client';

import React, { useState } from 'react';
import { PostingTimeAnalytics, PostingTimeScheduler } from '@/components/posting-time';
import { SocialPlatform } from '@/types/social';
import { 
  ChartBarIcon, 
  ClockIcon, 
  SparklesIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'scheduler'>('analytics');
  const [selectedPlatforms] = useState<SocialPlatform[]>(['twitter', 'instagram', 'tiktok']);

  const tabs = [
    {
      id: 'analytics' as const,
      name: 'Posting Time Analytics',
      icon: ChartBarIcon,
      description: 'Analyze your historical posting performance and discover optimal times'
    },
    {
      id: 'scheduler' as const,
      name: 'AI Scheduler',
      icon: SparklesIcon,
      description: 'Get AI-powered recommendations for when to schedule your next post'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Posting Time Intelligence
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Maximize your social media engagement with AI-powered posting time optimization
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <div>
              <PostingTimeAnalytics
                userId="current-user" // In a real app, get from auth context
                platforms={selectedPlatforms}
                dateRange={30}
              />
            </div>
          )}

          {activeTab === 'scheduler' && (
            <div>
              <PostingTimeScheduler
                platforms={selectedPlatforms}
                onScheduleComplete={(scheduledTime, platform) => {
                  // Handle successful scheduling
                  console.log(`Scheduled for ${platform} at ${scheduledTime}`);
                  // You could show a toast notification here
                }}
              />
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Smart Analytics
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Analyze your posting patterns and engagement rates across all platforms to identify peak performance times.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Hourly engagement tracking</li>
              <li>• Platform-specific insights</li>
              <li>• Historical performance trends</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                AI Recommendations
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Get personalized posting time recommendations based on your audience demographics and content type.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Audience-targeted timing</li>
              <li>• Content-type optimization</li>
              <li>• Multi-platform coordination</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-8 w-8 text-green-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Smart Scheduling
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Automatically schedule your posts for optimal engagement times with one-click scheduling.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• One-click optimal scheduling</li>
              <li>• Multi-platform sync</li>
              <li>• Timezone optimization</li>
            </ul>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Posting Time Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Twitter</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak: 8-9 AM, 7-9 PM EST</li>
                <li>• Best days: Tue-Thu</li>
                <li>• Use trending hashtags</li>
                <li>• Engage during commute hours</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Instagram</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak: 11 AM-1 PM, 7-9 PM EST</li>
                <li>• Best days: Tue-Fri</li>
                <li>• Stories: 7-9 PM</li>
                <li>• Reels get 22% more engagement</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">TikTok</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak: 6-10 AM, 7-9 PM EST</li>
                <li>• Best days: Tue-Thu</li>
                <li>• Post 3-5x daily</li>
                <li>• Trending sounds matter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}