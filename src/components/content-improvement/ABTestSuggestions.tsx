'use client';

import React, { useState } from 'react';
import { ABTestSuggestion } from '@/types/content-improvement';

interface ABTestSuggestionsProps {
  abTests: ABTestSuggestion[];
}

export function ABTestSuggestions({ abTests }: ABTestSuggestionsProps) {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const getTestTypeIcon = (type: string) => {
    const icons = {
      title: '📝',
      hook: '🪝',
      cta: '📢',
      structure: '🏗️',
      tone: '🎭'
    };
    return icons[type as keyof typeof icons] || '🧪';
  };

  const getTestTypeColor = (type: string) => {
    const colors = {
      title: 'bg-blue-100 text-blue-800',
      hook: 'bg-green-100 text-green-800',
      cta: 'bg-purple-100 text-purple-800',
      structure: 'bg-orange-100 text-orange-800',
      tone: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPotentialLiftColor = (lift: number) => {
    if (lift >= 30) return 'text-green-600';
    if (lift >= 15) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (abTests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🧪</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B Test Suggestions</h3>
        <p className="text-gray-600">
          Your content appears to be well-optimized. No specific A/B tests are recommended at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">A/B Test Suggestions</h3>
        <div className="text-sm text-gray-600">
          {abTests.length} test{abTests.length !== 1 ? 's' : ''} recommended
        </div>
      </div>

      <div className="space-y-4">
        {abTests.map((test, index) => (
          <div key={test.id} className="border border-gray-200 rounded-lg bg-white">
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTestTypeIcon(test.testType)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        A/B Test #{index + 1}: {test.testType.charAt(0).toUpperCase() + test.testType.slice(1)} Optimization
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTestTypeColor(test.testType)}`}>
                        {test.testType}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{test.hypothesis}</p>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`text-center p-3 rounded-lg ${getConfidenceColor(test.confidence)}`}>
                        <div className="text-sm font-medium mb-1">Confidence</div>
                        <div className="text-lg font-bold">{Math.round(test.confidence * 100)}%</div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-600 mb-1">Potential Lift</div>
                        <div className={`text-lg font-bold ${getPotentialLiftColor(test.potentialLift)}`}>
                          +{test.potentialLift}%
                        </div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-600 mb-1">Duration</div>
                        <div className="text-lg font-bold text-gray-800">{test.duration} days</div>
                      </div>
                      
                      <div className="text-center p-3 rounded-lg bg-gray-50">
                        <div className="text-sm font-medium text-gray-600 mb-1">Variations</div>
                        <div className="text-lg font-bold text-gray-800">{test.variations.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="ml-4 text-gray-400 hover:text-gray-600">
                  <svg 
                    className={`w-5 h-5 transition-transform ${expandedTest === test.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTest === test.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Test Metrics */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Metrics to Track:</h5>
                  <div className="flex flex-wrap gap-2">
                    {test.metrics.map((metric, metricIndex) => (
                      <span 
                        key={metricIndex}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {metric.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Test Variations */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Test Variations:</h5>
                  <div className="space-y-4">
                    {test.variations.map((variation, variationIndex) => (
                      <div key={variation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-gray-900">
                            Variation {String.fromCharCode(65 + variationIndex)}: {variation.title}
                          </h6>
                          <div className="flex space-x-2">
                            {Object.entries(variation.expectedImprovement).map(([key, value]) => (
                              <span key={key} className="text-xs text-gray-500">
                                {key}: {value > 0 ? '+' : ''}{value}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{variation.purpose}</p>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                          <div className="text-sm text-gray-700 line-clamp-3">
                            {variation.content.length > 200 
                              ? `${variation.content.substring(0, 200)}...` 
                              : variation.content}
                          </div>
                        </div>
                        {variation.changes.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Changes: </span>
                            <span className="text-xs text-gray-600">{variation.changes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implementation Guide */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">🎯 Implementation Guide</h5>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>Setup:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Split traffic 50/50 between variations</li>
                          <li>• Run test for {test.duration} days minimum</li>
                          <li>• Ensure statistical significance</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Success Criteria:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Monitor {test.metrics.join(', ')}</li>
                          <li>• Look for {test.potentialLift}%+ improvement</li>
                          <li>• Validate with 95% confidence level</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-4">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Export Test Plan
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors">
                    Start A/B Test
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* A/B Testing Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-yellow-900 mb-3">🧪 A/B Testing Best Practices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div>
            <h5 className="font-medium mb-2">Before Testing:</h5>
            <ul className="space-y-1">
              <li>• Define clear success metrics</li>
              <li>• Ensure sufficient sample size</li>
              <li>• Test one element at a time</li>
              <li>• Set up proper tracking</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">During Testing:</h5>
            <ul className="space-y-1">
              <li>• Don&apos;t stop tests early</li>
              <li>• Monitor for external factors</li>
              <li>• Ensure equal traffic distribution</li>
              <li>• Document any changes made</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}