'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface ModernHeaderProps {
  onMenuToggle?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onMenuToggle }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

          {/* 中央: 検索バー */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${isSearchFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                placeholder="コンテンツを検索..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
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

            {/* 設定ボタン */}
            <Link
              href="/settings"
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </Link>

            {/* プロフィールドロップダウン */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ドロップダウンメニュー */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">ユーザー</p>
                    <p className="text-xs text-gray-500">user@example.com</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    プロフィール
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    設定
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* プログレスバー（オプション） */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity"></div>
    </header>
  );
};
