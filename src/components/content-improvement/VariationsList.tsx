'use client';

import React from 'react';
import { ContentVariation } from '@/types/content-improvement';

interface VariationsListProps {
  variations: ContentVariation[];
  onVariationSelect: (variationId: string) => void;
  selectedVariation?: string | null;
}

export function VariationsList({ variations, onVariationSelect, selectedVariation }: VariationsListProps) {
  const getImprovementColor = (value: number) => {
    if (value > 0) return 'text-green-600 bg-green-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImprovementIcon = (value: number) => {
    if (value > 0) return '↗️';
    if (value < 0) return '↘️';
    return '→';
  };

  if (variations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🔄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Variations Available</h3>
        <p className="text-gray-600">
          No content variations were generated. This usually means your content is already well-optimized!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Content Variations</h3>
        <div className="text-sm text-gray-600">
          {variations.length} variation{variations.length !== 1 ? 's' : ''} generated
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {variations.map((variation, index) => (
          <div 
            key={variation.id}
            className={`border rounded-lg transition-all duration-200 cursor-pointer ${
              selectedVariation === variation.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onVariationSelect(variation.id)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{variation.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{variation.purpose}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedVariation === variation.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    Variation {index + 1}
                  </div>
                </div>
              </div>

              {/* Expected Improvements */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`text-center p-3 rounded-lg ${getImprovementColor(variation.expectedImprovement.quality)}`}>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-xs">{getImprovementIcon(variation.expectedImprovement.quality)}</span>
                    <span className="text-sm font-medium">Quality</span>
                  </div>
                  <div className="text-lg font-bold">
                    {variation.expectedImprovement.quality > 0 ? '+' : ''}{variation.expectedImprovement.quality}
                  </div>
                </div>

                <div className={`text-center p-3 rounded-lg ${getImprovementColor(variation.expectedImprovement.engagement)}`}>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-xs">{getImprovementIcon(variation.expectedImprovement.engagement)}</span>
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <div className="text-lg font-bold">
                    {variation.expectedImprovement.engagement > 0 ? '+' : ''}{variation.expectedImprovement.engagement}
                  </div>
                </div>

                <div className={`text-center p-3 rounded-lg ${getImprovementColor(variation.expectedImprovement.readability)}`}>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="text-xs">{getImprovementIcon(variation.expectedImprovement.readability)}</span>
                    <span className="text-sm font-medium">Readability</span>
                  </div>
                  <div className="text-lg font-bold">
                    {variation.expectedImprovement.readability > 0 ? '+' : ''}{variation.expectedImprovement.readability}
                  </div>
                </div>
              </div>

              {/* Changes Made */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Changes Made:</h5>
                <div className="flex flex-wrap gap-2">
                  {variation.changes.map((change, changeIndex) => (
                    <span 
                      key={changeIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {change}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Content Preview:</h5>
                <div className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                  {variation.content.length > 300 
                    ? `${variation.content.substring(0, 300)}...` 
                    : variation.content}
                </div>
                {variation.content.length > 300 && (
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVariationSelect(variation.id);
                    }}
                  >
                    View full content →
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{variation.content.split(' ').length} words</span>
                  <span>~{Math.ceil(variation.content.split(' ').length / 200)} min read</span>
                </div>
                <button 
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    selectedVariation === variation.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVariationSelect(variation.id);
                  }}
                >
                  {selectedVariation === variation.id ? 'Selected' : 'Preview'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Using Variations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on any variation to preview it in detail</li>
          <li>• Compare improvements across Quality, Engagement, and Readability</li>
          <li>• Use variations as starting points for further customization</li>
          <li>• Consider A/B testing different variations to see what works best</li>
        </ul>
      </div>
    </div>
  );
}