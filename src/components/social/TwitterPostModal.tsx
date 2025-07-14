'use client';

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TwitterPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

export default function TwitterPostModal({ isOpen, onClose, content, title }: TwitterPostModalProps) {
  const [tweetText, setTweetText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // コンテンツからツイート用テキストを生成
  React.useEffect(() => {
    if (content && title) {
      // タイトルと最初の段落を使用してツイートを作成
      const firstParagraph = content.split('\n\n')[1] || content.split('\n')[0] || '';
      const cleanText = firstParagraph.replace(/[#*]/g, '').trim();
      const defaultTweet = `${title}\n\n${cleanText.substring(0, 150)}...`;
      setTweetText(defaultTweet.substring(0, 280));
    }
  }, [content, title]);

  const handlePost = async () => {
    setIsPosting(true);
    setError('');
    setSuccess(false);

    try {
      // Twitter認証情報を取得（実際の実装では、認証フローを実装する必要があります）
      const accessToken = localStorage.getItem('twitter_access_token');
      const accessTokenSecret = localStorage.getItem('twitter_access_token_secret');

      if (!accessToken || !accessTokenSecret) {
        setError('Twitter認証が必要です。設定画面から認証してください。');
        return;
      }

      const response = await fetch('/api/social/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: tweetText,
          accessToken,
          accessTokenSecret,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Twitter投稿に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsPosting(false);
    }
  };

  const remainingChars = 280 - tweetText.length;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Twitterに投稿
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-2">
                  <div className="mb-4">
                    <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
                      ツイート内容
                    </label>
                    <textarea
                      id="tweet"
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      rows={5}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="ツイート内容を入力..."
                    />
                    <div className="mt-2 text-sm text-right">
                      <span className={remainingChars < 0 ? 'text-red-600' : 'text-gray-500'}>
                        {remainingChars} 文字
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 rounded-md bg-green-50 p-4">
                      <p className="text-sm text-green-800">Twitter投稿が成功しました！</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isPosting || remainingChars < 0
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    onClick={handlePost}
                    disabled={isPosting || remainingChars < 0}
                  >
                    {isPosting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        投稿中...
                      </>
                    ) : (
                      'ツイートする'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}