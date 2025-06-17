'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import useSocialPostStore from '@/store/socialPostStore';
import SocialPostEditor from '@/components/social/SocialPostEditor';
import { CreatePostInput } from '@/types/social';

export default function NewSocialPostPage() {
  const router = useRouter();
  const { createPost } = useSocialPostStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (input: CreatePostInput) => {
    setIsSubmitting(true);
    try {
      const post = await createPost(input);
      router.push(`/social/${post.id}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      setIsSubmitting(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">新規SNS投稿作成</h1>
        
        <SocialPostEditor
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}