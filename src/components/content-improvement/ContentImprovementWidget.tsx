'use client';

import React, { useState, useEffect } from 'react';
import { useContentImprovementStore } from '@/store/contentImprovementStore';
import { ContentAnalysisRequest } from '@/types/content-improvement';

interface ContentImprovementWidgetProps {
  content: string;
  title?: string;
  platform?: string;
  targetAudience?: string;
  category?: string;
  onContentImproved?: (improvedContent: string) => void;
  isRealTime?: boolean;
}

export function ContentImprovementWidget({
  content,
  title,
  platform,
  targetAudience,
  category,
  onContentImproved,
  isRealTime = false
}: ContentImprovementWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState('');
  
  const {
    currentAnalysis,
    isAnalyzing,
    analysisError,
    realTimeSuggestions,
    enableRealTime,
    analyzeContent,
    updateRealTimeSuggestions,
    toggleRealTime,
    dismissRealTimeSuggestion,
    getImprovementScore
  } = useContentImprovementStore();

  // Auto-analyze content when it changes (for real-time mode)
  useEffect(() => {
    if (isRealTime && enableRealTime && content.length > 100 && content !== lastAnalyzedContent) {
      const timer = setTimeout(() => {
        updateRealTimeSuggestions(content);
        setLastAnalyzedContent(content);
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [content, isRealTime, enableRealTime, lastAnalyzedContent, updateRealTimeSuggestions]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    const request: ContentAnalysisRequest = {
      content,
      title,
      platform,
      targetAudience,
      category
    };

    await analyzeContent(request);
    setIsExpanded(true);
  };

  const handleApplyImprovement = (improvedContent: string) => {
    if (onContentImproved) {
      onContentImproved(improvedContent);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const improvementScore = getImprovementScore();

  if (!content || content.length < 50) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Add more content to enable AI improvement suggestions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">AI Content Improvement</h3>
                <p className="text-xs text-gray-600">Enhance your content with AI-powered suggestions</p>
              </div>
            </div>
            
            {currentAnalysis && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(improvementScore)}`}>
                Score: {improvementScore}/100
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isRealTime && (
              <button
                onClick={() => toggleRealTime(!enableRealTime)}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                  enableRealTime 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${enableRealTime ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                Real-time
              </button>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time suggestions (always visible when available) */}
      {realTimeSuggestions.length > 0 && (
        <div className="border-b border-gray-200 p-4 bg-yellow-50">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Real-time Suggestions
          </h4>
          <div className="space-y-2">
            {realTimeSuggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="flex items-start justify-between bg-white rounded p-3 border border-yellow-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Impact: +{suggestion.impact}</span>
                    <span>Effort: {suggestion.effort}/100</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => handleApplyImprovement(suggestion.after)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => dismissRealTimeSuggestion(suggestion.type)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Error */}
      {analysisError && (
        <div className="border-b border-gray-200 p-4 bg-red-50">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{analysisError}</span>
          </div>
        </div>
      )}

      {/* Expanded Analysis Results */}
      {isExpanded && currentAnalysis && (
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className={`text-lg font-bold ${getScoreColor(currentAnalysis.quality.overall).split(' ')[0]}`}>
                  {currentAnalysis.quality.overall}
                </div>
                <div className="text-xs text-gray-600">Quality</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className={`text-lg font-bold ${getScoreColor(currentAnalysis.engagement.score).split(' ')[0]}`}>
                  {currentAnalysis.engagement.score}
                </div>
                <div className="text-xs text-gray-600">Engagement</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className={`text-lg font-bold ${getScoreColor(currentAnalysis.readability.score).split(' ')[0]}`}>
                  {currentAnalysis.readability.score}
                </div>
                <div className="text-xs text-gray-600">Readability</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-800 capitalize">
                  {currentAnalysis.sentiment.overall}
                </div>
                <div className="text-xs text-gray-600">Sentiment</div>
              </div>
            </div>

            {/* Top Recommendations */}
            {currentAnalysis.overallRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Recommendations</h4>
                <div className="space-y-2">
                  {currentAnalysis.overallRecommendations.slice(0, 3).map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Variations */}
            {currentAnalysis.variations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Improvements</h4>
                <div className="space-y-2">
                  {currentAnalysis.variations.slice(0, 2).map((variation) => (
                    <div key={variation.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{variation.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{variation.purpose}</p>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                            <span>Quality: +{variation.expectedImprovement.quality}</span>
                            <span>Engagement: +{variation.expectedImprovement.engagement}</span>
                            <span>Readability: +{variation.expectedImprovement.readability}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleApplyImprovement(variation.content)}
                          className="ml-3 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Analysis Link */}
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={() => window.open(`/content-improvement?content=${encodeURIComponent(content)}`, '_blank')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full Analysis & Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (when collapsed) */}
      {!isExpanded && currentAnalysis && (
        <div className="p-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {currentAnalysis.variations.length} improvements available
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View suggestions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}