'use client';

import React, { useState, useEffect } from 'react';
import { useDifyStore } from '@/store/difyStore';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const DifyConfigPanel: React.FC = () => {
  const {
    config,
    isConfigured,
    isConnected,
    connectionError,
    setConfig,
    testConnection,
    clearConfig,
  } = useDifyStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: config?.apiKey || '',
    baseUrl: config?.baseUrl || 'https://api.dify.ai/v1',
    appId: config?.appId || '',
  });
  const [isLocalDify, setIsLocalDify] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // 初回レンダリング時に、configがあるのにisConfiguredがfalseの場合は修正
  useEffect(() => {
    if (config && config.apiKey && !isConfigured) {
      setConfig(config);
    }
  }, [config, isConfigured, setConfig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // APIエンドポイントに設定を保存
      const response = await fetch('/api/dify/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました');
      }

      // ローカルストアも更新
      setConfig(formData);
      
      // 接続テストを実行
      setTimeout(async () => {
        await handleTestConnection();
      }, 100);
    } catch (error) {
      console.error('Save error:', error);
      alert('設定の保存に失敗しました');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const success = await testConnection();
    setIsTesting(false);
  };

  const handleClearConfig = () => {
    if (window.confirm('Dify設定をクリアしてもよろしいですか？')) {
      clearConfig();
      setFormData({
        apiKey: '',
        baseUrl: 'https://api.dify.ai/v1',
        appId: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Dify接続設定</h2>

      <div className="space-y-4">
        {/* API Key Input */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="app-xxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* Base URL Input */}
        <div>
          <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
          </label>
          <input
            type="text"
            id="baseUrl"
            name="baseUrl"
            value={formData.baseUrl}
            onChange={handleInputChange}
            placeholder="https://api.dify.ai/v1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            DifyのAPIエンドポイントURL
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p>• Dify Cloud: <code className="bg-gray-100 px-1">https://api.dify.ai/v1</code></p>
            <p>• ローカル環境: <code className="bg-gray-100 px-1">http://localhost:3000/v1</code> (ポート番号を確認)</p>
            <p>• 現在の設定: <code className="bg-gray-100 px-1">{formData.baseUrl}</code></p>
          </div>
        </div>

        {/* App ID Input (Optional) */}
        <div>
          <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-1">
            App ID (オプション)
          </label>
          <input
            type="text"
            id="appId"
            name="appId"
            value={formData.appId}
            onChange={handleInputChange}
            placeholder="特定のアプリケーションIDを指定"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Connection Status */}
        {isConfigured && (
          <div className="p-4 rounded-md bg-gray-50">
            <div className="flex items-center">
              {isConnected ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700">接続済み</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    {connectionError || '未接続'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={!formData.apiKey || isTesting}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '接続テスト中...' : '保存して接続テスト'}
          </button>
          
          {isConfigured && (
            <button
              onClick={handleClearConfig}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
            >
              設定をクリア
            </button>
          )}
        </div>
      </div>

      {/* Usage Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">Difyの使い方</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Difyにログインし、アプリケーションを作成</li>
          <li>アプリケーション設定からAPI Keyを取得</li>
          <li>上記フォームにAPI Keyを入力して保存</li>
          <li>接続テストが成功したら、コンテンツ作成・改善でDifyを利用可能</li>
        </ol>
      </div>
    </div>
  );
};