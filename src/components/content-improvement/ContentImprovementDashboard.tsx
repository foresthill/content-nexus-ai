'use client';

import React, { useState, useEffect } from 'react';
import { ContentImprovement, ContentAnalysisRequest } from '@/types/content-improvement';
import { ImprovementOverview } from './ImprovementOverview';
import { QualityAnalysis } from './QualityAnalysis';
import { EngagementAnalysis } from './EngagementAnalysis';
import { ReadabilityAnalysis } from './ReadabilityAnalysis';
import { SentimentAnalysis } from './SentimentAnalysis';
import { VariationsList } from './VariationsList';
import { ABTestSuggestions } from './ABTestSuggestions';
import { ImprovementPreview } from './ImprovementPreview';

interface ContentImprovementDashboardProps {
  contentId?: string;
  initialContent?: string;
  initialTitle?: string;
  platform?: string;
  targetAudience?: string;
  category?: string;
  onContentImproved?: (improvedContent: string) => void;
}

export function ContentImprovementDashboard({
  contentId,
  initialContent = '',
  initialTitle = '',
  platform,
  targetAudience,
  category,
  onContentImproved
}: ContentImprovementDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [improvement, setImprovement] = useState<ContentImprovement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'engagement' | 'readability' | 'sentiment' | 'variations' | 'ab-tests'>('overview');
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Please provide content to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: ContentAnalysisRequest = {
        content,
        title: title || undefined,
        platform,
        targetAudience,
        category
      };

      const response = await fetch('/api/ai/content-improvement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const result: ContentImprovement = await response.json();
      setImprovement(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = (variationId: string) => {
    setSelectedVariation(variationId);
    const variation = improvement?.variations.find(v => v.id === variationId);
    if (variation && onContentImproved) {
      onContentImproved(variation.content);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'quality', label: 'Quality', icon: '⭐' },
    { id: 'engagement', label: 'Engagement', icon: '🚀' },
    { id: 'readability', label: 'Readability', icon: '📖' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊' },
    { id: 'variations', label: 'Variations', icon: '🔄' },
    { id: 'ab-tests', label: 'A/B Tests', icon: '🧪' }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Improvement Dashboard</h1>
        
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your content title..."
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your content here for analysis..."
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                id="platform"
                value={platform || ''}
                onChange={(e) => {/* Platform is passed as prop */}}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Platform</option>
                <option value="blog">Blog</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                id="audience"
                value={targetAudience || ''}
                onChange={(e) => {/* Target audience is passed as prop */}}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., professionals, students"
              />
            </div>
          </div>

          <button
            onClick={analyzeContent}
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Content'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {improvement && (
        <>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && <ImprovementOverview improvement={improvement} />}
              {activeTab === 'quality' && <QualityAnalysis quality={improvement.quality} />}
              {activeTab === 'engagement' && <EngagementAnalysis engagement={improvement.engagement} />}
              {activeTab === 'readability' && <ReadabilityAnalysis readability={improvement.readability} />}
              {activeTab === 'sentiment' && <SentimentAnalysis sentiment={improvement.sentiment} />}
              {activeTab === 'variations' && (
                <VariationsList 
                  variations={improvement.variations} 
                  onVariationSelect={handleVariationSelect}
                  selectedVariation={selectedVariation}
                />
              )}
              {activeTab === 'ab-tests' && <ABTestSuggestions abTests={improvement.abTests} />}
            </div>
          </div>

          {/* Preview Section */}
          {selectedVariation && (
            <ImprovementPreview
              originalContent={improvement.originalContent}
              selectedVariation={improvement.variations.find(v => v.id === selectedVariation)}
              onApply={() => {
                const variation = improvement.variations.find(v => v.id === selectedVariation);
                if (variation) {
                  setContent(variation.content);
                  setSelectedVariation(null);
                  if (onContentImproved) {
                    onContentImproved(variation.content);
                  }
                }
              }}
              onClose={() => setSelectedVariation(null)}
            />
          )}
        </>
      )}
    </div>
  );
}