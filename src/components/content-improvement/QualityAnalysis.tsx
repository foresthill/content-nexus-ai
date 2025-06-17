'use client';

import React from 'react';
import { ContentQualityScore } from '@/types/content-improvement';

interface QualityAnalysisProps {
  quality: ContentQualityScore;
}

export function QualityAnalysis({ quality }: QualityAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const qualityMetrics = [
    { name: 'Clarity', score: quality.clarity, description: 'How clear and understandable the content is' },
    { name: 'Structure', score: quality.structure, description: 'Organization and logical flow of content' },
    { name: 'Relevance', score: quality.relevance, description: 'How relevant the content is to the topic' },
    { name: 'Originality', score: quality.originalityScore, description: 'Uniqueness and fresh perspective' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Quality Score</h3>
            <p className="text-sm text-gray-600 mt-1">Comprehensive content quality assessment</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(quality.overall)}`}>
              {quality.overall}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(quality.overall)}`}
              style={{ width: `${quality.overall}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quality Metrics Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualityMetrics.map((metric, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{metric.name}</h4>
                <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.score)}`}
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {quality.details.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <span className="mr-2">✅</span>
            Content Strengths
          </h3>
          <div className="space-y-2">
            {quality.details.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-green-800 flex-1">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {quality.details.weaknesses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Areas for Improvement
          </h3>
          <div className="space-y-2">
            {quality.details.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-red-800 flex-1">{weakness}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {quality.details.suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Improvement Suggestions
          </h3>
          <div className="space-y-3">
            {quality.details.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-blue-800 flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Score Interpretation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Interpretation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">80-100</div>
            <div className="text-sm font-medium text-green-800 mb-1">Excellent</div>
            <div className="text-xs text-green-700">High-quality content ready for publication</div>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">60-79</div>
            <div className="text-sm font-medium text-yellow-800 mb-1">Good</div>
            <div className="text-xs text-yellow-700">Solid content with minor improvements needed</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">0-59</div>
            <div className="text-sm font-medium text-red-800 mb-1">Needs Work</div>
            <div className="text-xs text-red-700">Significant improvements required</div>
          </div>
        </div>
      </div>

      {/* Tips for Improvement */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Quality</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Structure & Organization</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use clear headings and subheadings</li>
              <li>• Organize content in logical sections</li>
              <li>• Include introduction and conclusion</li>
              <li>• Use bullet points for lists</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Clarity & Relevance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Define technical terms clearly</li>
              <li>• Stay focused on the main topic</li>
              <li>• Use specific examples</li>
              <li>• Eliminate unnecessary jargon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}