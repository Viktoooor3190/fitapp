"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = exports.processApplication = exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const identity_1 = require("firebase-functions/v2/identity");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Create user profile when a new user signs up
exports.createUserProfile = (0, identity_1.beforeUserCreated)(async (event) => {
    try {
        const { email, uid } = event.data;
        await db.collection('users').doc(uid).set({
            email,
            createdAt: new Date(),
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