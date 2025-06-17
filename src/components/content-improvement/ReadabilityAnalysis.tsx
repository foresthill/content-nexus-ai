'use client';

import React from 'react';
import { ReadabilityAnalysis as ReadabilityType } from '@/types/content-improvement';

interface ReadabilityAnalysisProps {
  readability: ReadabilityType;
}

export function ReadabilityAnalysis({ readability }: ReadabilityAnalysisProps) {
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

  const getGradeLevelColor = (level: number) => {
    if (level <= 8) return 'text-green-600 bg-green-50';
    if (level <= 12) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Overall Readability Score */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Readability Score</h3>
            <p className="text-sm text-gray-600 mt-1">How easy your content is to read and understand</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(readability.score)}`}>
              {readability.score}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(readability.score)}`}
              style={{ width: `${readability.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Readability Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flesch-Kincaid Grade Level */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Flesch-Kincaid Grade Level</h4>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeLevelColor(readability.metrics.fleschKincaid)}`}>
                Grade {readability.metrics.fleschKincaid.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              The school grade level needed to understand this text
            </p>
            <div className="text-xs text-gray-500">
              Target: Grade 8-12 for general audience
            </div>
          </div>

          {/* Average Sentence Length */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Average Sentence Length</h4>
              <span className="text-lg font-bold text-gray-800">
                {readability.metrics.averageSentenceLength.toFixed(1)} words
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Average number of words per sentence
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  readability.metrics.averageSentenceLength <= 20 ? 'bg-green-500' : 
                  readability.metrics.averageSentenceLength <= 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((readability.metrics.averageSentenceLength / 30) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: 15-20 words per sentence
            </div>
          </div>

          {/* Complex Words */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Complex Words</h4>
              <span className="text-lg font-bold text-gray-800">
                {readability.metrics.complexWords.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Percentage of words with 3+ syllables
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  readability.metrics.complexWords <= 10 ? 'bg-green-500' : 
                  readability.metrics.complexWords <= 15 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(readability.metrics.complexWords * 5, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: Less than 10% for general audience
            </div>
          </div>

          {/* Passive Voice */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Passive Voice</h4>
              <span className="text-lg font-bold text-gray-800">
                {readability.metrics.passiveVoice}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Percentage of sentences using passive voice
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  readability.metrics.passiveVoice <= 20 ? 'bg-green-500' : 
                  readability.metrics.passiveVoice <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(readability.metrics.passiveVoice * 3, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: Less than 20% passive voice
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600 mb-2">
              {readability.targetAudience.readingLevel}
            </div>
            <div className="text-sm font-medium text-blue-800 mb-1">Reading Level</div>
            <div className="text-xs text-blue-600">
              Appropriate educational level
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600 mb-2">
              {readability.targetAudience.ageGroup}
            </div>
            <div className="text-sm font-medium text-green-800 mb-1">Age Group</div>
            <div className="text-xs text-green-600">
              Recommended age range
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600 mb-2">
              {readability.targetAudience.expertise}
            </div>
            <div className="text-sm font-medium text-purple-800 mb-1">Expertise Level</div>
            <div className="text-xs text-purple-600">
              Required knowledge level
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Recommendations */}
      <div className="space-y-4">
        {/* Simplify Language */}
        {readability.recommendations.simplifyLanguage.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <span className="mr-2">🔤</span>
              Simplify Language
            </h3>
            <div className="space-y-2">
              {readability.recommendations.simplifyLanguage.map((recommendation, index) => (
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

        {/* Shorten Sentences */}
        {readability.recommendations.shortenSentences.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
              <span className="mr-2">✂️</span>
              Shorten Sentences
            </h3>
            <div className="space-y-2">
              {readability.recommendations.shortenSentences.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-orange-800 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improve Flow */}
        {readability.recommendations.improveFlow.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <span className="mr-2">🌊</span>
              Improve Flow
            </h3>
            <div className="space-y-2">
              {readability.recommendations.improveFlow.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-green-800 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reading Level Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Level Guide</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-100 rounded">
            <div>
              <span className="font-medium text-green-800">Elementary (Grade 1-5)</span>
              <span className="text-sm text-green-600 ml-2">Very easy to read</span>
            </div>
            <span className="text-green-700 font-bold">Flesch-Kincaid: 1-5</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-100 rounded">
            <div>
              <span className="font-medium text-blue-800">Middle School (Grade 6-8)</span>
              <span className="text-sm text-blue-600 ml-2">Easy to read</span>
            </div>
            <span className="text-blue-700 font-bold">Flesch-Kincaid: 6-8</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-100 rounded">
            <div>
              <span className="font-medium text-yellow-800">High School (Grade 9-12)</span>
              <span className="text-sm text-yellow-600 ml-2">Moderately difficult</span>
            </div>
            <span className="text-yellow-700 font-bold">Flesch-Kincaid: 9-12</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-100 rounded">
            <div>
              <span className="font-medium text-orange-800">College (Grade 13-16)</span>
              <span className="text-sm text-orange-600 ml-2">Difficult to read</span>
            </div>
            <span className="text-orange-700 font-bold">Flesch-Kincaid: 13-16</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-100 rounded">
            <div>
              <span className="font-medium text-red-800">Graduate (Grade 17+)</span>
              <span className="text-sm text-red-600 ml-2">Very difficult to read</span>
            </div>
            <span className="text-red-700 font-bold">Flesch-Kincaid: 17+</span>
          </div>
        </div>
      </div>

      {/* Readability Tips */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Readability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Sentence Structure</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Keep sentences under 20 words when possible</li>
              <li>• Use active voice instead of passive voice</li>
              <li>• Break long sentences into shorter ones</li>
              <li>• Use simple sentence structures</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Word Choice</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Choose simple words over complex ones</li>
              <li>• Define technical terms when necessary</li>
              <li>• Avoid jargon and industry-specific language</li>
              <li>• Use familiar words your audience knows</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Text Formatting</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use headings and subheadings</li>
              <li>• Break text into short paragraphs</li>
              <li>• Add bullet points and numbered lists</li>
              <li>• Include white space for visual breaks</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Content Organization</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Start with the most important information</li>
              <li>• Use logical flow and transitions</li>
              <li>• Provide clear examples and explanations</li>
              <li>• Summarize key points at the end</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}