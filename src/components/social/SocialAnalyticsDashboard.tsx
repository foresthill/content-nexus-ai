'use client';

import { useState, useEffect } from 'react';
import { PlatformMetrics } from '@/lib/social/analytics';

export function SocialAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    platforms: PlatformMetrics[];
    summary: {
      totalFollowers: number;
      totalPosts: number;
      totalEngagement: number;
      averageEngagementRate: number;
    };
  } | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/social/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const platformColors = {
    twitter: 'bg-blue-500',
    instagram: 'bg-pink-500',
    tiktok: 'bg-black'
  };

  const platformIcons = {
    twitter: '𝕏',
    instagram: '📷',
    tiktok: '🎵'
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Followers
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {analytics.summary.totalFollowers.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Posts
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {analytics.summary.totalPosts.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Engagement
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {analytics.summary.totalEngagement.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Avg Engagement Rate
          </h3>
          <p className="mt-2 text-3xl font-bold">
            {analytics.summary.averageEngagementRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Platform Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analytics.platforms.map((platform) => (
          <div
            key={platform.platform}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className={`${platformColors[platform.platform]} text-white p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  {platformIcons[platform.platform]} {platform.platform}
                </h3>
                <span className="text-2xl font-bold">
                  {platform.followers.toLocaleString()}
                </span>
              </div>
              <p className="text-sm opacity-90">followers</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Following</span>
                <span className="font-medium">{platform.following.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Posts</span>
                <span className="font-medium">{platform.posts.toLocaleString()}</span>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Engagement</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">❤️ Likes</span>
                    <span className="font-medium">
                      {platform.engagement.likes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">💬 Comments</span>
                    <span className="font-medium">
                      {platform.engagement.comments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">🔄 Shares</span>
                    <span className="font-medium">
                      {platform.engagement.shares.toLocaleString()}
                    </span>
                  </div>
                  {platform.engagement.views && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">👁️ Views</span>
                      <span className="font-medium">
                        {platform.engagement.views.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Growth</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Followers Change</span>
                    <span className={`font-medium ${
                      platform.growth.followersChange >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {platform.growth.followersChange >= 0 ? '+' : ''}
                      {platform.growth.followersChange.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Engagement Rate</span>
                    <span className="font-medium">
                      {platform.growth.engagementRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
}