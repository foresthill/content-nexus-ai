'use client';

import React, { useState } from 'react';
import { useDifyStore } from '@/store/difyStore';
import { DifyService } from '@/lib/dify/service';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface DifyContentImproverProps {
  content: string;
  onContentImproved?: (improvedContent: string) => void;
  platform?: string;
  targetAudience?: string;
}

export const DifyContentImprover: React.FC<DifyContentImproverProps> = ({
  content,
  onContentImproved,
  platform,
  targetAudience,
}) => {
  const { config, isConnected } = useDifyStore();
  const [isImproving, setIsImproving] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'friendly'>('professional');

  const handleImproveContent = async () => {
    if (!config || !isConnected) {
      setError('Difyが設定されていません。設定画面から接続してください。');
      return;
    }

    setIsImproving(true);
    setError(null);

    try {
      const difyService = new DifyService(config);
      const result = await difyService.improveContent(content, {
        tone: selectedTone,
        platform,
        targetAudience,
      });

      setImprovedContent(result.improvedContent);
      setSuggestions(result.suggestions);
      
      if (onContentImproved) {
        onContentImproved(result.improvedContent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コンテンツの改善中にエラーが発生しました');
    } finally {
      setIsImproving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          DifyのAI機能を使用するには、先に設定画面から接続してください。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Dify AIによるコンテンツ改善
        </h3>
        
        <select
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="professional">プロフェッショナル</option>
          <option value="casual">カジュアル</option>
          <option value="friendly">フレンドリー</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleImproveContent}
        disabled={isImproving || !content}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isImproving ? (
          <>
            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            改善中...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            コンテンツを改善
          </>
        )}
      </button>

      {improvedContent && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">改善されたコンテンツ:</h4>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{improvedContent}</p>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">改善ポイント:</h4>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};