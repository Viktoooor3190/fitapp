"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUserCollections = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("./admin");
// Create additional collections when a new coach document is created
// This triggers when a new document is created in the coaches collection
exports.setupUserCollections = (0, firestore_1.onDocumentCreated)('coaches/{userId}', async (event) => {
    try {
        const uid = event.params.userId;
        const timestamp = new Date();
        // Create a batch to perform all writes atomically
        const batch = admin_1.db.batch();
        // Create a sample program document (empty/template)
        const programsRef = admin_1.db.collection('programs').doc(`template_${uid}`);
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
        const reportsRef = admin_1.db.collection('reports').doc(uid);
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
        const sessionsRef = admin_1.db.collection('sessions').doc(`template_${uid}`);
        batch.set(sessionsRef, {
            coachId: uid,
            clientId: "",
            date: "",
            time: "",
            type: "Training",
            status: "Template",
            notes: "",
            completed: false,
            isTemplate: true
        });
        // Create a sample messages document (empty/template)
        const messagesRef = admin_1.db.collection('messages').doc(`template_${uid}`);
        batch.set(messagesRef, {
            coachId: uid,
            clientId: "",
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
        const revenueRef = admin_1.db.collection('revenue').doc(`template_${uid}`);
        batch.set(revenueRef, {
            coachId: uid,
            clientId: "",
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
//# sourceMappingURL=setupCollections.js.map