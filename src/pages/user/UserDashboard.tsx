import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  Activity, Calendar, MessageSquare,
  TrendingUp, Apple, Dumbbell,
  MessageCircle, ChevronRight
} from 'lucide-react';
import ChatFold from '../../components/chat/ChatFold';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

interface UserData {
  name: string;
  email: string;
  fitnessGoals?: string;
  experienceLevel?: string;
  todaysWorkout?: {
    name: string;
    exercises: Exercise[];
  };
  todaysNutrition?: {
    meals: string[];
    calories: number;
    protein: number;
  };
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {userData?.name}!
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Here's your fitness journey overview
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Workout</p>
                  <h3 className="text-xl font-semibold text-white mt-1">Upper Body</h3>
                </div>
                <div className="bg-blue-500/20 p-2.5 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Next Session</p>
                  <h3 className="text-xl font-semibold text-white mt-1">Tomorrow, 10 AM</h3>
                </div>
                <div className="bg-green-500/20 p-2.5 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Progress</p>
                  <h3 className="text-xl font-semibold text-white mt-1">75%</h3>
                </div>
                <div className="bg-purple-500/20 p-2.5 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Workout and Nutrition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {/* Upper Body Workout Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Upper Body Workout</h2>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Bench Press', sets: 4, reps: '12, 10, 10, 8', completed: false },
                  { name: 'Shoulder Press', sets: 4, reps: '12, 10, 10, 8', completed: false },
                  { name: 'Lat Pulldowns', sets: 3, reps: '12, 12, 10', completed: false },
                  { name: 'Bicep Curls', sets: 3, reps: '12, 12, 12', completed: false }
                ].map((exercise, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <h3 className="text-white font-medium">{exercise.name}</h3>
                      <p className="text-sm text-gray-400">
                        {exercise.sets} sets • {exercise.reps} reps
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Nutrition Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Today's Nutrition</h2>
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Apple className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm">Calories</p>
                    <p className="text-white font-semibold mt-1">2,400</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm">Protein</p>
                    <p className="text-white font-semibold mt-1">180g</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm">Progress</p>
                    <p className="text-white font-semibold mt-1">75%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Oatmeal with protein shake',
                    'Chicken breast with rice',
                    'Post-workout smoothie',
                    'Salmon with vegetables'
                  ].map((meal, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-white">{meal}</span>
                      <input 
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Chat Button and Fold - Remains the same */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 bg-blue-500 text-xs text-white px-2 py-1 rounded-full">
            2
          </div>
          
          {/* Chat Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>

          {/* Chat Fold - Position it above the button */}
          <div className="absolute bottom-full right-0 mb-4 w-[350px]">
            <ChatFold 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 