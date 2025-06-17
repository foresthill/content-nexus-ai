'use client';

import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { 
  SocialPlatform, 
  PlatformContent, 
  CreatePostInput,
  PLATFORM_LIMITS 
} from '@/types/social';
import PlatformContentEditor from './PlatformContentEditor';
import { PostingTimeRecommendations } from '@/components/posting-time';
import { ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface SocialPostEditorProps {
  initialData?: CreatePostInput;
  onSubmit: (data: CreatePostInput) => void;
  isSubmitting?: boolean;
}

const platforms: { id: SocialPlatform; name: string; color: string }[] = [
  { id: 'twitter', name: 'X (Twitter)', color: 'bg-blue-500' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-purple-500' },
];

export default function SocialPostEditor({ 
  initialData, 
  onSubmit, 
  isSubmitting = false 
}: SocialPostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SocialPlatform>>(
    new Set(initialData?.platforms.map(p => p.platform) || [])
  );
  const [platformContents, setPlatformContents] = useState<Record<SocialPlatform, PlatformContent>>(
    initialData?.platforms.reduce((acc, p) => ({ ...acc, [p.platform]: p }), {}) || {}
  );
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : ''
  );
  const [showOptimalTimes, setShowOptimalTimes] = useState(false);
  const [contentType, setContentType] = useState('');
  const [targetAudience, setTargetAudience] = useState({
    ageGroup: '',
    primaryRegion: ''
  });

  const togglePlatform = (platform: SocialPlatform) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
      const newContents = { ...platformContents };
      delete newContents[platform];
      setPlatformContents(newContents);
    } else {
      newSelected.add(platform);
      setPlatformContents({
        ...platformContents,
        [platform]: {
          platform,
          text: '',
          media: [],
          hashtags: [],
          mentions: [],
        },
      });
    }
    setSelectedPlatforms(newSelected);
  };

  const updatePlatformContent = (platform: SocialPlatform, content: PlatformContent) => {
    setPlatformContents({
      ...platformContents,
      [platform]: content,
    });
  };

  const handleOptimalTimeSelect = (time: Date) => {
    const timeString = time.toISOString().slice(0, 16);
    setScheduledAt(timeString);
    setShowOptimalTimes(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const platforms = Array.from(selectedPlatforms).map(platform => 
      platformContents[platform]
    ).filter(Boolean);

    onSubmit({
      title,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          投稿タイトル（管理用）
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="例：新商品リリースのお知らせ"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          投稿先プラットフォーム
        </label>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center">
              <Switch
                checked={selectedPlatforms.has(platform.id)}
                onChange={() => togglePlatform(platform.id)}
                className={`${
                  selectedPlatforms.has(platform.id) ? platform.color : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    selectedPlatforms.has(platform.id) ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {platform.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedPlatforms.size > 0 && (
        <div className="space-y-6">
          {Array.from(selectedPlatforms).map((platform) => (
            <PlatformContentEditor
              key={platform}
              platform={platform}
              content={platformContents[platform]}
              onChange={(content) => updatePlatformContent(platform, content)}
              limits={PLATFORM_LIMITS[platform]}
            />
          ))}
        </div>
      )}

      {/* Content Type and Audience Configuration */}
      {selectedPlatforms.size > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Content & Audience Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">General</option>
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
                <option value="news">News</option>
                <option value="promotional">Promotional</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Age Group
              </label>
              <select
                value={targetAudience.ageGroup}
                onChange={(e) => setTargetAudience(prev => ({ ...prev, ageGroup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Ages</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Region
              </label>
              <select
                value={targetAudience.primaryRegion}
                onChange={(e) => setTargetAudience(prev => ({ ...prev, primaryRegion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Global</option>
                <option value="north_america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
                <option value="oceania">Oceania</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
            予約投稿（オプション）
          </label>
          {selectedPlatforms.size > 0 && (
            <button
              type="button"
              onClick={() => setShowOptimalTimes(!showOptimalTimes)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              AI Optimal Times
            </button>
          )}
        </div>
        
        <input
          type="datetime-local"
          id="scheduledAt"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          指定しない場合は下書きとして保存されます
        </p>

        {/* Optimal Times Recommendations */}
        {showOptimalTimes && selectedPlatforms.size > 0 && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              AI-Powered Optimal Posting Times
            </h4>
            <div className="space-y-4">
              {Array.from(selectedPlatforms).map((platform) => (
                <div key={platform}>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform} Recommendations
                  </h5>
                  <PostingTimeRecommendations
                    platform={platform}
                    targetAudience={targetAudience.ageGroup || targetAudience.primaryRegion ? targetAudience : undefined}
                    contentType={contentType || undefined}
                    onSchedule={handleOptimalTimeSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting || selectedPlatforms.size === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}