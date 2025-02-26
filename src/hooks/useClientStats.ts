import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface ClientStats {
  totalClients: number;
  newClientsThisWeek: number;
  activeClients: number;
  inactiveClients: number;
}

export const useClientStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    newClientsThisWeek: 0,
    activeClients: 0,
    inactiveClients: 0
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query for clients belonging to the current coach
    const clientsRef = collection(db, 'clients');
    const clientsQuery = query(clientsRef, where('coachId', '==', user.uid));

    // Set up real-time listener for clients
    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        try {
          // Get current date and date 7 days ago for "new this week" calculation
          const now = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          let totalClients = 0;
          let newClientsThisWeek = 0;
          let activeClients = 0;
          let inactiveClients = 0;

          snapshot.forEach((doc) => {
            const clientData = doc.data();
            totalClients++;

            // Check if client was created in the last week
            if (clientData.createdAt) {
              const createdAt = clientData.createdAt instanceof Timestamp 
                ? clientData.createdAt.toDate() 
                : new Date(clientData.createdAt);
              
              if (createdAt >= oneWeekAgo) {
                newClientsThisWeek++;
              }
            }

            // Count active vs inactive clients
            if (clientData.status === 'active') {
              activeClients++;
            } else {
              inactiveClients++;
            }
          });

          setStats({
            totalClients,
            newClientsThisWeek,
            activeClients,
            inactiveClients
          });
          setLoading(false);
        } catch (err) {
          console.error('Error processing client data:', err);
          setError('Failed to process client data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching clients:', err);
        setError('Failed to fetch client data');
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user]);

  return { stats, loading, error };
}; 