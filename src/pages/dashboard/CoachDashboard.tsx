import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, Activity, DollarSign, Calendar, 
  BarChart2, MessageSquare, Clock, TrendingUp 
} from 'lucide-react';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp, staggerChildren } from '../../animations/dashboard';

const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('overview');

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Quick Stats Data
  const stats = [
    {
      label: 'Total Clients',
      value: '24',
      change: '+2 this week',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Monthly Revenue',
      value: '$2,400',
      change: '+15% vs last month',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Active Programs',
      value: '18',
      change: '75% engagement',
      icon: Activity,
      color: 'purple'
    },
    {
      label: 'Upcoming Sessions',
      value: '8',
      change: 'Next: Today 2PM',
      icon: Calendar,
      color: 'orange'
    }
  ];

  // Recent Activity Data
  const recentActivity = [
    {
      type: 'new_client',
      message: 'Sarah Johnson joined as a new client',
      time: '2 minutes ago',
      icon: Users,
      color: 'green'
    },
    {
      type: 'workout_complete',
      message: 'Mike completed "Upper Body Strength"',
      time: '15 minutes ago',
      icon: Activity,
      color: 'blue'
    },
    {
      type: 'progress_update',
      message: 'Emma updated her progress photos',
      time: '1 hour ago',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      type: 'message',
      message: 'New message from David about diet plan',
      time: '2 hours ago',
      icon: MessageSquare,
      color: 'orange'
    }
  ];

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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
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
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`p-2 bg-${activity.color}-100 dark:bg-${activity.color}-900/20 rounded-lg`}>
                    <activity.icon className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((session) => (
                <div
                  key={session}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Training Session with Sarah
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Today at 2:00 PM
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachDashboard; 