const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, arrayUnion } = require('firebase/firestore');

// Your Firebase configuration - using emulator
const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
const { connectFirestoreEmulator } = require('firebase/firestore');
connectFirestoreEmulator(db, 'localhost', 8080);

async function fixClientCoachRelationship() {
  try {
    // Get the client document
    const clientId = 'mountain.olive.626@example.com';
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    
    if (clientDoc.exists()) {
      console.log('Found client document');
      const clientData = clientDoc.data();
      
      // Get the coach document using email
      const coachEmail = 'milos@gmail.com';
      const coachDoc = await getDoc(doc(db, 'coaches', coachEmail));
      
      if (coachDoc.exists()) {
        console.log('Found coach document');
        
        // Update the coach document to include this client
        await updateDoc(doc(db, 'coaches', coachEmail), {
          clients: arrayUnion(clientId)
        });
        
        console.log('Updated coach document with client ID');
        
        // Update the client document with the correct coachId
        await updateDoc(doc(db, 'clients', clientId), {
          coachId: coachEmail
        });
        console.log('Updated client document with correct coachId');
      } else {
        console.log('Coach document not found');
      }
    } else {
      console.log('Client document not found');
    }
    
    console.log('Relationship fix attempt completed');
  } catch (error) {
    console.error('Error fixing relationship:', error);
  }
}

fixClientCoachRelationship(); 