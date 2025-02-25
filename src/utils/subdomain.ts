import { db } from '../firebase/config';

export const getSubdomain = () => {
  const parts = window.location.hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
};

export const isCoachSubdomain = () => {
  const subdomain = getSubdomain();
  return subdomain && subdomain !== 'www';
};

export const getCoachIdFromSubdomain = async () => {
  const subdomain = getSubdomain();
  if (!subdomain) return null;

  // Query Firestore to get coach ID from subdomain
  const coachDoc = await db
    .collection('coaches')
    .where('subdomain', '==', subdomain)
    .limit(1)
    .get();

  return coachDoc.docs[0]?.id || null;
}; 