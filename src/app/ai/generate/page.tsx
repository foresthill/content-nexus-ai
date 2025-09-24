'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SparklesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CogIcon,
  BookmarkIcon,
  PaperAirplaneIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';
import { useTwitterStore } from '@/store/twitterStore';
import { smartSplitText } from '@/lib/twitter/utils';

type ContentType = 'blog' | 'social' | 'general';
type Tone = 'professional' | 'casual' | 'friendly' | 'formal' | 'creative';
type Length = 'short' | 'medium' | 'long';
type Language = 'ja' | 'en' | 'zh' | 'ko' | 'es' | 'fr' | 'de';

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
  const [language, setLanguage] = useState<Language>('ja');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [showThreadPreview, setShowThreadPreview] = useState(false);
  const [threadTweets, setThreadTweets] = useState<string[]>([]);

  const createContent = useContentStore((state) => state.createContent);
  const { isConfigured: isTwitterConfigured, isConnected: isTwitterConnected, loadFromDB, username } = useTwitterStore();
  const router = useRouter();

  // コンポーネントマウント時にTwitter設定を確認
  useEffect(() => {
    loadFromDB(); // DBから設定を読み込み
  }, []);

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
            language,
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

  const handleSaveContent = async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      const { data } = result;

      // Difyコンテンツとして保存
      const response = await fetch('/api/dify/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title || `AI Generated - ${new Date().toLocaleDateString()}`,
          content: data.content,
          summary: data.summary || data.content.substring(0, 200) + '...',
          tags: data.keywords || [],
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      // プラットフォーム情報を設定（必ずTwitterを含める - 全タイプで投稿可能）
      const platformsData = [{
        type: 'TWITTER' as any,
        status: 'DRAFT' as any,
        scheduledAt: new Date()
      }];

      // ローカルストアにも保存
      await createContent({
        title: data.title || `AI Generated Content - ${new Date().toLocaleDateString()}`,
        description: data.summary || data.content.substring(0, 200) + '...',
        content: data.content,
        author: 'AI Generated',
        category: ['AI Generated'],
        tags: data.keywords || [],
        status: 'DRAFT' as any,
        featuredImage: '',
        publishedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        affiliateLinks: [],
        platforms: platformsData,
      });

      alert('コンテンツが保存されました！');
    } catch (err) {
      console.error('Save error:', err);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostToTwitter = async () => {
    if (!result || contentType !== 'social') return;

    const postText = result.data.content.trim();

    // 280文字を超える場合はスレッド投稿のプレビューを表示
    if (postText.length > 280) {
      const tweets = smartSplitText(postText, 280);
      setThreadTweets(tweets);
      setShowThreadPreview(true);
      return;
    }

    setIsPosting(true);
    setPostResult(null);

    try {
      const response = await fetch('/api/social/twitter/simple-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: postText,
          userId: 'temp-user-id' // 一時的なユーザーID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPostResult({
          success: true,
          message: 'Xへの投稿に成功しました！',
          url: data.url || `https://twitter.com/i/web/status/${data.id}`,
        });

        // 投稿成功時、コンテンツをストアに保存（まだ保存されていない場合）
        if (result) {
          try {
            await createContent({
              title: result.data.title || `X Post - ${new Date().toLocaleDateString()}`,
              description: result.data.summary || result.data.content.substring(0, 200) + '...',
              content: result.data.content,
              author: 'AI Generated',
              category: ['Social Media', 'X (Twitter)'],
              tags: result.data.hashtags || result.data.keywords || [],
              status: 'PUBLISHED' as any,
              featuredImage: '',
              publishedAt: new Date(),
              updatedAt: new Date(),
              createdAt: new Date(),
              affiliateLinks: [],
              platforms: [{
                type: 'TWITTER' as any,
                url: data.url || `https://twitter.com/i/web/status/${data.id}`,
                publishedAt: new Date(),
                engagement: {
                  likes: 0,
                  comments: 0,
                  shares: 0
                }
              }],
            });
          } catch (err) {
            console.error('Failed to save posted content:', err);
          }
        }
      } else {
        setPostResult({
          success: false,
          message: data.error || '投稿に失敗しました'
        });
      }
    } catch (error) {
      console.error('Post error:', error);
      setPostResult({
        success: false,
        message: 'ネットワークエラーが発生しました'
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostThread = async () => {
    if (threadTweets.length === 0) return;

    setIsPosting(true);
    setPostResult(null);
    setShowThreadPreview(false);

    try {
      // 現在は単一投稿のAPIしかないため、最初のツイートのみ投稿
      // TODO: スレッド投稿APIを実装
      const response = await fetch('/api/social/twitter/simple-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: threadTweets[0],
          userId: 'temp-user-id' // 一時的なユーザーID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPostResult({
          success: true,
          message: `スレッドの最初のツイートを投稿しました！（全${threadTweets.length}件）`,
          url: data.url || `https://twitter.com/i/web/status/${data.id}`,
        });
      } else {
        setPostResult({
          success: false,
          message: data.error || '投稿に失敗しました'
        });
      }
    } catch (error) {
      console.error('Thread post error:', error);
      setPostResult({
        success: false,
        message: 'ネットワークエラーが発生しました'
      });
    } finally {
      setIsPosting(false);
    }
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
                  {/* 言語 */}
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      言語
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ko">한국어</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

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
                      <button
                        onClick={handleSaveContent}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <BookmarkIcon className="h-4 w-4 mr-1" />
                            保存
                          </>
                        )}
                      </button>
                      {isTwitterConfigured && isTwitterConnected && (
                        <button
                          onClick={handlePostToTwitter}
                          disabled={isPosting}
                          className="px-3 py-1.5 text-sm bg-black hover:bg-gray-800 text-white rounded-lg flex items-center transition-colors disabled:opacity-50"
                        >
                          {isPosting ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                              投稿中...
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                              Xに投稿
                            </>
                          )}
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

            {/* 投稿結果表示 */}
            {postResult && (
              <div className={`rounded-lg p-4 ${
                postResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {postResult.success ? (
                    <CheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      postResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {postResult.message}
                    </p>
                    {postResult.success && postResult.url && (
                      <a
                        href={postResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-sm text-green-700 hover:text-green-900 underline"
                      >
                        投稿を表示
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* スレッドプレビューモーダル */}
            {showThreadPreview && threadTweets.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      スレッド投稿プレビュー（全{threadTweets.length}件）
                    </h3>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                      {threadTweets.map((tweet, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{index + 1}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 whitespace-pre-wrap">{tweet}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {tweet.length}/280文字
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowThreadPreview(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handlePostThread}
                        disabled={isPosting}
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg flex items-center transition-colors disabled:opacity-50"
                      >
                        {isPosting ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                            投稿中...
                          </>
                        ) : (
                          <>
                            <QueueListIcon className="h-4 w-4 mr-2" />
                            スレッドを投稿
                          </>
                        )}
                      </button>
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