'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, TrashIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import useSocialPostStore from '@/store/socialPostStore';
import { SocialPost } from '@/types/social';

const platformNames = {
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

export default function SocialPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getPostById, deletePost, publishPost } = useSocialPostStore();
  const [post, setPost] = useState<SocialPost | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchedPost = getPostById(id);
    setPost(fetchedPost);
  }, [id, getPostById]);

  const handleDelete = async () => {
    if (!confirm('この投稿を削除してもよろしいですか？')) return;
    
    setIsDeleting(true);
    try {
      await deletePost(id);
      router.push('/social');
    } catch (error) {
      console.error('Failed to delete post:', error);
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('この投稿を今すぐ公開しますか？')) return;
    
    setIsPublishing(true);
    try {
      await publishPost(id);
      const updatedPost = getPostById(id);
      setPost(updatedPost);
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">投稿が見つかりません</div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/social')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          投稿一覧に戻る
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>作成: {formatDate(post.createdAt)}</span>
                  <span>更新: {formatDate(post.updatedAt)}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {post.status === 'draft' && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    {isPublishing ? '公開中...' : '今すぐ公開'}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/social/${id}/edit`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {isDeleting ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">ステータス</h2>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {post.status === 'draft' && '下書き'}
                  {post.status === 'scheduled' && '予約済み'}
                  {post.status === 'published' && '公開済み'}
                  {post.status === 'failed' && '失敗'}
                </span>
                {post.status === 'scheduled' && post.scheduledAt && (
                  <span className="text-sm text-gray-600">
                    予約日時: {formatDate(post.scheduledAt)}
                  </span>
                )}
                {post.status === 'published' && post.publishedAt && (
                  <span className="text-sm text-gray-600">
                    公開日時: {formatDate(post.publishedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {post.platforms.map((platform) => (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {platformNames[platform.platform]}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">投稿内容</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{platform.text}</p>
                    </div>

                    {platform.hashtags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">ハッシュタグ</p>
                        <div className="flex flex-wrap gap-2">
                          {platform.hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {platform.media.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">メディア</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {platform.media.map((media) => (
                            <div key={media.id} className="relative">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={media.filename}
                                  className="h-32 w-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-sm text-gray-600">動画: {media.filename}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}