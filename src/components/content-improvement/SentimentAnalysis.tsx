'use client';

import React from 'react';
import { SentimentAnalysis as SentimentType } from '@/types/content-improvement';

interface SentimentAnalysisProps {
  sentiment: SentimentType;
}

export function SentimentAnalysis({ sentiment }: SentimentAnalysisProps) {
  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      default: return '😐';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const emotions = [
    { name: 'Joy', value: sentiment.emotions.joy, color: 'bg-yellow-500', icon: '😄' },
    { name: 'Trust', value: sentiment.emotions.trust, color: 'bg-blue-500', icon: '🤝' },
    { name: 'Surprise', value: sentiment.emotions.surprise, color: 'bg-purple-500', icon: '😲' },
    { name: 'Sadness', value: sentiment.emotions.sadness, color: 'bg-blue-400', icon: '😢' },
    { name: 'Fear', value: sentiment.emotions.fear, color: 'bg-gray-500', icon: '😨' },
    { name: 'Anger', value: sentiment.emotions.anger, color: 'bg-red-500', icon: '😠' }
  ];

  const tones = [
    { name: 'Formal', value: sentiment.tone.formal, color: 'bg-indigo-500' },
    { name: 'Casual', value: sentiment.tone.casual, color: 'bg-green-500' },
    { name: 'Professional', value: sentiment.tone.professional, color: 'bg-blue-500' },
    { name: 'Friendly', value: sentiment.tone.friendly, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Sentiment</h3>
            <p className="text-sm text-gray-600 mt-1">The emotional tone and feeling of your content</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{getSentimentIcon(sentiment.overall)}</span>
              <div>
                <div className={`text-2xl font-bold capitalize ${getSentimentColor(sentiment.overall).split(' ')[0]}`}>
                  {sentiment.overall}
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${getConfidenceColor(sentiment.confidence)}`}>
                  {Math.round(sentiment.confidence * 100)}% confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Breakdown</h3>
        <p className="text-sm text-gray-600 mb-4">
          Percentage of different emotions detected in your content
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {emotions.map((emotion, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{emotion.icon}</span>
                  <span className="font-medium text-gray-900">{emotion.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {emotion.value.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${emotion.color}`}
                  style={{ width: `${Math.min(emotion.value * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tone Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tone Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          The writing style and communication approach of your content
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tones.map((tone, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {tone.value.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-700">{tone.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${tone.color}`}
                    style={{ width: `${Math.min(tone.value * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Optimization */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Sentiment Optimization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Current Tone</h4>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <span className="text-lg font-medium text-gray-900 capitalize">
                {sentiment.optimization.currentTone}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Suggested Tone</h4>
            <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
              <span className="text-lg font-medium text-blue-900 capitalize">
                {sentiment.optimization.suggestedTone}
              </span>
            </div>
          </div>
        </div>

        {sentiment.optimization.adjustments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-blue-800 mb-3">Recommended Adjustments</h4>
            <div className="space-y-2">
              {sentiment.optimization.adjustments.map((adjustment, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-blue-800 flex-1">{adjustment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sentiment Guidelines */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Guidelines by Platform</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Social Media Platforms</h4>
            
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>📘</span>
                  <span className="font-medium text-gray-900">Facebook</span>
                </div>
                <p className="text-sm text-gray-600">
                  Friendly and conversational tone works best. Mix positive emotions with authentic experiences.
                </p>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>🐦</span>
                  <span className="font-medium text-gray-900">Twitter</span>
                </div>
                <p className="text-sm text-gray-600">
                  Casual and direct tone. Strong emotions (both positive and negative) can drive engagement.
                </p>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>📸</span>
                  <span className="font-medium text-gray-900">Instagram</span>
                </div>
                <p className="text-sm text-gray-600">
                  Positive and inspiring tone. Focus on joy, surprise, and aspirational emotions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Professional Platforms</h4>
            
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>💼</span>
                  <span className="font-medium text-gray-900">LinkedIn</span>
                </div>
                <p className="text-sm text-gray-600">
                  Professional and trustworthy tone. Balance confidence with humility and expertise.
                </p>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>📝</span>
                  <span className="font-medium text-gray-900">Blog Posts</span>
                </div>
                <p className="text-sm text-gray-600">
                  Depends on audience. Educational content should be neutral to positive with high trust.
                </p>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span>📧</span>
                  <span className="font-medium text-gray-900">Email Marketing</span>
                </div>
                <p className="text-sm text-gray-600">
                  Friendly yet professional. Build trust while maintaining enthusiasm for your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Impact Tips */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Emotional Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">✅</span>
              Do
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Use personal pronouns (you, we, us) to create connection</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Share authentic stories and experiences</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Address your audience's pain points and aspirations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Use specific, vivid language that evokes imagery</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Balance emotions appropriately for your message</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">❌</span>
              Avoid
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Overly dramatic or manipulative language</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Inconsistent tone throughout your content</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Negative emotions without providing solutions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Generic, emotionless corporate speak</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Forcing emotions that don't match your brand</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confidence Level Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Level Guide</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-100 rounded">
            <div>
              <span className="font-medium text-green-800">High Confidence (80%+)</span>
              <span className="text-sm text-green-600 ml-2">Clear sentiment, take action</span>
            </div>
            <span className="text-green-700 font-bold">Reliable Analysis</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-100 rounded">
            <div>
              <span className="font-medium text-yellow-800">Medium Confidence (60-79%)</span>
              <span className="text-sm text-yellow-600 ml-2">Generally accurate, minor adjustments</span>
            </div>
            <span className="text-yellow-700 font-bold">Good Analysis</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-100 rounded">
            <div>
              <span className="font-medium text-red-800">Low Confidence (Below 60%)</span>
              <span className="text-sm text-red-600 ml-2">Mixed signals, review content tone</span>
            </div>
            <span className="text-red-700 font-bold">Needs Review</span>
          </div>
        </div>
      </div>
    </div>
  );
}