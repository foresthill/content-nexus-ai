'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TwitterSettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Twitter認証状態をチェック
    const accessToken = localStorage.getItem('twitter_access_token');
    const accessTokenSecret = localStorage.getItem('twitter_access_token_secret');
    const savedUserInfo = localStorage.getItem('twitter_user_info');
    
    if (accessToken && accessTokenSecret) {
      setIsConnected(true);
      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Twitter OAuth認証フローを開始
      const response = await fetch('/api/auth/twitter');
      const data = await response.json();
      
      if (data.authUrl) {
        // OAuth認証画面にリダイレクト
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Twitter認証エラー:', error);
      alert('Twitter認証の開始に失敗しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Twitter認証情報を削除
    localStorage.removeItem('twitter_access_token');
    localStorage.removeItem('twitter_access_token_secret');
    localStorage.removeItem('twitter_user_info');
    setIsConnected(false);
    setUserInfo(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Twitter設定</h1>
          <p className="text-gray-600 mt-1">
            Twitterアカウントと連携して、生成したコンテンツを直接投稿できます
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/settings" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            設定一覧へ戻る
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">アカウント連携</h2>
            
            {isConnected ? (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Twitter連携済み</p>
                      {userInfo && (
                        <p className="text-sm text-gray-600">@{userInfo.screen_name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    連携を解除
                  </button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Twitter未連携</p>
                      <p className="text-sm text-gray-600">アカウントを連携してコンテンツを投稿</p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                      isConnecting 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        連携中...
                      </>
                    ) : (
                      'Twitterと連携'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">使い方</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mr-3">
                  1
                </span>
                <p>上記の「Twitterと連携」ボタンをクリックして、Twitterアカウントと連携します。</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mr-3">
                  2
                </span>
                <p>Twitterの認証画面で、アプリケーションのアクセスを許可します。</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium mr-3">
                  3
                </span>
                <p>連携が完了したら、コンテンツ生成画面から直接Twitterに投稿できるようになります。</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">注意事項</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Twitter APIの利用制限により、1日あたりの投稿数に制限があります。</li>
              <li>投稿内容は280文字以内に自動的に調整されます。</li>
              <li>アカウント連携情報は安全に暗号化されて保存されます。</li>
              <li>連携を解除すると、保存されている認証情報は完全に削除されます。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}