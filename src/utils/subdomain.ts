import { db } from '../firebase/config';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

/**
 * Extracts the subdomain from the current hostname
 * Works with both production domains and local development (.localhost domains)
 */
export const getSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Handle localhost development environment
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    return parts[0]; // Returns 'coach1' from 'coach1.localhost'
  }
  
  // Handle production environment
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
};

/**
 * Checks if the current subdomain is a coach subdomain
 */
export const isCoachSubdomain = () => {
  const subdomain = getSubdomain();
  return subdomain && subdomain !== 'www';
};

/**
 * Gets the coach ID associated with the current subdomain
 * For local development, you can map specific test subdomains to coach IDs
 */
export const getCoachIdFromSubdomain = async () => {
  const subdomain = getSubdomain();
  if (!subdomain) return null;

  // For local development testing, you can hardcode mappings
  if (process.env.NODE_ENV === 'development') {
    const localMappings: Record<string, string> = {
      'coach1': 'test-coach-id-1',
      'coach2': 'test-coach-id-2',
    };
    
    if (localMappings[subdomain]) {
      console.log(`[DEV] Using mapped coach ID for ${subdomain}: ${localMappings[subdomain]}`);
      return localMappings[subdomain];
    }
  }

  // Query Firestore to get coach ID from subdomain
  try {
    const coachesCollection = collection(db, 'coaches');
    const coachQuery = query(
      coachesCollection,
      where('subdomain', '==', subdomain),
      limit(1)
    );
    const coachSnapshot = await getDocs(coachQuery);
    
    return coachSnapshot.docs[0]?.id || null;
  } catch (error) {
    console.error('Error fetching coach from subdomain:', error);
    return null;
  }
}; 