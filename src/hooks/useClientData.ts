import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, DocumentData, doc, getDoc, getDocs, updateDoc, arrayUnion, collectionGroup } from 'firebase/firestore';
import { db, firestore } from '../firebase/config';
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
  registeredViaSubdomain?: string;
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

    const fetchClients = async () => {
      try {
        console.log('[useClientData] Starting to fetch clients for coach:', user.uid);
        
        // First, get the coach document to check the clients array
        const coachDocRef = doc(db, 'coaches', user.uid);
        const coachDoc = await getDoc(coachDocRef);
        
        // Get the coach's subdomain
        let coachSubdomain = null;
        if (coachDoc.exists()) {
          coachSubdomain = coachDoc.data().subdomain;
          console.log(`[useClientData] Coach has subdomain: ${coachSubdomain}`);
        } else {
          // Try to get subdomain from user document
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().subdomain) {
            coachSubdomain = userDoc.data().subdomain;
            console.log(`[useClientData] Found subdomain in user document: ${coachSubdomain}`);
          }
        }
        
        // If we have a subdomain, check if there's a corresponding subdomain document
        let subdomainUserId = null;
        if (coachSubdomain) {
          try {
            const subdomainDocRef = doc(firestore, 'subdomains', coachSubdomain);
            const subdomainDoc = await getDoc(subdomainDocRef);
            if (subdomainDoc.exists()) {
              subdomainUserId = subdomainDoc.data().userId;
              console.log(`[useClientData] Found userId ${subdomainUserId} for subdomain ${coachSubdomain}`);
            }
          } catch (err) {
            console.error(`[useClientData] Error fetching subdomain document:`, err);
          }
        }
        
        let clientsFromArray: Client[] = [];
        
        // If coach document exists and has clients array
        if (coachDoc.exists()) {
          console.log('[useClientData] Coach document exists:', coachDoc.id);
          const coachData = coachDoc.data();
          const clientIds = coachData.clients || [];
          
          console.log(`[useClientData] Found ${clientIds.length} clients in coach's clients array:`, clientIds);
          
          // If there are client IDs in the coach's clients array
          if (clientIds.length > 0) {
            // Fetch all clients in batches to avoid too many parallel requests
            const fetchPromises = clientIds.map(async (clientId: string) => {
              try {
                const clientDocRef = doc(db, 'clients', clientId);
                const clientDoc = await getDoc(clientDocRef);
                
                if (clientDoc.exists()) {
                  const data = clientDoc.data();
                  console.log(`[useClientData] Successfully fetched client ${clientId}:`, data);
                  
                  // Skip template clients
                  if (data.isTemplate) return null;
                  
                  // If the client doesn't have the correct coachId, update it
                  if (data.coachId !== user.uid) {
                    console.log(`[useClientData] Updating client ${clientId} with correct coachId`);
                    await updateDoc(clientDocRef, {
                      coachId: user.uid
                    });
                  }
                  
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
                    registeredViaSubdomain: data.registeredViaSubdomain
                  };
                } else {
                  console.log(`[useClientData] Client ${clientId} does not exist`);
                }
                return null;
              } catch (err) {
                console.error(`[useClientData] Error fetching client ${clientId}:`, err);
                return null;
              }
            });
            
            // Wait for all client fetches to complete
            const results = await Promise.all(fetchPromises);
            clientsFromArray = results.filter(client => client !== null) as Client[];
            console.log(`[useClientData] Successfully fetched ${clientsFromArray.length} clients from array`);
          }
        } else {
          console.log('[useClientData] Coach document does not exist');
        }
        
        // Now query for clients with matching coachId
        console.log('[useClientData] Querying for clients with coachId:', user.uid);
        const clientsQuery = query(
          collection(db, 'clients'),
          where('coachId', '==', user.uid),
          where('isTemplate', '!=', true) // Exclude template clients
        );
        
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsFromQuery: Client[] = [];
        
        clientsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`[useClientData] Found client with matching coachId:`, doc.id, data);
          
          // Add client to coach's clients array if not already there
          if (coachDoc.exists()) {
            const coachData = coachDoc.data();
            const clientIds = coachData.clients || [];
            if (!clientIds.includes(doc.id)) {
              console.log(`[useClientData] Adding client ${doc.id} to coach's clients array`);
              updateDoc(coachDocRef, {
                clients: arrayUnion(doc.id)
              }).catch(err => {
                console.error(`[useClientData] Error updating coach's clients array:`, err);
              });
            }
          }
          
          clientsFromQuery.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            status: data.status || 'inactive',
            programId: data.programId || '',
            progress: data.progress || {},
            lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
            coachId: data.coachId,
            registeredViaSubdomain: data.registeredViaSubdomain
          });
        });
        
        console.log(`[useClientData] Found ${clientsFromQuery.length} clients with matching coachId`);
        
        // If we have a subdomain, also query for clients registered via this subdomain
        let clientsFromSubdomain: Client[] = [];
        if (coachSubdomain) {
          console.log(`[useClientData] Querying for clients registered via subdomain: ${coachSubdomain}`);
          const subdomainQuery = query(
            collection(db, 'clients'),
            where('registeredViaSubdomain', '==', coachSubdomain),
            where('isTemplate', '!=', true)
          );
          
          const subdomainSnapshot = await getDocs(subdomainQuery);
          
          subdomainSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`[useClientData] Found client registered via subdomain:`, doc.id, data);
            
            // Add client to coach's clients array if not already there
            if (coachDoc.exists()) {
              const coachData = coachDoc.data();
              const clientIds = coachData.clients || [];
              if (!clientIds.includes(doc.id)) {
                console.log(`[useClientData] Adding client ${doc.id} to coach's clients array`);
                updateDoc(coachDocRef, {
                  clients: arrayUnion(doc.id)
                }).catch(err => {
                  console.error(`[useClientData] Error updating coach's clients array:`, err);
                });
              }
            }
            
            // Update client's coachId if it's incorrect
            if (data.coachId !== user.uid) {
              console.log(`[useClientData] Updating client ${doc.id} with correct coachId`);
              updateDoc(doc.ref, {
                coachId: user.uid
              }).catch(err => {
                console.error(`[useClientData] Error updating client's coachId:`, err);
              });
            }
            
            clientsFromSubdomain.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              status: data.status || 'inactive',
              programId: data.programId || '',
              progress: data.progress || {},
              lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
              coachId: user.uid, // Set to current coach ID
              registeredViaSubdomain: data.registeredViaSubdomain
            });
          });
          
          console.log(`[useClientData] Found ${clientsFromSubdomain.length} clients registered via subdomain`);
        }
        
        // Also query for clients with coachId in the format "coach-subdomain-id"
        let clientsFromLegacyId: Client[] = [];
        if (coachSubdomain) {
          const legacyCoachId = `${coachSubdomain}-id`;
          console.log(`[useClientData] Querying for clients with legacy coachId: ${legacyCoachId}`);
          
          const legacyQuery = query(
            collection(db, 'clients'),
            where('coachId', '==', legacyCoachId),
            where('isTemplate', '!=', true)
          );
          
          const legacySnapshot = await getDocs(legacyQuery);
          
          legacySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`[useClientData] Found client with legacy coachId:`, doc.id, data);
            
            // Add client to coach's clients array if not already there
            if (coachDoc.exists()) {
              const coachData = coachDoc.data();
              const clientIds = coachData.clients || [];
              if (!clientIds.includes(doc.id)) {
                console.log(`[useClientData] Adding client ${doc.id} to coach's clients array`);
                updateDoc(coachDocRef, {
                  clients: arrayUnion(doc.id)
                }).catch(err => {
                  console.error(`[useClientData] Error updating coach's clients array:`, err);
                });
              }
            }
            
            // Update client's coachId to the correct one
            console.log(`[useClientData] Updating client ${doc.id} with correct coachId`);
            updateDoc(doc.ref, {
              coachId: user.uid
            }).catch(err => {
              console.error(`[useClientData] Error updating client's coachId:`, err);
            });
            
            clientsFromLegacyId.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              status: data.status || 'inactive',
              programId: data.programId || '',
              progress: data.progress || {},
              lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
              coachId: user.uid, // Set to current coach ID
              registeredViaSubdomain: data.registeredViaSubdomain
            });
          });
          
          console.log(`[useClientData] Found ${clientsFromLegacyId.length} clients with legacy coachId`);
        }
        
        // If we have a subdomain user ID from the subdomains collection, query for clients with that ID
        let clientsFromSubdomainUserId: Client[] = [];
        if (subdomainUserId && subdomainUserId !== user.uid) {
          console.log(`[useClientData] Querying for clients with subdomain userId: ${subdomainUserId}`);
          
          const subdomainUserIdQuery = query(
            collection(db, 'clients'),
            where('coachId', '==', subdomainUserId),
            where('isTemplate', '!=', true)
          );
          
          const subdomainUserIdSnapshot = await getDocs(subdomainUserIdQuery);
          
          subdomainUserIdSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`[useClientData] Found client with subdomain userId:`, doc.id, data);
            
            // Add client to coach's clients array if not already there
            if (coachDoc.exists()) {
              const coachData = coachDoc.data();
              const clientIds = coachData.clients || [];
              if (!clientIds.includes(doc.id)) {
                console.log(`[useClientData] Adding client ${doc.id} to coach's clients array`);
                updateDoc(coachDocRef, {
                  clients: arrayUnion(doc.id)
                }).catch(err => {
                  console.error(`[useClientData] Error updating coach's clients array:`, err);
                });
              }
            }
            
            // Update client's coachId to the correct one
            console.log(`[useClientData] Updating client ${doc.id} with correct coachId`);
            updateDoc(doc.ref, {
              coachId: user.uid
            }).catch(err => {
              console.error(`[useClientData] Error updating client's coachId:`, err);
            });
            
            clientsFromSubdomainUserId.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              status: data.status || 'inactive',
              programId: data.programId || '',
              progress: data.progress || {},
              lastActive: data.lastActive ? new Date(data.lastActive.seconds * 1000) : null,
              coachId: user.uid, // Set to current coach ID
              registeredViaSubdomain: data.registeredViaSubdomain
            });
          });
          
          console.log(`[useClientData] Found ${clientsFromSubdomainUserId.length} clients with subdomain userId`);
        }
        
        // Combine all sets of clients, avoiding duplicates
        const clientIdSet = new Set();
        const allClients: Client[] = [];
        
        // Add clients from array first
        for (const client of clientsFromArray) {
          if (!clientIdSet.has(client.id)) {
            clientIdSet.add(client.id);
            allClients.push(client);
          }
        }
        
        // Then add clients from query
        for (const client of clientsFromQuery) {
          if (!clientIdSet.has(client.id)) {
            clientIdSet.add(client.id);
            allClients.push(client);
          }
        }
        
        // Then add clients from subdomain query
        for (const client of clientsFromSubdomain) {
          if (!clientIdSet.has(client.id)) {
            clientIdSet.add(client.id);
            allClients.push(client);
          }
        }
        
        // Then add clients from legacy ID query
        for (const client of clientsFromLegacyId) {
          if (!clientIdSet.has(client.id)) {
            clientIdSet.add(client.id);
            allClients.push(client);
          }
        }
        
        // Finally add clients from subdomain user ID query
        for (const client of clientsFromSubdomainUserId) {
          if (!clientIdSet.has(client.id)) {
            clientIdSet.add(client.id);
            allClients.push(client);
          }
        }
        
        // Sort by lastActive (most recent first)
        allClients.sort((a, b) => {
          if (!a.lastActive) return 1;
          if (!b.lastActive) return -1;
          return b.lastActive.getTime() - a.lastActive.getTime();
        });
        
        console.log(`[useClientData] Total unique clients: ${allClients.length}`);
        setClients(allClients);
        setLoading(false);
        
      } catch (err) {
        console.error('[useClientData] Error fetching clients:', err);
        setError('Failed to fetch clients. Please try again.');
        setLoading(false);
      }
    };
    
    fetchClients();
    
    // We're not using real-time updates for now to simplify the code
    // If you want real-time updates, you can add onSnapshot listeners here
    
    return () => {
      // No cleanup needed for this implementation
    };
  }, [user]);

  return { clients, loading, error };
}; 