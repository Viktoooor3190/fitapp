"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = exports.processApplication = exports.createUserProfile = exports.setupUserCollections = void 0;
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const identity_1 = require("firebase-functions/v2/identity");
const firestore_1 = require("firebase-functions/v2/firestore");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_2.getFirestore)();
// Create additional collections when a new coach document is created
// This triggers when a new document is created in the coaches collection
exports.setupUserCollections = (0, firestore_1.onDocumentCreated)('coaches/{userId}', async (event) => {
    try {
        const uid = event.params.userId;
        // const coachData = event.data?.data();
        // const email = coachData?.email || '';
        const timestamp = new Date();
        // Create a batch to perform all writes atomically
        const batch = db.batch();
        // Create a sample client document (empty/template)
        const clientsRef = db.collection('clients').doc(`template_${uid}`);
        batch.set(clientsRef, {
            coachId: uid,
            name: "Template Client",
            email: "",
            phone: "",
            status: "template",
            programId: "",
            progress: {},
            upcomingSessions: [],
            lastActive: timestamp,
            isTemplate: true // Flag to identify this as a template
        });
        // Create a sample program document (empty/template)
        const programsRef = db.collection('programs').doc(`template_${uid}`);
        batch.set(programsRef, {
            coachId: uid,
            name: "Template Program",
            description: "Program template",
            duration: "",
            difficulty: "",
            clientsEnrolled: [],
            workouts: [],
            nutritionPlan: [],
            progressTracking: { avgCompletionRate: "0%" },
            isTemplate: true // Flag to identify this as a template
        });
        // Initialize reports document for the coach
        const reportsRef = db.collection('reports').doc(uid);
        batch.set(reportsRef, {
            coachId: uid,
            clientRetentionRate: "0%",
            avgSessionRating: "0/5",
            clientGoalAchievement: "0%",
            engagementMetrics: {
                workoutCompletionRate: "0%",
                sessionAttendance: "0%",
                appUsage: "0%"
            },
            createdAt: timestamp,
            lastUpdated: timestamp
        });
        // Create a sample session document (empty/template)
        const sessionsRef = db.collection('sessions').doc(`template_${uid}`);
        batch.set(sessionsRef, {
            coachId: uid,
            clientId: `template_${uid}`,
            date: "",
            time: "",
            type: "Training",
            status: "Template",
            notes: "",
            completed: false,
            isTemplate: true
        });
        // Create a sample messages document (empty/template)
        const messagesRef = db.collection('messages').doc(`template_${uid}`);
        batch.set(messagesRef, {
            coachId: uid,
            clientId: `template_${uid}`,
            messages: [
                {
                    sender: "system",
                    text: "Welcome to your messaging system!",
                    timestamp: timestamp
                }
            ],
            createdAt: timestamp,
            lastUpdated: timestamp,
            isTemplate: true
        });
        // Create a sample revenue document (empty/template)
        const revenueRef = db.collection('revenue').doc(`template_${uid}`);
        batch.set(revenueRef, {
            coachId: uid,
            clientId: `template_${uid}`,
            amount: 0,
            date: timestamp,
            status: "Template",
            type: "Subscription",
            isTemplate: true
        });
        // Commit all the writes
        await batch.commit();
        return;
    }
    catch (error) {
        console.error('Error setting up user collections:', error);
        throw new Error('Failed to set up user collections');
    }
});
// Legacy function - keeping for reference but not using
exports.createUserProfile = (0, identity_1.beforeUserCreated)(async (event) => {
    try {
        const { email, uid } = event.data;
        const timestamp = new Date();
        // Create user document only
        await db.collection('users').doc(uid).set({
            email,
            createdAt: timestamp,
            role: 'coach',
            status: 'active'
        });
        return { customClaims: { role: 'coach' } };
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        throw new Error('Failed to create user profile');
    }
});
// Process application for new coaches
exports.processApplication = (0, https_1.onCall)(async (request) => {
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
    }
    catch (error) {
        console.error('Error processing application:', error);
        throw new Error('Failed to process application');
    }
});
// Example function
exports.helloWorld = (0, https_2.onRequest)((request, response) => {
    response.send("Hello from Firebase!");
});
//# sourceMappingURL=index.js.map