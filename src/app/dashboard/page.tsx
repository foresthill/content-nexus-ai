'use client';

import React, { useEffect } from 'react';
import useContentStore from '@/store/contentStore';
import useVideoStore from '@/store/videoStore';
import useAnalyticsStore from '@/store/analyticsStore';

export default function DashboardPage() {
  const { contents, fetchContents } = useContentStore();
  const { videos, fetchVideos } = useVideoStore();
  const { analyticsData, fetchAnalytics } = useAnalyticsStore();
  
  useEffect(() => {
    fetchContents();
    fetchVideos();
    fetchAnalytics();
  }, [fetchContents, fetchVideos, fetchAnalytics]);
  
  // 統計データの集計
  const totalContents = contents.length;
  const totalVideos = videos.length;
  const totalViews = analyticsData.reduce((sum, data) => sum + data.totalViews, 0);
  
  // 視聴データ準備
  const viewsData = analyticsData.length > 0 && analyticsData[0].views
    ? analyticsData[0].views.map(item => ({
        date: item.date.toLocaleDateString(),
        views: item.count
      }))
    : [];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Contents</dt>
              <dd className="text-3xl font-semibold text-gray-900">{totalContents}</dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Videos</dt>
              <dd className="text-3xl font-semibold text-gray-900">{totalVideos}</dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
              <dd className="text-3xl font-semibold text-gray-900">{totalViews}</dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
              <dd className="text-3xl font-semibold text-gray-900">
                {(analyticsData.find(data => data.conversionRate)?.conversionRate || 0) * 100}%
              </dd>
            </div>
          </div>
        </div>
      </div>
      
      {/* グラフがあれば表示 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">
          詳細な分析ダッシュボードは開発中です。完全版ではグラフやチャートが表示されます。
        </p>
      </div>
    </div>
  );
}