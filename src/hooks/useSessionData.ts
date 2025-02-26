import { useState, useEffect } from 'react';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, updateDoc, doc, getDoc, getDocs, Timestamp, 
  serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  coachId: string;
  coachName?: string;
  title: string;
  type: 'in-person' | 'virtual';
  date: Date;
  time: string;
  duration: number; // in minutes
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: 'coach' | 'client';
}

export const useSessionData = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions for the current user (coach or client)
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Determine if user is a coach or client
    const userRef = doc(db, 'users', user.uid);
    getDoc(userRef).then(userDoc => {
      if (!userDoc.exists()) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const isCoach = userData.role === 'coach';

      // Create query based on user role
      const sessionsQuery = isCoach
        ? query(
            collection(db, 'sessions'),
            where('coachId', '==', user.uid),
            orderBy('date', 'asc')
          )
        : query(
            collection(db, 'sessions'),
            where('clientId', '==', user.uid),
            orderBy('date', 'asc')
          );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        sessionsQuery,
        (snapshot) => {
          const sessionList: Session[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert Firestore timestamp to Date
            const sessionDate = data.date instanceof Timestamp 
              ? data.date.toDate() 
              : new Date(data.date);
            
            const createdAt = data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt);
              
            const updatedAt = data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt);
            
            sessionList.push({
              id: doc.id,
              clientId: data.clientId,
              clientName: data.clientName || 'Client',
              coachId: data.coachId,
              coachName: data.coachName,
              title: data.title || 'Session',
              type: data.type || 'in-person',
              date: sessionDate,
              time: data.time || '',
              duration: data.duration || 60,
              status: data.status || 'scheduled',
              notes: data.notes,
              location: data.location,
              meetingLink: data.meetingLink,
              createdAt,
              updatedAt,
              createdBy: data.createdBy || 'coach'
            });
          });
          
          setSessions(sessionList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching sessions:', err);
          setError('Failed to fetch session data');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }).catch(err => {
      console.error('Error determining user role:', err);
      setError('Failed to determine user role');
      setLoading(false);
    });
  }, [user]);

  // Check for scheduling conflicts
  const checkForConflicts = async (
    date: Date, 
    time: string, 
    duration: number, 
    coachId: string, 
    clientId: string,
    excludeSessionId?: string
  ): Promise<boolean> => {
    try {
      // Convert time string (HH:MM) to minutes since midnight
      const [hours, minutes] = time.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + duration;
      
      // Format date to YYYY-MM-DD for comparison
      const formattedDate = date.toISOString().split('T')[0];
      
      // Query sessions for the coach on the same day
      const coachSessionsQuery = query(
        collection(db, 'sessions'),
        where('coachId', '==', coachId),
        where('date', '==', Timestamp.fromDate(date)),
        where('status', 'in', ['scheduled', 'requested'])
      );
      
      // Query sessions for the client on the same day
      const clientSessionsQuery = query(
        collection(db, 'sessions'),
        where('clientId', '==', clientId),
        where('date', '==', Timestamp.fromDate(date)),
        where('status', 'in', ['scheduled', 'requested'])
      );
      
      const [coachSessionsSnapshot, clientSessionsSnapshot] = await Promise.all([
        getDocs(coachSessionsQuery),
        getDocs(clientSessionsQuery)
      ]);
      
      // Check coach sessions for conflicts
      for (const doc of coachSessionsSnapshot.docs) {
        // Skip the current session if we're updating
        if (excludeSessionId && doc.id === excludeSessionId) continue;
        
        const sessionData = doc.data();
        const [sessionHours, sessionMinutes] = sessionData.time.split(':').map(Number);
        const sessionStartMinutes = sessionHours * 60 + sessionMinutes;
        const sessionEndMinutes = sessionStartMinutes + sessionData.duration;
        
        // Check for overlap
        if (
          (startMinutes >= sessionStartMinutes && startMinutes < sessionEndMinutes) ||
          (endMinutes > sessionStartMinutes && endMinutes <= sessionEndMinutes) ||
          (startMinutes <= sessionStartMinutes && endMinutes >= sessionEndMinutes)
        ) {
          return true; // Conflict found
        }
      }
      
      // Check client sessions for conflicts
      for (const doc of clientSessionsSnapshot.docs) {
        // Skip the current session if we're updating
        if (excludeSessionId && doc.id === excludeSessionId) continue;
        
        const sessionData = doc.data();
        const [sessionHours, sessionMinutes] = sessionData.time.split(':').map(Number);
        const sessionStartMinutes = sessionHours * 60 + sessionMinutes;
        const sessionEndMinutes = sessionStartMinutes + sessionData.duration;
        
        // Check for overlap
        if (
          (startMinutes >= sessionStartMinutes && startMinutes < sessionEndMinutes) ||
          (endMinutes > sessionStartMinutes && endMinutes <= sessionEndMinutes) ||
          (startMinutes <= sessionStartMinutes && endMinutes >= sessionEndMinutes)
        ) {
          return true; // Conflict found
        }
      }
      
      return false; // No conflicts
    } catch (err) {
      console.error('Error checking for conflicts:', err);
      throw new Error('Failed to check for scheduling conflicts');
    }
  };

  // Create a new session
  const createSession = async (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) {
      throw new Error('You must be logged in to create a session');
    }

    try {
      // Check for conflicts
      const hasConflict = await checkForConflicts(
        sessionData.date,
        sessionData.time,
        sessionData.duration,
        sessionData.coachId,
        sessionData.clientId
      );

      if (hasConflict) {
        throw new Error('There is a scheduling conflict with an existing session');
      }

      // Create the session
      const sessionRef = await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        date: Timestamp.fromDate(sessionData.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return sessionRef.id;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  // Update an existing session
  const updateSession = async (sessionId: string, updates: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to update a session');
    }

    try {
      // Get the current session data
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        throw new Error('Session not found');
      }
      
      const sessionData = sessionSnap.data();
      
      // Check for conflicts if date, time, or duration is being updated
      if (updates.date || updates.time || updates.duration) {
        const date = updates.date || (sessionData.date instanceof Timestamp 
          ? sessionData.date.toDate() 
          : new Date(sessionData.date));
        const time = updates.time || sessionData.time;
        const duration = updates.duration || sessionData.duration;
        
        const hasConflict = await checkForConflicts(
          date,
          time,
          duration,
          sessionData.coachId,
          sessionData.clientId,
          sessionId
        );

        if (hasConflict) {
          throw new Error('There is a scheduling conflict with an existing session');
        }
      }

      // Prepare updates
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Convert date to Timestamp if it exists
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      // Update the session
      await updateDoc(sessionRef, updateData);
    } catch (err) {
      console.error('Error updating session:', err);
      throw err;
    }
  };

  // Cancel a session
  const cancelSession = async (sessionId: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to cancel a session');
    }

    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error cancelling session:', err);
      throw err;
    }
  };

  // Complete a session
  const completeSession = async (sessionId: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to mark a session as completed');
    }

    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error completing session:', err);
      throw err;
    }
  };

  // Delete a session (admin only)
  const deleteSession = async (sessionId: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to delete a session');
    }

    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await deleteDoc(sessionRef);
    } catch (err) {
      console.error('Error deleting session:', err);
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    cancelSession,
    completeSession,
    deleteSession,
    checkForConflicts
  };
}; 