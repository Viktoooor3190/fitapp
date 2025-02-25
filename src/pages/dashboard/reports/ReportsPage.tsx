import { useState } from 'react';
import { 
  BarChart2, TrendingUp, Download, 
  Filter, Calendar, Users,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  period: string;
}

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('performance');

  const performanceMetrics: MetricCard[] = [
    {
      title: 'Client Retention Rate',
      value: '92%',
      change: 5.2,
      trend: 'up',
      period: 'vs last month'
    },
    {
      title: 'Average Session Rating',
      value: '4.8/5',
      change: 0.3,
      trend: 'up',
      period: 'vs last month'
    },
    {
      title: 'Client Goal Achievement',
      value: '78%',
      change: -2.1,
      trend: 'down',
      period: 'vs last month'
    },
    {
      title: 'Active Programs',
      value: '24',
      change: 4,
      trend: 'up',
      period: 'vs last month'
    }
  ];

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track performance and analyze trends
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="year-to-date">Year to Date</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="performance">Performance Metrics</option>
            <option value="client-progress">Client Progress</option>
            <option value="revenue">Revenue Analysis</option>
            <option value="engagement">Client Engagement</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.title}
            </p>
            <div className="mt-2 flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </h3>
              <span className={`ml-2 text-sm flex items-center ${
                metric.trend === 'up' 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {metric.period}
            </p>
          </div>
        ))}
      </div>

      {/* Main Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Client Progress Overview
          </h2>
          <div className="space-y-4">
            {/* Progress Bars */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Weight Goals</span>
                <span className="text-gray-900 dark:text-white">75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Strength Goals</span>
                <span className="text-gray-900 dark:text-white">82%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Cardio Goals</span>
                <span className="text-gray-900 dark:text-white">68%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Client Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Client Engagement
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Workout Completion Rate
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last 30 days average
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                87%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Session Attendance
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last 30 days average
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                92%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  App Usage
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily active users
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                85%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 