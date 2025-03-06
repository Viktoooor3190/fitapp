import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface ClientDashboardData {
  // User profile
  name: string;
  email: string;
  memberSince: Date | null;
  
  // Today's workout
  todaysWorkout: {
    title: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      completed: boolean;
    }>;
  } | null;
  
  // Next session
  nextSession: {
    date: Date | null;
    time: string;
    title: string;
  } | null;
  
  // Progress
  progress: {
    overall: number;
    nutrition: number;
  };
  
  // Nutrition
  nutrition: {
    calories: number;
    protein: number;
    meals: Array<{
      name: string;
      completed: boolean;
    }>;
  };
  
  // Program
  currentProgram: {
    name: string;
    id: string;
  } | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const useClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState<ClientDashboardData>({
    name: '',
    email: '',
    memberSince: null,
    todaysWorkout: null,
    nextSession: null,
    progress: {
      overall: 0,
      nutrition: 0
    },
    nutrition: {
      calories: 0,
      protein: 0,
      meals: []
    },
    currentProgram: null,
    loading: true,
    error: null
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setDashboardData(prev => ({ ...prev, loading: false, error: 'User not authenticated' }));
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        console.log('[useClientDashboard] Fetching dashboard data for user:', user.uid);
        
        // 1. Get client document
        const clientDocRef = doc(db, 'clients', user.uid);
        const clientDoc = await getDoc(clientDocRef);
        
        if (!clientDoc.exists()) {
          console.log('[useClientDashboard] Client document not found');
          setDashboardData(prev => ({ ...prev, loading: false, error: 'Client data not found' }));
          return;
        }
        
        const clientData = clientDoc.data();
        console.log('[useClientDashboard] Client data:', clientData);
        
        // 2. Get current program if exists
        let currentProgram = null;
        if (clientData.programId) {
          try {
            const programDocRef = doc(db, 'programs', clientData.programId);
            const programDoc = await getDoc(programDocRef);
            
            if (programDoc.exists()) {
              const programData = programDoc.data();
              currentProgram = {
                name: programData.name || 'Unnamed Program',
                id: programDoc.id
              };
              console.log('[useClientDashboard] Current program:', currentProgram);
            }
          } catch (err) {
            console.error('[useClientDashboard] Error fetching program:', err);
          }
        }
        
        // 3. Get today's workout
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let todaysWorkout = null;
        try {
          const workoutsQuery = query(
            collection(db, 'workouts'),
            where('clientId', '==', user.uid),
            where('date', '>=', today),
            where('date', '<', tomorrow),
            orderBy('date', 'asc'),
            limit(1)
          );
          
          const workoutsSnapshot = await getDocs(workoutsQuery);
          
          if (!workoutsSnapshot.empty) {
            const workoutDoc = workoutsSnapshot.docs[0];
            const workoutData = workoutDoc.data();
            
            todaysWorkout = {
              title: workoutData.title || 'Today\'s Workout',
              exercises: workoutData.exercises?.map(ex => ({
                name: ex.name,
                sets: ex.sets || 0,
                reps: ex.reps || '',
                completed: ex.completed || false
              })) || []
            };
            console.log('[useClientDashboard] Today\'s workout:', todaysWorkout);
          } else {
            // If no workout found for today, use a default from the program if available
            if (currentProgram && clientData.programId) {
              const programWorkoutsQuery = query(
                collection(db, 'workouts'),
                where('programId', '==', clientData.programId),
                limit(1)
              );
              
              const programWorkoutsSnapshot = await getDocs(programWorkoutsQuery);
              
              if (!programWorkoutsSnapshot.empty) {
                const workoutDoc = programWorkoutsSnapshot.docs[0];
                const workoutData = workoutDoc.data();
                
                todaysWorkout = {
                  title: workoutData.title || 'Upper Body',
                  exercises: workoutData.exercises?.map(ex => ({
                    name: ex.name,
                    sets: ex.sets || 0,
                    reps: ex.reps || '',
                    completed: false
                  })) || []
                };
                console.log('[useClientDashboard] Using program workout as today\'s workout:', todaysWorkout);
              }
            }
            
            // If still no workout, use a default
            if (!todaysWorkout) {
              todaysWorkout = {
                title: 'Upper Body',
                exercises: [
                  { name: 'Bench Press', sets: 4, reps: '12, 10, 10, 8', completed: false },
                  { name: 'Shoulder Press', sets: 4, reps: '12, 10, 10, 8', completed: false },
                  { name: 'Lat Pulldowns', sets: 3, reps: '12, 12, 10', completed: false },
                  { name: 'Bicep Curls', sets: 3, reps: '12, 12, 12', completed: false }
                ]
              };
              console.log('[useClientDashboard] Using default workout:', todaysWorkout);
            }
          }
        } catch (err) {
          console.error('[useClientDashboard] Error fetching today\'s workout:', err);
        }
        
        // 4. Get next session
        let nextSession = null;
        try {
          const sessionsQuery = query(
            collection(db, 'sessions'),
            where('clientId', '==', user.uid),
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(1)
          );
          
          const sessionsSnapshot = await getDocs(sessionsQuery);
          
          if (!sessionsSnapshot.empty) {
            const sessionDoc = sessionsSnapshot.docs[0];
            const sessionData = sessionDoc.data();
            
            const sessionDate = sessionData.date?.toDate();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            nextSession = {
              date: sessionDate,
              time: sessionDate ? `${sessionDate.getHours()}:${String(sessionDate.getMinutes()).padStart(2, '0')} ${sessionDate.getHours() >= 12 ? 'PM' : 'AM'}` : '10 AM',
              title: sessionData.title || 'Coaching Session'
            };
            console.log('[useClientDashboard] Next session:', nextSession);
          } else {
            // Default next session if none found
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);
            
            nextSession = {
              date: tomorrow,
              time: '10 AM',
              title: 'Coaching Session'
            };
            console.log('[useClientDashboard] Using default next session:', nextSession);
          }
        } catch (err) {
          console.error('[useClientDashboard] Error fetching next session:', err);
        }
        
        // 5. Get nutrition data
        let nutrition = {
          calories: 2400,
          protein: 180,
          meals: [
            { name: 'Oatmeal with protein shake', completed: false },
            { name: 'Chicken breast with rice', completed: false },
            { name: 'Post-workout smoothie', completed: false },
            { name: 'Salmon with vegetables', completed: false }
          ]
        };
        
        try {
          const nutritionQuery = query(
            collection(db, 'nutrition'),
            where('clientId', '==', user.uid),
            where('date', '>=', today),
            where('date', '<', tomorrow),
            limit(1)
          );
          
          const nutritionSnapshot = await getDocs(nutritionQuery);
          
          if (!nutritionSnapshot.empty) {
            const nutritionDoc = nutritionSnapshot.docs[0];
            const nutritionData = nutritionDoc.data();
            
            nutrition = {
              calories: nutritionData.calories || 2400,
              protein: nutritionData.protein || 180,
              meals: nutritionData.meals?.map(meal => ({
                name: meal.name,
                completed: meal.completed || false
              })) || nutrition.meals
            };
            console.log('[useClientDashboard] Nutrition data:', nutrition);
          }
        } catch (err) {
          console.error('[useClientDashboard] Error fetching nutrition data:', err);
        }
        
        // 6. Calculate progress
        const progress = {
          overall: clientData.progress?.overall || 75,
          nutrition: clientData.progress?.nutrition || 75
        };
        
        // 7. Update dashboard data
        setDashboardData({
          name: clientData.name || user.displayName || 'Client',
          email: clientData.email || user.email || '',
          memberSince: clientData.createdAt ? new Date(clientData.createdAt.seconds * 1000) : null,
          todaysWorkout,
          nextSession,
          progress,
          nutrition,
          currentProgram,
          loading: false,
          error: null
        });
        
        console.log('[useClientDashboard] Dashboard data set successfully');
        
      } catch (err) {
        console.error('[useClientDashboard] Error fetching dashboard data:', err);
        setDashboardData(prev => ({ 
          ...prev, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Error fetching dashboard data' 
        }));
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  return dashboardData;
}; 