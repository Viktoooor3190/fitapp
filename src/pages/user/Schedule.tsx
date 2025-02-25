import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';

interface ScheduledSession {
  date: string;
  time: string;
  type: string;
  coach: string;
}

const Schedule = () => {
  const [upcomingSessions] = useState<ScheduledSession[]>([
    {
      date: '2024-03-20',
      time: '10:00 AM',
      type: 'Personal Training',
      coach: 'John Smith'
    },
    {
      date: '2024-03-22',
      time: '2:00 PM',
      type: 'Fitness Assessment',
      coach: 'Sarah Johnson'
    }
  ]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Schedule</h1>
            <p className="text-gray-400 mt-2">Manage your training sessions</p>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{session.type}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {session.time}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {session.coach}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 transition-colors">
                    Cancel
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Book New Session */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Book New Session</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Type
                </label>
                <select className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3">
                  <option>Personal Training</option>
                  <option>Fitness Assessment</option>
                  <option>Nutrition Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition-colors"
              >
                Book Session
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Schedule; 