import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin once
const app = initializeApp();
const db = getFirestore();

export { app, db }; 