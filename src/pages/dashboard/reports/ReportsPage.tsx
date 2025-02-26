import { useState } from 'react';
import { 
  BarChart2, TrendingUp, Download, 
  Filter, Calendar, Users,
  ArrowUpRight, ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useReportsData } from '../../../hooks/useReportsData';
import { useAuth } from '../../../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase/config';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('last-7-days');
  const [reportType, setReportType] = useState('performance');
  const { reportsData, loading, error } = useReportsData(dateRange);
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Handle export report functionality
  const handleExportReport = () => {
    // Create a text representation of the report
    let reportText = `COACH PERFORMANCE REPORT\n`;
    reportText += `Date Range: ${dateRange}\n\n`;
    
    // Add performance metrics
    reportText += `PERFORMANCE METRICS:\n`;
    reportsData.performanceMetrics.forEach(metric => {
      reportText += `${metric.title}: ${metric.value} (${metric.change >= 0 ? '+' : ''}${metric.change}% ${metric.period})\n`;
    });
    
    // Add client progress
    reportText += `\nCLIENT PROGRESS:\n`;
    reportText += `Weight Goals: ${reportsData.clientProgress.weightGoals}%\n`;
    reportText += `Strength Goals: ${reportsData.clientProgress.strengthGoals}%\n`;
    reportText += `Cardio Goals: ${reportsData.clientProgress.cardioGoals}%\n`;
    
    // Add client engagement
    reportText += `\nCLIENT ENGAGEMENT:\n`;
    reportText += `Workout Completion Rate: ${reportsData.clientEngagement.workoutCompletionRate}%\n`;
    reportText += `Session Attendance: ${reportsData.clientEngagement.sessionAttendance}%\n`;
    reportText += `App Usage: ${reportsData.clientEngagement.appUsage}%\n`;
    
    // Add timestamp
    reportText += `\nReport generated on: ${new Date().toLocaleString()}`;
    
    // Create a blob and download it
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coach-report-${dateRange}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle manual update of reports
  const handleManualUpdate = async () => {
    if (!user) return;
    
    setUpdating(true);
    setUpdateError(null);
    
    try {
      // Call the Cloud Function to update reports
      const manualReportsUpdate = httpsCallable(functions, 'manualReportsUpdate');
      await manualReportsUpdate();
      
      // Refresh the data
      setDateRange(prev => prev); // This will trigger a re-fetch
      
    } catch (err) {
      console.error('Error updating reports:', err);
      setUpdateError('Failed to update reports. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your coaching performance and client progress
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          {/* Manual Update Button */}
          <button
            onClick={handleManualUpdate}
            disabled={updating || loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Reports
              </>
            )}
          </button>
          
          {/* Export Button */}
          <button
            onClick={handleExportReport}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Update Error Message */}
      {updateError && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {updateError}
        </div>
      )}
      
      {/* Filter Controls */}
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {reportsData.performanceMetrics.map((metric, index) => (
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
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Client Progress Overview
                  </h2>
                  <div className="relative ml-2 group">
                    <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 cursor-help">
                      ?
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      This data is calculated from your clients' actual goals and progress. It shows the average progress percentage across all clients for each goal type.
                    </div>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-pulse h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                ) : (
                  <button 
                    onClick={() => setDateRange(dateRange)} 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Refresh
                  </button>
                )}
              </div>
              
              {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {/* Loading skeleton */}
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="animate-pulse h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="animate-pulse h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress Bars */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Weight Goals</span>
                      <span className="text-gray-900 dark:text-white">{reportsData.clientProgress.weightGoals}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${reportsData.clientProgress.weightGoals}%` }} 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Strength Goals</span>
                      <span className="text-gray-900 dark:text-white">{reportsData.clientProgress.strengthGoals}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${reportsData.clientProgress.strengthGoals}%` }} 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Cardio Goals</span>
                      <span className="text-gray-900 dark:text-white">{reportsData.clientProgress.cardioGoals}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${reportsData.clientProgress.cardioGoals}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
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
                    {reportsData.clientEngagement.workoutCompletionRate}%
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
                    {reportsData.clientEngagement.sessionAttendance}%
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
                    {reportsData.clientEngagement.appUsage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage; 