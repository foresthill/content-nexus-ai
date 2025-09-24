'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onMenuToggle }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ContentNexus ロゴアイコン
  const ContentNexusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* 中央のネクサス（接続点） */}
      <circle cx="16" cy="16" r="4" fill="url(#logo-gradient)" />
      {/* 放射状の接続線 */}
      <path d="M16 4 L16 12 M28 16 L20 16 M16 28 L16 20 M4 16 L12 16" 
            stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" />
      {/* 角の接続点 */}
      <circle cx="8" cy="8" r="2" fill="url(#logo-gradient)" opacity="0.7" />
      <circle cx="24" cy="8" r="2" fill="url(#logo-gradient)" opacity="0.7" />
      <circle cx="8" cy="24" r="2" fill="url(#logo-gradient)" opacity="0.7" />
      <circle cx="24" cy="24" r="2" fill="url(#logo-gradient)" opacity="0.7" />
      {/* 対角線の接続線 */}
      <path d="M10.5 10.5 L13.5 13.5 M21.5 10.5 L18.5 13.5 M10.5 21.5 L13.5 18.5 M21.5 21.5 L18.5 18.5" 
            stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左側: ロゴとメニューボタン */}
          <div className="flex items-center space-x-4">
            {/* モバイルメニューボタン */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* ロゴ */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <ContentNexusIcon className="h-8 w-8 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ContentNexus
                </h1>
                <p className="text-xs text-gray-500 -mt-1">AI-Powered Content Hub</p>
              </div>
            </Link>
          </div>

          {/* 中央: ナビゲーションメニュー */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50">
                ダッシュボード
              </Link>
              <Link href="/content" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50">
                コンテンツ
              </Link>
              <Link href="/x-post" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50">
                𝕏 投稿
              </Link>
              <Link href="/ai/generate" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50">
                AI生成
              </Link>
              <Link href="/social/analytics" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50">
                分析
              </Link>
            </nav>
          </div>

          {/* 右側: アクション群 */}
          <div className="flex items-center space-x-2">
            {/* モバイル検索ボタン */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* 通知ボタン */}
            <button className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 設定ドロップダウン */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              {/* 設定ドロップダウンメニュー */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">設定</p>
                  </div>
                  
                  <Link
                    href="/settings/dify"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    AI設定 (Dify)
                  </Link>
                  
                  <Link
                    href="/settings/openrouter"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.44L19.55 8.5L12 12.56L4.45 8.5L12 4.44ZM4 9.78L11 13.78V20.11L4 16.22V9.78ZM20 16.22L13 20.11V13.78L20 9.78V16.22Z"/>
                    </svg>
                    AI設定 (Openrouter)
                  </Link>
                  
                  <Link
                    href="/settings/twitter"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.0956Z" />
                    </svg>
                    Twitter API設定
                  </Link>
                  
                  <Link
                    href="/settings/n8n"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    n8n連携設定
                  </Link>
                </div>
              )}
            </div>

            {/* プロフィールボタン */}
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </div>

      {/* プログレスバー（オプション） */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity"></div>
    </header>
  );
};
