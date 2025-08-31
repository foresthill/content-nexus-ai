'use client';

import React, { useState, useEffect } from 'react';
import { useTwitterStore } from '@/store/twitterStore';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export const TwitterConfigPanel: React.FC = () => {
  const {
    config,
    isConfigured,
    isConnected,
    connectionError,
    setConfig,
    testConnection,
    clearConfig,
  } = useTwitterStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showAccessTokenSecret, setShowAccessTokenSecret] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: config?.apiKey || '',
    apiSecret: config?.apiSecret || '',
    accessToken: config?.accessToken || '',
    accessTokenSecret: config?.accessTokenSecret || '',
  });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        accessToken: config.accessToken,
        accessTokenSecret: config.accessTokenSecret,
      });
    }
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // APIエンドポイントに設定を保存
      const response = await fetch('/api/twitter/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました');
      }

      // Zustandストアに保存
      setConfig(formData);
      
      // 接続テストを実行
      await handleTestConnection();
    } catch (error) {
      console.error('Twitter API設定の保存に失敗:', error);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearConfig();
    setFormData({
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      accessTokenSecret: '',
    });
  };

  const isFormValid = formData.apiKey && formData.apiSecret && formData.accessToken && formData.accessTokenSecret;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Twitter/X API設定</h3>
            <p className="text-sm text-gray-500">Twitter Developer Portalから取得したAPIキーを設定してください</p>
          </div>
        </div>
        {isConfigured && (
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">接続済み</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <XCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">未接続</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="your_twitter_api_key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiKey ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* API Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Secret <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiSecret ? 'text' : 'password'}
              name="apiSecret"
              value={formData.apiSecret}
              onChange={handleInputChange}
              placeholder="your_twitter_api_secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiSecret(!showApiSecret)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showApiSecret ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Access Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showAccessToken ? 'text' : 'password'}
              name="accessToken"
              value={formData.accessToken}
              onChange={handleInputChange}
              placeholder="your_twitter_access_token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowAccessToken(!showAccessToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showAccessToken ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Access Token Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token Secret <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showAccessTokenSecret ? 'text' : 'password'}
              name="accessTokenSecret"
              value={formData.accessTokenSecret}
              onChange={handleInputChange}
              placeholder="your_twitter_access_token_secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowAccessTokenSecret(!showAccessTokenSecret)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showAccessTokenSecret ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* エラーメッセージ */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">接続エラー</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{connectionError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 設定ガイド */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Twitter API設定ガイド</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Twitter Developer Portal</a> にアクセス</p>
            <p>2. アプリを作成し、API Keys and Tokensタブを開く</p>
            <p>3. 「Consumer Keys」と「Authentication Tokens」を取得</p>
            <p>4. 上記フォームに入力して「設定を保存」をクリック</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            設定を保存
          </button>
          
          {isConfigured && (
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isTesting ? '接続テスト中...' : '接続テスト'}
            </button>
          )}
          
          {isConfigured && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              設定をクリア
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
