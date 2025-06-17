'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  EyeIcon,
  ArrowArrowTrendingUpIcon,
  ArrowArrowTrendingDownIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface CompetitorData {
  name: string;
  marketShare: number;
  engagementRate: number;
  growthRate: number;
  contentScore: number;
  innovation: number;
  accessibility: number;
}

interface BenchmarkData {
  metric: string;
  yourScore: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
}

interface DifferentiationPoint {
  category: string;
  yourScore: number;
  competitorAverage: number;
  advantage: string;
}

const CompetitorAnalysisDashboard: React.FC = () => {
  const [competitorData, setCompetitorData] = useState<CompetitorData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [differentiationData, setDifferentiationData] = useState<DifferentiationPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedAnalysis, setSelectedAnalysis] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompetitorData([
        { name: 'Your Brand', marketShare: 15.2, engagementRate: 4.8, growthRate: 12.5, contentScore: 87, innovation: 92, accessibility: 78 },
        { name: 'Competitor A', marketShare: 23.5, engagementRate: 3.2, growthRate: 8.1, contentScore: 72, innovation: 65, accessibility: 88 },
        { name: 'Competitor B', marketShare: 18.7, engagementRate: 2.9, growthRate: 5.4, contentScore: 68, innovation: 78, accessibility: 62 },
        { name: 'Competitor C', marketShare: 12.8, engagementRate: 3.8, growthRate: 15.2, contentScore: 75, innovation: 55, accessibility: 75 },
        { name: 'Competitor D', marketShare: 9.3, engagementRate: 2.1, growthRate: 3.7, contentScore: 61, innovation: 48, accessibility: 82 }
      ]);

      setBenchmarkData([
        { metric: 'Engagement Rate', yourScore: 4.8, industryAverage: 3.1, topPerformer: 5.2, percentile: 85 },
        { metric: 'Content Quality', yourScore: 87, industryAverage: 68, topPerformer: 91, percentile: 92 },
        { metric: 'Innovation Score', yourScore: 92, industryAverage: 59, topPerformer: 94, percentile: 98 },
        { metric: 'Response Time', yourScore: 15, industryAverage: 45, topPerformer: 8, percentile: 78 },
        { metric: 'Brand Recognition', yourScore: 58, industryAverage: 75, topPerformer: 96, percentile: 35 }
      ]);

      setDifferentiationData([
        { category: 'Technology Innovation', yourScore: 94, competitorAverage: 67, advantage: '+27 points' },
        { category: 'Content Quality', yourScore: 87, competitorAverage: 74, advantage: '+13 points' },
        { category: 'User Experience', yourScore: 82, competitorAverage: 79, advantage: '+3 points' },
        { category: 'Brand Recognition', yourScore: 58, competitorAverage: 75, advantage: '-17 points' },
        { category: 'Market Penetration', yourScore: 45, competitorAverage: 63, advantage: '-18 points' }
      ]);

      setIsLoading(false);
    };

    fetchData();
  }, [selectedTimeframe, selectedAnalysis]);

  const renderOverviewAnalysis = () => (
    <div className="space-y-6">
      {/* Market Position Scatter Plot */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <EyeIcon className="w-5 h-5 mr-2 text-blue-600" />
          Market Positioning Map
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={competitorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="innovation" 
              name="Innovation" 
              domain={[40, 100]}
              label={{ value: 'Innovation Score', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              dataKey="accessibility" 
              name="Accessibility" 
              domain={[50, 100]}
              label={{ value: 'Accessibility Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Company: ${label}`}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-medium">{data.name}</p>
                      <p>Innovation: {data.innovation}</p>
                      <p>Accessibility: {data.accessibility}</p>
                      <p>Market Share: {data.marketShare}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter dataKey="marketShare" fill="#3b82f6">
              {competitorData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.name === 'Your Brand' ? '#10b981' : '#3b82f6'} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Competitive Radar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
          Competitive Analysis Radar
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={[
            { metric: 'Innovation', yourBrand: 92, competitor: 67 },
            { metric: 'Quality', yourBrand: 87, competitor: 74 },
            { metric: 'UX', yourBrand: 82, competitor: 79 },
            { metric: 'Recognition', yourBrand: 58, competitor: 75 },
            { metric: 'Penetration', yourBrand: 45, competitor: 63 },
            { metric: 'Growth', yourBrand: 78, competitor: 68 }
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Your Brand"
              dataKey="yourBrand"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Competitor Average"
              dataKey="competitor"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderBenchmarkAnalysis = () => (
    <div className="space-y-6">
      {/* Benchmark Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2 text-yellow-600" />
          Industry Benchmark Comparison
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="industryAverage" fill="#94a3b8" name="Industry Average" />
            <Bar dataKey="topPerformer" fill="#fbbf24" name="Top Performer" />
            <Line 
              type="monotone" 
              dataKey="yourScore" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Your Score"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Percentile Rankings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Percentiles</h3>
        <div className="space-y-4">
          {benchmarkData.map((item) => (
            <div key={item.metric} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <span className={`text-sm font-semibold ${
                    item.percentile >= 80 ? 'text-green-600' :
                    item.percentile >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {item.percentile}th percentile
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.percentile >= 80 ? 'bg-green-500' :
                      item.percentile >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.percentile}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDifferentiationAnalysis = () => (
    <div className="space-y-6">
      {/* Competitive Advantages */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ArrowArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-600" />
          Competitive Advantages & Gaps
        </h3>
        <div className="space-y-4">
          {differentiationData.map((item) => {
            const isAdvantage = item.yourScore > item.competitorAverage;
            const difference = Math.abs(item.yourScore - item.competitorAverage);
            
            return (
              <div key={item.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{item.category}</h4>
                  <div className={`flex items-center text-sm font-semibold ${
                    isAdvantage ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isAdvantage ? (
                      <ArrowArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                    )}
                    {item.advantage}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Your Score: </span>
                    <span className="font-medium">{item.yourScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Competitor Avg: </span>
                    <span className="font-medium">{item.competitorAverage}</span>
                  </div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.yourScore / 100) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${(item.competitorAverage / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Strategic Recommendations</h3>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Leverage Strengths</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• AI機能の積極的マーケティングで技術優位性をアピール</li>
              <li>• コンテンツ品質の高さを活かしたソートリーダーシップ</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Address Weaknesses</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• ブランド認知度向上のための統合マーケティング</li>
              <li>• 市場浸透拡大のためのパートナーシップ戦略</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Exploit Opportunities</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• AI-First Positioningによる市場差別化</li>
              <li>• エンタープライズ市場への戦略的進出</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">競合分析ダッシュボード</h1>
        <p className="text-gray-600">
          市場ポジショニング、業界ベンチマーク、差別化要因を総合的に分析
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">7日間</option>
          <option value="30d">30日間</option>
          <option value="90d">90日間</option>
          <option value="1y">1年間</option>
        </select>

        <select
          value={selectedAnalysis}
          onChange={(e) => setSelectedAnalysis(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="overview">Overview</option>
          <option value="benchmark">Benchmark</option>
          <option value="differentiation">Differentiation</option>
        </select>
      </div>

      {/* Analysis Content */}
      {selectedAnalysis === 'overview' && renderOverviewAnalysis()}
      {selectedAnalysis === 'benchmark' && renderBenchmarkAnalysis()}
      {selectedAnalysis === 'differentiation' && renderDifferentiationAnalysis()}
    </div>
  );
};

export default CompetitorAnalysisDashboard;