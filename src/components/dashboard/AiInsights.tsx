'use client';

import React from 'react';
import Link from 'next/link';

interface AiInsight {
  id: string;
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const AiInsights: React.FC = () => {
  // モックデータ - 実際のアプリケーションではAPIや状態管理から取得
  const insights: AiInsight[] = [
    {
      id: '1',
      title: 'トレンドキーワード活用のチャンス',
      description: '現在のトレンドキーワードは「サステナブル投資」「在宅ワーク効率化」「オーガニック食品」です。これらのキーワードを使った記事を作成すると高いパフォーマンスが期待できます。',
      actionUrl: '/content/new',
      priority: 'high'
    },
    {
      id: '2',
      title: 'コンテンツ更新のおすすめ',
      description: '「SEO対策の最新トレンド2025」の記事が注目を集めています。情報を更新して再プッシュすると、さらなるアクセス増が見込めます。',
      actionUrl: '/content/2/edit',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'ショート動画の作成提案',
      description: '人気記事「効果的なコンテンツマーケティングの秘訣」をショート動画化すると、若年層へのリーチが高まります。',
      actionUrl: '/videos/new',
      priority: 'medium'
    }
  ];
  
  const getPriorityStyle = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'from-indigo-600 to-blue-500';
      case 'medium':
        return 'from-blue-500 to-cyan-400';
      case 'low':
        return 'from-cyan-400 to-teal-300';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };
  
  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div 
          key={insight.id}
          className={`bg-gradient-to-r ${getPriorityStyle(insight.priority)} rounded-lg shadow-lg px-6 py-6 text-white`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2">{insight.title}</h2>
              <p className="mb-4 text-sm">
                {insight.description}
              </p>
              <div className="flex space-x-3">
                {insight.actionUrl && (
                  <Link 
                    href={insight.actionUrl}
                    className="flex items-center bg-white text-indigo-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-90 transition-colors"
                  >
                    アクションを実行
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                )}
                <button className="flex items-center bg-indigo-700 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-40 transition-colors">
                  詳細を見る
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AiInsights;