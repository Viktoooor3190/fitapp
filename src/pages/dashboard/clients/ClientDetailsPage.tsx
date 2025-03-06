import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, CalendarIcon, 
  ChevronLeft, ChevronRight,
  TrendingUp, Activity, Scale,
  Clock, CheckCircle, 
  Dumbbell, Apple, UserCheck, Edit, Plus, Loader, Pencil
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, getYear, getMonth } from 'date-fns';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import PlanEditor from '../../../components/fitness/PlanEditor';
import { 
  getMonthWorkoutPlans, 
  getMonthNutritionPlans,
  getWorkoutPlan,
  getNutritionPlan,
  WorkoutPlan,
  NutritionPlan
} from '../../../firebase/fitnessData';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  coachId: string;
  goals: {
    type: string;
    target: string;
    progress: number;
    deadline: string;
  }[];
  measurements: {
    date: string;
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
  }[];
  currentProgram: {
    name: string;
    startDate: string;
    completionRate: number;
    nextSession: string;
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
}

interface DaySchedule {
  workout?: {
    type: string;
    exercises: string[];
  };
  nutrition?: {
    type: string;
    meals: {
      name: string;
      calories: number;
      description: string;
    }[];
    totalCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
}

interface ClientSchedule {
  [date: string]: DaySchedule;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'workout' | 'nutrition';
  data: WorkoutPlan | NutritionPlan;
}

const ClientDetailsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientDetails>({
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 234 567 8900',
    joinDate: '2024-01-15',
    coachId: '',
    goals: [
      {
        type: 'Weight Loss',
        target: 'Lose 10kg',
        progress: 60,
        deadline: '2024-06-15'
      },
      {
        type: 'Strength',
        target: 'Deadlift 100kg',
        progress: 75,
        deadline: '2024-05-30'
      },
      {
        type: 'Cardio',
        target: '5k under 25min',
        progress: 45,
        deadline: '2024-07-01'
      }
    ],
    measurements: [
      {
        date: '2024-02-20',
        weight: 68,
        bodyFat: 24,
        muscleMass: 45
      },
      {
        date: '2024-02-13',
        weight: 69,
        bodyFat: 25,
        muscleMass: 44
      }
    ],
    currentProgram: {
      name: 'Weight Loss Pro',
      startDate: '2024-02-01',
      completionRate: 85,
      nextSession: '2024-02-22 14:00'
    },
    recentActivity: [
      {
        type: 'workout',
        description: 'Completed Upper Body Strength workout',
        date: '2024-02-20'
      },
      {
        type: 'measurement',
        description: 'Updated body measurements',
        date: '2024-02-20'
      },
      {
        type: 'goal',
        description: 'Achieved monthly weight loss target',
        date: '2024-02-19'
      }
    ]
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DaySchedule | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedNutrition, setSelectedNutrition] = useState<NutritionPlan | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Fetch client data from Firestore
  useEffect(() => {
    if (!clientId || !user) return;
    
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get client document
        const clientRef = doc(db, 'clients', clientId);
        const clientDoc = await getDoc(clientRef);
        
        if (!clientDoc.exists()) {
          setError('Client not found');
          setLoading(false);
          return;
        }
        
        const clientData = clientDoc.data();
        
        // Check if this client belongs to the current coach
        if (clientData.coachId !== user.uid) {
          setError('You do not have permission to view this client');
          setLoading(false);
          return;
        }
        
        // Format client data
        const formattedClient: ClientDetails = {
          id: clientDoc.id,
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          joinDate: clientData.createdAt ? new Date(clientData.createdAt.toDate()).toISOString().split('T')[0] : '',
          coachId: clientData.coachId || '',
          goals: [],
          measurements: [],
          currentProgram: {
            name: '',
            startDate: '',
            completionRate: 0,
            nextSession: ''
          },
          recentActivity: []
        };
        
        // Get client goals
        if (clientData.goals && Array.isArray(clientData.goals)) {
          formattedClient.goals = clientData.goals.map((goal: any) => ({
            type: goal.type || '',
            target: goal.target || '',
            progress: goal.progress || 0,
            deadline: goal.deadline || ''
          }));
        } else if (clientData.progress) {
          // If goals are stored in the progress object
          const goalTypes = [
            { key: 'weight', name: 'Weight Loss' },
            { key: 'strength', name: 'Strength' },
            { key: 'cardio', name: 'Cardio' }
          ];
          
          goalTypes.forEach(({ key, name }) => {
            if (clientData.progress[key] !== undefined) {
              formattedClient.goals.push({
                type: name,
                target: clientData.progress[`${key}Target`] || `Improve ${name}`,
                progress: typeof clientData.progress[key] === 'number' 
                  ? clientData.progress[key] 
                  : parseFloat(clientData.progress[key]) || 0,
                deadline: clientData.progress[`${key}Deadline`] || ''
              });
            }
          });
        }
        
        // If no goals found, add default goals
        if (formattedClient.goals.length === 0) {
          formattedClient.goals = [
            {
              type: 'Weight Loss',
              target: 'Lose weight',
              progress: 0,
              deadline: ''
            },
            {
              type: 'Strength',
              target: 'Improve strength',
              progress: 0,
              deadline: ''
            },
            {
              type: 'Cardio',
              target: 'Improve cardio',
              progress: 0,
              deadline: ''
            }
          ];
        }
        
        // Get client measurements
        if (clientData.measurements && Array.isArray(clientData.measurements)) {
          formattedClient.measurements = clientData.measurements.map((measurement: any) => ({
            date: measurement.date || '',
            weight: measurement.weight || 0,
            bodyFat: measurement.bodyFat,
            muscleMass: measurement.muscleMass
          }));
        }
        
        // Get client's program
        if (clientData.programId) {
          const programRef = doc(db, 'programs', clientData.programId);
          const programDoc = await getDoc(programRef);
          
          if (programDoc.exists()) {
            const programData = programDoc.data();
            
            formattedClient.currentProgram = {
              name: programData.name || '',
              startDate: programData.startDate ? new Date(programData.startDate.toDate()).toISOString().split('T')[0] : '',
              completionRate: programData.completionRate || 0,
              nextSession: ''
            };
          }
        }
        
        // Get upcoming session
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('clientId', '==', clientId),
          where('completed', '==', false),
          where('date', '>=', new Date()),
          orderBy('date', 'asc'),
          limit(1)
        );
        
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        if (!sessionsSnapshot.empty) {
          const sessionData = sessionsSnapshot.docs[0].data();
          
          if (sessionData.date) {
            const sessionDate = new Date(sessionData.date.toDate());
            formattedClient.currentProgram.nextSession = sessionDate.toISOString();
          }
        }
        
        // Get recent activity
        const activityQuery = query(
          collection(db, 'activity'),
          where('relatedId', '==', clientId),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        
        const activitySnapshot = await getDocs(activityQuery);
        
        if (!activitySnapshot.empty) {
          formattedClient.recentActivity = activitySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              type: data.type || '',
              description: data.message || '',
              date: data.timestamp ? new Date(data.timestamp.toDate()).toISOString().split('T')[0] : ''
            };
          });
        }
        
