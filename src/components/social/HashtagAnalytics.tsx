'use client';

import { useState, useEffect } from 'react';
import { SocialPlatform } from '@/types/social';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  HashtagIcon 
} from '@heroicons/react/24/outline';

interface HashtagAnalyticsProps {
  platform?: SocialPlatform;
}

interface TrendData {
  hashtag: string;
  trendScore: number;
  growthRate: number;
  engagementRate?: number;
}

interface TrendAnalytics {
  all: TrendData[];
  rising: TrendData[];
  stable: TrendData[];
  declining: TrendData[];
}

export default function HashtagAnalytics({ platform }: HashtagAnalyticsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(
    platform || 'instagram'
  );
  const [trends, setTrends] = useState<TrendAnalytics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, [selectedPlatform]);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/hashtags/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform }),
      });

      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends);
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const platforms: { value: SocialPlatform; label: string; color: string }[] = [
    { value: 'twitter', label: 'X (Twitter)', color: 'bg-blue-500' },
    { value: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
    { value: 'tiktok', label: 'TikTok', color: 'bg-purple-500' },
  ];

  const renderTrendBadge = (growthRate: number) => {
    if (growthRate > 15) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
          急上昇
        </span>
      );
    } else if (growthRate < 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
          下降
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
        安定
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <HashtagIcon className="h-5 w-5 mr-2" />
          ハッシュタグトレンド分析
        </h3>
        <div className="flex space-x-2">
          {platforms.map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPlatform(p.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPlatform === p.value
                  ? `${p.color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                AIインサイト
              </h4>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start">
                    <span className="text-blue-500 mr-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trending Hashtags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rising Trends */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                急上昇トレンド
              </h4>
              <div className="space-y-2">
                {trends?.rising.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      #{trend.hashtag}
                    </span>
                    <span className="text-xs text-green-600">
                      +{trend.growthRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stable Trends */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                安定トレンド
              </h4>
              <div className="space-y-2">
                {trends?.stable.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      #{trend.hashtag}
                    </span>
                    <span className="text-xs text-gray-600">
                      {trend.trendScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Declining Trends */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                下降トレンド
              </h4>
              <div className="space-y-2">
                {trends?.declining.slice(0, 5).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      #{trend.hashtag}
                    </span>
                    <span className="text-xs text-red-600">
                      {trend.growthRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Trends Table */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              トップトレンド一覧
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ハッシュタグ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      トレンドスコア
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      成長率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      エンゲージメント率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trends?.all.slice(0, 10).map((trend, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{trend.hashtag}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${trend.trendScore}%` }}
                            />
                          </div>
                          {trend.trendScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`font-semibold ${
                          trend.growthRate > 10 ? 'text-green-600' : 
                          trend.growthRate < 5 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trend.engagementRate 
                          ? `${trend.engagementRate.toFixed(1)}%`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderTrendBadge(trend.growthRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}