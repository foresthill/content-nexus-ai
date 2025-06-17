'use client';

import React, { useState } from 'react';
import { ContentVariation } from '@/types/content-improvement';

interface ImprovementPreviewProps {
  originalContent: string;
  selectedVariation?: ContentVariation;
  onApply: () => void;
  onClose: () => void;
}

export function ImprovementPreview({ 
  originalContent, 
  selectedVariation, 
  onApply, 
  onClose 
}: ImprovementPreviewProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'diff' | 'preview'>('side-by-side');

  if (!selectedVariation) {
    return null;
  }

  const getImprovementColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImprovementIcon = (value: number) => {
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '→';
  };

  // Simple diff highlighting function
  const highlightDifferences = (original: string, improved: string) => {
    const originalWords = original.split(' ');
    const improvedWords = improved.split(' ');
    
    // This is a simplified diff - in production, you'd use a proper diff library
    const maxLength = Math.max(originalWords.length, improvedWords.length);
    const originalHighlighted = [];
    const improvedHighlighted = [];
    
    for (let i = 0; i < maxLength; i++) {
      const originalWord = originalWords[i] || '';
      const improvedWord = improvedWords[i] || '';
      
      if (originalWord !== improvedWord) {
        if (originalWord) {
          originalHighlighted.push(`<span class="bg-red-100 text-red-800 px-1 rounded">${originalWord}</span>`);
        }
        if (improvedWord) {
          improvedHighlighted.push(`<span class="bg-green-100 text-green-800 px-1 rounded">${improvedWord}</span>`);
        }
      } else {
        originalHighlighted.push(originalWord);
        improvedHighlighted.push(improvedWord);
      }
    }
    
    return {
      original: originalHighlighted.join(' '),
      improved: improvedHighlighted.join(' ')
    };
  };

  const diffResult = highlightDifferences(originalContent, selectedVariation.content);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Content Improvement Preview</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedVariation.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'side-by-side', label: 'Side by Side', icon: '👥' },
            { id: 'diff', label: 'Highlight Changes', icon: '🔍' },
            { id: 'preview', label: 'Preview Only', icon: '👁️' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === mode.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Improvement Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Expected Improvements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Quality</span>
                  <span className={`text-sm font-bold flex items-center ${getImprovementColor(selectedVariation.expectedImprovement.quality)}`}>
                    {getImprovementIcon(selectedVariation.expectedImprovement.quality)}
                    {selectedVariation.expectedImprovement.quality > 0 ? '+' : ''}{selectedVariation.expectedImprovement.quality}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Engagement</span>
                  <span className={`text-sm font-bold flex items-center ${getImprovementColor(selectedVariation.expectedImprovement.engagement)}`}>
                    {getImprovementIcon(selectedVariation.expectedImprovement.engagement)}
                    {selectedVariation.expectedImprovement.engagement > 0 ? '+' : ''}{selectedVariation.expectedImprovement.engagement}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Readability</span>
                  <span className={`text-sm font-bold flex items-center ${getImprovementColor(selectedVariation.expectedImprovement.readability)}`}>
                    {getImprovementIcon(selectedVariation.expectedImprovement.readability)}
                    {selectedVariation.expectedImprovement.readability > 0 ? '+' : ''}{selectedVariation.expectedImprovement.readability}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Changes Made */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Changes Made:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedVariation.changes.map((change, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Purpose */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Purpose:</strong> {selectedVariation.purpose}
              </p>
            </div>
          </div>

          {/* Content Comparison */}
          <div className="p-6">
            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📝</span>
                    Original Content
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {originalContent}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {originalContent.split(' ').length} words
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">✨</span>
                    Improved Content
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selectedVariation.content}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedVariation.content.split(' ').length} words
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'diff' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🔍</span>
                    Changes Highlighted
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Removed/Changed</h4>
                      <div 
                        className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: diffResult.original }}
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">Added/Improved</h4>
                      <div 
                        className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: diffResult.improved }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'preview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👁️</span>
                  Final Preview
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedVariation.content}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{selectedVariation.content.split(' ').length} words</span>
                  <span>Reading time: ~{Math.ceil(selectedVariation.content.split(' ').length / 200)} min</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            This will replace your current content with the improved version.
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Improvement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}