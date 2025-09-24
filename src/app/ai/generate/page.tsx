'use client';

import { useState } from 'react';
import { 
  SparklesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';

type ContentType = 'blog' | 'social' | 'general';
type Tone = 'professional' | 'casual' | 'friendly' | 'formal' | 'creative';
type Length = 'short' | 'medium' | 'long';

interface GenerationResult {
  success: boolean;
  type: ContentType;
  data: {
    title?: string;
    content: string;
    summary?: string;
    keywords?: string[];
    metaDescription?: string;
    hashtags?: string[];
    wordCount?: number;
    characterCount: number;
    metadata: {
      model: string;
      timestamp: string;
      [key: string]: any;
    };
  };
}

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<ContentType>('general');
  const [tone, setTone] = useState<Tone>('professional');
  const [length, setLength] = useState<Length>('medium');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { addContent } = useContentStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください');
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: contentType,
          options: {
            tone,
            length,
            keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'コンテンツ生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.data.content) return;
    
    try {
      await navigator.clipboard.writeText(result.data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleSaveContent = () => {
    if (!result) return;

    const { data } = result;
    
    addContent({
      title: data.title || `AI Generated Content - ${new Date().toLocaleDateString()}`,
      content: data.content,
      summary: data.summary || data.content.substring(0, 200) + '...',
      tags: data.keywords || [],
      status: 'draft' as const,
      publishedAt: null,
      slug: '',
      metaDescription: data.metaDescription || '',
      featuredImage: null,
    });

    alert('コンテンツがドラフトとして保存されました！');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
            AI コンテンツ生成
          </h1>
          <p className="mt-2 text-gray-600">
            Openrouter経由で複数のAIモデルを使用してコンテンツを生成します
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 入力フォーム */}
          <div className="space-y-6">
            {/* プロンプト入力 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                コンテンツ生成設定
              </h2>

              <div className="space-y-4">
                {/* コンテンツタイプ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コンテンツタイプ
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setContentType('general')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        contentType === 'general'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <PencilSquareIcon className="h-5 w-5 mx-auto mb-1" />
                      一般
                    </button>
                    <button
                      onClick={() => setContentType('blog')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        contentType === 'blog'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <DocumentTextIcon className="h-5 w-5 mx-auto mb-1" />
                      ブログ
                    </button>
                    <button
                      onClick={() => setContentType('social')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        contentType === 'social'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mx-auto mb-1" />
                      SNS
                    </button>
                  </div>
                </div>

                {/* プロンプト */}
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    プロンプト
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      contentType === 'blog' 
                        ? 'ブログ記事のトピックを入力してください（例：「AIを活用したマーケティング戦略」）'
                        : contentType === 'social'
                        ? 'SNS投稿の内容を入力してください（例：「新製品のローンチ告知」）'
                        : '生成したいコンテンツの内容を具体的に入力してください'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 詳細設定 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* トーン */}
                  <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                      トーン
                    </label>
                    <select
                      id="tone"
                      value={tone}
                      onChange={(e) => setTone(e.target.value as Tone)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="professional">プロフェッショナル</option>
                      <option value="casual">カジュアル</option>
                      <option value="friendly">フレンドリー</option>
                      <option value="formal">フォーマル</option>
                      <option value="creative">クリエイティブ</option>
                    </select>
                  </div>

                  {/* 長さ */}
                  <div>
                    <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                      長さ
                    </label>
                    <select
                      id="length"
                      value={length}
                      onChange={(e) => setLength(e.target.value as Length)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="short">短い</option>
                      <option value="medium">中程度</option>
                      <option value="long">長い</option>
                    </select>
                  </div>
                </div>

                {/* キーワード */}
                {contentType === 'blog' && (
                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                      キーワード（カンマ区切り）
                    </label>
                    <input
                      type="text"
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="マーケティング, AI, デジタル変革"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* 生成ボタン */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      コンテンツを生成
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 設定リンク */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CogIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">
                    Openrouter API設定が必要です
                  </p>
                  <p className="text-blue-700 mt-1">
                    <Link 
                      href="/settings/openrouter" 
                      className="underline hover:text-blue-900"
                    >
                      設定ページ
                    </Link>
                    でAPIキーとモデルを設定してください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 結果表示 */}
          <div className="space-y-6">
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">エラーが発生しました</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 生成結果 */}
            {result && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      生成結果
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            コピー済み
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                            コピー
                          </>
                        )}
                      </button>
                      {result.type === 'blog' && (
                        <button
                          onClick={handleSaveContent}
                          className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                          保存
                        </button>
                      )}
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">モデル:</span> {result.data.metadata.model}
                      </div>
                      <div>
                        <span className="font-medium">文字数:</span> {result.data.characterCount.toLocaleString()}
                      </div>
                      {result.data.wordCount && (
                        <div>
                          <span className="font-medium">単語数:</span> {result.data.wordCount.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">生成時刻:</span> {new Date(result.data.metadata.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* ブログ記事の場合 */}
                  {result.type === 'blog' && result.data.title && (
                    <div className="mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {result.data.title}
                      </h4>
                      {result.data.summary && (
                        <p className="text-gray-600 italic mb-4">
                          {result.data.summary}
                        </p>
                      )}
                      {result.data.keywords && result.data.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.data.keywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SNS投稿の場合 */}
                  {result.type === 'social' && result.data.hashtags && result.data.hashtags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {result.data.hashtags.map((hashtag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* コンテンツ本文 */}
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {result.data.content}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* プレースホルダー */}
            {!result && !error && !isGenerating && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-dashed">
                <div className="p-12 text-center">
                  <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    プロンプトを入力してコンテンツを生成してください
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}