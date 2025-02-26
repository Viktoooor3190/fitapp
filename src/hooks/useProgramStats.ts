import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface ProgramStats {
  totalPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  engagementRate: number;
}

export const useProgramStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProgramStats>({
    totalPrograms: 0,
    activePrograms: 0,
    completedPrograms: 0,
    engagementRate: 0
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query for programs belonging to the current coach
    const programsRef = collection(db, 'programs');
    const programsQuery = query(programsRef, where('coachId', '==', user.uid));

    // Set up real-time listener for programs
    const unsubscribe = onSnapshot(
      programsQuery,
      (snapshot) => {
        try {
          let totalPrograms = 0;
          let activePrograms = 0;
          let completedPrograms = 0;
          let totalClients = 0;
          let activeClients = 0;

          snapshot.forEach((doc) => {
            const programData = doc.data();
            totalPrograms++;

            // Count active vs completed programs
            if (programData.status === 'active') {
              activePrograms++;
              
              // Count clients for engagement calculation
              if (programData.clients && Array.isArray(programData.clients)) {
                totalClients += programData.clients.length;
                
                // Count active clients if the data includes client status
                if (programData.clientStatus && typeof programData.clientStatus === 'object') {
                  Object.values(programData.clientStatus).forEach((status: any) => {
                    if (status === 'active' || status === 'engaged') {
                      activeClients++;
                    }
                  });
                } else {
                  // If no detailed status, assume all clients are active
                  activeClients += programData.clients.length;
                }
              }
            } else if (programData.status === 'completed') {
              completedPrograms++;
            }
          });

          // Calculate engagement rate (active clients / total clients)
          const engagementRate = totalClients > 0 
            ? (activeClients / totalClients) * 100 
            : 0;

          setStats({
            totalPrograms,
            activePrograms,
            completedPrograms,
            engagementRate
          });
          setLoading(false);
        } catch (err) {
          console.error('Error processing program data:', err);
          setError('Failed to process program data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching programs:', err);
        setError('Failed to fetch program data');
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user]);

  return { stats, loading, error };
}; 