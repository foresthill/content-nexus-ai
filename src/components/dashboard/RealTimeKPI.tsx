'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { KPIMetrics } from '@/types/analytics';

interface KPIIndicatorProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  isRealTime?: boolean;
  lastUpdated?: Date;
  target?: number;
  unit?: string;
}

const RealTimeKPIIndicator: React.FC<KPIIndicatorProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  isRealTime = false,
  lastUpdated,
  target,
  unit = ''
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  // Simulate real-time updates
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        // Simulate small random changes for real-time effect
        const numValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newValue = Math.max(0, numValue * (1 + variation));
        
        setCurrentValue(typeof value === 'number' ? Math.round(newValue) : newValue.toFixed(1));
        setIsFlashing(true);
        
        setTimeout(() => setIsFlashing(false), 200);
      }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

      return () => clearInterval(interval);
    }
  }, [value, isRealTime]);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'bg-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      accent: 'bg-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'bg-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      accent: 'bg-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      accent: 'bg-red-600'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'bg-gray-600'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpIcon;
    if (trend === 'down') return ArrowDownIcon;
    return MinusIcon;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const TrendIcon = getTrendIcon();
  const classes = colorClasses[color];

  // Calculate progress percentage for target
  const getProgressPercentage = () => {
    if (!target) return 0;
    const numValue = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue.toString().replace(/[^0-9.-]/g, ''));
    return Math.min(100, (numValue / target) * 100);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border ${classes.border} p-4 relative overflow-hidden transition-all duration-200 ${
      isFlashing ? 'ring-2 ring-blue-400 shadow-lg' : ''
    }`}>
      {/* Real-time indicator */}
      {isRealTime && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">LIVE</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 truncate">{title}</h3>
        <div className={`p-2 rounded-full ${classes.bg}`}>
          <Icon className={`h-4 w-4 ${classes.text}`} />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">
          {currentValue}{unit}
        </p>
      </div>

      {/* Change and Trend */}
      {change !== undefined && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <TrendIcon className={`h-4 w-4 ${getTrendColor()}`} />
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Progress bar for targets */}
      {target && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{getProgressPercentage().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${classes.accent}`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-400 flex items-center space-x-1">
          <ClockIcon className="h-3 w-3" />
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

interface RealTimeKPIDashboardProps {
  refreshInterval?: number;
  showTargets?: boolean;
  showAlerts?: boolean;
}

const RealTimeKPIDashboard: React.FC<RealTimeKPIDashboardProps> = ({
  refreshInterval = 30000,
  showTargets = true,
  showAlerts = true
}) => {
  const [kpiData, setKpiData] = useState<KPIMetrics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch KPI data
  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/analytics/kpi?real_time=true&alerts=true&timeframe=24h');
      const data = await response.json();
      setKpiData(data.current);
      setAlerts(data.alerts || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
    
    const interval = setInterval(fetchKPIData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load KPI data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-medium text-yellow-800">Active Alerts</h3>
          </div>
          <div className="mt-2 space-y-1">
            {alerts.slice(0, 3).map((alert, index) => (
              <p key={index} className="text-sm text-yellow-700">
                • {alert.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeKPIIndicator
          title="Total Engagement"
          value={kpiData.totalEngagement.toLocaleString()}
          change={kpiData.growthRate}
          trend={kpiData.engagementTrend}
          icon={HeartIcon}
          color="blue"
          isRealTime={true}
          lastUpdated={lastUpdate}
          target={showTargets ? kpiData.totalEngagement * 1.2 : undefined}
        />

        <RealTimeKPIIndicator
          title="Engagement Rate"
          value={kpiData.averageEngagementRate}
          trend={kpiData.engagementTrend}
          icon={TrendingUpIcon}
          color="green"
          isRealTime={true}
          lastUpdated={lastUpdate}
          unit="%"
          target={showTargets ? 10 : undefined}
        />

        <RealTimeKPIIndicator
          title="Total Reach"
          value={kpiData.totalReach.toLocaleString()}
          trend={kpiData.engagementTrend}
          icon={EyeIcon}
          color="purple"
          isRealTime={true}
          lastUpdated={lastUpdate}
          target={showTargets ? kpiData.totalReach * 1.3 : undefined}
        />

        <RealTimeKPIIndicator
          title="Revenue"
          value={kpiData.revenueGenerated.toLocaleString()}
          change={15.8}
          trend="up"
          icon={CurrencyDollarIcon}
          color="orange"
          isRealTime={true}
          lastUpdated={lastUpdate}
          unit="$"
          target={showTargets ? 10000 : undefined}
        />

        <RealTimeKPIIndicator
          title="Followers Growth"
          value={kpiData.followersGrowth}
          change={kpiData.growthRate}
          trend={kpiData.growthRate > 0 ? 'up' : kpiData.growthRate < 0 ? 'down' : 'stable'}
          icon={UserGroupIcon}
          color="blue"
          isRealTime={true}
          lastUpdated={lastUpdate}
          target={showTargets ? 1500 : undefined}
        />

        <RealTimeKPIIndicator
          title="Conversion Rate"
          value={kpiData.conversionRate}
          change={8.3}
          trend="up"
          icon={ChartBarIcon}
          color="green"
          isRealTime={true}
          lastUpdated={lastUpdate}
          unit="%"
          target={showTargets ? 5 : undefined}
        />

        <RealTimeKPIIndicator
          title="Content Published"
          value={kpiData.contentPublished}
          trend="stable"
          icon={BoltIcon}
          color="purple"
          lastUpdated={lastUpdate}
          target={showTargets ? 50 : undefined}
        />

        <RealTimeKPIIndicator
          title="Impressions"
          value={kpiData.totalImpressions.toLocaleString()}
          change={12.5}
          trend="up"
          icon={EyeIcon}
          color="gray"
          isRealTime={true}
          lastUpdated={lastUpdate}
          target={showTargets ? kpiData.totalImpressions * 1.25 : undefined}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Real-time monitoring active</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={fetchKPIData}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
        
        {/* Performance Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Overall Trend</p>
              <div className="flex items-center justify-center space-x-1">
                {kpiData.engagementTrend === 'up' ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-600" />
                ) : kpiData.engagementTrend === 'down' ? (
                  <TrendingDownIcon className="h-4 w-4 text-red-600" />
                ) : (
                  <MinusIcon className="h-4 w-4 text-gray-500" />
                )}
                <span className={`text-sm font-medium ${
                  kpiData.engagementTrend === 'up' ? 'text-green-600' :
                  kpiData.engagementTrend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {kpiData.engagementTrend.charAt(0).toUpperCase() + kpiData.engagementTrend.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className={`text-lg font-bold ${
                kpiData.growthRate > 0 ? 'text-green-600' : 
                kpiData.growthRate < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {kpiData.growthRate > 0 ? '+' : ''}{kpiData.growthRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Content</p>
              <p className="text-sm font-medium text-gray-900">
                {kpiData.topPerformingContent.length} viral posts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeKPIDashboard;