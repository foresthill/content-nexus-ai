'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ViewCount } from '@/types/analytics';

export type ChartType = 'line' | 'area' | 'bar' | 'pie';

interface AnalyticsChartProps {
  data: ViewCount[] | Record<string, number>;
  type?: ChartType;
  title: string;
  description?: string;
  height?: number;
  colors?: string[];
}

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  type = 'line',
  title,
  description,
  height = 300,
  colors = CHART_COLORS
}) => {
  // データ形式に応じてチャートデータを準備
  const isViewCountData = Array.isArray(data) && data.length > 0 && 'date' in data[0];
  
  // ViewCount[] 形式のデータを処理
  const timeSeriesData = isViewCountData
    ? (data as ViewCount[]).map((item) => ({
        name: formatDate(item.date),
        value: item.count
      }))
    : [];
  
  // Record<string, number> 形式のデータを処理
  const categoryData = !isViewCountData
    ? Object.entries(data as Record<string, number>).map(([name, value]) => ({
        name,
        value
      }))
    : [];
  
  // 使用するデータを決定
  const chartData = isViewCountData ? timeSeriesData : categoryData;

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              activeDot={{ r: 8 }}
              name={title}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              name={title}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={colors[0]} name={title} />
          </BarChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill={colors[0]}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      
      default:
        return <div>サポートされていないチャートタイプです</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;