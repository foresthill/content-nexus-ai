'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, PhotoIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PostResult {
  success: boolean;
  message: string;
  url?: string;
  id?: string;
  postId?: string;
}

interface PostStats {
  total: number;
  published: number;
  failed: number;
  scheduled: number;
  successRate: number;
}

interface SavedPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  platformPostId?: string;
  createdAt: string;
  publishedAt?: string;
  failedAt?: string;
  failureReason?: string;
  url?: string;
}

interface MediaFile {
  file: File;
  preview: string;
  id: string;
}

export default function XPostPage() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<PostResult | null>(null);
  const [recentPosts, setRecentPosts] = useState<SavedPost[]>([]);
  const [postStats, setPostStats] = useState<PostStats>({
    total: 0,
    published: 0,
    failed: 0,
    scheduled: 0,
    successRate: 0,
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 投稿履歴を読み込む関数
  const loadPostHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/social/posts?platform=TWITTER&limit=10');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentPosts(data.data.posts);
          setPostStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('投稿履歴の読み込みに失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時に投稿履歴を読み込み
  useEffect(() => {
    loadPostHistory();
  }, []);

  const maxLength = 280;
  const remainingChars = maxLength - text.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars > 0;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // テキストエリアの高さを自動調整
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      (file.type.startsWith('image/') || file.type.startsWith('video/')) && 
      file.size <= 5 * 1024 * 1024 // 5MB制限
    ).slice(0, 4 - media.length); // 最大4枚まで

    const newMediaFiles: MediaFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setMedia(prev => [...prev, ...newMediaFiles].slice(0, 4));
  };

  const removeMedia = (id: string) => {
    setMedia(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // URLを解放してメモリリークを防ぐ
      const removed = prev.find(item => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  };

  const handlePost = async () => {
    if (!text.trim() || isOverLimit || isPosting) return;

    setIsPosting(true);
    setPostResult(null);

    try {
      // スケジュール投稿の場合（将来実装）
      if (scheduledAt) {
        setPostResult({
          success: false,
          message: 'スケジュール投稿機能は開発中です。現在は即座投稿のみ対応しています。'
        });
        setIsPosting(false);
        return;
      }

      // メディア付き投稿の場合の警告（現在はテキストのみ対応）
      if (media.length > 0) {
        setPostResult({
          success: false,
          message: 'メディア付き投稿機能は開発中です。現在はテキストのみ対応しています。'
        });
        setIsPosting(false);
        return;
      }

      const response = await fetch('/api/social/twitter/simple-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const result: PostResult = {
          success: true,
          message: data.message,
          url: data.url || `https://twitter.com/i/web/status/${data.id}`,
          id: data.id,
          postId: data.postId
        };
        setPostResult(result);
        
        // 投稿履歴を再読み込み
        await loadPostHistory();
        
        setText(''); // 成功時のみテキストをクリア
        setMedia([]);
        setScheduledAt('');
        setShowScheduler(false);
        
        // テキストエリアの高さをリセット
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        setPostResult({
          success: false,
          message: data.error || '投稿に失敗しました'
        });
        
        // エラー時も履歴を再読み込み（失敗記録が保存されている可能性があるため）
        await loadPostHistory();
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      setPostResult({
        success: false,
        message: 'ネットワークエラーが発生しました。接続を確認してください。'
      });
      
      // ネットワークエラー時も履歴を再読み込み
      await loadPostHistory();
    } finally {
      setIsPosting(false);
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return 'text-red-500';
    if (isNearLimit) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const progressPercentage = Math.min((text.length / maxLength) * 100, 100);
  const getProgressColor = () => {
    if (isOverLimit) return 'stroke-red-500';
    if (isNearLimit) return 'stroke-yellow-500';
    return 'stroke-blue-500';
  };

  // 統計は状態から取得（データベースベース）
  const { total: todayTotal, published, failed, successRate } = postStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-black shadow-lg border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">𝕏</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">X (Twitter) 投稿</h1>
              <p className="text-gray-300">今何が起こってる？世界とつながろう。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* メイン投稿エリア */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* 投稿フォーム */}
              <div className="p-6">
                {/* ユーザー情報 */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">あ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">あなた</p>
                    <p className="text-sm text-gray-500">@your_username</p>
                  </div>
                </div>

                {/* テキスト入力エリア */}
                <div className="mb-4">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="今何してる？"
                    className="w-full min-h-[140px] p-0 text-xl border-none resize-none focus:outline-none placeholder-gray-400"
                    disabled={isPosting}
                    rows={4}
                  />
                </div>

                {/* メディアプレビュー */}
                {media.length > 0 && (
                  <div className="mb-6">
                    <div className={`grid gap-2 ${
                      media.length === 1 ? 'grid-cols-1' :
                      media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                    }`}>
                      {media.map((item) => (
                        <div key={item.id} className="relative group">
                          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                            {item.file.type.startsWith('image/') ? (
                              <img
                                src={item.preview}
                                alt="Upload preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={item.preview}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                          </div>
                          <button
                            onClick={() => removeMedia(item.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <XMarkIcon className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* スケジュール設定 */}
                {showScheduler && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        投稿をスケジュール
                      </h4>
                      <button
                        onClick={() => setShowScheduler(false)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-blue-600 mt-2">
                      ※ スケジュール投稿機能は開発中です
                    </p>
                  </div>
                )}

                {/* 区切り線 */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    {/* 左側のオプションボタン */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={media.length >= 4 || isPosting}
                        className="p-3 text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="画像・動画を添付"
                      >
                        <PhotoIcon className="w-5 h-5" />
                      </button>

                      <button
                        disabled={true}
                        className="p-3 text-gray-300 rounded-full cursor-not-allowed"
                        title="GIF（近日実装）"
                      >
                        <span className="text-sm font-bold">GIF</span>
                      </button>

                      <button
                        disabled={true}
                        className="p-3 text-gray-300 rounded-full cursor-not-allowed"
                        title="投票（近日実装）"
                      >
                        <span className="text-sm">📊</span>
                      </button>

                      <button
                        disabled={true}
                        className="p-3 text-gray-300 rounded-full cursor-not-allowed"
                        title="絵文字（近日実装）"
                      >
                        <span className="text-sm">😀</span>
                      </button>

                      <button
                        onClick={() => setShowScheduler(!showScheduler)}
                        disabled={isPosting}
                        className={`p-3 rounded-full transition-colors ${
                          showScheduler 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-blue-500 hover:bg-blue-50'
                        }`}
                        title="投稿をスケジュール"
                      >
                        <ClockIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 右側の文字数とボタン */}
                    <div className="flex items-center space-x-4">
                      {/* 文字数カウンター */}
                      <div className="flex items-center space-x-3">
                        <div className="relative w-8 h-8">
                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              className={getProgressColor()}
                              strokeDasharray={`${progressPercentage * 1.005} 100.53`}
                            />
                          </svg>
                          {(isNearLimit || isOverLimit) && (
                            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getCharacterCountColor()}`}>
                              {remainingChars}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${getCharacterCountColor()}`}>
                          {text.length}/{maxLength}
                        </span>
                      </div>

                      {/* 投稿ボタン */}
                      <button
                        onClick={handlePost}
                        disabled={!text.trim() || isOverLimit || isPosting}
                        className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isPosting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            投稿中...
                          </>
                        ) : scheduledAt ? (
                          'スケジュール'
                        ) : (
                          'ポスト'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿結果表示 */}
            {postResult && (
              <div className={`mt-6 p-6 rounded-2xl border ${
                postResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-4">
                  {postResult.success ? (
                    <CheckCircleIcon className="w-7 h-7 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <ExclamationCircleIcon className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${
                      postResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {postResult.success ? '🎉 投稿成功！' : '❌ 投稿失敗'}
                    </p>
                    <p className={`text-sm mt-2 leading-relaxed ${
                      postResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {postResult.message}
                    </p>
                    {postResult.success && postResult.url && (
                      <a
                        href={postResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-4 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <span className="mr-2">𝕏</span>
                        ポストを表示
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 投稿統計 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-5">📊 投稿統計</h3>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">今日の投稿</span>
                    <span className="text-2xl font-bold text-blue-600">{todayTotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">成功した投稿</span>
                    <span className="text-2xl font-bold text-green-600">{published}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">失敗した投稿</span>
                    <span className="text-2xl font-bold text-red-600">{failed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">成功率</span>
                    <span className={`text-2xl font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {successRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 投稿のコツ */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">💡 投稿のコツ</h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>280文字以内で簡潔かつ印象的に</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>ハッシュタグで発見性を高める</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>質問形式でエンゲージメント促進</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>画像・動画で視覚的にアピール</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">•</span>
                  <span>投稿時間を意識してリーチ最大化</span>
                </li>
              </ul>
            </div>

            {/* 投稿履歴 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📝 最近の投稿</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentPosts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      className={`flex items-center space-x-3 p-4 rounded-xl ${
                        post.status === 'PUBLISHED' ? 'bg-green-50' : 
                        post.status === 'FAILED' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}
                    >
                      {post.status === 'PUBLISHED' ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : post.status === 'FAILED' ? (
                        <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                      ) : (
                        <ClockIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {post.status === 'PUBLISHED' ? '投稿成功' :
                           post.status === 'FAILED' ? '投稿失敗' :
                           post.status === 'SCHEDULED' ? 'スケジュール済み' : 'ドラフト'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {post.content.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(post.createdAt).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {post.failureReason && (
                          <p className="text-xs text-red-600 mt-1 truncate">
                            {post.failureReason}
                          </p>
                        )}
                      </div>
                      {post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex-shrink-0"
                        >
                          表示
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">まだ投稿がありません</p>
                  <p className="text-sm text-gray-400 mt-1">最初の投稿を作成してみましょう！</p>
                </div>
              )}
              {recentPosts.length > 5 && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  他 {recentPosts.length - 5} 件
                </p>
              )}
            </div>

            {/* API設定状況 */}
            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">⚙️ API設定</h3>
              <p className="text-sm text-yellow-700 mb-4 leading-relaxed">
                X投稿機能を使用するには、環境変数でTwitter APIの設定が必要です。
              </p>
              <div className="space-y-3">
                {[
                  'TWITTER_API_KEY',
                  'TWITTER_API_SECRET', 
                  'TWITTER_ACCESS_TOKEN',
                  'TWITTER_ACCESS_TOKEN_SECRET'
                ].map((key) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0"></div>
                    <code className="text-xs font-mono text-yellow-800 bg-yellow-100 px-2 py-1 rounded border">
                      {key}
                    </code>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium">
                  💡 設定方法: <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Twitter Developer Portal</a> でAPI Keyを取得
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
    </div>
  );
}