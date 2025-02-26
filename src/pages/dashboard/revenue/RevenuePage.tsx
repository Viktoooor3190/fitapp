import { useState } from 'react';
import { 
  DollarSign, TrendingUp, Users, 
  Calendar, Download, Filter,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp, staggerChildren, cardHover } from '../../../animations/dashboard';
import { useRevenueData } from '../../../hooks/useRevenueData';

interface Revenue {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  type: 'subscription' | 'one-time' | 'package';
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscriptions: number;
  revenueGrowth: number;
}

const RevenuePage = () => {
  const [dateFilter, setDateFilter] = useState('this-month');
  const { transactions, stats, loading, error } = useRevenueData(dateFilter);
  
  // Helper function to format growth percentage with + or - sign
  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };
  
  return (
    <motion.div 
      className="h-full p-6"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revenue
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your earnings and payments
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerChildren}
      >
        <motion.div
          variants={fadeInUp}
          {...cardHover}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`text-sm flex items-center ${
              stats.revenueGrowth >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {stats.revenueGrowth >= 0 
                ? <ArrowUpRight className="w-4 h-4 mr-1" />
                : <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              {formatGrowth(stats.revenueGrowth)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${stats.totalRevenue.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Revenue
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          {...cardHover}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className={`text-sm flex items-center ${
              (stats.recurringGrowth || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {(stats.recurringGrowth || 0) >= 0 
                ? <ArrowUpRight className="w-4 h-4 mr-1" />
                : <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              {formatGrowth(stats.recurringGrowth || 0)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            ${stats.monthlyRecurring.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monthly Recurring
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          {...cardHover}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className={`text-sm flex items-center ${
              (stats.subscriptionGrowth || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {(stats.subscriptionGrowth || 0) >= 0 
                ? <ArrowUpRight className="w-4 h-4 mr-1" />
                : <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              {formatGrowth(stats.subscriptionGrowth || 0)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.activeSubscriptions}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Active Subscriptions
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          {...cardHover}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className={`text-sm flex items-center ${
              stats.revenueGrowth >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {stats.revenueGrowth >= 0 
                ? <ArrowUpRight className="w-4 h-4 mr-1" />
                : <ArrowDownRight className="w-4 h-4 mr-1" />
              }
              {formatGrowth(stats.revenueGrowth)}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.abs(stats.revenueGrowth).toFixed(1)}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Revenue Growth
          </p>
        </motion.div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        variants={fadeInUp}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="3-months">Last 3 Months</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transactions found for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.clientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RevenuePage; 