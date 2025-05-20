'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';
import { ContentStatus, PlatformType, PlatformData } from '@/types/content';

export default function ContentPage() {
  const { contents, fetchContents } = useContentStore();
  const [currentTab, setCurrentTab] = useState<'all' | PlatformType>('all');
  const [filteredContents, setFilteredContents] = useState([...contents]);
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [sortOption, setSortOption] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (contents.length === 0) {
      fetchContents();
    }
  }, [contents.length, fetchContents]);
  
  // タブ変更時にコンテンツをフィルタリング
  useEffect(() => {
    let filtered = [...contents];
    
    // プラットフォームでフィルタリング
    if (currentTab !== 'all') {
      filtered = contents.filter(content => 
        content.platforms?.some(platform => platform.type === currentTab)
      );
    }
    
    // ステータスでフィルタリング
    if (statusFilter !== 'all') {
      filtered = filtered.filter(content => content.status === statusFilter);
    }
    
    // 検索クエリでフィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(query) || 
        content.description.toLowerCase().includes(query) ||
        content.tags.some(tag => tag.toLowerCase().includes(query)) ||
        content.category.some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    // 並び替え
    if (sortOption === 'date_desc') {
      filtered.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } else if (sortOption === 'date_asc') {
      filtered.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    } else if (sortOption === 'title_asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title_desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    setFilteredContents(filtered);
  }, [contents, currentTab, statusFilter, sortOption, searchQuery]);
  
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
  
  // プラットフォームアイコンを表示
  const PlatformIcon = ({ type }: { type: PlatformType }) => {
    switch (type) {
      case PlatformType.BLOG:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
        );
      case PlatformType.TWITTER:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case PlatformType.FACEBOOK:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
          </svg>
        );
      case PlatformType.INSTAGRAM:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.824 1.265a3.412 3.412 0 0 1-1.265.824c-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379a3.412 3.412 0 0 1-1.265-.824 3.412 3.412 0 0 1-.824-1.265c-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.824-1.265a3.412 3.412 0 0 1 1.265-.824c.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 0c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512a5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.27 1.949c-.272.7-.458 1.499-.512 2.67C1.013 7.638 1 8.013 1 11s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67a5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.949 1.27c.7.272 1.499.458 2.67.512C8.638 21.987 9.013 22 12 22s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512a5.392 5.392 0 0 0 1.949-1.27 5.392 5.392 0 0 0 1.27-1.949c.272-.7.458-1.499.512-2.67.053-1.173.066-1.548.066-4.535s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67a5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.949-1.27c-.7-.272-1.499-.458-2.67-.512C15.362.013 14.987 0 12 0Zm0 5.351a5.649 5.649 0 1 0 0 11.298 5.649 5.649 0 0 0 0-11.298Zm0 9.316a3.667 3.667 0 1 1 0-7.334 3.667 3.667 0 0 1 0 7.334Zm7.192-9.539a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0Z" />
          </svg>
        );
      case PlatformType.NOTE:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.845 19.721c-1.524 0-2.84-.92-3.62-2.076a4.041 4.041 0 0 1-.47-3.23L3.938 3.57a.752.752 0 0 1 .723-.57h14.779c.398 0 .721.323.721.721s-.323.721-.721.721H5.057L1.812 14.908c-.45.876-.19 1.754.332 2.454.554.767 1.454 1.224 2.702 1.224h14.344c.398 0 .721.323.721.721s-.323.721-.721.721L4.845 19.721z" />
            <path d="M18.498 19.27c-.19 0-.38-.076-.519-.225a.73.73 0 0 1-.01-1.033l2.085-2.121-2.085-2.121a.73.73 0 0 1 .01-1.033.73.73 0 0 1 1.033.01l2.637 2.682a.73.73 0 0 1-.01 1.033l-2.637 2.683a.713.713 0 0 1-.504.126z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        );
    }
  };
  
  // プラットフォーム名を返す
  const getPlatformName = (type: PlatformType): string => {
    switch (type) {
      case PlatformType.BLOG:
        return 'ブログ';
      case PlatformType.TWITTER:
        return 'X (Twitter)';
      case PlatformType.FACEBOOK:
        return 'Facebook';
      case PlatformType.INSTAGRAM:
        return 'Instagram';
      case PlatformType.NOTE:
        return 'note';
      default:
        return 'その他';
    }
  };
  
  // エンゲージメント情報を表示
  const EngagementInfo = ({ platform }: { platform: PlatformData }) => {
    if (!platform.engagement) return null;
    
    return (
      <div className="flex space-x-2 text-gray-500 text-xs">
        {platform.engagement.likes !== undefined && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1">
              <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
            </svg>
            {platform.engagement.likes}
          </span>
        )}
        {platform.engagement.comments !== undefined && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1">
              <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.08.178 2.002.91 2.32 1.94l.01.04c.56 1.864.83 3.817.83 5.796 0 1.978-.27 3.932-.83 5.795l-.01.04c-.318 1.031-1.24 1.763-2.32 1.94-2.14.346-4.334.525-6.57.525-2.236 0-4.43-.18-6.57-.524-1.08-.178-2.002-.91-2.32-1.94l-.01-.04C.27 14.932 0 12.978 0 11c0-1.978.27-3.932.83-5.795l.01-.04c.318-1.031 1.24-1.763 2.32-1.94ZM10.001 11a1 1 0 0 1 1 1 .99.99 0 1 1-2 0 1 1 0 0 1 1-1Zm-4 0a1 1 0 0 1 1 1 .99.99 0 1 1-2 0 1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 1 1 .99.99 0 1 1-2 0 1 1 0 0 1 1-1Z" clipRule="evenodd" />
            </svg>
            {platform.engagement.comments}
          </span>
        )}
        {platform.engagement.shares !== undefined && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1">
              <path d="M13 4.5a2.5 2.5 0 1 1 .602 1.628l-6.5 3.25a2.5 2.5 0 0 1 0 1.244l6.5 3.25a2.5 2.5 0 1 1-.652.646l-6.5-3.25a2.5 2.5 0 1 1 0-2.536l6.5-3.25A2.5 2.5 0 0 1 13 4.5Z" />
            </svg>
            {platform.engagement.shares}
          </span>
        )}
        {platform.engagement.clicks !== undefined && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1">
              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
            </svg>
            {platform.engagement.clicks}
          </span>
        )}
      </div>
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
      
      {/* プラットフォームタブ */}
      <div className="mb-4">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          <button
            onClick={() => setCurrentTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === 'all' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            すべて
          </button>
          <button
            onClick={() => setCurrentTab(PlatformType.BLOG)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === PlatformType.BLOG 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <PlatformIcon type={PlatformType.BLOG} />
            <span className="ml-2">ブログ</span>
          </button>
          <button
            onClick={() => setCurrentTab(PlatformType.TWITTER)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === PlatformType.TWITTER 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <PlatformIcon type={PlatformType.TWITTER} />
            <span className="ml-2">X (Twitter)</span>
          </button>
          <button
            onClick={() => setCurrentTab(PlatformType.FACEBOOK)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === PlatformType.FACEBOOK 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <PlatformIcon type={PlatformType.FACEBOOK} />
            <span className="ml-2">Facebook</span>
          </button>
          <button
            onClick={() => setCurrentTab(PlatformType.INSTAGRAM)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === PlatformType.INSTAGRAM 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <PlatformIcon type={PlatformType.INSTAGRAM} />
            <span className="ml-2">Instagram</span>
          </button>
          <button
            onClick={() => setCurrentTab(PlatformType.NOTE)}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
              currentTab === PlatformType.NOTE 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <PlatformIcon type={PlatformType.NOTE} />
            <span className="ml-2">note</span>
          </button>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | ContentStatus)}
                >
                  <option value="all">すべて</option>
                  <option value={ContentStatus.PUBLISHED}>公開</option>
                  <option value={ContentStatus.DRAFT}>下書き</option>
                  <option value={ContentStatus.ARCHIVED}>アーカイブ</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">並び替え</label>
                <select
                  id="sort"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* コンテンツリスト */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredContents.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-gray-600">コンテンツがありません</p>
            <div className="mt-4">
              <Link 
                href="/content/new" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                新規コンテンツを作成
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredContents.map((content) => (
              <li key={content.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start">
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
                      <div className="flex items-center mb-1">
                        <h2 className="text-lg font-medium text-gray-900 mr-2">{content.title}</h2>
                        <StatusBadge status={content.status} />
                      </div>
                      <div className="text-sm text-gray-500 mb-1">{content.description}</div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="mr-4">
                          <span className="font-medium">作成日:</span> {new Date(content.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        {content.publishedAt && (
                          <span>
                            <span className="font-medium">公開日:</span> {new Date(content.publishedAt).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                      <div className="mb-2 flex flex-wrap gap-1">
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
                      
                      {/* プラットフォーム情報 */}
                      {content.platforms && content.platforms.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">配信プラットフォーム:</p>
                          <div className="flex flex-wrap gap-2">
                            {content.platforms.map((platform, index) => (
                              <div key={index} className="flex flex-col bg-gray-50 rounded p-2 text-sm border border-gray-200">
                                <div className="flex items-center mb-1">
                                  <PlatformIcon type={platform.type} />
                                  <span className="ml-1 font-medium">{getPlatformName(platform.type)}</span>
                                </div>
                                {platform.url && (
                                  <a 
                                    href={platform.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-800 underline mb-1 truncate max-w-[180px]"
                                  >
                                    {platform.url}
                                  </a>
                                )}
                                {platform.publishedAt ? (
                                  <span className="text-xs text-gray-500">
                                    公開: {new Date(platform.publishedAt).toLocaleDateString('ja-JP')}
                                  </span>
                                ) : platform.scheduledAt ? (
                                  <span className="text-xs text-gray-500">
                                    予定: {new Date(platform.scheduledAt).toLocaleDateString('ja-JP')}
                                  </span>
                                ) : null}
                                <EngagementInfo platform={platform} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 md:mt-0">
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
        )}
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
            <div className="flex flex-wrap gap-3">
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
              <button className="flex items-center bg-indigo-700 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-opacity-40 transition-colors">
                一括スケジュール配信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}