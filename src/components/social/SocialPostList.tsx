import { SocialPost } from '@/types/social';
import { CalendarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SocialPostListProps {
  posts: SocialPost[];
}

const platformColors = {
  twitter: 'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusIcons = {
  draft: ClockIcon,
  scheduled: CalendarIcon,
  published: CheckCircleIcon,
  failed: ExclamationCircleIcon,
};

export default function SocialPostList({ posts }: SocialPostListProps) {
  const router = useRouter();

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
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {posts.map((post) => {
          const StatusIcon = statusIcons[post.status];
          return (
            <li key={post.id}>
              <button
                onClick={() => router.push(`/social/${post.id}`)}
                className="block hover:bg-gray-50 w-full text-left"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {post.title}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <StatusIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                            {post.status === 'draft' && '下書き'}
                            {post.status === 'scheduled' && '予約済み'}
                            {post.status === 'published' && '公開済み'}
                            {post.status === 'failed' && '失敗'}
                          </span>
                        </div>
                        <span className="ml-4">
                          {post.status === 'scheduled' && post.scheduledAt && (
                            <>予約: {formatDate(post.scheduledAt)}</>
                          )}
                          {post.status === 'published' && post.publishedAt && (
                            <>公開: {formatDate(post.publishedAt)}</>
                          )}
                          {post.status === 'draft' && (
                            <>作成: {formatDate(post.createdAt)}</>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex space-x-2">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform.platform}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platformColors[platform.platform]}`}
                        >
                          {platform.platform === 'twitter' && 'X'}
                          {platform.platform === 'instagram' && 'Instagram'}
                          {platform.platform === 'tiktok' && 'TikTok'}
                        </span>
                      ))}
                    </div>
                  </div>
                  {post.platforms[0] && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.platforms[0].text}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}