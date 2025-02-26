import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

// Record activity when a new client is created
export const recordNewClientActivity = onDocumentCreated('clients/{clientId}', async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const clientData = snapshot.data();
    const { coachId, name, firstName, lastName } = clientData;
    
    if (!coachId) {
      console.log('No coachId found in client data');
      return;
    }

    // Determine client name from available fields
    const clientName = name || (firstName && lastName ? `${firstName} ${lastName}` : 'New client');

    // Create activity record
    await db.collection('activity').add({
      type: 'new_client',
      message: `${clientName} joined as a new client`,
      timestamp: new Date(),
      coachId,
      relatedId: snapshot.id,
      relatedName: clientName
    });

    console.log(`Recorded new client activity for ${clientName}`);
  } catch (error) {
    console.error('Error recording new client activity:', error);
  }
});

// Record activity when a workout is completed
export const recordWorkoutCompleteActivity = onDocumentUpdated('workouts/{workoutId}', async (event) => {
  try {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) {
      console.log('No data associated with the event');
      return;
    }

    // Only proceed if status changed from 'assigned' to 'completed'
    if (beforeData.status !== 'assigned' || afterData.status !== 'completed') {
      return;
    }

    const { coachId, clientId, clientName, programName, title } = afterData;
    
    if (!coachId || !clientId) {
      console.log('Missing required fields in workout data');
      return;
    }

    // Create activity record
    await db.collection('activity').add({
      type: 'workout_complete',
      message: `${clientName || 'Client'} completed "${title || programName || 'workout'}"`,
      timestamp: new Date(),
      coachId,
      relatedId: clientId,
      relatedName: clientName
    });

    console.log(`Recorded workout completion for ${clientName}`);
  } catch (error) {
    console.error('Error recording workout completion activity:', error);
  }
});

// Record activity when a progress update is submitted
export const recordProgressUpdateActivity = onDocumentCreated('progress/{progressId}', async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const progressData = snapshot.data();
    const { coachId, clientId, clientName, type } = progressData;
    
    if (!coachId || !clientId) {
      console.log('Missing required fields in progress data');
      return;
    }

    // Determine update type
    let updateType = 'progress update';
    if (type === 'photos') {
      updateType = 'progress photos';
    } else if (type === 'measurements') {
      updateType = 'measurements';
    } else if (type === 'weight') {
      updateType = 'weight log';
    }

    // Create activity record
    await db.collection('activity').add({
      type: 'progress_update',
      message: `${clientName || 'Client'} updated their ${updateType}`,
      timestamp: new Date(),
      coachId,
      relatedId: clientId,
      relatedName: clientName
    });

    console.log(`Recorded progress update for ${clientName}`);
  } catch (error) {
    console.error('Error recording progress update activity:', error);
  }
});

// Record activity when a new message is sent
export const recordMessageActivity = onDocumentCreated('messages/{messageId}', async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const messageData = snapshot.data();
    const { senderId, recipientId, senderName, recipientName, conversationId } = messageData;
    
    if (!senderId || !recipientId) {
      console.log('Missing required fields in message data');
      return;
    }

    // Get the coach ID (could be sender or recipient)
    let coachId, clientName;
    
    // Check if sender is a coach
    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderData = senderDoc.data();
    
    if (senderData && senderData.role === 'coach') {
      coachId = senderId;
      clientName = recipientName;
    } else {
      coachId = recipientId;
      clientName = senderName;
    }
    
    if (!coachId) {
      console.log('Could not determine coach ID from message data');
      return;
    }

    // Create activity record
    await db.collection('activity').add({
      type: 'message',
      message: `New message from ${clientName || 'client'}`,
      timestamp: new Date(),
      coachId,
      relatedId: conversationId,
      relatedName: clientName
    });

    console.log(`Recorded message activity for conversation ${conversationId}`);
  } catch (error) {
    console.error('Error recording message activity:', error);
  }
});

// Record activity when a payment is received
export const recordPaymentActivity = onDocumentCreated('transactions/{transactionId}', async (event) => {
  try {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const transactionData = snapshot.data();
    const { coachId, clientName, amount, status, type } = transactionData;
    
    if (!coachId || status !== 'paid') {
      return; // Only record paid transactions
    }

    // Format amount as currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);

    // Create activity record
    await db.collection('activity').add({
      type: 'payment',
      message: `${formattedAmount} ${type === 'subscription' ? 'subscription' : 'payment'} received from ${clientName || 'client'}`,
      timestamp: new Date(),
      coachId,
      relatedId: snapshot.id,
      relatedName: clientName
    });

    console.log(`Recorded payment activity for ${clientName}`);
  } catch (error) {
    console.error('Error recording payment activity:', error);
  }
});

// Record activity when a session is completed
export const recordSessionCompletedActivity = onDocumentUpdated('sessions/{sessionId}', async (event) => {
  try {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) {
      console.log('No data associated with the event');
      return;
    }

    // Only proceed if status changed to 'completed'
    if (beforeData.status === afterData.status || afterData.status !== 'completed') {
      return;
    }

    const { coachId, clientId, clientName, title } = afterData;
    
    if (!coachId || !clientId) {
      console.log('Missing required fields in session data');
      return;
    }

    // Create activity record
    await db.collection('activity').add({
      type: 'session_completed',
      message: `Session "${title || 'Training session'}" with ${clientName || 'client'} completed`,
      timestamp: new Date(),
      coachId,
      relatedId: clientId,
      relatedName: clientName
    });

    console.log(`Recorded session completion for ${clientName}`);
  } catch (error) {
    console.error('Error recording session completion activity:', error);
  }
}); 