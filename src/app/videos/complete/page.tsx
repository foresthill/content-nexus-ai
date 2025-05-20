'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useVideoStore from '@/store/videoStore';
import { VideoType } from '@/types/video';

export default function VideoCompletePage() {
  const router = useRouter();
  const { videos } = useVideoStore();
  
  // 最新の動画を取得（実際のアプリでは特定のIDを使用します）
  const [currentVideo] = useState(videos.length > 0 ? videos[videos.length - 1] : null);
  
  // プログレスステータス
  const [exportProgress, setExportProgress] = useState({
    tiktok: { progress: 0, status: 'pending' },
    youtube: { progress: 0, status: 'pending' },
    instagram: { progress: 0, status: 'pending' },
    line: { progress: 0, status: 'pending' },
  });
  
  // エクスポート処理のシミュレーション
  useEffect(() => {
    if (!currentVideo) return;
    
    // TikTokとYouTubeへのエクスポートをシミュレート
    const simulateExport = (platform: 'tiktok' | 'youtube' | 'instagram' | 'line', delay: number) => {
      let progress = 0;
      setExportProgress(prev => ({
        ...prev,
        [platform]: { progress: 0, status: 'processing' }
      }));
      
      const interval = setInterval(() => {
        progress += 5;
        
        if (progress >= 100) {
          clearInterval(interval);
          setExportProgress(prev => ({
            ...prev,
            [platform]: { progress: 100, status: 'completed' }
          }));
          return;
        }
        
        setExportProgress(prev => ({
          ...prev,
          [platform]: { ...prev[platform], progress }
        }));
      }, delay);
    };
    
    // TikTok エクスポート
    simulateExport('tiktok', 300);
    
    // YouTube エクスポート (少し遅らせる)
    setTimeout(() => {
      simulateExport('youtube', 400);
    }, 1000);
    
  }, [currentVideo]);
  
  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">動画が見つかりません。動画をアップロードしてください。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">動画処理完了</h1>
        <Link 
          href="/videos" 
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          動画一覧に戻る
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* 動画プレビュー */}
            <div className="w-full md:w-1/3">
              <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                <video 
                  src={currentVideo.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
            
            {/* 動画情報 */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{currentVideo.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{currentVideo.duration}秒 • {new Date().toLocaleDateString()}</p>
              
              <div className="mt-3">
                <p className="text-sm text-gray-700">{currentVideo.description}</p>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {currentVideo.tags.map((tag, i) => (
                  <span key={i} className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* 動画統計 (プレースホルダー) */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">予想視聴回数</p>
                  <p className="text-lg font-semibold text-gray-900">1.2k-2.4k</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">予想エンゲージメント</p>
                  <p className="text-lg font-semibold text-gray-900">100-200</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">予想リーチ数</p>
                  <p className="text-lg font-semibold text-gray-900">5k-10k</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* エクスポートステータス */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">エクスポートステータス</h3>
            
            <div className="space-y-4">
              {/* TikTok */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <h4 className="font-medium text-gray-900">TikTok</h4>
                  </div>
                  <div>
                    {exportProgress.tiktok.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        完了
                      </span>
                    ) : exportProgress.tiktok.status === 'processing' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        処理中
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        待機中
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${exportProgress.tiktok.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${exportProgress.tiktok.progress}%` }}
                  ></div>
                </div>
                
                {exportProgress.tiktok.status === 'completed' && (
                  <div className="mt-3 flex justify-between">
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      動画をダウンロード
                    </a>
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                      </svg>
                      TikTokに投稿
                    </a>
                  </div>
                )}
              </div>
              
              {/* YouTube Shorts */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <h4 className="font-medium text-gray-900">YouTube Shorts</h4>
                  </div>
                  <div>
                    {exportProgress.youtube.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        完了
                      </span>
                    ) : exportProgress.youtube.status === 'processing' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        処理中
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        待機中
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${exportProgress.youtube.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${exportProgress.youtube.progress}%` }}
                  ></div>
                </div>
                
                {exportProgress.youtube.status === 'completed' && (
                  <div className="mt-3 flex justify-between">
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      動画をダウンロード
                    </a>
                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z" />
                      </svg>
                      YouTubeに投稿
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 次のアクション */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">次のアクション</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                </svg>
                <h4 className="text-sm font-medium text-indigo-900 mb-1">関連記事を作成</h4>
                <p className="text-xs text-indigo-700 mb-3">動画に合わせたアフィリエイト記事を生成</p>
                <button className="mt-auto text-xs bg-indigo-600 text-white py-1.5 px-3 rounded hover:bg-indigo-700 transition-colors">
                  記事を作成
                </button>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h4 className="text-sm font-medium text-indigo-900 mb-1">投稿スケジュール設定</h4>
                <p className="text-xs text-indigo-700 mb-3">最適な時間に各プラットフォームへ投稿</p>
                <button className="mt-auto text-xs bg-indigo-600 text-white py-1.5 px-3 rounded hover:bg-indigo-700 transition-colors">
                  スケジュール設定
                </button>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <h4 className="text-sm font-medium text-indigo-900 mb-1">新しい動画を作成</h4>
                <p className="text-xs text-indigo-700 mb-3">次の動画コンテンツをアップロード</p>
                <Link 
                  href="/videos/upload" 
                  className="mt-auto text-xs bg-indigo-600 text-white py-1.5 px-3 rounded hover:bg-indigo-700 transition-colors"
                >
                  新規アップロード
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}