        setClient(formattedClient);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data');
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId, user]);

  // Update the useEffect hook to use refreshMonthPlans
  useEffect(() => {
    if (clientId) {
      refreshMonthPlans(currentMonth);
    }
  }, [clientId, currentMonth]);

  // Add a useEffect to set a default selected date when the component loads
  useEffect(() => {
    if (clientId && !selectedDate) {
      // Set today as the default selected date
      const today = new Date();
      // Create a new date object to avoid reference issues
      const todayCopy = new Date(today);
      handleDayClick(todayCopy);
    }
  }, [clientId, selectedDate]);

  // Update the month navigation functions to refresh plans
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = subMonths(prevMonth, 1);
      refreshMonthPlans(newMonth);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = addMonths(prevMonth, 1);
      refreshMonthPlans(newMonth);
      return newMonth;
    });
  };

  // Add a helper function to refresh plans for a given month
  const refreshMonthPlans = async (month: Date) => {
    if (!clientId) return;
    
    setIsLoadingPlans(true);
    
    try {
      const year = getYear(month);
      const monthNum = getMonth(month) + 1; // JavaScript months are 0-indexed
      
      // Fetch workout and nutrition plans for the month
      const [workoutResult, nutritionResult] = await Promise.all([
        getMonthWorkoutPlans(clientId, year, monthNum),
        getMonthNutritionPlans(clientId, year, monthNum)
      ]);
      
      const events: CalendarEvent[] = [];
      
      // Process workout plans
      if (workoutResult.success && workoutResult.data) {
        workoutResult.data.forEach(workout => {
          events.push({
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
          events.push({
            id: nutrition.id || nutrition.date,
            title: `Nutrition Plan (${nutrition.totalCalories} cal)`,
            date: nutrition.date,
            type: 'nutrition',
            data: nutrition
          });
        });
      }
      
      setCalendarEvents(events);
      
      // If there's a selected date, check if it's in the new month
      if (selectedDate) {
        const selectedMonth = getMonth(selectedDate);
        const selectedYear = getYear(selectedDate);
        
        if (selectedMonth !== getMonth(month) || selectedYear !== getYear(month)) {
          // If the selected date is not in the new month, clear the selection
          setSelectedDate(null);
          setSelectedWorkout(null);
          setSelectedNutrition(null);
          setSelectedDaySchedule(null);
        } else {
          // If the selected date is in the new month, refresh its data
          handleDayClick(selectedDate);
        }
      }
    } catch (error) {
      console.error('Error refreshing month plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleDayClick = async (date: Date) => {
    // Clone the date to avoid reference issues
    const selectedDateCopy = new Date(date);
    setSelectedDate(selectedDateCopy);
    setIsLoadingPlans(true);
    
    try {
      // Format the date string
      const dateStr = format(selectedDateCopy, 'yyyy-MM-dd');
      
      // If we already have the client ID, fetch the plans directly
      if (clientId) {
        // Fetch both workout and nutrition plans for the selected date
        const [workoutResult, nutritionResult] = await Promise.all([
          getWorkoutPlan(clientId, dateStr),
          getNutritionPlan(clientId, dateStr)
        ]);
        
        // Update the workout plan state
        if (workoutResult.success) {
          setSelectedWorkout(workoutResult.data || null);
        } else {
          console.error('Error fetching workout plan:', workoutResult.error);
          setSelectedWorkout(null);
        }
        
        // Update the nutrition plan state
        if (nutritionResult.success) {
          setSelectedNutrition(nutritionResult.data || null);
        } else {
          console.error('Error fetching nutrition plan:', nutritionResult.error);
          setSelectedNutrition(null);
        }
        
        // For backward compatibility with existing code
        const schedule = {
          workout: workoutResult.data ? {
            type: workoutResult.data.name,
            exercises: workoutResult.data.exercises.map(ex => `${ex.name}: ${ex.sets} sets x ${ex.reps}`)
          } : undefined,
          nutrition: nutritionResult.data ? {
            type: 'Custom',
            meals: nutritionResult.data.meals.map(meal => ({
              name: meal.name,
              calories: meal.calories,
              description: meal.description
            })),
            totalCalories: nutritionResult.data.totalCalories,
            macros: {
              protein: nutritionResult.data.macros.protein,
              carbs: nutritionResult.data.macros.carbs,
              fats: nutritionResult.data.macros.fat
            }
          } : undefined
        };
        
        setSelectedDaySchedule(schedule);
      } else {
        // If we don't have the client ID, use the cached events
        const dayEvents = calendarEvents.filter(event => event.date === dateStr);
        
        const workout = dayEvents.find(e => e.type === 'workout')?.data as WorkoutPlan;
        const nutrition = dayEvents.find(e => e.type === 'nutrition')?.data as NutritionPlan;
        
        setSelectedWorkout(workout || null);
        setSelectedNutrition(nutrition || null);
        
        // For backward compatibility with existing code
        const schedule = {
          workout: workout ? {
            type: workout.name,
            exercises: workout.exercises.map(ex => `${ex.name}: ${ex.sets} sets x ${ex.reps}`)
          } : undefined,
          nutrition: nutrition ? {
            type: 'Custom',
            meals: nutrition.meals.map(meal => ({
              name: meal.name,
              calories: meal.calories,
              description: meal.description
            })),
            totalCalories: nutrition.totalCalories,
            macros: {
              protein: nutrition.macros.protein,
              carbs: nutrition.macros.carbs,
              fats: nutrition.macros.fat
            }
          } : undefined
        };
        
        setSelectedDaySchedule(schedule);
      }
    } catch (error) {
      console.error('Error handling day click:', error);
      setSelectedWorkout(null);
      setSelectedNutrition(null);
      setSelectedDaySchedule(null);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Update the handleEditPlan function
  const handleEditPlan = () => {
    setIsEditingPlan(true);
  };

  // Update the handleSavePlan function to show loading state
  const handleSavePlan = () => {
    setIsLoadingPlans(true);
    setIsEditingPlan(false);
    
    // Refresh the calendar data
    const year = getYear(currentMonth);
    const month = getMonth(currentMonth) + 1;
    
    Promise.all([
      getMonthWorkoutPlans(clientId!, year, month),
      getMonthNutritionPlans(clientId!, year, month)
    ]).then(([workoutResult, nutritionResult]) => {
      const events: CalendarEvent[] = [];
      
      if (workoutResult.success && workoutResult.data) {
        workoutResult.data.forEach(workout => {
          events.push({
            id: workout.id || workout.date,
            title: workout.name,
            date: workout.date,
            type: 'workout',
            data: workout
          });
        });
      }
      
      if (nutritionResult.success && nutritionResult.data) {
        nutritionResult.data.forEach(nutrition => {
          events.push({
            id: nutrition.id || nutrition.date,
            title: `Nutrition Plan (${nutrition.totalCalories} cal)`,
            date: nutrition.date,
            type: 'nutrition',
            data: nutrition
          });
        });
      }
      
      setCalendarEvents(events);
      
      // If the selected date is still the same, update the selected workout and nutrition
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayEvents = events.filter(event => event.date === dateStr);
        
        const workout = dayEvents.find(e => e.type === 'workout')?.data as WorkoutPlan;
        const nutrition = dayEvents.find(e => e.type === 'nutrition')?.data as NutritionPlan;
        
        setSelectedWorkout(workout || null);
        setSelectedNutrition(nutrition || null);
      }
      
      setIsLoadingPlans(false);
    }).catch(error => {
      console.error('Error refreshing plans:', error);
      setIsLoadingPlans(false);
    });
  };

  // Update the renderCalendar function to improve date selection
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const days = [];
    let day = startDate;

    for (let i = 0; i < 35; i++) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEvents = calendarEvents.filter(event => event.date === dateStr);
      const hasWorkout = dayEvents.some(e => e.type === 'workout');
      const hasNutrition = dayEvents.some(e => e.type === 'nutrition');
      
      const isCurrentMonth = day >= monthStart && day <= monthEnd;
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      
      // Create the className string properly without duplicates
      let className = `
        p-1 border border-gray-700 min-h-[80px] relative cursor-pointer
        ${!isCurrentMonth ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-800/80 hover:bg-gray-800'}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''}
        ${isToday && !isSelected ? 'border-yellow-500/50' : ''}
        transition-all duration-150
      `;
      
      // Create a copy of the date to avoid reference issues
      const currentDay = new Date(day);
      
      days.push(
        <div
          key={i}
          className={className}
          onClick={() => handleDayClick(currentDay)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium p-1 ${isToday ? 'bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
              {format(day, 'd')}
            </span>
            <div className="flex space-x-1">
              {hasWorkout && (
                <span className="bg-blue-500 w-2 h-2 rounded-full" title="Workout scheduled"></span>
              )}
              {hasNutrition && (
                <span className="bg-green-500 w-2 h-2 rounded-full" title="Nutrition plan"></span>
              )}
            </div>
          </div>
        </div>
      );
      
      day = addDays(day, 1);
    }
    
    return days;
  };

  // Add animation variants
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const calendarTransition = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="h-full p-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Header with animation */}
      <motion.div 
        className="flex items-center space-x-4 mb-6"
        variants={fadeInUp}
      >
        <button 
          onClick={() => navigate('/dashboard/clients')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {client.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Member since {new Date(client.joinDate).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Enhanced Client Schedule Section */}
      <motion.div 
        className="mb-6 bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700"
        variants={calendarTransition}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                Client Training Schedule
              </h2>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-2 py-1">
              <button
                onClick={handlePreviousMonth}
                className="p-1 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium px-2">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4 bg-gray-900/90">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-300 text-xs font-medium py-2 border-b border-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
        
        {/* Selected Date Schedule */}
        {selectedDate && !isEditingPlan && (
          <div className="border-t border-gray-700 p-4 bg-gray-900/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
                {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={handleEditPlan}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"
                disabled={isLoadingPlans}
              >
                {isLoadingPlans ? (
                  <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4 mr-1.5" />
                )}
                Edit Plan
              </button>
            </div>
            
            {isLoadingPlans ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-gray-400">Loading plans...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout Plan */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-colors shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-blue-500/20 p-2.5 rounded-lg mr-3">
                        <Dumbbell className="w-5 h-5 text-blue-500" />
                      </div>
                      <h4 className="font-medium text-white text-lg">Workout Plan</h4>
                    </div>
                    {!selectedWorkout && (
                      <button
                        onClick={handleEditPlan}
                        className="text-blue-500 hover:text-blue-400 flex items-center text-sm bg-blue-500/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </button>
                    )}
                  </div>
                  
                  {selectedWorkout ? (
                    <div>
                      <h5 className="text-white font-medium text-lg mb-3 border-b border-gray-700 pb-2">{selectedWorkout.name}</h5>
                      <div className="space-y-3">
                        {selectedWorkout.exercises.map((exercise, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
                            <div className="flex justify-between">
                              <span className="text-white font-medium">{exercise.name}</span>
                              <span className="text-gray-300 text-sm">
                                {exercise.sets} sets • {exercise.reps}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-gray-400 text-sm">Weight: {exercise.weight}</span>
                              {exercise.completed && (
                                <span className="text-green-400 text-xs flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                </span>
                              )}
                            </div>
                            {exercise.notes && (
                              <p className="text-gray-400 text-xs mt-2 bg-gray-800/50 p-2 rounded">{exercise.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      {selectedWorkout.notes && (
                        <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border-l-2 border-blue-500">
                          <p className="text-sm text-gray-300">{selectedWorkout.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400 bg-gray-800/20 rounded-lg border border-dashed border-gray-700">
                      <Dumbbell className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <p>No workout plan for this day</p>
                      <button
                        onClick={handleEditPlan}
                        className="mt-3 text-blue-500 hover:text-blue-400 text-sm underline"
                      >
                        Create workout plan
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Nutrition Plan */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-colors shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-green-500/20 p-2.5 rounded-lg mr-3">
                        <Apple className="w-5 h-5 text-green-500" />
                      </div>
                      <h4 className="font-medium text-white text-lg">Nutrition Plan</h4>
                    </div>
                    {!selectedNutrition && (
                      <button
                        onClick={handleEditPlan}
                        className="text-green-500 hover:text-green-400 flex items-center text-sm bg-green-500/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </button>
                    )}
                  </div>
                  
                  {selectedNutrition ? (
                    <div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Total Calories</p>
                          <p className="text-white font-semibold text-lg mt-1">{selectedNutrition.totalCalories}</p>
                        </div>
                        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Protein</p>
                          <p className="text-white font-semibold text-lg mt-1">{selectedNutrition.macros.protein}g</p>
                        </div>
                        <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Carbs / Fats</p>
                          <p className="text-white font-semibold text-lg mt-1">
                            {selectedNutrition.macros.carbs}g / {selectedNutrition.macros.fat}g
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedNutrition.meals.map((meal, index) => (
                          <div key={index} className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
                            <div className="flex justify-between">
                              <span className="text-white font-medium">{meal.name}</span>
                              <span className="text-gray-300 text-sm bg-gray-800/50 px-2 py-0.5 rounded-full">
                                {meal.calories} cal
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{meal.description}</p>
                            <div className="flex justify-between mt-2">
                              <div className="flex space-x-3 text-xs text-gray-400">
                                <span className="bg-gray-800/50 px-2 py-0.5 rounded-full">P: {meal.protein}g</span>
                                <span className="bg-gray-800/50 px-2 py-0.5 rounded-full">C: {meal.carbs}g</span>
                                <span className="bg-gray-800/50 px-2 py-0.5 rounded-full">F: {meal.fat}g</span>
                              </div>
                              {meal.completed && (
                                <span className="text-green-400 text-xs flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedNutrition.notes && (
                        <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border-l-2 border-green-500">
                          <p className="text-sm text-gray-300">{selectedNutrition.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400 bg-gray-800/20 rounded-lg border border-dashed border-gray-700">
                      <Apple className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <p>No nutrition plan for this day</p>
                      <button
                        onClick={handleEditPlan}
                        className="mt-3 text-green-500 hover:text-green-400 text-sm underline"
                      >
                        Create nutrition plan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Plan Editor */}
        {selectedDate && isEditingPlan && clientId && (
          <div className="border-t border-gray-700">
            <PlanEditor
              clientId={clientId}
              selectedDate={selectedDate}
              onSave={handleSavePlan}
              onCancel={() => setIsEditingPlan(false)}
            />
          </div>
        )}
      </motion.div>

      {/* Other Information with stagger animation */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerChildren}
      >
        {/* Client Info & Goals */}
        <motion.div 
          className="space-y-6"
          variants={fadeInUp}
        >
          {/* Client Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {client.email}
                </p>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">{client.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coach ID</p>
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <p className="text-gray-900 dark:text-white">{client.coachId || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Program</p>
                  <p className="text-gray-900 dark:text-white">{client.currentProgram.name || 'No active program'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Goals & Progress
            </h2>
            <div className="space-y-4">
              {client.goals.map((goal, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.type} - {goal.target}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Current Program */}
        <motion.div 
          className="space-y-6"
          variants={fadeInUp}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Program
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {client.currentProgram.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Started {new Date(client.currentProgram.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {client.currentProgram.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${client.currentProgram.completionRate}%` }} 
                  />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Next Session: {new Date(client.currentProgram.nextSession).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Measurements Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Measurements
            </h2>
            <div className="space-y-4">
              {client.measurements.map((measurement, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(measurement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {measurement.weight} kg
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Weight
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {measurement.bodyFat}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Body Fat
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {measurement.muscleMass}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Muscle Mass
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform transition-all duration-200 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {client.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ClientDetailsPage; 