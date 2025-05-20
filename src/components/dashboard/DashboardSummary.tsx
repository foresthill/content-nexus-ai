'use client';

import React from 'react';
import useAnalyticsStore from '@/store/analyticsStore';
import useContentStore from '@/store/contentStore';
import useVideoStore from '@/store/videoStore';
import AnalyticsChart from './AnalyticsChart';

const DashboardSummary: React.FC = () => {
  const { analyticsData } = useAnalyticsStore();
  const { contents } = useContentStore();
  // videosは現在使用していないが、将来的に使用する可能性があるためストアは維持
  const { } = useVideoStore();
  
  // 統計データの集計
  const totalContents = contents.length;
  const totalViews = analyticsData.reduce((sum, data) => sum + data.totalViews, 0);
  const conversionRate = (analyticsData.find(data => data.conversionRate)?.conversionRate || 0) * 100;
  const revenue = analyticsData.find(data => data.revenue)?.revenue || 0;
  
  // チャート用のデータ準備
  const viewsChartData = analyticsData.length > 0 
    ? analyticsData[0].views
    : [];
    
  // デバイス別のアクセス数集計
  const deviceData = analyticsData.reduce((result, item) => {
    if (item.demographics?.devices) {
      Object.entries(item.demographics.devices).forEach(([device, value]) => {
        result[device] = (result[device] || 0) + value;
      });
    }
    return result;
  }, {} as Record<string, number>);
  
  // 年齢層別のアクセス数集計
  const ageData = analyticsData.reduce((result, item) => {
    if (item.demographics?.ageGroups) {
      Object.entries(item.demographics.ageGroups).forEach(([age, value]) => {
        result[age] = (result[age] || 0) + value;
      });
    }
    return result;
  }, {} as Record<string, number>);
  
  return (
    <div className="space-y-6">
      {/* メインスタッツ カード */}
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
      
      {/* チャートセクション */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* アクセス推移チャート */}
        <AnalyticsChart
          data={viewsChartData}
          type="area"
          title="アクセス推移"
          description="過去9日間のアクセス数推移"
        />
        
        {/* デバイス別アクセスチャート */}
        <AnalyticsChart
          data={deviceData}
          type="pie"
          title="デバイス別アクセス割合"
          description="ユーザーデバイスの分布"
          colors={['#4f46e5', '#10b981', '#f59e0b']}
        />
        
        {/* 年齢層別アクセスチャート */}
        <AnalyticsChart
          data={ageData}
          type="bar"
          title="年齢層別アクセス割合"
          description="訪問者の年齢層分布"
        />
        
        {/* エンゲージメントチャート */}
        {analyticsData.length > 0 && analyticsData[0].engagement && (
          <AnalyticsChart
            data={analyticsData.reduce((result, item) => {
              if (item.engagement) {
                Object.entries(item.engagement).forEach(([key, value]) => {
                  if (typeof value === 'number' && key !== 'averageViewDuration' && key !== 'bounceRate') {
                    result[key] = (result[key] || 0) + value;
                  }
                });
              }
              return result;
            }, {} as Record<string, number>)}
            type="bar"
            title="エンゲージメント指標"
            description="いいね、シェア、コメント数の合計"
            colors={['#8b5cf6', '#ec4899', '#14b8a6']}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardSummary;