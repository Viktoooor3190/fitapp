import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, 
  ChevronLeft, ChevronRight, Plus,
  Video, MapPin, Check, X as XIcon, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, slideIn, fadeInUp } from '../../../animations/dashboard';
import { useSessionData, Session } from '../../../hooks/useSessionData';
import { useAuth } from '../../../contexts/AuthContext';
import SessionModal from '../../../components/schedule/SessionModal';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';

const SchedulePage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  
  const { 
    sessions, 
    loading, 
    error, 
    createSession, 
    updateSession, 
    cancelSession, 
    completeSession 
  } = useSessionData();

  // Check if user is a client
  useEffect(() => {
    if (user) {
      // This is a simplified approach. In a real app, you'd check the user's role in Firestore
      const checkUserRole = async () => {
        try {
          // For now, we'll assume all users are coaches unless they have a clientId field
          setIsClient(false);
        } catch (err) {
          console.error('Error checking user role:', err);
        }
      };
      
      checkUserRole();
    }
  }, [user]);

  // Filter sessions based on selected date and view
  const filteredSessions = sessions.filter(session => {
    if (view === 'day') {
      return isSameDay(session.date, selectedDate);
    } else {
      // Week view - get start of week and check if session is within 7 days
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = addDays(weekStart, 6);
      return session.date >= weekStart && session.date <= weekEnd;
    }
  });

  // Generate time slots for the schedule
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Generate days for the week view
  const getDaysOfWeek = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const daysOfWeek = getDaysOfWeek();

  // Handle navigation
  const navigatePrevious = () => {
    if (view === 'day') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(subWeeks(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else {
      setSelectedDate(addWeeks(selectedDate, 1));
    }
  };

  // Handle session actions
  const handleCreateSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSession(sessionData);
      setIsModalOpen(false);
      setSelectedSession(undefined);
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  const handleUpdateSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedSession) return;
    
    try {
      await updateSession(selectedSession.id, sessionData);
      setIsModalOpen(false);
      setSelectedSession(undefined);
    } catch (err) {
      console.error('Error updating session:', err);
      throw err;
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await cancelSession(sessionId);
    } catch (err) {
      console.error('Error cancelling session:', err);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSession(sessionId);
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  // Open modal for creating or editing a session
  const openCreateModal = () => {
    setSelectedSession(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  // Get sessions for a specific day and time
  const getSessionsForTimeSlot = (day: Date, time: string) => {
    return filteredSessions.filter(session => {
      return isSameDay(session.date, day) && session.time.startsWith(time.split(':')[0]);
    });
  };

  // Format date for display
  const formatDateHeader = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

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
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={openCreateModal}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6"
          variants={fadeInUp}
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div 
          className="flex justify-center items-center py-12"
          variants={fadeInUp}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading schedule...</p>
        </motion.div>
      )}

      {/* Calendar Navigation */}
      {!loading && (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6"
        variants={fadeInUp}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={navigatePrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === 'day' 
                  ? formatDateHeader(selectedDate)
                  : `Week of ${format(daysOfWeek[0], 'MMM d')} - ${format(daysOfWeek[6], 'MMM d, yyyy')}`
                }
            </h2>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={navigateNext}
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
            {view === 'week' ? (
              // Week View
              daysOfWeek.map((day, index) => (
                <div key={index} className="bg-white dark:bg-gray-800">
              <div className="h-12 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-sm font-medium ${
                        isSameDay(day, new Date()) 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
              </div>
                  {timeSlots.map((time) => {
                    const sessionsAtTime = getSessionsForTimeSlot(day, time);
                    return (
                <div
                        key={`${index}-${time}`}
                  className="h-20 border-b border-gray-200 dark:border-gray-700 relative"
                >
                        {sessionsAtTime.map((session) => (
                      <motion.div
                            key={session.id}
                        variants={slideIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                            className={`absolute inset-x-1 top-1 p-2 rounded-lg cursor-pointer ${
                              session.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-900/20'
                                : session.status === 'completed'
                                ? 'bg-green-100 dark:bg-green-900/20'
                                : session.status === 'requested'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20'
                                : 'bg-blue-100 dark:bg-blue-900/20'
                            }`}
                            onClick={() => openEditModal(session)}
                      >
                        <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                session.status === 'cancelled'
                                  ? 'text-red-600 dark:text-red-400'
                                  : session.status === 'completed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : session.status === 'requested'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                {session.clientName}
                          </span>
                              {session.type === 'virtual' ? (
                            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <span className="text-xs text-blue-500 dark:text-blue-300">
                              {session.time} ({session.duration}min)
                        </span>
                      </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              // Day View (single column)
              <div className="bg-white dark:bg-gray-800 col-span-7">
                <div className="h-12 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(selectedDate, 'EEEE')}
                  </span>
                </div>
                {timeSlots.map((time) => {
                  const sessionsAtTime = getSessionsForTimeSlot(selectedDate, time);
                  return (
                    <div
                      key={time}
                      className="h-20 border-b border-gray-200 dark:border-gray-700 relative"
                    >
                      {sessionsAtTime.map((session) => (
                        <motion.div
                          key={session.id}
                          variants={slideIn}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className={`absolute inset-x-1 top-1 p-3 rounded-lg cursor-pointer ${
                            session.status === 'cancelled'
                              ? 'bg-red-100 dark:bg-red-900/20'
                              : session.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : session.status === 'requested'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20'
                              : 'bg-blue-100 dark:bg-blue-900/20'
                          }`}
                          onClick={() => openEditModal(session)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`text-sm font-medium ${
                                session.status === 'cancelled'
                                  ? 'text-red-600 dark:text-red-400'
                                  : session.status === 'completed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : session.status === 'requested'
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                {session.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                with {session.clientName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {session.time} - {session.duration} minutes
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              {session.status === 'scheduled' && (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteSession(session.id);
                                    }}
                                    className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full"
                                  >
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelSession(session.id);
                                    }}
                                    className="p-1 bg-red-100 dark:bg-red-900/20 rounded-full"
                                  >
                                    <XIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(session);
                                }}
                                className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full"
                              >
                                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* List of upcoming sessions */}
      {!loading && filteredSessions.length > 0 && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
          variants={fadeInUp}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {view === 'day' ? 'Sessions Today' : 'Sessions This Week'}
          </h3>
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg cursor-pointer ${
                  session.status === 'cancelled'
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : session.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/20'
                    : session.status === 'requested'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-gray-100 dark:bg-gray-700/50'
                }`}
                onClick={() => openEditModal(session)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'virtual'
                        ? 'bg-blue-100 dark:bg-blue-900/20'
                        : 'bg-purple-100 dark:bg-purple-900/20'
                    }`}>
                      {session.type === 'virtual' ? (
                        <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(session.date, 'MMM d')} at {session.time}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3 mr-1" />
                          {session.clientName}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {session.status === 'scheduled' && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteSession(session.id);
                          }}
                          className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full"
                        >
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelSession(session.id);
                          }}
                          className="p-1 bg-red-100 dark:bg-red-900/20 rounded-full"
                        >
                          <XIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(session);
                      }}
                      className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-full"
                    >
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>
                {session.status === 'requested' && (
                  <div className="mt-2 flex justify-end space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSession(session.id, { status: 'scheduled' });
                      }}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-lg"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSession(session.id);
                      }}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredSessions.length === 0 && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
          variants={fadeInUp}
        >
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sessions scheduled
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {view === 'day' 
              ? 'There are no sessions scheduled for this day' 
              : 'There are no sessions scheduled for this week'}
          </p>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={openCreateModal}
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Session
          </button>
        </motion.div>
      )}

      {/* Session Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(undefined);
        }}
        onSave={selectedSession ? handleUpdateSession : handleCreateSession}
        session={selectedSession}
        isClient={isClient}
      />
    </motion.div>
  );
};

export default SchedulePage; 