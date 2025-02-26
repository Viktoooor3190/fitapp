import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  programId: string;
  programName?: string; // This might come from a join with programs collection
  progress: any; // This could be a complex object based on your schema
  lastActive: Date | null;
  coachId: string;
  // Add other fields as needed
}

export const useClientData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create a query against the clients collection
    const clientsQuery = query(
      collection(db, 'clients'),
      where('coachId', '==', user.uid),
      where('isTemplate', '!=', true), // Exclude template clients
      orderBy('lastActive', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        const clientsData: Client[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          clientsData.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            status: data.status || 'inactive',
            programId: data.programId || '',
            progress: data.progress || {},
            lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
            coachId: data.coachId,
            // Add other fields as needed
          });
        });
        setClients(clientsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching clients:', err);
        setError('Failed to fetch clients. Please try again.');
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user]);

  return { clients, loading, error };
}; 