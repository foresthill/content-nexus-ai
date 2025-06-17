'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentImprovementDashboard } from '@/components/content-improvement';

function ContentImprovementForm() {
  const searchParams = useSearchParams();
  
  // Get initial content from URL parameters
  const initialContent = searchParams.get('content') || '';
  const initialTitle = searchParams.get('title') || '';
  const platform = searchParams.get('platform') || undefined;
  const targetAudience = searchParams.get('audience') || undefined;
  const category = searchParams.get('category') || undefined;

  return (
    <ContentImprovementDashboard
      initialContent={initialContent}
      initialTitle={initialTitle}
      platform={platform}
      targetAudience={targetAudience}
      category={category}
      onContentImproved={(improvedContent) => {
        // Handle content improvement - could update URL or trigger callbacks
        console.log('Content improved:', improvedContent.substring(0, 100) + '...');
      }}
    />
  );
}

export default function ContentImprovementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content improvement dashboard...</p>
          </div>
        </div>
      }>
        <ContentImprovementForm />
      </Suspense>
    </div>
  );
}