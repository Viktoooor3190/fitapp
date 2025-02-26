import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Plus } from 'lucide-react';
import { useSessionData, Session } from '../../hooks/useSessionData';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import SessionModal from '../../components/schedule/SessionModal';

const Schedule = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    sessions, 
    loading: sessionsLoading, 
    error, 
    createSession,
    cancelSession
  } = useSessionData();

  // Get coach ID for the current client
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch the client's coach ID from Firestore
      // For now, we'll use a placeholder
      setCoachId('coach123');
      setLoading(false);
    }
  }, [user]);

  // Filter to only show upcoming sessions (not cancelled or completed)
  const upcomingSessions = sessions.filter(
    session => session.status === 'scheduled' || session.status === 'requested'
  );

  const handleRequestSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSession({
        ...sessionData,
        clientId: user?.uid || '',
        clientName: user?.displayName || '',
        coachId: coachId || '',
        status: 'requested',
        createdBy: 'client'
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error requesting session:', err);
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

  // Format date for display
  const formatSessionDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

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

          {/* Loading State */}
          {(loading || sessionsLoading) && (
            <div className="bg-gray-800 rounded-xl p-6 mb-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-400">Loading sessions...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Upcoming Sessions */}
          {!loading && !sessionsLoading && (
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Request Session
                </button>
              </div>
              
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No upcoming sessions scheduled</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Request a Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg p-4 flex items-center justify-between ${
                        session.status === 'requested' 
                          ? 'bg-yellow-900/20 border border-yellow-800/30' 
                          : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${
                          session.type === 'virtual' 
                            ? 'bg-blue-500/20' 
                            : 'bg-purple-500/20'
                        }`}>
                          {session.type === 'virtual' ? (
                            <Video className="w-6 h-6 text-blue-500" />
                          ) : (
                            <MapPin className="w-6 h-6 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{session.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatSessionDate(session.date)} at {session.time}
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {session.coachName || 'Your Coach'}
                            </div>
                          </div>
                          {session.status === 'requested' && (
                            <div className="mt-2 text-xs text-yellow-400">
                              Awaiting coach approval
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        className="text-red-400 hover:text-red-300 transition-colors"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Session Request Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRequestSession}
        isClient={true}
      />
    </div>
  );
};

export default Schedule; 