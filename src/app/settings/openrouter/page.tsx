'use client';

import { useState, useEffect } from 'react';
import { 
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface OpenrouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export default function OpenrouterSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [models, setModels] = useState<OpenrouterModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-sonnet:beta');
  const [isLoading, setIsLoading] = useState(false);

  // 設定の読み込み
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/openrouter/config');
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey || '');
        setSelectedModel(data.model || 'anthropic/claude-3-sonnet:beta');
        setIsConfigured(data.isConfigured || false);
      }
    } catch (error) {
      console.error('設定の読み込みに失敗:', error);
    }
  };

  const saveConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/openrouter/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
        }),
      });

      if (response.ok) {
        setIsConfigured(true);
        setTestMessage('設定が保存されました');
        setTestStatus('success');
      } else {
        throw new Error('設定の保存に失敗しました');
      }
    } catch (error) {
      setTestMessage('設定の保存に失敗しました');
      setTestStatus('error');
      console.error('設定保存エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      setTestMessage('APIキーを入力してください');
      setTestStatus('error');
      return;
    }

    try {
      setTestStatus('testing');
      setTestMessage('接続をテストしています...');

      const response = await fetch('/api/openrouter/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestStatus('success');
        setTestMessage(`接続成功！モデル: ${data.model}`);
      } else {
        setTestStatus('error');
        setTestMessage(`接続失敗: ${data.error}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('接続テストでエラーが発生しました');
      console.error('接続テストエラー:', error);
    }
  };

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/openrouter/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('モデル一覧の取得に失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 人気のモデル一覧
  const popularModels = [
    { id: 'anthropic/claude-3-sonnet:beta', name: 'Claude 3 Sonnet', description: '高品質で汎用的なAI' },
    { id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku', description: '高速で効率的なAI' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'OpenAIの最新高性能モデル' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'コスト効率的なモデル' },
    { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Googleの高性能AI' },
    { id: 'meta-llama/llama-2-70b-chat', name: 'Llama 2 70B', description: 'Metaのオープンソースモデル' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
            Openrouter AI設定
          </h1>
          <p className="mt-2 text-gray-600">
            Openrouter経由で複数のAIモデルにアクセスしてコンテンツを生成します。
          </p>
        </div>

        {/* 設定フォーム */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            API設定
          </h2>

          <div className="space-y-4">
            {/* APIキー */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Openrouter API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Openrouter Dashboard
                </a>
                でAPIキーを取得してください
              </p>
            </div>

            {/* モデル選択 */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                AIモデル
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {popularModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                用途に応じて最適なAIモデルを選択してください
              </p>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={saveConfig}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" /> : null}
              設定を保存
            </button>

            <button
              onClick={testConnection}
              disabled={testStatus === 'testing' || !apiKey}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              接続テスト
            </button>
          </div>

          {/* テスト結果 */}
          {testStatus !== 'idle' && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              testStatus === 'success' ? 'bg-green-50 text-green-800' :
              testStatus === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {testStatus === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {testStatus === 'error' && <XCircleIcon className="h-5 w-5 mr-2" />}
              {testStatus === 'testing' && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
              <span className="text-sm">{testMessage}</span>
            </div>
          )}
        </div>

        {/* 使用方法ガイド */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 使用方法</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900">1. Openrouter APIキーを取得</h3>
              <p>
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Openrouter Dashboard
                </a>
                でアカウントを作成し、APIキーを生成してください。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">2. AIモデルを選択</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Claude 3 Sonnet</strong>: 高品質な文章生成</li>
                <li><strong>GPT-4 Turbo</strong>: 複雑なタスクに対応</li>
                <li><strong>Gemini Pro</strong>: Googleの高性能AI</li>
                <li><strong>Llama 2</strong>: オープンソースモデル</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">3. コンテンツ生成</h3>
              <p>
                設定完了後、
                <a 
                  href="/ai/generate" 
                  className="text-purple-600 hover:underline ml-1"
                >
                  AI生成ページ
                </a>
                でコンテンツを生成できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}