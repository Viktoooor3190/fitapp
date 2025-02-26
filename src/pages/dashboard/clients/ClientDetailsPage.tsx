import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Calendar as CalendarIcon, 
  TrendingUp, Activity, Scale,
  Clock, CheckCircle, ChevronLeft, ChevronRight,
  Dumbbell, Apple
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
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

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DaySchedule | null>(null);

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

  // Dummy schedule data - replace with Firestore data later
  const schedule: ClientSchedule = {
    '2024-02-06': {
      workout: {
        type: 'Upper Body',
        exercises: [
          'Bench Press: 4 sets x 8-10 reps',
          'Shoulder Press: 3 sets x 12 reps',
          'Pull-ups: 3 sets to failure'
        ]
      },
      nutrition: {
        type: 'High Protein',
        meals: [
          {
            name: 'Breakfast',
            calories: 650,
            description: 'Protein oats with banana and almonds'
          },
          {
            name: 'Lunch',
            calories: 750,
            description: 'Grilled chicken salad with quinoa'
          },
          {
            name: 'Dinner',
            calories: 800,
            description: 'Salmon with sweet potato and vegetables'
          },
          {
            name: 'Snacks',
            calories: 200,
            description: 'Protein shake, Greek yogurt with berries'
          }
        ],
        totalCalories: 2400,
        macros: {
          protein: 180,
          carbs: 220,
          fats: 65
        }
      }
    }
    // Add more days...
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDaySchedule(schedule[dateKey] || null);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const days = [];
    let day = startDate;

    for (let i = 0; i < 35; i++) {
      const dateKey = format(day, 'yyyy-MM-dd');
      const daySchedule = schedule[dateKey];
      const isCurrentMonth = day >= monthStart && day <= monthEnd;
      
      days.push(
        <motion.div 
          key={i}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`bg-white dark:bg-gray-800 min-h-[100px] p-2 transform transition-all duration-200 ${
            isCurrentMonth
              ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md'
              : 'bg-gray-50 dark:bg-gray-700/50'
          } ${
            isSameDay(day, selectedDate)
              ? 'ring-2 ring-blue-500 dark:ring-blue-400'
              : ''
          }`}
          onClick={() => isCurrentMonth && handleDayClick(day)}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {format(day, 'd')}
          </div>
          {daySchedule && (
            <div className="space-y-1">
              {daySchedule.workout && (
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                  <Dumbbell className="w-3 h-3 mr-1" />
                  <span className="text-[10px]">{daySchedule.workout.type}</span>
                </div>
              )}
              {daySchedule.nutrition && (
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <Apple className="w-3 h-3 mr-1" />
                  <span className="text-[10px]">{daySchedule.nutrition.type}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
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

      {/* Program Schedule with animation */}
      <motion.div 
        className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        variants={calendarTransition}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Program Schedule
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid with hover animations */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Week days header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 dark:bg-gray-800 py-1.5 text-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </span>
            </div>
          ))}
          
          {/* Calendar days with hover effect */}
          {renderCalendar()}
        </div>

        {/* Selected Day Details with animation */}
        <motion.div 
          className="mt-6 grid grid-cols-2 gap-4"
          variants={staggerChildren}
        >
          <motion.div 
            variants={fadeInUp}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 transform transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center mb-2">
              <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-xs font-medium text-blue-900 dark:text-blue-200">
                Workout Plan - {selectedDate.toLocaleDateString()}
              </h4>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300">
              {selectedDaySchedule?.workout && (
                <>
                  <p>{selectedDaySchedule.workout.type}</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10px]">
                    {selectedDaySchedule.workout.exercises.map((exercise, index) => (
                      <li key={index}>{exercise}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Apple className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                <h4 className="text-xs font-medium text-green-900 dark:text-green-200">
                  Nutrition Plan - {selectedDate.toLocaleDateString()}
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  {selectedDaySchedule?.nutrition?.totalCalories} kcal
                </span>
              </div>
            </div>
            <div className="text-xs text-green-800 dark:text-green-300">
              {selectedDaySchedule?.nutrition && (
                <>
                  <p>{selectedDaySchedule.nutrition.type}</p>
                  <div className="mt-1 space-y-1 text-[10px]">
                    {selectedDaySchedule.nutrition.meals.map((meal, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{meal.name}:</p>
                          <span className="text-green-600 dark:text-green-400">{meal.calories} kcal</span>
                        </div>
                        <p>{meal.description}</p>
                      </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                      <div className="flex justify-between text-[10px] text-green-700 dark:text-green-300">
                        <div>
                          <span className="font-medium">Protein:</span> {selectedDaySchedule.nutrition.macros.protein}g
                        </div>
                        <div>
                          <span className="font-medium">Carbs:</span> {selectedDaySchedule.nutrition.macros.carbs}g
                        </div>
                        <div>
                          <span className="font-medium">Fats:</span> {selectedDaySchedule.nutrition.macros.fats}g
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Other Information with stagger animation */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {client.phone}
                </p>
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