import { onCall } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

interface UserData {
  email: string;
  name: string;
  businessName: string;
  // Add other fields as needed
}

// Create user profile when a new user signs up
export const createUserProfile = beforeUserCreated(async (event) => {
  try {
    const { email, uid } = event.data;
    
    await db.collection('users').doc(uid).set({
      email,
      createdAt: new Date(),
      role: 'coach',
      status: 'active'
    });

    return { customClaims: { role: 'coach' } };

  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
});

// Process application for new coaches
export const processApplication = onCall<UserData>(async (request) => {
  try {
    if (!request.auth) {
      throw new Error('Must be logged in');
    }

    const { email, name, businessName } = request.data;

    await db.collection('applications').add({
      userId: request.auth.uid,
      email,
      name,
      businessName,
      status: 'pending',
      submittedAt: new Date()
    });

    return { success: true };

  } catch (error) {
    console.error('Error processing application:', error);
    throw new Error('Failed to process application');
  }
});

// Example function
export const helloWorld = onRequest((request, response) => {
  response.send("Hello from Firebase!");
}); 