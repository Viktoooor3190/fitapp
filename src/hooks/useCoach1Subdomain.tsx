import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config';

/**
 * Custom hook to handle coach subdomains in local development
 * This is a workaround for the main subdomain detection issues
 */
export const useCoachSubdomain = () => {
  const [coachSubdomain, setCoachSubdomain] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubdomainData = async () => {
      setIsLoading(true);
      
      // Extract the subdomain from the hostname
      const hostname = window.location.hostname;
      
      // Check if we're on a coach subdomain (e.g., coach1.localhost, coach2.localhost, coach-milos.localhost)
      const isLocalhost = hostname.endsWith('.localhost');
      
      if (isLocalhost) {
        const parts = hostname.split('.');
        if (parts.length > 1) {
          const subdomain = parts[0];
          // Check if it starts with 'coach'
          if (subdomain.startsWith('coach')) {
            console.log(`[useCoachSubdomain] Detected coach subdomain: ${subdomain}`);
            setCoachSubdomain(subdomain);
            
            // Try to get the real coach ID from the subdomains collection
            try {
              const subdomainDocRef = doc(firestore, 'subdomains', subdomain);
              const subdomainDoc = await getDoc(subdomainDocRef);
              
              if (subdomainDoc.exists()) {
                const subdomainData = subdomainDoc.data();
                const userId = subdomainData.userId;
                console.log(`[useCoachSubdomain] Found real userId ${userId} for subdomain ${subdomain}`);
                
                // Set coach data with the real userId, even if we can't get more details
                const coachDataObj = {
                  id: userId, // Use the real user ID from the subdomain document
                  name: formatCoachName(subdomain),
                  subdomain: subdomain,
                  email: `${subdomain.replace('-', '.')}@example.com`,
                  profileImage: `https://randomuser.me/api/portraits/${subdomain === 'coach1' ? 'men' : 'women'}/1.jpg`,
                  bio: "Professional fitness coach with experience in various training methods",
                  specialties: ["Weight Loss", "Strength Training", "Nutrition"],
                  active: true
                };
                
                // Try to get more details from the user and coach documents
                try {
                  // Get the user document to get more coach details
                  const userDocRef = doc(firestore, 'users', userId);
                  const userDoc = await getDoc(userDocRef);
                  
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log(`[useCoachSubdomain] Found user document for ${userId}:`, userData);
                    
                    // Update coach data with user details
                    coachDataObj.name = userData.displayName || coachDataObj.name;
                    coachDataObj.email = userData.email || coachDataObj.email;
                    coachDataObj.profileImage = userData.profileImage || coachDataObj.profileImage;
                    coachDataObj.active = userData.isActive || true;
                    
                    // Try to get the coach document for additional details
                    try {
                      const coachDocRef = doc(firestore, 'coaches', userId);
                      const coachDoc = await getDoc(coachDocRef);
                      
                      if (coachDoc.exists()) {
                        const coachDocData = coachDoc.data();
                        console.log(`[useCoachSubdomain] Found coach document for ${userId}:`, coachDocData);
                        
                        // Update coach data with coach document details
                        coachDataObj.name = coachDocData.name || coachDataObj.name;
                        coachDataObj.email = coachDocData.email || coachDataObj.email;
                        coachDataObj.profileImage = coachDocData.profilePicture || coachDataObj.profileImage;
                        coachDataObj.bio = coachDocData.bio || coachDataObj.bio;
                        
                        if (coachDocData.specialties) {
                          coachDataObj.specialties = typeof coachDocData.specialties === 'string' ? 
                            coachDocData.specialties.split(',') : coachDocData.specialties;
                        }
                      }
                    } catch (err) {
                      console.log(`[useCoachSubdomain] Could not get coach document for ${userId}:`, err);
                      // Continue with the data we have
                    }
                  }
                } catch (err) {
                  console.log(`[useCoachSubdomain] Could not get user document for ${userId}:`, err);
                  // Continue with the data we have
                }
                
                // Set the coach data with whatever information we were able to gather
                setCoachData(coachDataObj);
                console.log(`[useCoachSubdomain] Using coach data for ${subdomain} with ID ${userId}:`, coachDataObj);
                setIsLoading(false);
                return;
              } else {
                console.log(`[useCoachSubdomain] No subdomain document found for ${subdomain}`);
              }
            } catch (err) {
              console.error(`[useCoachSubdomain] Error fetching subdomain data:`, err);
            }
            
            // Fall back to mock data if real data couldn't be found
            const mockCoachData = {
              id: `${subdomain}-id`,
              name: formatCoachName(subdomain),
              subdomain: subdomain,
              email: `${subdomain.replace('-', '.')}@example.com`,
              profileImage: `https://randomuser.me/api/portraits/${subdomain === 'coach1' ? 'men' : 'women'}/1.jpg`,
              bio: "Professional fitness coach with experience in various training methods",
              specialties: ["Weight Loss", "Strength Training", "Nutrition"],
              active: true
            };
            
            setCoachData(mockCoachData);
            console.log(`[useCoachSubdomain] Using mock coach data for ${subdomain}:`, mockCoachData);
          }
        }
      }
      
      // Set loading to false
      setIsLoading(false);
    };
    
    fetchSubdomainData();
  }, []);
  
  return {
    isCoachSubdomain: !!coachSubdomain,
    coachSubdomain,
    isLoading,
    coachData
  };
};

/**
 * Helper function to format coach name from subdomain
 * Handles cases like "coach1" -> "Coach 1" and "coach-milos" -> "Coach Milos"
 */
function formatCoachName(subdomain: string): string {
  // Remove 'coach' prefix
  let name = subdomain.replace(/^coach/, '');
  
  // Handle hyphenated names (e.g., coach-milos -> Milos)
  if (name.startsWith('-')) {
    name = name.substring(1); // Remove the leading hyphen
  }
  
  // Capitalize first letter of each word
  name = name.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  
  // Handle numeric names (e.g., coach1 -> Coach 1)
  if (/^\d+$/.test(name)) {
    name = `Coach ${name}`;
  } else {
    name = `Coach ${name}`;
  }
  
  return name;
} 