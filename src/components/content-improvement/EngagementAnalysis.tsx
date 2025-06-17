'use client';

import React from 'react';
import { EngagementPotential } from '@/types/content-improvement';

interface EngagementAnalysisProps {
  engagement: EngagementPotential;
}

export function EngagementAnalysis({ engagement }: EngagementAnalysisProps) {
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

  const engagementFactors = [
    { 
      name: 'Hooks', 
      score: engagement.factors.hooks, 
      description: 'Opening elements that capture attention',
      icon: '🪝'
    },
    { 
      name: 'Call to Action', 
      score: engagement.factors.callToAction, 
      description: 'Clear prompts for user engagement',
      icon: '📢'
    },
    { 
      name: 'Emotional Appeal', 
      score: engagement.factors.emotionalAppeal, 
      description: 'Content that resonates emotionally',
      icon: '❤️'
    },
    { 
      name: 'Trending Elements', 
      score: engagement.factors.trending, 
      description: 'Current and relevant topics',
      icon: '📈'
    },
    { 
      name: 'Visual Appeal', 
      score: engagement.factors.visualAppeal, 
      description: 'Scannable and visually pleasing format',
      icon: '👁️'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Engagement Score */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Engagement Potential</h3>
            <p className="text-sm text-gray-600 mt-1">How likely your content is to engage readers</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(engagement.score)}`}>
              {engagement.score}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(engagement.score)}`}
              style={{ width: `${engagement.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Engagement Factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Factors Breakdown</h3>
        <div className="space-y-4">
          {engagementFactors.map((factor, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{factor.icon}</span>
                  <h4 className="font-medium text-gray-900">{factor.name}</h4>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(factor.score)}`}>
                  {factor.score}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(factor.score)}`}
                  style={{ width: `${factor.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Predictions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {engagement.predictions.expectedLikes}
            </div>
            <div className="text-sm font-medium text-blue-800 mb-1">Expected Likes</div>
            <div className="text-xs text-blue-600">
              Based on current engagement factors
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {engagement.predictions.expectedShares}
            </div>
            <div className="text-sm font-medium text-green-800 mb-1">Expected Shares</div>
            <div className="text-xs text-green-600">
              Projected viral potential
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {engagement.predictions.expectedComments}
            </div>
            <div className="text-sm font-medium text-purple-800 mb-1">Expected Comments</div>
            <div className="text-xs text-purple-600">
              Discussion potential
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {Math.round(engagement.predictions.confidence * 100)}%
            </div>
            <div className="text-sm font-medium text-orange-800 mb-1">Confidence</div>
            <div className="text-xs text-orange-600">
              Prediction accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {engagement.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Engagement Improvement Recommendations
          </h3>
          <div className="space-y-3">
            {engagement.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-blue-800 flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Strategies */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proven Engagement Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">🎯</span>
              Opening Hooks
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Start with a compelling question</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Use surprising statistics or facts</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Share a personal story or anecdote</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Create curiosity gaps</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">📞</span>
              Call-to-Actions
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Ask specific questions to readers</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Encourage sharing and commenting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Provide clear next steps</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Create urgency when appropriate</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">💫</span>
              Emotional Connection
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Use personal pronouns (you, we, us)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Include relatable examples</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Address pain points and solutions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Use storytelling techniques</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">📱</span>
              Visual Appeal
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Use bullet points and lists</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Keep paragraphs short</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Add clear headings and subheadings</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Include relevant images or media</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Engagement Score Interpretation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Score Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">80-100</div>
            <div className="text-sm font-medium text-green-800 mb-1">High Engagement</div>
            <div className="text-xs text-green-700">Likely to drive significant user interaction</div>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">60-79</div>
            <div className="text-sm font-medium text-yellow-800 mb-1">Moderate Engagement</div>
            <div className="text-xs text-yellow-700">Good potential with some improvements</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600 mb-2">0-59</div>
            <div className="text-sm font-medium text-red-800 mb-1">Low Engagement</div>
            <div className="text-xs text-red-700">Needs significant improvements to engage readers</div>
          </div>
        </div>
      </div>
    </div>
  );
}