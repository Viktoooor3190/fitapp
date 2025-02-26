import { useState, useEffect } from 'react';
import { useSessionData, Session as SessionType } from './useSessionData';

export type Session = SessionType;

export const useUpcomingSessions = (limitCount: number = 5) => {
  const { sessions: allSessions, loading, error } = useSessionData();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Filter for upcoming sessions (scheduled and not in the past)
    const now = new Date();
    const upcomingSessions = allSessions
      .filter(session => 
        (session.status === 'scheduled' || session.status === 'requested') && 
        session.date >= now
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limitCount);
    
    setSessions(upcomingSessions);
  }, [allSessions, limitCount]);

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