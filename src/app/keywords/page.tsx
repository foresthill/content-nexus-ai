'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// キーワード検索結果の型定義
interface KeywordResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number;
  trends: 'rising' | 'stable' | 'falling';
}

// キーワード候補を生成する関数（実際はAPIから取得）
const getKeywordSuggestions = (seed: string): KeywordResult[] => {
  // 本番ではAPIコールで取得するモックデータ
  const baseKeywords = [
    {
      keyword: `${seed}の始め方`,
      searchVolume: 4800,
      difficulty: 42,
      competition: 'medium' as const,
      cpc: 1.25,
      trends: 'rising' as const
    },
    {
      keyword: `初心者向け${seed}`,
      searchVolume: 3200,
      difficulty: 28,
      competition: 'low' as const,
      cpc: 0.95,
      trends: 'rising' as const
    },
    {
      keyword: `${seed} おすすめ`,
      searchVolume: 8900,
      difficulty: 65,
      competition: 'high' as const,
      cpc: 2.10,
      trends: 'stable' as const
    },
    {
      keyword: `${seed} 比較`,
      searchVolume: 5400,
      difficulty: 48,
      competition: 'medium' as const,
      cpc: 1.85,
      trends: 'stable' as const
    },
    {
      keyword: `${seed} メリット`,
      searchVolume: 2300,
      difficulty: 32,
      competition: 'low' as const,
      cpc: 0.75,
      trends: 'stable' as const
    },
    {
      keyword: `${seed} デメリット`,
      searchVolume: 1900,
      difficulty: 25,
      competition: 'low' as const,
      cpc: 0.65,
      trends: 'rising' as const
    },
    {
      keyword: `${seed}とは`,
      searchVolume: 12000,
      difficulty: 72,
      competition: 'high' as const,
      cpc: 1.95,
      trends: 'stable' as const
    },
    {
      keyword: `無料${seed}`,
      searchVolume: 7600,
      difficulty: 58,
      competition: 'high' as const,
      cpc: 1.45,
      trends: 'stable' as const
    },
    {
      keyword: `${seed} 活用法`,
      searchVolume: 2100,
      difficulty: 35,
      competition: 'medium' as const,
      cpc: 0.85,
      trends: 'rising' as const
    },
    {
      keyword: `${seed} 2025`,
      searchVolume: 3800,
      difficulty: 40,
      competition: 'medium' as const,
      cpc: 1.05,
      trends: 'rising' as const
    }
  ];
  
  // ランダムな変動を加えて結果を多様化
  return baseKeywords.map(kw => ({
    ...kw,
    searchVolume: Math.floor(kw.searchVolume * (0.9 + Math.random() * 0.2)),
    difficulty: Math.floor(kw.difficulty * (0.9 + Math.random() * 0.2)),
    cpc: parseFloat((kw.cpc * (0.9 + Math.random() * 0.2)).toFixed(2))
  }));
};

// キーワードの競合度を色付きのバッジで表示するコンポーネント
const CompetitionBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const styles = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  );
};

// トレンドを示すコンポーネント
const TrendIndicator = ({ trend }: { trend: 'rising' | 'stable' | 'falling' }) => {
  if (trend === 'rising') {
    return (
      <span className="inline-flex items-center text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
        </svg>
        上昇中
      </span>
    );
  } else if (trend === 'stable') {
    return (
      <span className="inline-flex items-center text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zM13.25 2A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zM4.25 11A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zM13.25 11A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" />
        </svg>
        安定
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
          <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-.996.35l-4.286-2.475a.75.75 0 01.75-1.3l2.685 1.55a19.427 19.427 0 00-3.582-6.777L8 10.439l-5.72-5.72a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
        下降中
      </span>
    );
  }
};

