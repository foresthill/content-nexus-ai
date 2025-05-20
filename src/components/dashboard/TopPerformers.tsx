'use client';

import React from 'react';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';
import useAnalyticsStore from '@/store/analyticsStore';

const TopPerformers: React.FC = () => {
  const { contents } = useContentStore();
  const { analyticsData } = useAnalyticsStore();
  
  // モック用に記事にPV数とコンバージョン率を追加
  const contentsWithAnalytics = contents.map((content, index) => {
    const revenue = analyticsData.find(data => data.revenue)?.revenue || 0;
    return {
      ...content,
      views: (500 * (index + 1)),
      ctr: (2.5 + index * 0.5),
      revenue: index === 0 ? revenue : Math.round(revenue / (index + 2))
    };
  });
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">高パフォーマンス記事</h2>
        <Link href="/analytics" className="text-sm text-indigo-600 hover:text-indigo-900">
          すべて表示
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                記事タイトル
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PV数
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                収益
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentsWithAnalytics.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                      {content.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={content.featuredImage} alt="コンテンツサムネイル" className="h-full w-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{content.title}</div>
                      <div className="text-sm text-gray-500">
                        {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString('ja-JP') : '未公開'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{content.views.toLocaleString()}</div>
                  <div className="text-xs text-green-600">+{5 * (Number(content.id))}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{content.ctr.toFixed(1)}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{content.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/content/${content.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    詳細
                  </Link>
                  <Link href={`/content/${content.id}/edit`} className="text-gray-600 hover:text-gray-900">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPerformers;