'use client';

import React from 'react';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';
import { ContentStatus } from '@/types/content';

export default function ContentPage() {
  const { contents } = useContentStore();
  
  // 公開日の新しい順にソート
  const sortedContents = [...contents].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  
  // コンテンツのステータスに応じたバッジを表示
  const StatusBadge = ({ status }: { status: ContentStatus }) => {
    let classes = '';
    
    switch (status) {
      case ContentStatus.PUBLISHED:
        classes = 'bg-green-100 text-green-800';
        break;
      case ContentStatus.DRAFT:
        classes = 'bg-yellow-100 text-yellow-800';
        break;
      case ContentStatus.ARCHIVED:
        classes = 'bg-gray-100 text-gray-800';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
        {status === ContentStatus.PUBLISHED ? '公開' : status === ContentStatus.DRAFT ? '下書き' : 'アーカイブ'}
      </span>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">コンテンツ管理</h1>
          <p className="text-gray-600 mt-1">
            AIを活用して魅力的なコンテンツを簡単に作成・管理
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/content/new" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新規コンテンツ作成
          </Link>
        </div>
      </div>
      
      {/* フィルターと検索 */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-1">
            <div className="flex items-center space-x-2">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">ステータス</label>
                <select
                  id="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  defaultValue="all"
                >
                  <option value="all">すべて</option>
                  <option value="published">公開</option>
                  <option value="draft">下書き</option>
                  <option value="archived">アーカイブ</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">並び替え</label>
                <select
                  id="sort"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  defaultValue="date_desc"
                >
                  <option value="date_desc">新しい順</option>
                  <option value="date_asc">古い順</option>
                  <option value="title_asc">タイトル (A-Z)</option>
                  <option value="title_desc">タイトル (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">検索</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="タイトルまたは内容で検索"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* コンテンツリスト */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <ul className="divide-y divide-gray-200">
          {sortedContents.map((content) => (
            <li key={content.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {content.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={content.featuredImage} alt={content.title} className="h-full w-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h2 className="text-lg font-medium text-gray-900">{content.title}</h2>
                      <StatusBadge status={content.status} />
                    </div>
                    <div className="mt-1 flex items-center">
                      <p className="text-sm text-gray-500 mr-4">
                        <span className="font-medium">作成日:</span> {new Date(content.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {content.publishedAt && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">公開日:</span> {new Date(content.publishedAt).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {content.category.map((cat, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {cat}
                        </span>
                      ))}
                      {content.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link 
                    href={`/content/${content.id}`} 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    詳細
                  </Link>
                  <Link 
                    href={`/content/${content.id}/edit`} 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    編集
                  </Link>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700">
                    投稿
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* AIアシスタント */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg px-6 py-8 text-white mt-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">AIコンテンツアシスタント</h2>
            <p className="mb-4">
              コンテンツの作成や最適化をAIがサポートします。SEOに最適化された高品質な記事を自動生成したり、既存コンテンツを分析して改善提案を受け取りましょう。
            </p>
            <div className="flex space-x-3">
              <Link
                href="/content/new"
                className="flex items-center bg-white text-indigo-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-90 transition-colors"
              >
                記事を自動生成
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
              <Link
                href="/keywords"
                className="flex items-center bg-indigo-700 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-40 transition-colors"
              >
                キーワード検索
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}