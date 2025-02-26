import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Activity {
  id: string;
  type: 'new_client' | 'workout_complete' | 'progress_update' | 'message' | 'payment' | 'session_completed' | 'other';
  message: string;
  timestamp: Date;
  relatedId?: string; // ID of related entity (client, program, etc.)
  relatedName?: string; // Name of related entity
}

export const useRecentActivity = (limitCount: number = 5) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query for recent activity
    const activityRef = collection(db, 'activity');
    const activityQuery = query(
      activityRef,
      where('coachId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    // Set up real-time listener for activity
    const unsubscribe = onSnapshot(
      activityQuery,
      (snapshot) => {
        try {
          const recentActivities: Activity[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert Firestore timestamp to Date
            const activityTimestamp = data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp);
            
            recentActivities.push({
              id: doc.id,
              type: data.type || 'other',
              message: data.message || 'Activity recorded',
              timestamp: activityTimestamp,
              relatedId: data.relatedId,
              relatedName: data.relatedName
            });
          });
          
          setActivities(recentActivities);
          setLoading(false);
        } catch (err) {
          console.error('Error processing activity data:', err);
          setError('Failed to process activity data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching activity:', err);
        setError('Failed to fetch activity data');
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user, limitCount]);

  // Helper function to format time relative to now
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    // For older activities, return the date
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Add relative time to each activity
  const activitiesWithRelativeTime = activities.map(activity => ({
    ...activity,
    relativeTime: getRelativeTime(activity.timestamp)
  }));

  return { activities: activitiesWithRelativeTime, loading, error };
}; 