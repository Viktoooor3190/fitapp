import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const createTestCoach = async () => {
  try {
    await setDoc(doc(db, 'coaches', 'testCoach1'), {
      email: 'coach1@example.com',
      subdomain: 'coach1',
      displayName: 'Coach One',
      clients: [],
      createdAt: new Date()
    });

    console.log('Test coach created successfully');
  } catch (error) {
    console.error('Error creating test coach:', error);
  }
};

createTestCoach(); 