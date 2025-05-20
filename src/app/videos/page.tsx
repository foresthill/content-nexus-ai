'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useVideoStore from '@/store/videoStore';
import { VideoStatus, VideoType } from '@/types/video';

export default function VideosPage() {
  const { videos, fetchVideos, isLoading } = useVideoStore();
  const [activeTab, setActiveTab] = useState<'all' | 'shorts' | 'long'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'processing' | 'draft'>('all');
  
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  // 動画のフィルタリング
  const filteredVideos = videos.filter(video => {
    // タイプによるフィルタリング
    if (activeTab === 'shorts' && video.type !== VideoType.SHORT && 
        video.type !== VideoType.TIKTOK && 
        video.type !== VideoType.YOUTUBE_SHORTS && 
        video.type !== VideoType.INSTAGRAM_REELS && 
        video.type !== VideoType.LINE_VOOM) {
      return false;
    }
    
    if (activeTab === 'long' && video.type !== VideoType.LONG) {
      return false;
    }
    
    // ステータスによるフィルタリング
    if (activeFilter === 'published' && video.status !== VideoStatus.PUBLISHED) {
      return false;
    }
    
    if (activeFilter === 'processing' && video.status !== VideoStatus.PROCESSING) {
      return false;
    }
    
    if (activeFilter === 'draft' && video.status !== VideoStatus.READY) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">動画管理</h1>
          <p className="text-gray-500 mt-1">アップロード、編集、投稿を一元管理</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/videos/upload" 
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            新規アップロード
          </Link>
        </div>
      </div>
      
      {/* タブとフィルター */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('all')}
            >
              すべての動画
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'shorts' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('shorts')}
            >
              ショート動画
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'long' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('long')}
            >
              長尺動画
            </button>
          </div>
          
          <div className="flex space-x-2">
            <select
              className="bg-white border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
            >
              <option value="all">すべてのステータス</option>
              <option value="published">公開済み</option>
              <option value="processing">処理中</option>
              <option value="draft">下書き</option>
            </select>
            
            <button className="bg-white border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 動画グリッド */}
      {isLoading ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-500">動画を読み込んでいます...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto">
            <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">動画がありません</h3>
          <p className="mt-1 text-gray-500">選択された条件に一致する動画はありません。</p>
          <Link 
            href="/videos/upload"
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            動画をアップロード
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="relative">
                <div className="aspect-[9/16] bg-gray-100">
                  {/* サムネイル画像 */}
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 画像読み込みエラー時のフォールバック
                      (e.target as HTMLImageElement).src = '/window.svg';
                    }}
                  />
                  
                  {/* 動画長さ */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-1.5 py-0.5 rounded text-xs text-white">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                  
                  {/* ステータスバッジ */}
                  <div className="absolute top-2 left-2">
                    {video.status === VideoStatus.PUBLISHED ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        公開済み
                      </span>
                    ) : video.status === VideoStatus.PROCESSING ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        処理中
                      </span>
                    ) : video.status === VideoStatus.READY ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        準備完了
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        アーカイブ
                      </span>
                    )}
                  </div>
                  
                  {/* 再生ボタン */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="rounded-full bg-black bg-opacity-50 p-3 text-white hover:bg-opacity-70 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {video.publishedAt 
                    ? new Date(video.publishedAt).toLocaleDateString() 
                    : new Date(video.createdAt).toLocaleDateString()}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {video.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                      #{tag}
                    </span>
                  ))}
                  {video.tags.length > 3 && (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      +{video.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="mt-3 flex justify-between">
                  {video.status === VideoStatus.PROCESSING ? (
                    <Link 
                      href={`/videos/edit?id=${video.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                    >
                      処理中...
                    </Link>
                  ) : video.status === VideoStatus.READY || video.status === VideoStatus.PUBLISHED ? (
                    <Link 
                      href={`/videos/edit?id=${video.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      編集する
                    </Link>
                  ) : (
                    <button
                      className="text-xs text-gray-500 font-medium flex items-center"
                      disabled
                    >
                      アーカイブ済み
                    </button>
                  )}
                  
                  <div className="text-xs text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    {Math.floor(Math.random() * 1000) + 100}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* 新規アップロードカード */}
          <Link 
            href="/videos/upload"
            className="bg-white shadow rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 h-full min-h-[300px] hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900">新しい動画を追加</p>
            <p className="mt-1 text-xs text-gray-500">クリックしてアップロード</p>
          </Link>
        </div>
      )}
    </div>
  );
}