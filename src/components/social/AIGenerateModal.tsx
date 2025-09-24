'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useOpenrouterStore } from '@/store/openrouterStore';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (text: string) => void;
}

export default function AIGenerateModal({ isOpen, onClose, onGenerated }: AIGenerateModalProps) {
  const { isConfigured, selectedModel } = useOpenrouterStore();
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'casual' | 'professional' | 'funny' | 'inspirational'>('casual');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const toneDescriptions = {
    casual: 'カジュアル - 友達に話すような親しみやすい口調',
    professional: 'プロフェッショナル - ビジネス向けの丁寧な口調',
    funny: '面白い - ユーモアを交えた楽しい投稿',
    inspirational: 'インスピレーション - 前向きで励みになる投稿'
  };

  const examplePrompts = [
    '今日の朝活について',
    '新商品のお知らせ',
    'プログラミング学習のコツ',
    '週末の過ごし方',
    '仕事の効率化について'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `以下の条件でTwitter/X用の投稿を生成してください：

トピック: ${prompt}
口調: ${toneDescriptions[tone]}
${includeHashtags ? 'ハッシュタグ: 適切なハッシュタグを3-5個含める' : 'ハッシュタグ: 含めない'}
${includeEmojis ? '絵文字: 適切に絵文字を使用する' : '絵文字: 使用しない'}

以下の条件を守ってください：
- 280文字以内
- 読みやすく、エンゲージメントを促進する内容
- 日本語で作成
- 投稿文のみを返す（説明や前置きは不要）`,
          model: selectedModel,
          temperature: tone === 'funny' ? 0.8 : tone === 'inspirational' ? 0.7 : 0.6,
          max_tokens: 200,
        }),
      });

      const data = await response.json();

      if (response.ok && data.content) {
        // 生成されたテキストを親コンポーネントに渡す
        onGenerated(data.content.trim());
        onClose();
        // フォームをリセット
        setPrompt('');
      } else {
        setError(data.error || '生成に失敗しました');
      }
    } catch (err) {
      console.error('生成エラー:', err);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI投稿生成
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {!isConfigured && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      OpenRouter APIの設定が必要です。設定画面から API Keyを設定してください。
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* プロンプト入力 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      投稿のトピック
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="例: 今日の朝活について、新商品のお知らせ"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      disabled={isGenerating}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {examplePrompts.map((example) => (
                        <button
                          key={example}
                          onClick={() => setPrompt(example)}
                          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                          disabled={isGenerating}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* トーン選択 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      投稿のトーン
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['casual', 'professional', 'funny', 'inspirational'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            tone === t
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          disabled={isGenerating}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {t === 'casual' ? 'カジュアル' :
                             t === 'professional' ? 'プロフェッショナル' :
                             t === 'funny' ? '面白い' : 'インスピレーション'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t === 'casual' ? '親しみやすい' :
                             t === 'professional' ? 'ビジネス向け' :
                             t === 'funny' ? 'ユーモラス' : '前向き'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* オプション */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={includeHashtags}
                        onChange={(e) => setIncludeHashtags(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        disabled={isGenerating}
                      />
                      <span className="text-sm text-gray-700">ハッシュタグを含める</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={includeEmojis}
                        onChange={(e) => setIncludeEmojis(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        disabled={isGenerating}
                      />
                      <span className="text-sm text-gray-700">絵文字を使用する</span>
                    </label>
                  </div>

                  {/* エラー表示 */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={isGenerating}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating || !isConfigured}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          生成中...
                        </span>
                      ) : (
                        '投稿を生成'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}