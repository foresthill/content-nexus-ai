'use client';

import { useState, useEffect, useCallback } from 'react';
import { SocialPlatform } from '@/types/social';
import { XMarkIcon, SparklesIcon, TrendingUpIcon } from '@heroicons/react/24/outline';

interface HashtagSuggestionsProps {
  content: string;
  platform: SocialPlatform;
  currentHashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  targetAudience?: string;
  category?: string;
}

interface HashtagSuggestion {
  hashtag: string;
  trendScore?: number;
  growthRate?: number;
  selected?: boolean;
}

interface SuggestionResponse {
  suggestions: string[];
  trends: Array<{
    hashtag: string;
    trendScore: number;
    growthRate: number;
  }>;
  performance: number;
  reasoning: string[];
}

export default function HashtagSuggestions({
  content,
  platform,
  currentHashtags,
  onHashtagsChange,
  targetAudience,
  category,
}: HashtagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);

  const fetchSuggestions = useCallback(async () => {
    if (!content || content.length < 10) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platform,
          targetAudience,
          category,
        }),
      });

      if (response.ok) {
        const data: SuggestionResponse = await response.json();
        
        // Merge suggestions with trend data
        const mergedSuggestions = data.suggestions.map(hashtag => {
          const trend = data.trends.find(t => t.hashtag === hashtag);
          return {
            hashtag,
            trendScore: trend?.trendScore,
            growthRate: trend?.growthRate,
            selected: currentHashtags.includes(hashtag),
          };
        });

        setSuggestions(mergedSuggestions);
        setPerformanceScore(data.performance);
        setReasoning(data.reasoning);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content, platform, targetAudience, category, currentHashtags]);

  // Debounce content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && content.length >= 10) {
        fetchSuggestions();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, fetchSuggestions]);

  const toggleHashtag = (hashtag: string) => {
    if (currentHashtags.includes(hashtag)) {
      onHashtagsChange(currentHashtags.filter(h => h !== hashtag));
    } else {
      onHashtagsChange([...currentHashtags, hashtag]);
    }

    // Update suggestion state
    setSuggestions(suggestions.map(s => 
      s.hashtag === hashtag ? { ...s, selected: !s.selected } : s
    ));
  };

  const addCustomHashtag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const input = event.currentTarget;
      const hashtag = input.value.trim().replace(/^#/, '');
      
      if (hashtag && !currentHashtags.includes(hashtag)) {
        onHashtagsChange([...currentHashtags, hashtag]);
        input.value = '';
      }
    }
  };

  const removeHashtag = (hashtag: string) => {
    onHashtagsChange(currentHashtags.filter(h => h !== hashtag));
    setSuggestions(suggestions.map(s => 
      s.hashtag === hashtag ? { ...s, selected: false } : s
    ));
  };

  return (
    <div className="space-y-4">
      {/* Current Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ハッシュタグ
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {currentHashtags.map(hashtag => (
            <span
              key={hashtag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              #{hashtag}
              <button
                type="button"
                onClick={() => removeHashtag(hashtag)}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="カスタムハッシュタグを追加 (Enterキーで追加)"
          onKeyDown={addCustomHashtag}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* AI Suggestions Toggle */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <SparklesIcon className="h-5 w-5" />
          {isLoading ? 'AI分析中...' : 'AIハッシュタグ提案'}
        </button>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Performance Score */}
          {performanceScore !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                パフォーマンススコア
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${performanceScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {performanceScore}%
                </span>
              </div>
            </div>
          )}

          {/* Suggested Hashtags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              おすすめハッシュタグ
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.hashtag}
                  type="button"
                  onClick={() => toggleHashtag(suggestion.hashtag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    suggestion.selected || currentHashtags.includes(suggestion.hashtag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  #{suggestion.hashtag}
                  {suggestion.trendScore && suggestion.trendScore > 80 && (
                    <TrendingUpIcon className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          {reasoning.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                AI分析結果
              </h4>
              <ul className="space-y-1">
                {reasoning.map((reason, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}