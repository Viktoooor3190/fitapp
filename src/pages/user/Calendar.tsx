import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Apple, Dumbbell, MessageCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getYear, getMonth } from 'date-fns';
import { auth } from '../../firebase/config';
import { 
  getMonthWorkoutPlans, 
  getMonthNutritionPlans,
  updateWorkoutExerciseStatus,
  updateMealStatus,
  WorkoutPlan,
  NutritionPlan,
  Exercise,
  Meal
} from '../../firebase/fitnessData';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'workout' | 'nutrition';
  data: WorkoutPlan | NutritionPlan;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedNutrition, setSelectedNutrition] = useState<NutritionPlan | null>(null);

  // Get all days in current month
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        setIsLoading(true);
        const year = getYear(currentDate);
        const month = getMonth(currentDate) + 1; // JavaScript months are 0-indexed

        // Fetch workout and nutrition plans for the month
        const [workoutResult, nutritionResult] = await Promise.all([
          getMonthWorkoutPlans(user.uid, year, month),
          getMonthNutritionPlans(user.uid, year, month)
        ]);

        const newEvents: CalendarEvent[] = [];

        // Process workout plans
        if (workoutResult.success && workoutResult.data) {
          workoutResult.data.forEach(workout => {
            newEvents.push({
              id: workout.id || workout.date,
              title: workout.name,
              date: workout.date,
              type: 'workout',
              data: workout
            });
          });
        }

        // Process nutrition plans
        if (nutritionResult.success && nutritionResult.data) {
          nutritionResult.data.forEach(nutrition => {
            newEvents.push({
              id: nutrition.id || nutrition.date,
              title: `Nutrition Plan (${nutrition.totalCalories} cal)`,
              date: nutrition.date,
              type: 'nutrition',
              data: nutrition
            });
          });
        }

        setEvents(newEvents);
      } catch (error) {
        console.error('Error fetching month data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthData();
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(date);
    
    // Find workout and nutrition for the selected date
    const dayEvents = getEventsForDate(date);
    const workout = dayEvents.find(e => e.type === 'workout')?.data as WorkoutPlan;
    const nutrition = dayEvents.find(e => e.type === 'nutrition')?.data as NutritionPlan;
    
    setSelectedWorkout(workout || null);
    setSelectedNutrition(nutrition || null);
  };

  const handleExerciseStatusChange = async (exerciseIndex: number, completed: boolean) => {
    if (!selectedWorkout || !auth.currentUser) return;
    
    try {
      await updateWorkoutExerciseStatus(
        auth.currentUser.uid,
        selectedWorkout.date,
        exerciseIndex,
        completed
      );
      
      // Update local state
      setSelectedWorkout(prev => {
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
    if (!selectedNutrition || !auth.currentUser) return;
    
    try {
      await updateMealStatus(
        auth.currentUser.uid,
        selectedNutrition.date,
        mealIndex,
        completed
      );
      
      // Update local state
      setSelectedNutrition(prev => {
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
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-sm text-gray-400 mt-1">View your training and nutrition schedule</p>
          </div>

          {/* Calendar Grid */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-400 text-xs py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Dates */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const hasWorkout = dayEvents.some(e => e.type === 'workout');
                const hasNutrition = dayEvents.some(e => e.type === 'nutrition');
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-14 p-1.5 rounded-lg relative flex flex-col items-center justify-between
                      ${!isSameMonth(day, currentDate) ? 'text-gray-600' : 'text-gray-200'}
                      ${isToday(day) ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700'}
                      ${selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'ring-2 ring-blue-500' : ''}
                    `}
                  >
                    <span className="text-xs">{format(day, 'd')}</span>
                    {(hasWorkout || hasNutrition) && (
                      <div className="flex space-x-0.5">
                        {hasWorkout && (
                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                        )}
                        {hasNutrition && (
                          <div className="w-1 h-1 rounded-full bg-green-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-4 space-y-4">
              {/* Workout Plan */}
              {selectedWorkout && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Dumbbell className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{selectedWorkout.name}</h3>
                    </div>
                    <span className="text-sm text-gray-400">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  
                  {selectedWorkout.description && (
                    <p className="text-gray-400 mb-3">{selectedWorkout.description}</p>
                  )}
                  
                  <div className="space-y-2 mt-2">
                    {selectedWorkout.exercises.map((exercise, index) => (
                  <motion.div
                        key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          bg-gray-700/50 rounded-lg p-3 flex items-center justify-between
                          ${exercise.completed ? 'border-l-4 border-green-500' : ''}
                        `}
                      >
                        <div>
                          <h4 className="text-white font-medium">{exercise.name}</h4>
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
                      </motion.div>
                    ))}
                  </div>
                  
                  {selectedWorkout.notes && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">{selectedWorkout.notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Nutrition Plan */}
              {selectedNutrition && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <Apple className="w-5 h-5 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Nutrition Plan</h3>
                    </div>
                    <span className="text-sm text-gray-400">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">Calories</p>
                      <p className="text-white font-semibold">{selectedNutrition.totalCalories}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">Protein</p>
                      <p className="text-white font-semibold">{selectedNutrition.macros.protein}g</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs">Carbs/Fats</p>
                      <p className="text-white font-semibold">{selectedNutrition.macros.carbs}g / {selectedNutrition.macros.fat}g</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedNutrition.meals.map((meal, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          bg-gray-700/50 rounded-lg p-3 flex items-center justify-between
                          ${meal.completed ? 'border-l-4 border-green-500' : ''}
                        `}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{meal.name}</h4>
                            <span className="text-sm text-gray-400 ml-2">{meal.calories} cal</span>
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
                      </motion.div>
                    ))}
                      </div>
                  
                  {selectedNutrition.notes && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">{selectedNutrition.notes}</p>
                        </div>
                      )}
                    </div>
              )}
              
              {!selectedWorkout && !selectedNutrition && (
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-gray-400">No workout or nutrition plan for {format(selectedDate, 'MMMM d, yyyy')}</p>
              </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Chat with Coach FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {/* Add chat navigation or modal trigger here */}}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 group transition-all duration-200"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-300 ease-in-out whitespace-nowrap">
          Chat with Coach
        </span>
      </motion.button>
    </div>
  );
};

export default Calendar; 