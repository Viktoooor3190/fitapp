import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubdomain } from '../utils/subdomain';
import { userService } from '../services/userService';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db, firestore } from '../firebase/config';

// Define the shape of the coach data
export interface CoachData {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  profileImage?: string;
  bio?: string;
  specialties?: string[];
  active: boolean;
}

// Define the shape of the context
export interface SubdomainContextType {
  subdomain: string | null;
  coachId: string | null;
  coachData: CoachData | null;
  isCoachDomain: boolean;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const SubdomainContext = createContext<SubdomainContextType>({
  subdomain: null,
  coachId: null,
  coachData: null,
  isCoachDomain: false,
  loading: true,
  error: null
});

// Custom hook to use the subdomain context
export const useSubdomain = () => useContext(SubdomainContext);

// Provider component
export const SubdomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [isCoachDomain, setIsCoachDomain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSubdomain = async () => {
      try {
        // Get the subdomain from the URL
        const detectedSubdomain = getSubdomain();
        console.log('Detected subdomain:', detectedSubdomain);
        setSubdomain(detectedSubdomain);

        // If there's a subdomain, fetch the coach data
        if (detectedSubdomain) {
          console.log('Fetching coach data for subdomain:', detectedSubdomain);
          
          // First, try to get the coach ID from the subdomains collection
          const subdomainDoc = await getDoc(doc(firestore, 'subdomains', detectedSubdomain));
          
          if (subdomainDoc.exists()) {
            const subdomainData = subdomainDoc.data();
            const userId = subdomainData.userId;
            console.log('Found subdomain document with userId:', userId);
            
            // Get the user document
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('Found user document:', userData);
              
              // Get the coach document
              const coachDoc = await getDoc(doc(db, 'coaches', userId));
              
              if (coachDoc.exists()) {
                const coachData = coachDoc.data();
                console.log('Found coach document:', coachData);
                
                setCoachId(userId);
                setCoachData({
                  id: userId,
                  name: userData.displayName || coachData.name || '',
                  subdomain: detectedSubdomain,
                  email: userData.email || coachData.email || '',
                  profileImage: userData.profileImage || coachData.profilePicture || '',
                  bio: coachData.bio || '',
                  specialties: coachData.specialties ? coachData.specialties.split(',') : [],
                  active: userData.isActive || true
                });
                setIsCoachDomain(true);
              } else {
                // If coach document doesn't exist, try to use just the user data
                console.log('No coach document found, using user data only');
                setCoachId(userId);
                setCoachData({
                  id: userId,
                  name: userData.displayName || '',
                  subdomain: detectedSubdomain,
                  email: userData.email || '',
                  profileImage: userData.profileImage || '',
                  bio: '',
                  specialties: [],
                  active: userData.isActive || true
                });
                setIsCoachDomain(true);
              }
            } else {
              // If user document doesn't exist, try to find coach by subdomain directly
              console.log('No user document found, trying to find coach by subdomain directly');
              await findCoachBySubdomain(detectedSubdomain);
            }
          } else {
            // If subdomain document doesn't exist, try to find coach by subdomain directly
            console.log('No subdomain document found, trying to find coach by subdomain directly');
            await findCoachBySubdomain(detectedSubdomain);
          }
        }
      } catch (err) {
        console.error('Error initializing subdomain:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        // Ensure loading state is completed after a brief period
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    // Helper function to find coach by subdomain directly in coaches collection
    const findCoachBySubdomain = async (subdomain: string) => {
      try {
        // Query coaches collection for the subdomain
        const coachesQuery = query(
          collection(db, 'coaches'),
          where('subdomain', '==', subdomain),
          limit(1)
        );
        
        const coachSnapshot = await getDocs(coachesQuery);
        
        if (!coachSnapshot.empty) {
          const coachDoc = coachSnapshot.docs[0];
          const coachId = coachDoc.id;
          const coachData = coachDoc.data();
          
          console.log('Found coach by subdomain query:', coachData);
          
          setCoachId(coachId);
          setCoachData({
            id: coachId,
            name: coachData.name || '',
            subdomain: subdomain,
            email: coachData.email || '',
            profileImage: coachData.profilePicture || '',
            bio: coachData.bio || '',
            specialties: coachData.specialties ? coachData.specialties.split(',') : [],
            active: true
          });
          setIsCoachDomain(true);
        } else {
          console.log('No coach found for subdomain:', subdomain);
          setError(`No coach found for subdomain: ${subdomain}`);
        }
      } catch (err) {
        console.error('Error finding coach by subdomain:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeSubdomain();
  }, []);

  // The value that will be provided to consumers of this context
  const value: SubdomainContextType = {
    subdomain,
    coachId,
    coachData,
    isCoachDomain,
    loading,
    error
  };

  return (
    <SubdomainContext.Provider value={value}>
      {children}
    </SubdomainContext.Provider>
  );
}; 