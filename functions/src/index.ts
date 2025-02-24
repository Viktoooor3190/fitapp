import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface UserData {
  email: string;
  name: string;
  businessName: string;
  // Add other fields as needed
}

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const { email, uid } = user;
    
    await admin.firestore().collection('users').doc(uid).set({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'coach',
      status: 'active'
    });

  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});

export const processApplication = functions.https.onCall(async (data: UserData, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { email, name, businessName } = data;

    await admin.firestore().collection('applications').add({
      userId: context.auth.uid,
      email,
      name,
      businessName,
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };

  } catch (error) {
    console.error('Error processing application:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process application');
  }
}); 