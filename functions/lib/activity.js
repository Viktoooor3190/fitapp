"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSessionCompletedActivity = exports.recordPaymentActivity = exports.recordMessageActivity = exports.recordProgressUpdateActivity = exports.recordWorkoutCompleteActivity = exports.recordNewClientActivity = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("./admin");
// Record activity when a new client is created
exports.recordNewClientActivity = (0, firestore_1.onDocumentCreated)('clients/{clientId}', async (event) => {
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
        await admin_1.db.collection('activity').add({
            type: 'new_client',
            message: `${clientName} joined as a new client`,
            timestamp: new Date(),
            coachId,
            relatedId: snapshot.id,
            relatedName: clientName
        });
        console.log(`Recorded new client activity for ${clientName}`);
    }
    catch (error) {
        console.error('Error recording new client activity:', error);
    }
});
// Record activity when a workout is completed
exports.recordWorkoutCompleteActivity = (0, firestore_1.onDocumentUpdated)('workouts/{workoutId}', async (event) => {
    var _a, _b;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
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
        await admin_1.db.collection('activity').add({
            type: 'workout_complete',
            message: `${clientName || 'Client'} completed "${title || programName || 'workout'}"`,
            timestamp: new Date(),
            coachId,
            relatedId: clientId,
            relatedName: clientName
        });
        console.log(`Recorded workout completion for ${clientName}`);
    }
    catch (error) {
        console.error('Error recording workout completion activity:', error);
    }
});
// Record activity when a progress update is submitted
exports.recordProgressUpdateActivity = (0, firestore_1.onDocumentCreated)('progress/{progressId}', async (event) => {
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
        }
        else if (type === 'measurements') {
            updateType = 'measurements';
        }
        else if (type === 'weight') {
            updateType = 'weight log';
        }
        // Create activity record
        await admin_1.db.collection('activity').add({
            type: 'progress_update',
            message: `${clientName || 'Client'} updated their ${updateType}`,
            timestamp: new Date(),
            coachId,
            relatedId: clientId,
            relatedName: clientName
        });
        console.log(`Recorded progress update for ${clientName}`);
    }
    catch (error) {
        console.error('Error recording progress update activity:', error);
    }
});
// Record activity when a new message is sent
exports.recordMessageActivity = (0, firestore_1.onDocumentCreated)('messages/{messageId}', async (event) => {
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
        const senderDoc = await admin_1.db.collection('users').doc(senderId).get();
        const senderData = senderDoc.data();
        if (senderData && senderData.role === 'coach') {
            coachId = senderId;
            clientName = recipientName;
        }
        else {
            coachId = recipientId;
            clientName = senderName;
        }
        if (!coachId) {
            console.log('Could not determine coach ID from message data');
            return;
        }
        // Create activity record
        await admin_1.db.collection('activity').add({
            type: 'message',
            message: `New message from ${clientName || 'client'}`,
            timestamp: new Date(),
            coachId,
            relatedId: conversationId,
            relatedName: clientName
        });
        console.log(`Recorded message activity for conversation ${conversationId}`);
    }
    catch (error) {
        console.error('Error recording message activity:', error);
    }
});
// Record activity when a payment is received
exports.recordPaymentActivity = (0, firestore_1.onDocumentCreated)('transactions/{transactionId}', async (event) => {
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
        await admin_1.db.collection('activity').add({
            type: 'payment',
            message: `${formattedAmount} ${type === 'subscription' ? 'subscription' : 'payment'} received from ${clientName || 'client'}`,
            timestamp: new Date(),
            coachId,
            relatedId: snapshot.id,
            relatedName: clientName
        });
        console.log(`Recorded payment activity for ${clientName}`);
    }
    catch (error) {
        console.error('Error recording payment activity:', error);
    }
});
// Record activity when a session is completed
exports.recordSessionCompletedActivity = (0, firestore_1.onDocumentUpdated)('sessions/{sessionId}', async (event) => {
    var _a, _b;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
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
        await admin_1.db.collection('activity').add({
            type: 'session_completed',
            message: `Session "${title || 'Training session'}" with ${clientName || 'client'} completed`,
            timestamp: new Date(),
            coachId,
            relatedId: clientId,
            relatedName: clientName
        });
        console.log(`Recorded session completion for ${clientName}`);
    }
    catch (error) {
        console.error('Error recording session completion activity:', error);
    }
});
//# sourceMappingURL=activity.js.map