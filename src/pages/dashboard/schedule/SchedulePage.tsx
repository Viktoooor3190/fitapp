import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, 
  ChevronLeft, ChevronRight, Plus,
  Video, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, slideIn, fadeInUp } from '../../../animations/dashboard';

interface Appointment {
  id: string;
  clientName: string;
  type: 'in-person' | 'virtual';
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  location?: string;
  meetingLink?: string;
}

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');

  // Dummy data - replace with Firestore data later
  const appointments: Appointment[] = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      type: 'virtual',
      date: '2024-02-21',
      time: '09:00',
      duration: '60min',
      status: 'upcoming',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      clientName: 'Mike Smith',
      type: 'in-person',
      date: '2024-02-21',
      time: '11:00',
      duration: '45min',
      status: 'upcoming',
      location: 'Main Gym'
    },
    // Add more appointments...
  ];

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      className="h-full p-6"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your appointments and sessions
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </button>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
        variants={fadeInUp}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - (view === 'week' ? 7 : 1));
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric',
                day: 'numeric'
              })}
            </h2>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + (view === 'week' ? 7 : 1));
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'day'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'week'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Time Column */}
          <div className="bg-white dark:bg-gray-800">
            <div className="h-12"></div> {/* Empty cell for alignment */}
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-20 p-2 text-sm text-gray-500 dark:text-gray-400"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {daysOfWeek.map((day, index) => (
            <div key={day} className="bg-white dark:bg-gray-800">
              <div className="h-12 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {day}
                </span>
              </div>
              {timeSlots.map((time) => (
                <div
                  key={`${day}-${time}`}
                  className="h-20 border-b border-gray-200 dark:border-gray-700 relative"
                >
                  {appointments.map((appointment) => (
                    appointment.date === '2024-02-21' && appointment.time === time && (
                      <motion.div
                        key={appointment.id}
                        variants={slideIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-x-1 top-1 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {appointment.clientName}
                          </span>
                          {appointment.type === 'virtual' ? (
                            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <span className="text-xs text-blue-500 dark:text-blue-300">
                          {appointment.duration}
                        </span>
                      </motion.div>
                    )
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SchedulePage; 