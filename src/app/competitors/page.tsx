'use client';

import React from 'react';
import { CompetitorAnalysisDashboard } from '@/components/competitors';

const CompetitorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CompetitorAnalysisDashboard />
    </div>
  );
};

export default CompetitorsPage;