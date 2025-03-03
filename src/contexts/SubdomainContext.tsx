import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubdomain } from '../utils/subdomain';
import { userService } from '../services/userService';

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
          
          // Use the userService to get coach data by subdomain
          const userData = await userService.getUserBySubdomain(detectedSubdomain);
          
          if (userData) {
            console.log('Coach data found:', userData);
            setCoachId(userData.uid);
            setCoachData({
              id: userData.uid,
              name: userData.displayName,
              subdomain: userData.subdomain,
              email: userData.email,
              profileImage: userData.profileImage,
              bio: userData.bio,
              specialties: userData.specialties,
              active: userData.isActive
            });
            setIsCoachDomain(true);
          } else {
            console.log('No coach found for subdomain:', detectedSubdomain);
            setError(`No coach found for subdomain: ${detectedSubdomain}`);
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