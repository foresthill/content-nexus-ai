'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, SparklesIcon, ArrowPathIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import DifyDebugStore from './debug-store';
import ResetConfigButton from './reset-config';
import CheckAppType from './check-app-type';
import TestDifyAPI from './test-api';
import useContentStore from '@/store/contentStore';
import { ContentStatus } from '@/types/content';

interface GenerationResult {
  content: {
    title: string;
    body: string;
    summary: string;
    keywords: string[];
    tags: string[];
    metaDescription: string;
    slug: string;
  };
  metadata: {
    workflowRunId: string;
    executionTime: number;
    tokensUsed: number;
    cost: string;
    timestamp: string;
  };
}

export default function DifyGeneratePage() {
  const router = useRouter();
  const { createContent } = useContentStore();
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    contentType: 'blog',
    tone: 'professional',
    length: 'medium',
    targetAudience: '',
    platform: 'web',
    useKnowledge: false,
    customPrompt: '',
    useChat: false, // チャットAPIを使用するかどうか
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // チャットAPIまたは通常のAPIを使用
      const apiUrl = formData.useChat ? '/api/dify/chat/generate' : '/api/dify/content/generate';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
          contentType: formData.contentType,
          tone: formData.tone,
          length: formData.length,
          targetAudience: formData.targetAudience,
          platform: formData.platform,
          useKnowledge: formData.useKnowledge,
          customInputs: formData.customPrompt ? { custom_prompt: formData.customPrompt } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'コンテンツ生成に失敗しました');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!result) return;
    
    setIsSaving(true);
    try {
      // contentStoreを使用して保存
      await createContent({
        title: result.content.title,
        description: result.content.summary || '',
        content: result.content.body,
        author: 'AI Generated',
        category: [formData.contentType],
        tags: result.content.keywords || [],
        status: ContentStatus.DRAFT,
        featuredImage: undefined,
        publishedAt: undefined,
        affiliateLinks: [],
        platforms: [],
      });
      
      alert('コンテンツが保存されました！');
      router.push('/content');
    } catch (error) {
      console.error('Save error:', error);
      alert(`保存エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="h-8 w-8 mr-3 text-indigo-600" />
          AIコンテンツ生成
        </h1>
        <p className="mt-2 text-gray-600">
          Difyワークフローを使用して高品質なコンテンツを自動生成します
        </p>
      </div>

      {/* デバッグ情報 */}
      <div className="mb-4 space-y-2">
        <DifyDebugStore />
        <ResetConfigButton />
        <CheckAppType />
        <TestDifyAPI />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 入力フォーム */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">生成設定</h2>

            {/* トピック */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                トピック <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例: AIマーケティングの最新トレンド"
                required
              />
            </div>

            {/* キーワード */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                キーワード（カンマ区切り）
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例: AI, マーケティング, 自動化, 効率化"
              />
            </div>

            {/* コンテンツタイプ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コンテンツタイプ
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="blog">ブログ記事</option>
                <option value="social">SNS投稿</option>
                <option value="email">メールマガジン</option>
                <option value="product">商品説明</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* トーン */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文体・トーン
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="professional">プロフェッショナル</option>
                <option value="casual">カジュアル</option>
                <option value="friendly">フレンドリー</option>
                <option value="formal">フォーマル</option>
                <option value="creative">クリエイティブ</option>
              </select>
            </div>

            {/* 長さ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コンテンツの長さ
              </label>
              <select
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="short">短い（200-300文字）</option>
                <option value="medium">中程度（500-700文字）</option>
                <option value="long">長い（1000文字以上）</option>
              </select>
            </div>

            {/* ターゲットオーディエンス */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ターゲットオーディエンス
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例: マーケティング担当者、経営者"
              />
            </div>

            {/* ナレッジ使用 */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.useKnowledge}
                  onChange={(e) => setFormData({ ...formData, useKnowledge: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  ナレッジベース（RAG）を使用する
                </span>
              </label>
            </div>

            {/* チャットAPI使用 */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.useChat}
                  onChange={(e) => setFormData({ ...formData, useChat: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  チャットAPIを使用する（チャットアプリの場合）
                </span>
              </label>
              {formData.useChat && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Difyアプリがチャットタイプの場合はこちらを選択してください
                </p>
              )}
            </div>

            {/* カスタムプロンプト */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                追加の指示（オプション）
              </label>
              <textarea
                value={formData.customPrompt}
                onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="特別な要望や詳細な指示があればここに入力してください"
              />
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* 生成ボタン */}
            <button
              type="submit"
              disabled={isGenerating || !formData.topic}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  コンテンツを生成
                </>
              )}
            </button>
          </form>
        </div>

        {/* 結果表示 */}
        <div>
          {result ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-green-600" />
                生成結果
              </h2>

              {/* タイトル */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{result.content.title}</h3>
              </div>

              {/* 本文 */}
              <div className="mb-4">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{result.content.body}</p>
                </div>
              </div>

              {/* サマリー */}
              {result.content.summary && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-900">
                    <strong>要約:</strong> {result.content.summary}
                  </p>
                </div>
              )}

              {/* キーワード・タグ */}
              <div className="mb-4">
                {result.content.keywords.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">キーワード: </span>
                    {result.content.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs mr-1"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* メタデータ */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">生成情報</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-600">実行時間:</dt>
                  <dd className="text-gray-900">{result.metadata.executionTime}ms</dd>
                  <dt className="text-gray-600">使用トークン:</dt>
                  <dd className="text-gray-900">{result.metadata.tokensUsed}</dd>
                  <dt className="text-gray-600">コスト:</dt>
                  <dd className="text-gray-900">${result.metadata.cost}</dd>
                </dl>
              </div>

              {/* アクションボタン */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      保存中...
                    </>
                  ) : (
                    'コンテンツを保存'
                  )}
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  新規生成
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                左側のフォームに必要事項を入力して、コンテンツを生成してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}