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
import { getTodaysPlans, WorkoutPlan, NutritionPlan, Exercise, Meal, updateWorkoutExerciseStatus, updateMealStatus } from '../../firebase/fitnessData';

interface UserData {
  name: string;
  email: string;
  fitnessGoals?: string;
  experienceLevel?: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutPlan | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<NutritionPlan | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }

        // Fetch today's workout and nutrition plans
        const todayResult = await getTodaysPlans(user.uid);
        if (todayResult.success) {
          setTodayWorkout(todayResult.workout || null);
          setTodayNutrition(todayResult.nutrition || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleExerciseStatusChange = async (exerciseIndex: number, completed: boolean) => {
    if (!todayWorkout || !auth.currentUser) return;
    
    try {
      await updateWorkoutExerciseStatus(
        auth.currentUser.uid,
        todayWorkout.date,
        exerciseIndex,
        completed
      );
      
      // Update local state
      setTodayWorkout(prev => {
        if (!prev) return null;
        const updatedExercises = [...prev.exercises];
        updatedExercises[exerciseIndex] = { 
          ...updatedExercises[exerciseIndex], 
          completed 
        };
        return { ...prev, exercises: updatedExercises };
      });
    } catch (error) {
      console.error('Error updating exercise status:', error);
    }
  };

  const handleMealStatusChange = async (mealIndex: number, completed: boolean) => {
    if (!todayNutrition || !auth.currentUser) return;
    
    try {
      await updateMealStatus(
        auth.currentUser.uid,
        todayNutrition.date,
        mealIndex,
        completed
      );
      
      // Update local state
      setTodayNutrition(prev => {
        if (!prev) return null;
        const updatedMeals = [...prev.meals];
        updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], completed };
        return { ...prev, meals: updatedMeals };
      });
    } catch (error) {
      console.error('Error updating meal status:', error);
    }
  };

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
                  <h3 className="text-xl font-semibold text-white mt-1">
                    {todayWorkout ? todayWorkout.name : 'Rest Day'}
                  </h3>
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
                  <p className="text-gray-400 text-sm">Nutrition</p>
                  <h3 className="text-xl font-semibold text-white mt-1">
                    {todayNutrition ? `${todayNutrition.totalCalories} calories` : 'No plan set'}
                  </h3>
                </div>
                <div className="bg-green-500/20 p-2.5 rounded-lg">
                  <Apple className="w-5 h-5 text-green-500" />
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
                  <h3 className="text-xl font-semibold text-white mt-1">
                    {calculateProgress()}%
                  </h3>
                </div>
                <div className="bg-purple-500/20 p-2.5 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Workout and Nutrition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {/* Workout Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {todayWorkout ? todayWorkout.name : "No Workout Today"}
                </h2>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              
              {todayWorkout ? (
                <div className="space-y-3">
                  {todayWorkout.exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className={`
                        flex items-center justify-between p-3 bg-gray-700/50 rounded-lg
                        ${exercise.completed ? 'border-l-4 border-green-500' : ''}
                      `}
                    >
                      <div>
                        <h3 className="text-white font-medium">{exercise.name}</h3>
                        <p className="text-sm text-gray-400">
                          {exercise.sets} sets • {exercise.reps} reps • {exercise.weight}
                        </p>
                        {exercise.notes && (
                          <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                      <input 
                        type="checkbox"
                        checked={exercise.completed}
                        onChange={e => handleExerciseStatusChange(index, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                    </div>
                  ))}
                  
                  {todayWorkout.notes && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">{todayWorkout.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-gray-400 mb-3">No workout planned for today.</p>
                  <button 
                    onClick={() => navigate('/user/calendar')}
                    className="text-blue-400 flex items-center hover:text-blue-300 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Check your calendar
                  </button>
                </div>
              )}
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
              
              {todayNutrition ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Calories</p>
                      <p className="text-white font-semibold mt-1">{todayNutrition.totalCalories}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Protein</p>
                      <p className="text-white font-semibold mt-1">{todayNutrition.macros.protein}g</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">Carbs/Fats</p>
                      <p className="text-white font-semibold mt-1">
                        {todayNutrition.macros.carbs}g / {todayNutrition.macros.fat}g
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {todayNutrition.meals.map((meal, index) => (
                      <div 
                        key={index}
                        className={`
                          flex items-center justify-between p-3 bg-gray-700/50 rounded-lg
                          ${meal.completed ? 'border-l-4 border-green-500' : ''}
                        `}
                      >
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-white font-medium">{meal.name}</h3>
                            <span className="text-sm text-gray-400 ml-2">({meal.calories} cal)</span>
                          </div>
                          <p className="text-sm text-gray-400">{meal.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                          </p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={meal.completed}
                          onChange={e => handleMealStatusChange(index, e.target.checked)}
                          className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {todayNutrition.notes && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">{todayNutrition.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-gray-400 mb-3">No nutrition plan for today.</p>
                  <button 
                    onClick={() => navigate('/user/calendar')}
                    className="text-green-400 flex items-center hover:text-green-300 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Check your calendar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Chat Button */}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </div>
        
        {/* Chat Widget */}
        <ChatFold isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
};

// Helper function to calculate completion percentage
function calculateProgress() {
  // In a real app, this would calculate based on completed exercises and meals
  // For now, we'll return a static value
  return 75;
}

export default UserDashboard; 