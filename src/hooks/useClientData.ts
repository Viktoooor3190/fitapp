import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, DocumentData, doc, getDoc } from 'firebase/firestore';
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

    // Create a query against the clients collection to find clients with matching coachId
    const clientsQuery = query(
      collection(db, 'clients'),
      where('coachId', '==', user.uid),
      where('isTemplate', '!=', true), // Exclude template clients
      orderBy('lastActive', 'desc')
    );

    // Set up real-time listener for clients with matching coachId
    const unsubscribeCoachIdClients = onSnapshot(
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
        
        // Get the coach document to check the clients array
        const coachDocRef = doc(db, 'coaches', user.uid);
        getDoc(coachDocRef).then((coachDoc) => {
          if (coachDoc.exists()) {
            const coachData = coachDoc.data();
            const clientIds = coachData.clients || [];
            
            // If there are client IDs in the coach's clients array
            if (clientIds.length > 0) {
              // Create a set of existing client IDs to avoid duplicates
              const existingClientIds = new Set(clientsData.map(client => client.id));
              
              // For each client ID in the coach's clients array
              const fetchPromises = clientIds
                .filter((clientId: string) => !existingClientIds.has(clientId)) // Skip if already fetched
                .map(async (clientId: string) => {
                  try {
                    const clientDocRef = doc(db, 'clients', clientId);
                    const clientDoc = await getDoc(clientDocRef);
                    
                    if (clientDoc.exists()) {
                      const data = clientDoc.data();
                      // Skip template clients
                      if (data.isTemplate) return null;
                      
                      return {
                        id: clientDoc.id,
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        status: data.status || 'inactive',
                        programId: data.programId || '',
                        progress: data.progress || {},
                        lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
                        coachId: user.uid, // Ensure coachId is set correctly
                        // Add other fields as needed
                      };
                    }
                    return null;
                  } catch (err) {
                    console.error(`Error fetching client ${clientId}:`, err);
                    return null;
                  }
                });
              
              // Wait for all client fetches to complete
              Promise.all(fetchPromises).then((additionalClients) => {
                // Filter out null values and combine with existing clients
                const validAdditionalClients = additionalClients.filter(client => client !== null) as Client[];
                const allClients = [...clientsData, ...validAdditionalClients];
                
                // Sort by lastActive (most recent first)
                allClients.sort((a, b) => {
                  if (!a.lastActive) return 1;
                  if (!b.lastActive) return -1;
                  return b.lastActive.getTime() - a.lastActive.getTime();
                });
                
                setClients(allClients);
                setLoading(false);
              }).catch(err => {
                console.error('Error fetching additional clients:', err);
                setClients(clientsData); // Use the clients we already have
                setLoading(false);
              });
            } else {
              // No additional clients to fetch
              setClients(clientsData);
              setLoading(false);
            }
          } else {
            // Coach document doesn't exist
            setClients(clientsData);
            setLoading(false);
          }
        }).catch(err => {
          console.error('Error fetching coach document:', err);
          setClients(clientsData); // Use the clients we already have
          setLoading(false);
        });
      },
      (err) => {
        console.error('Error fetching clients:', err);
        setError('Failed to fetch clients. Please try again.');
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribeCoachIdClients();
    };
  }, [user]);

  return { clients, loading, error };
}; 