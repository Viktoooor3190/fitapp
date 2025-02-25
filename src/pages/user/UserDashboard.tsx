import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  Activity, Calendar, MessageSquare,
  TrendingUp, Apple, Dumbbell
} from 'lucide-react';

interface UserData {
  name: string;
  onboardingAnswers: Record<string, any>;
  status: string;
}

const UserDashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'clients', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userData?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your fitness journey overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Today's Workout
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Upper Body
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Next Session
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Tomorrow, 10 AM
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Progress
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            75%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Messages
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            2 New
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workout Plan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Workout Plan
            </h2>
            <Dumbbell className="w-5 h-5 text-gray-400" />
          </div>
          {/* Add workout details here */}
        </motion.div>

        {/* Nutrition Plan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nutrition Plan
            </h2>
            <Apple className="w-5 h-5 text-gray-400" />
          </div>
          {/* Add nutrition details here */}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard; 