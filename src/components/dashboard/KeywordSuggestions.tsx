'use client';

import React from 'react';
import Link from 'next/link';

interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
}

const KeywordSuggestions: React.FC = () => {
  // モックデータ - 実際のアプリケーションではAPIや状態管理から取得
  const suggestions: KeywordSuggestion[] = [
    { keyword: 'サステナブル投資', searchVolume: 5000, competition: 'low' },
    { keyword: '時短家事テクニック', searchVolume: 4200, competition: 'medium' },
    { keyword: 'オーガニック食品', searchVolume: 3800, competition: 'low' },
    { keyword: '副業アイデア', searchVolume: 6500, competition: 'high' },
    { keyword: 'スマートホーム', searchVolume: 3100, competition: 'medium' },
    { keyword: 'ミニマリスト生活', searchVolume: 2800, competition: 'low' }
  ];
  
  // 競合度に基づいてラベルのスタイルを返す関数
  const getCompetitionStyle = (competition: 'low' | 'medium' | 'high') => {
    switch (competition) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 競合度に基づいてラベルのテキストを返す関数
  const getCompetitionLabel = (competition: 'low' | 'medium' | 'high') => {
    switch (competition) {
      case 'low':
        return '競合少';
      case 'medium':
        return '競合中';
      case 'high':
        return '競合多';
      default:
        return '不明';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">おすすめキーワード</h2>
        <Link href="/keywords" className="text-sm text-indigo-600 hover:text-indigo-900">
          すべて表示
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{suggestion.keyword}</h3>
                <p className="text-sm text-gray-500 mt-1">月間検索ボリューム: {suggestion.searchVolume.toLocaleString()}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompetitionStyle(suggestion.competition)}`}>
                {getCompetitionLabel(suggestion.competition)}
              </span>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                記事作成
              </button>
              <button className="flex-1 bg-indigo-50 border border-indigo-200 rounded-md shadow-sm px-2 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none">
                リサーチ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordSuggestions;