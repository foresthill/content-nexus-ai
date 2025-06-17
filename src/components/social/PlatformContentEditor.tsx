'use client';

import { useState, useEffect } from 'react';
import { PhotoIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { 
  SocialPlatform, 
  PlatformContent, 
  MediaFile 
} from '@/types/social';
import HashtagSuggestions from './HashtagSuggestions';

interface PlatformContentEditorProps {
  platform: SocialPlatform;
  content: PlatformContent;
  onChange: (content: PlatformContent) => void;
  limits: {
    textLength: number;
    imageCount?: number;
    videoCount?: number;
    videoLength?: number;
  };
}

const platformNames = {
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

export default function PlatformContentEditor({
  platform,
  content,
  onChange,
  limits,
}: PlatformContentEditorProps) {
  const [text, setText] = useState(content.text);
  const [hashtags, setHashtags] = useState<string[]>(content.hashtags || []);

  useEffect(() => {
    const mentions = extractMentions(text);
    
    onChange({
      ...content,
      text,
      hashtags,
      mentions,
    });
  }, [text, hashtags]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHashtagsChange = (newHashtags: string[]) => {
    setHashtags(newHashtags);
  };

  const extractMentions = (text: string): string[] => {
    const regex = /@[^\s@]+/g;
    const matches = text.match(regex) || [];
    return matches;
  };


  const handleMediaUpload = (files: FileList | null) => {
    if (!files) return;
    
    // モック実装: 実際にはファイルをアップロードして、URLを取得する
    const newMedia: MediaFile[] = Array.from(files).map((file, index) => ({
      id: `media-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      filename: file.name,
      size: file.size,
    }));

    onChange({
      ...content,
      media: [...content.media, ...newMedia],
    });
  };

  const removeMedia = (mediaId: string) => {
    onChange({
      ...content,
      media: content.media.filter(m => m.id !== mediaId),
    });
  };

  const remainingChars = limits.textLength - text.length;
  const canAddImage = !limits.imageCount || content.media.filter(m => m.type === 'image').length < limits.imageCount;
  const canAddVideo = !limits.videoCount || content.media.filter(m => m.type === 'video').length < limits.videoCount;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {platformNames[platform]}
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor={`text-${platform}`} className="block text-sm font-medium text-gray-700">
            投稿内容
          </label>
          <textarea
            id={`text-${platform}`}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={`${platformNames[platform]}への投稿内容を入力...`}
          />
          <p className={`mt-1 text-sm ${remainingChars < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            残り文字数: {remainingChars}
          </p>
        </div>

        <HashtagSuggestions
          content={text}
          platform={platform}
          currentHashtags={hashtags}
          onHashtagsChange={handleHashtagsChange}
          targetAudience="young_adults"
          category="general"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メディア
          </label>
          <div className="flex space-x-2">
            {(canAddImage || canAddVideo) && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="sr-only"
                  accept={`${canAddImage ? 'image/*' : ''}${canAddImage && canAddVideo ? ',' : ''}${canAddVideo ? 'video/*' : ''}`}
                  multiple={platform !== 'tiktok'}
                  onChange={(e) => handleMediaUpload(e.target.files)}
                />
                <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 inline-flex items-center">
                  {canAddImage && <PhotoIcon className="h-5 w-5 mr-2" />}
                  {canAddVideo && <VideoCameraIcon className="h-5 w-5 mr-2" />}
                  メディアを追加
                </div>
              </label>
            )}
          </div>
          
          {content.media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {content.media.map((media) => (
                <div key={media.id} className="relative group">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="h-24 w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}