// 難易度を表示するコンポーネント
const DifficultyBar = ({ value }: { value: number }) => {
  // 0-100の範囲で難易度を設定
  const getColorClass = () => {
    if (value < 30) return 'bg-green-500';
    if (value < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${getColorClass()}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default function KeywordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordResult | null>(null);
  
  // 人気のニッチリスト
  const popularNiches = [
    'アフィリエイト', 'ブログ', '副業', 'SEO', 'マーケティング', 
    '投資', '仮想通貨', 'AI', 'プログラミング', 'ミニマリスト'
  ];
  
  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm && !selectedNiche) return;
    
    setIsLoading(true);
    
    // 実際のAPIコールをシミュレートするタイマー
    setTimeout(() => {
      const term = searchTerm || selectedNiche;
      const keywordResults = getKeywordSuggestions(term);
      setResults(keywordResults);
      setIsLoading(false);
    }, 1000);
  };
  
  // ニッチ選択処理
  const handleNicheSelect = (niche: string) => {
    setSelectedNiche(niche);
    setSearchTerm('');
    
    setIsLoading(true);
    
    // 実際のAPIコールをシミュレートするタイマー
    setTimeout(() => {
      const keywordResults = getKeywordSuggestions(niche);
      setResults(keywordResults);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEOキーワード検索</h1>
        <p className="text-gray-600 mt-1">
          記事作成に最適なキーワードを見つけて、検索上位を狙いましょう
        </p>
      </div>
      
      {/* 検索フォーム */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="sm:flex items-center">
            <div className="flex-1 min-w-0">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                キーワードを入力
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="検索キーワードを入力してください"
                />
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    検索中...
                  </>
                ) : (
                  '検索'
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* 人気のニッチ */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">人気のニッチ</h3>
          <div className="flex flex-wrap gap-2">
            {popularNiches.map((niche) => (
              <button
                key={niche}
                onClick={() => handleNicheSelect(niche)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedNiche === niche
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 検索結果 */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              「{searchTerm || selectedNiche}」の検索結果
            </h2>
            <p className="text-sm text-gray-500">
              {results.length}件のキーワードが見つかりました
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    キーワード
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    検索ボリューム
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    難易度
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    競合度
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC (¥)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    トレンド
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((keyword, index) => (
                  <tr key={index} className={selectedKeyword?.keyword === keyword.keyword ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{keyword.keyword}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{keyword.searchVolume.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="w-24 flex items-center">
                          <span className="mr-2 text-xs">{keyword.difficulty}</span>
                          <DifficultyBar value={keyword.difficulty} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CompetitionBadge level={keyword.competition} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{keyword.cpc.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <TrendIndicator trend={keyword.trends} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedKeyword(keyword)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        詳細
                      </button>
                      <Link 
                        href={`/content/new?keyword=${encodeURIComponent(keyword.keyword)}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        作成
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* キーワード詳細モーダル */}
      {selectedKeyword && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">「{selectedKeyword.keyword}」の詳細分析</h3>
              <button
                onClick={() => setSelectedKeyword(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* キーワード指標 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">月間検索ボリューム</div>
                  <div className="text-xl font-semibold text-gray-900">{selectedKeyword.searchVolume.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">難易度スコア</div>
                  <div className="text-xl font-semibold text-gray-900">{selectedKeyword.difficulty}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">競合度</div>
                  <div className="mt-1">
                    <CompetitionBadge level={selectedKeyword.competition} />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">CPC (¥)</div>
                  <div className="text-xl font-semibold text-gray-900">¥{selectedKeyword.cpc.toFixed(2)}</div>
                </div>
              </div>
              
              {/* コンテンツ作成アドバイス */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h4 className="font-medium text-indigo-900 mb-2">コンテンツ作成アドバイス</h4>
                <ul className="text-sm text-indigo-800 space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600 mr-1 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>「{selectedKeyword.keyword}」は{selectedKeyword.difficulty < 40 ? '比較的狙いやすい' : '競争が激しい'}キーワードです。</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600 mr-1 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>タイトルと見出しに「{selectedKeyword.keyword}」を含めることでSEO効果が高まります。</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600 mr-1 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>このキーワードには最低1,500語以上のコンテンツを作成することをおすすめします。</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600 mr-1 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>画像、表、リストなどを使用して読みやすさを向上させてください。</span>
                  </li>
                </ul>
              </div>
              
              {/* 記事構成サンプル */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">推奨記事構成</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ol className="text-sm text-gray-700 space-y-3 list-decimal pl-4">
                    <li><span className="font-medium">導入: {selectedKeyword.keyword}の概要と重要性</span></li>
                    <li><span className="font-medium">{selectedKeyword.keyword}の基本知識</span></li>
                    <li><span className="font-medium">{selectedKeyword.keyword}の主なメリット</span></li>
                    <li><span className="font-medium">{selectedKeyword.keyword}の活用方法 (5つ以上)</span></li>
                    <li><span className="font-medium">{selectedKeyword.keyword}に関する一般的な課題と解決策</span></li>
                    <li><span className="font-medium">成功事例: {selectedKeyword.keyword}の実例</span></li>
                    <li><span className="font-medium">今後の展望: {selectedKeyword.keyword}の将来性</span></li>
                    <li><span className="font-medium">まとめと次のステップ</span></li>
                  </ol>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  onClick={() => setSelectedKeyword(null)}
                >
                  閉じる
                </button>
                <Link
                  href={`/content/new?keyword=${encodeURIComponent(selectedKeyword.keyword)}`}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                >
                  この構成で記事を作成
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}