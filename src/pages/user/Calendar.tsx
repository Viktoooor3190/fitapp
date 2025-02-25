import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Apple, Dumbbell, MessageCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'training' | 'nutrition';
  description?: string;
  coachName?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get all days in current month
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch training sessions
        const trainingsQuery = query(
          collection(db, 'sessions'),
          where('clientId', '==', user.uid),
          where('date', '>=', startOfMonth(currentDate)),
          where('date', '<=', endOfMonth(currentDate))
        );

        // Fetch nutrition plans
        const nutritionQuery = query(
          collection(db, 'nutritionPlans'),
          where('clientId', '==', user.uid),
          where('date', '>=', startOfMonth(currentDate)),
          where('date', '<=', endOfMonth(currentDate))
        );

        const [trainingsSnapshot, nutritionSnapshot] = await Promise.all([
          getDocs(trainingsQuery),
          getDocs(nutritionQuery)
        ]);

        const trainings = trainingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'training' as const,
          date: doc.data().date.toDate()
        }));

        const nutritionPlans = nutritionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'nutrition' as const,
          date: doc.data().date.toDate()
        }));

        setEvents([...trainings, ...nutritionPlans]);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
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
                const hasEvents = dayEvents.length > 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      h-14 p-1.5 rounded-lg relative flex flex-col items-center justify-between
                      ${!isSameMonth(day, currentDate) ? 'text-gray-600' : 'text-gray-200'}
                      ${isToday(day) ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700'}
                      ${selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'ring-2 ring-blue-500' : ''}
                    `}
                  >
                    <span className="text-xs">{format(day, 'd')}</span>
                    {hasEvents && (
                      <div className="flex space-x-0.5">
                        {dayEvents.map((event, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              event.type === 'training' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4">
              <h3 className="text-base font-semibold text-white mb-3">
                Events for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${
                          event.type === 'training' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        }`}>
                          {event.type === 'training' ? (
                            <Dumbbell className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Apple className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{event.title}</h4>
                          <p className="text-xs text-gray-400">{event.description}</p>
                        </div>
                      </div>
                      {event.coachName && (
                        <div className="flex items-center text-xs text-gray-400">
                          <User className="w-3 h-3 mr-1" />
                          {event.coachName}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
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