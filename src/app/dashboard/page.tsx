'use client';

import React, { useEffect } from 'react';
import useContentStore from '@/store/contentStore';
import useVideoStore from '@/store/videoStore';
import useAnalyticsStore from '@/store/analyticsStore';
import Link from 'next/link';

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
  const conversionRate = (analyticsData.find(data => data.conversionRate)?.conversionRate || 0) * 100;
  const revenue = analyticsData.find(data => data.revenue)?.revenue || 0;
  
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
      
      {/* メインスタッツ */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">月間収益</dt>
              <dd className="text-3xl font-semibold text-gray-900">¥{revenue.toLocaleString()}</dd>
              <p className="mt-1 text-xs text-green-600">前月比 +12.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-green-100">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">公開記事数</dt>
              <dd className="text-3xl font-semibold text-gray-900">{totalContents}</dd>
              <p className="mt-1 text-xs text-green-600">今週 +2 記事</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">月間PV数</dt>
              <dd className="text-3xl font-semibold text-gray-900">{totalViews.toLocaleString()}</dd>
              <p className="mt-1 text-xs text-green-600">前月比 +8.3%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md p-3 bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
              </svg>
            </div>
            <div className="ml-5">
              <dt className="text-sm font-medium text-gray-500 truncate">コンバージョン率</dt>
              <dd className="text-3xl font-semibold text-gray-900">{conversionRate.toFixed(1)}%</dd>
              <p className="mt-1 text-xs text-green-600">前月比 +0.5%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* AIアシスタント */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg px-6 py-8 text-white">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">AIアシスタント分析</h2>
            <p className="mb-4">
              現在のトレンドキーワードは「サステナブル投資」「在宅ワーク効率化」「オーガニック食品」です。これらのキーワードを使った記事を作成すると高いパフォーマンスが期待できます。
            </p>
            <div className="flex space-x-3">
              <button className="flex items-center bg-white text-indigo-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-90 transition-colors">
                記事を作成する
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button className="flex items-center bg-indigo-700 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-40 transition-colors">
                詳細を見る
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 高パフォーマンス記事 */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contents.map((content, index) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        {content.featuredImage ? (
                          <img src={content.featuredImage} alt="" className="h-full w-full object-cover" />
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
                    <div className="text-sm text-gray-900">{(500 * (index + 1)).toLocaleString()}</div>
                    <div className="text-xs text-green-600">+{5 * (index + 2)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{(2.5 + index * 0.5).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{(index === 0 ? revenue : Math.round(revenue / (index + 2))).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* キーワードサジェスト */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">おすすめキーワード</h2>
          <Link href="/keywords" className="text-sm text-indigo-600 hover:text-indigo-900">
            すべて表示
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {['サステナブル投資', '時短家事テクニック', 'オーガニック食品', '副業アイデア', 'スマートホーム', 'ミニマリスト生活'].map((keyword, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{keyword}</h3>
                  <p className="text-sm text-gray-500 mt-1">月間検索ボリューム: {(1000 * (index + 1)).toLocaleString()}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  競合少
                </span>
              </div>
              <div className="mt-4">
                <button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  このキーワードで記事作成
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}