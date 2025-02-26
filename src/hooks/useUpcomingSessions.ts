import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export const useUpcomingSessions = (limitCount: number = 5) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Get current date/time
    const now = new Date();
    
    // Create a query for upcoming sessions
    const sessionsRef = collection(db, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('coachId', '==', user.uid),
      where('status', '==', 'scheduled'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    // Set up real-time listener for sessions
    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        try {
          const upcomingSessions: Session[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert Firestore timestamp to Date
            const sessionDate = data.date instanceof Timestamp 
              ? data.date.toDate() 
              : new Date(data.date);
            
            upcomingSessions.push({
              id: doc.id,
              clientId: data.clientId || '',
              clientName: data.clientName || 'Client',
              title: data.title || 'Session',
              date: sessionDate,
              time: data.time || '',
              duration: data.duration || 60,
              status: data.status || 'scheduled',
              notes: data.notes
            });
          });
          
          setSessions(upcomingSessions);
          setLoading(false);
        } catch (err) {
          console.error('Error processing session data:', err);
          setError('Failed to process session data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching sessions:', err);
        setError('Failed to fetch session data');
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user, limitCount]);

  // Helper function to format session time
  const getNextSessionTime = (): string => {
    if (sessions.length === 0) return 'No upcoming sessions';
    
    const nextSession = sessions[0];
    const today = new Date();
    const sessionDate = nextSession.date;
    
    // Check if session is today
    if (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    ) {
      return `Today at ${nextSession.time}`;
    }
    
    // Check if session is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (
      sessionDate.getDate() === tomorrow.getDate() &&
      sessionDate.getMonth() === tomorrow.getMonth() &&
      sessionDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow at ${nextSession.time}`;
    }
    
    // Format date for other days
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return `${sessionDate.toLocaleDateString('en-US', options)} at ${nextSession.time}`;
  };

  return { sessions, loading, error, getNextSessionTime };
}; 