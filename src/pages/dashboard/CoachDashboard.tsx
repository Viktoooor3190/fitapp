import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, Activity, DollarSign, Calendar, 
  MessageSquare, Clock, TrendingUp, Loader
} from 'lucide-react';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp, staggerChildren } from '../../animations/dashboard';
import { useClientStats } from '../../hooks/useClientStats';
import { useProgramStats } from '../../hooks/useProgramStats';
import { useUpcomingSessions } from '../../hooks/useUpcomingSessions';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { useRevenueData } from '../../hooks/useRevenueData';

const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('overview');

  // Fetch data using our custom hooks
  const { stats: clientStats, loading: clientsLoading } = useClientStats();
  const { stats: programStats, loading: programsLoading } = useProgramStats();
  const { sessions, loading: sessionsLoading, getNextSessionTime } = useUpcomingSessions(3);
  const { activities, loading: activitiesLoading } = useRecentActivity(4);
  const { stats: revenueStats, loading: revenueLoading } = useRevenueData('this-month');

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Navigate to specific sections when clicking on stats cards
  const navigateToSection = (section: string) => {
    navigate(`/dashboard/${section}`);
  };

  // Determine loading state
  const isLoading = clientsLoading || programsLoading || sessionsLoading || activitiesLoading || revenueLoading;

  // Quick Stats Data with real values
  const stats = [
    {
      label: 'Total Clients',
      value: clientStats.totalClients.toString(),
      change: `+${clientStats.newClientsThisWeek} this week`,
      icon: Users,
      color: 'blue',
      onClick: () => navigateToSection('clients')
    },
    {
      label: 'Monthly Revenue',
      value: `$${revenueStats.monthlyRecurring.toLocaleString()}`,
      change: `${revenueStats.revenueGrowth >= 0 ? '+' : ''}${revenueStats.revenueGrowth.toFixed(1)}% vs last month`,
      icon: DollarSign,
      color: 'green',
      onClick: () => navigateToSection('revenue')
    },
    {
      label: 'Active Programs',
      value: programStats.activePrograms.toString(),
      change: `${programStats.engagementRate.toFixed(0)}% engagement`,
      icon: Activity,
      color: 'purple',
      onClick: () => navigateToSection('programs')
    },
    {
      label: 'Upcoming Sessions',
      value: sessions.length.toString(),
      change: `Next: ${getNextSessionTime()}`,
      icon: Calendar,
      color: 'orange',
      onClick: () => navigateToSection('schedule')
    }
  ];

  // Map activity types to icons and colors
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_client':
        return { icon: Users, color: 'green' };
      case 'workout_complete':
        return { icon: Activity, color: 'blue' };
      case 'progress_update':
        return { icon: TrendingUp, color: 'purple' };
      case 'message':
        return { icon: MessageSquare, color: 'orange' };
      case 'payment':
        return { icon: DollarSign, color: 'green' };
      case 'session_completed':
        return { icon: Calendar, color: 'blue' };
      default:
        return { icon: Activity, color: 'gray' };
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.displayName || 'Coach'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your clients today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/dashboard/clients/new')}
              >
                Add New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              variants={staggerChildren}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity & Upcoming Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h2>
                {activities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity to display
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center space-x-4">
                          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
                            <ActivityIcon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.relativeTime}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upcoming Sessions
                </h2>
                {sessions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No upcoming sessions scheduled
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      // Format date for display
                      const options: Intl.DateTimeFormatOptions = { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      };
                      const formattedDate = session.date.toLocaleDateString('en-US', options);
                      
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {session.title} with {session.clientName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formattedDate} at {session.time}
                              </p>
                            </div>
                          </div>
                          <button 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={() => navigate(`/dashboard/schedule/${session.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CoachDashboard; 