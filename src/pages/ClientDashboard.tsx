import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface ClientData {
  name: string;
  email: string;
  status: string;
  onboardingCompleted: boolean;
  fitnessGoals?: string;
  experienceLevel?: string;
  healthConditions?: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const clientDoc = await getDoc(doc(db, 'clients', user.uid));
        if (clientDoc.exists()) {
          setClientData(clientDoc.data() as ClientData);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1f2b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2b] p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {clientData?.name}!
            </h1>
            <p className="text-gray-400 mt-2">
              Track your progress and manage your fitness journey
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-medium capitalize">{clientData?.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fitness Goal</span>
                  <span className="text-white font-medium capitalize">{clientData?.fitnessGoals || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Experience</span>
                  <span className="text-white font-medium capitalize">{clientData?.experienceLevel || 'Not set'}</span>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Sessions Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Sessions</h2>
              <div className="text-gray-400 text-center py-8">
                No upcoming sessions scheduled
              </div>
              <button 
                onClick={() => navigate('/schedule')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors"
              >
                Schedule Session
              </button>
            </motion.div>

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Progress Tracking</h2>
              <div className="text-gray-400 text-center py-8">
                Start tracking your fitness progress
              </div>
              <button 
                onClick={() => navigate('/progress')}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors"
              >
                View Progress
              </button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/workouts')}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors"
            >
              My Workouts
            </button>
            <button
              onClick={() => navigate('/nutrition')}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors"
            >
              Nutrition Plan
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors"
            >
              Message Coach
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors"
            >
              Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard; 