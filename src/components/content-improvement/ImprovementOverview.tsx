'use client';

import React from 'react';
import { ContentImprovement } from '@/types/content-improvement';

interface ImprovementOverviewProps {
  improvement: ContentImprovement;
}

export function ImprovementOverview({ improvement }: ImprovementOverviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(improvement.quality.overall)}`}>
                {improvement.quality.overall}
              </p>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="mt-2 flex space-x-2">
            <div className={`text-xs px-2 py-1 rounded ${getScoreColor(improvement.quality.overall)}`}>
              {improvement.quality.overall >= 80 ? 'Excellent' : 
               improvement.quality.overall >= 60 ? 'Good' : 'Needs Work'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className={`text-2xl font-bold ${getScoreColor(improvement.engagement.score)}`}>
                {improvement.engagement.score}
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
          <div className="mt-2 flex space-x-2">
            <div className={`text-xs px-2 py-1 rounded ${getScoreColor(improvement.engagement.score)}`}>
              {improvement.engagement.score >= 80 ? 'High' : 
               improvement.engagement.score >= 60 ? 'Medium' : 'Low'}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Readability</p>
              <p className={`text-2xl font-bold ${getScoreColor(improvement.readability.score)}`}>
                {improvement.readability.score}
              </p>
            </div>
            <div className="text-2xl">📖</div>
          </div>
          <div className="mt-2">
            <div className={`text-xs px-2 py-1 rounded ${getScoreColor(improvement.readability.score)}`}>
              {improvement.readability.targetAudience.readingLevel}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sentiment</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">
                {improvement.sentiment.overall}
              </p>
            </div>
            <div className="text-2xl">
              {improvement.sentiment.overall === 'positive' ? '😊' : 
               improvement.sentiment.overall === 'negative' ? '😟' : '😐'}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
              {Math.round(improvement.sentiment.confidence * 100)}% confidence
            </div>
          </div>
        </div>
      </div>

      {/* Priority and Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Priority Level</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(improvement.priority)}`}>
            {improvement.priority.toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Based on overall content analysis
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Estimated Impact</h3>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">{improvement.estimatedImpact}</span>
            <span className="text-sm text-gray-500 ml-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${improvement.estimatedImpact}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Implementation</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(improvement.implementationDifficulty)}`}>
            {improvement.implementationDifficulty.toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Complexity of suggested changes
          </p>
        </div>
      </div>

      {/* Key Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Recommendations</h3>
        <div className="space-y-3">
          {improvement.overallRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{improvement.variations.length}</p>
            <p className="text-sm text-gray-600">Variations Generated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{improvement.abTests.length}</p>
            <p className="text-sm text-gray-600">A/B Test Ideas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {improvement.originalContent.split(' ').length}
            </p>
            <p className="text-sm text-gray-600">Words Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((improvement.quality.overall + improvement.engagement.score + improvement.readability.score) / 3)}
            </p>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Analysis Date */}
      <div className="text-center text-sm text-gray-500">
        Analysis completed on {new Date(improvement.createdAt).toLocaleDateString()} at {new Date(improvement.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}