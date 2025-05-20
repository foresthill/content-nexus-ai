'use client';

import React, { useEffect } from 'react';
import useContentStore from '@/store/contentStore';
import useVideoStore from '@/store/videoStore';
import useAnalyticsStore from '@/store/analyticsStore';
import Link from 'next/link';
import { 
  DashboardSummary,
  AiInsights,
  TopPerformers,
  KeywordSuggestions
} from '@/components/dashboard';

export default function DashboardPage() {
  const { fetchContents } = useContentStore();
  const { fetchVideos } = useVideoStore();
  const { fetchAnalytics } = useAnalyticsStore();
  
  useEffect(() => {
    fetchContents();
    fetchVideos();
    fetchAnalytics();
  }, [fetchContents, fetchVideos, fetchAnalytics]);
  
  // 今日の日付
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アフィリエイトダッシュボード</h1>
          <p className="text-gray-500 mt-1">{today} 現在のデータ</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
            レポート出力
          </button>
          <Link 
            href="/content" 
            className="bg-indigo-600 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            新規記事作成
          </Link>
        </div>
      </div>
      
      {/* ダッシュボードサマリー（メインスタッツとチャート） */}
      <DashboardSummary />
      
      {/* AIインサイト */}
      <AiInsights />
      
      {/* 高パフォーマンス記事 */}
      <TopPerformers />
      
      {/* キーワードサジェスト */}
      <KeywordSuggestions />
    </div>
  );
}