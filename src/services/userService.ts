import { auth, firestore } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { slugify } from '../utils/stringUtils';

/**
 * Service for handling user-related operations
 */
export const userService = {
  /**
   * Register a new user and create their subdomain
   * @param email User's email
   * @param password User's password
   * @param displayName User's display name
   * @returns The created user data
   */
  async registerUser(email: string, password: string, displayName: string) {
    try {
      // Check if username is available for subdomain
      const subdomain = this.generateSubdomain(displayName);
      const isSubdomainAvailable = await this.checkSubdomainAvailability(subdomain);
      
      if (!isSubdomainAvailable) {
        throw new Error(`Subdomain "${subdomain}" is already taken. Please choose a different username.`);
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore with subdomain
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName,
        subdomain,
        role: 'coach', // Assuming all users with subdomains are coaches
        createdAt: new Date().toISOString(),
        isActive: true,
        profileComplete: false
      };
      
      await setDoc(doc(firestore, 'users', user.uid), userData);
      
      // Create a separate subdomain document for faster lookups
      await setDoc(doc(firestore, 'subdomains', subdomain), {
        userId: user.uid,
        subdomain,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      console.log(`User registered successfully with subdomain: ${subdomain}`);
      return userData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },
  
  /**
   * Generate a subdomain from a display name
   * @param displayName User's display name
   * @returns A URL-safe subdomain
   */
  generateSubdomain(displayName: string): string {
    // Convert display name to lowercase, remove special chars, replace spaces with hyphens
    let subdomain = slugify(displayName);
    
    // Ensure it starts with 'coach-' if it doesn't already start with 'coach'
    if (!subdomain.startsWith('coach')) {
      subdomain = `coach-${subdomain}`;
    }
    
    return subdomain;
  },
  
  /**
   * Check if a subdomain is available
   * @param subdomain The subdomain to check
   * @returns True if the subdomain is available
   */
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      // Check if subdomain exists in the subdomains collection
      const subdomainDoc = await getDoc(doc(firestore, 'subdomains', subdomain));
      return !subdomainDoc.exists();
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      throw error;
    }
  },
  
  /**
   * Get user data by subdomain
   * @param subdomain The subdomain to look up
   * @returns The user data or null if not found
   */
  async getUserBySubdomain(subdomain: string) {
    try {
      // Get the subdomain document
      const subdomainDoc = await getDoc(doc(firestore, 'subdomains', subdomain));
      
      if (!subdomainDoc.exists()) {
        return null;
      }
      
      const subdomainData = subdomainDoc.data();
      const userId = subdomainData.userId;
      
      // Get the user document
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data();
    } catch (error) {
      console.error('Error getting user by subdomain:', error);
      throw error;
    }
  }
}; 