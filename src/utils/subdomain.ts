import { db } from '../firebase/config';
import { collection, query, where, limit, getDocs, DocumentData } from 'firebase/firestore';

/**
 * Extracts the subdomain from the current hostname
 * Works with both production domains and local development (.localhost domains)
 * @returns The subdomain string or null if no subdomain is found
 */
export const getSubdomain = (): string | null => {
  try {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    console.log(`[getSubdomain] Raw hostname: "${hostname}", pathname: "${pathname}"`);
    
    // Special case for dashboard on coach1.localhost
    if (hostname === 'coach1.localhost' && pathname.startsWith('/dashboard')) {
      console.log('[getSubdomain] SPECIAL CASE: Dashboard on coach1.localhost');
      return 'coach1';
    }
    
    // HARDCODED CHECK for coach1.localhost - direct match
    if (hostname === 'coach1.localhost') {
      console.log('[getSubdomain] HARDCODED MATCH for coach1.localhost');
      return 'coach1';
    }
    
    // HARDCODED CHECK for coach2.localhost - direct match
    if (hostname === 'coach2.localhost') {
      console.log('[getSubdomain] HARDCODED MATCH for coach2.localhost');
      return 'coach2';
    }
    
    // Direct localhost check (no subdomain)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[getSubdomain] Direct localhost access, no subdomain');
      return null;
    }
    
    // General case for .localhost subdomains
    if (hostname.endsWith('.localhost')) {
      const subdomain = hostname.replace('.localhost', '');
      console.log(`[getSubdomain] Local subdomain detected: "${subdomain}"`);
      return subdomain;
    }
    
    // Handle production domains
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      console.log(`[getSubdomain] Production subdomain detected: "${parts[0]}"`);
      return parts[0];
    }
    
    console.log('[getSubdomain] No subdomain detected');
    return null;
  } catch (error) {
    console.error('[getSubdomain] Error extracting subdomain:', error);
    return null;
  }
};

/**
 * Checks if the current subdomain is a coach subdomain
 * @returns Boolean indicating if the current subdomain is a coach subdomain
 */
export const isCoachSubdomain = (): boolean => {
  const subdomain = getSubdomain();
  return Boolean(subdomain && subdomain !== 'www');
};

/**
 * Gets the coach ID associated with the current subdomain
 * For local development, you can map specific test subdomains to coach IDs
 * @returns Promise resolving to the coach ID or null if not found
 */
export const getCoachIdFromSubdomain = async (): Promise<string | null> => {
  try {
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
      
      if (coachSnapshot.empty) {
        console.warn(`No coach found for subdomain: ${subdomain}`);
        return null;
      }
      
      return coachSnapshot.docs[0]?.id || null;
    } catch (error) {
      console.error('Error fetching coach from subdomain:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in getCoachIdFromSubdomain:', error);
    return null;
  }
};

/**
 * Gets coach data associated with the current subdomain
 * @returns Promise resolving to the coach data or null if not found
 */
export const getCoachDataFromSubdomain = async (): Promise<DocumentData | null> => {
  try {
    const subdomain = getSubdomain();
    if (!subdomain) return null;

    // For local development testing, you can hardcode data
    if (process.env.NODE_ENV === 'development') {
      const localMappings: Record<string, DocumentData> = {
        'coach1': {
          id: 'test-coach-id-1',
          name: 'Test Coach 1',
          subdomain: 'coach1',
          email: 'coach1@example.com'
        },
        'coach2': {
          id: 'test-coach-id-2',
          name: 'Test Coach 2',
          subdomain: 'coach2',
          email: 'coach2@example.com'
        },
      };
      
      if (localMappings[subdomain]) {
        console.log(`[DEV] Using mapped coach data for ${subdomain}`);
        return localMappings[subdomain];
      }
    }

    // Query Firestore to get coach data from subdomain
    try {
      const coachesCollection = collection(db, 'coaches');
      const coachQuery = query(
        coachesCollection,
        where('subdomain', '==', subdomain),
        limit(1)
      );
      const coachSnapshot = await getDocs(coachQuery);
      
      if (coachSnapshot.empty) {
        console.warn(`No coach found for subdomain: ${subdomain}`);
        return null;
      }
      
      const coachDoc = coachSnapshot.docs[0];
      return { id: coachDoc.id, ...coachDoc.data() };
    } catch (error) {
      console.error('Error fetching coach data from subdomain:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in getCoachDataFromSubdomain:', error);
    return null;
  }
}; 