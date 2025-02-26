import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Program {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: string;
  difficulty: string;
  status: 'active' | 'draft';
  coachId: string;
  clientsEnrolled: string[];
  workouts: any[];
  nutritionPlan: any[];
  lastUpdated: Date;
  createdAt: Date;
  // Add other fields as needed
}

export const useProgramData = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsMap, setProgramsMap] = useState<Record<string, Program>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPrograms([]);
      setProgramsMap({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query against the programs collection
    const programsQuery = query(
      collection(db, 'programs'),
      where('coachId', '==', user.uid),
      orderBy('name')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      programsQuery,
      (snapshot) => {
        const programsData: Program[] = [];
        const programsMapData: Record<string, Program> = {};
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const program = {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            type: data.type || 'custom',
            duration: data.duration || '',
            difficulty: data.difficulty || 'intermediate',
            status: data.status || 'draft',
            coachId: data.coachId,
            clientsEnrolled: data.clientsEnrolled || [],
            workouts: data.workouts || [],
            nutritionPlan: data.nutritionPlan || [],
            lastUpdated: data.lastUpdated ? new Date(data.lastUpdated.seconds * 1000) : new Date(),
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          };
          
          programsData.push(program);
          programsMapData[doc.id] = program;
        });
        
        setPrograms(programsData);
        setProgramsMap(programsMapData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching programs:', err);
        setError('Failed to fetch programs. Please try again.');
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user]);

  return { programs, programsMap, loading, error };
}; 