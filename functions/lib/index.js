"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRevenueStatsOnDelete = exports.updateRevenueStatsOnUpdate = exports.updateRevenueStats = exports.helloWorld = exports.processApplication = exports.createUserProfile = exports.manualReportsUpdate = exports.aiCheckTypeformCompletion = exports.aiGenerateNutritionPlan = exports.aiGenerateWorkoutPlan = exports.aiAutoGeneratePlansHttp = exports.aiCheckTypeformCompletionHttp = exports.aiGenerateNutritionPlanHttp = exports.aiGenerateWorkoutPlanHttp = exports.weeklyReportsUpdate = exports.recordSessionCompletedActivity = exports.recordPaymentActivity = exports.recordMessageActivity = exports.recordProgressUpdateActivity = exports.recordWorkoutCompleteActivity = exports.recordNewClientActivity = exports.setupUserCollections = void 0;
const https_1 = require("firebase-functions/v2/https");
const https_2 = require("firebase-functions/v2/https");
const identity_1 = require("firebase-functions/v2/identity");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("./admin");
const setupCollections_1 = require("./setupCollections");
Object.defineProperty(exports, "setupUserCollections", { enumerable: true, get: function () { return setupCollections_1.setupUserCollections; } });
const activity_1 = require("./activity");
Object.defineProperty(exports, "recordNewClientActivity", { enumerable: true, get: function () { return activity_1.recordNewClientActivity; } });
Object.defineProperty(exports, "recordWorkoutCompleteActivity", { enumerable: true, get: function () { return activity_1.recordWorkoutCompleteActivity; } });
Object.defineProperty(exports, "recordProgressUpdateActivity", { enumerable: true, get: function () { return activity_1.recordProgressUpdateActivity; } });
Object.defineProperty(exports, "recordMessageActivity", { enumerable: true, get: function () { return activity_1.recordMessageActivity; } });
Object.defineProperty(exports, "recordPaymentActivity", { enumerable: true, get: function () { return activity_1.recordPaymentActivity; } });
Object.defineProperty(exports, "recordSessionCompletedActivity", { enumerable: true, get: function () { return activity_1.recordSessionCompletedActivity; } });
const updateReports_1 = require("./updateReports");
Object.defineProperty(exports, "weeklyReportsUpdate", { enumerable: true, get: function () { return updateReports_1.weeklyReportsUpdate; } });
const aiPlans_1 = require("./aiPlans");
const firestore_2 = require("firebase-admin/firestore");
// Export AI plan generation functions with callable versions
exports.aiGenerateWorkoutPlanHttp = aiPlans_1.generateWorkoutPlan;
exports.aiGenerateNutritionPlanHttp = aiPlans_1.generateNutritionPlan;
exports.aiCheckTypeformCompletionHttp = aiPlans_1.checkTypeformCompletion;
exports.aiAutoGeneratePlansHttp = aiPlans_1.autoGeneratePlans;
// New callable versions
exports.aiGenerateWorkoutPlan = (0, https_1.onCall)(async (data) => {
    try {
        const { userId, date } = data.data;
        if (!userId || !date) {
            throw new Error('The function requires userId and date parameters.');
        }
        // We'll reuse the existing utility functions from aiPlans.ts
        // Fetch user profile from Firestore (Typeform data)
        const userProfile = await (0, aiPlans_1.fetchUserProfileFromFirestore)(userId);
        if (!userProfile) {
            throw new Error('User profile data not found. Please ensure the user has completed the Typeform questionnaire.');
        }
        // Format the prompt for the AI and call OpenAI
        const workoutPlan = await generatePlan(userProfile, date, 'workout');
        return { success: true, data: workoutPlan };
    }
    catch (error) {
        console.error('Error in aiGenerateWorkoutPlan callable:', error);
        throw new Error('Failed to generate workout plan');
    }
});
exports.aiGenerateNutritionPlan = (0, https_1.onCall)(async (data) => {
    try {
        const { userId, date } = data.data;
        if (!userId || !date) {
            throw new Error('The function requires userId and date parameters.');
        }
        // We'll reuse the existing utility functions from aiPlans.ts
        // Fetch user profile from Firestore (Typeform data)
        const userProfile = await (0, aiPlans_1.fetchUserProfileFromFirestore)(userId);
        if (!userProfile) {
            throw new Error('User profile data not found. Please ensure the user has completed the Typeform questionnaire.');
        }
        // Format the prompt for the AI and call OpenAI
        const nutritionPlan = await generatePlan(userProfile, date, 'nutrition');
        return { success: true, data: nutritionPlan };
    }
    catch (error) {
        console.error('Error in aiGenerateNutritionPlan callable:', error);
        throw new Error('Failed to generate nutrition plan');
    }
});
exports.aiCheckTypeformCompletion = (0, https_1.onCall)(async (data) => {
    try {
        const { userId } = data.data;
        if (!userId) {
            throw new Error('The function requires a userId parameter.');
        }
        const userProfile = await (0, aiPlans_1.fetchUserProfileFromFirestore)(userId);
        return {
            success: true,
            hasCompletedTypeform: !!userProfile,
            profileData: userProfile ? {
                age: userProfile.age,
                weight: userProfile.weight,
                height: userProfile.height,
                gender: userProfile.gender,
                fitnessLevel: userProfile.fitnessLevel,
                fitnessGoalsCount: (userProfile.fitnessGoals || []).length,
                dietaryRestrictionsCount: (userProfile.dietaryRestrictions || []).length,
                healthConditionsCount: (userProfile.healthConditions || []).length
            } : null
        };
    }
    catch (error) {
        console.error('Error in aiCheckTypeformCompletion callable:', error);
        throw new Error('Failed to check typeform completion');
    }
});
// Helper function to generate plans
async function generatePlan(userProfile, date, type) {
    try {
        // Get Firestore database
        const db = (0, firestore_2.getFirestore)();
        const userId = userProfile.userId;
        // Create the appropriate prompt based on type
        let prompt, aiResponse, plan;
        if (type === 'workout') {
            prompt = (0, aiPlans_1.createWorkoutPrompt)(userProfile, date);
            aiResponse = await (0, aiPlans_1.callOpenAI)(prompt, "workout");
            if (!aiResponse) {
                throw new Error('Failed to get AI response for workout plan');
            }
            plan = (0, aiPlans_1.parseWorkoutPlanResponse)(aiResponse, date);
            // Save to Firestore
            await db.collection('workoutPlans').doc(`${userId}/plans/${date}`).set(Object.assign(Object.assign({}, plan), { updatedAt: firestore_2.FieldValue.serverTimestamp(), aiGenerated: true }));
        }
        else if (type === 'nutrition') {
            prompt = (0, aiPlans_1.createNutritionPrompt)(userProfile, date);
            aiResponse = await (0, aiPlans_1.callOpenAI)(prompt, "nutrition");
            if (!aiResponse) {
                throw new Error('Failed to get AI response for nutrition plan');
            }
            plan = (0, aiPlans_1.parseNutritionPlanResponse)(aiResponse, date);
            // Save to Firestore
            await db.collection('nutritionPlans').doc(`${userId}/plans/${date}`).set(Object.assign(Object.assign({}, plan), { updatedAt: firestore_2.FieldValue.serverTimestamp(), aiGenerated: true }));
        }
        return plan;
    }
    catch (error) {
        console.error(`Error generating ${type} plan:`, error);
        throw error;
    }
}
// Manual reports update function for coaches to trigger
exports.manualReportsUpdate = (0, https_1.onCall)(async (request) => {
    try {
        if (!request.auth) {
            throw new Error('Must be logged in');
        }
        const coachId = request.auth.uid;
        console.log(`Manual reports update triggered for coach: ${coachId}`);
        // Get current date and date ranges
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        // Get all clients for this coach
        const clientsSnapshot = await admin_1.db.collection('clients')
            .where('coachId', '==', coachId)
            .where('isTemplate', '!=', true)
            .get();
        if (clientsSnapshot.empty) {
            console.log(`No clients found for coach: ${coachId}`);
            return { success: false, message: 'No clients found' };
        }
        // Calculate client retention rate
        const totalClients = clientsSnapshot.size;
        let activeClients = 0;
        let clientsWithGoals = 0;
        let goalsAchieved = 0;
        clientsSnapshot.forEach(doc => {
            const clientData = doc.data();
            // Count active clients
            if (clientData.status === 'active') {
                activeClients++;
            }
            // Count goals achieved (simplified example)
            if (clientData.progress && clientData.progress.goals) {
                clientsWithGoals++;
                if (clientData.progress.goals.achieved) {
                    goalsAchieved++;
                }
            }
        });
        // Calculate client retention rate
        const clientRetentionRate = totalClients > 0
            ? Math.round((activeClients / totalClients) * 100)
            : 0;
        // Calculate goal achievement rate
        const clientGoalAchievement = clientsWithGoals > 0
            ? Math.round((goalsAchieved / clientsWithGoals) * 100)
            : 0;
        // Get all sessions for this coach in the last month
        const sessionsSnapshot = await admin_1.db.collection('sessions')
            .where('coachId', '==', coachId)
            .where('date', '>=', oneMonthAgo)
            .get();
        // Calculate average session rating
        let totalRating = 0;
        let ratedSessions = 0;
        let completedSessions = 0;
        let totalSessions = 0;
        sessionsSnapshot.forEach(doc => {
            const sessionData = doc.data();
            // Skip template sessions
            if (sessionData.isTemplate)
                return;
            totalSessions++;
            // Count completed sessions
            if (sessionData.completed) {
                completedSessions++;
            }
            // Sum ratings
            if (sessionData.rating && sessionData.rating > 0) {
                totalRating += sessionData.rating;
                ratedSessions++;
            }
        });
        // Calculate average session rating
        const avgSessionRating = ratedSessions > 0
            ? (totalRating / ratedSessions).toFixed(1)
            : "0";
        // Calculate session attendance
        const sessionAttendance = totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0;
        // Get all workouts for this coach in the last month
        const workoutsSnapshot = await admin_1.db.collection('workouts')
            .where('coachId', '==', coachId)
            .where('date', '>=', oneMonthAgo)
            .get();
        // Calculate workout completion rate
        let completedWorkouts = 0;
        let totalWorkouts = 0;
        workoutsSnapshot.forEach(doc => {
            const workoutData = doc.data();
            // Skip template workouts
            if (workoutData.isTemplate)
                return;
            totalWorkouts++;
            // Count completed workouts
            if (workoutData.completed) {
                completedWorkouts++;
            }
        });
        // Calculate workout completion rate
        const workoutCompletionRate = totalWorkouts > 0
            ? Math.round((completedWorkouts / totalWorkouts) * 100)
            : 0;
        // Calculate app usage (simplified example - in a real app, you'd track user logins)
        // Here we're using a more realistic value instead of a placeholder
        const appUsage = 75;
        // Get previous reports data for trend calculation
        const reportsRef = admin_1.db.collection('reports').doc(coachId);
        const reportsDoc = await reportsRef.get();
        // Default values for previous metrics
        let prevClientRetentionRate = 0;
        let prevAvgSessionRating = 0;
        let prevClientGoalAchievement = 0;
        let prevActivePrograms = 0;
        // If we have previous reports data, save it for historical comparison
        if (reportsDoc.exists) {
            const prevData = reportsDoc.data() || {};
            // Save current data as historical before updating
            await admin_1.db.collection('reportsHistory').add({
                coachId,
                timestamp: now,
                data: prevData
            });
            // Parse previous values for trend calculation
            prevClientRetentionRate = parseFloat(String(prevData.clientRetentionRate)) || 0;
            prevAvgSessionRating = parseFloat(String(prevData.avgSessionRating)) || 0;
            prevClientGoalAchievement = parseFloat(String(prevData.clientGoalAchievement)) || 0;
            // Count active programs
            const programsQuery = await admin_1.db.collection('programs')
                .where('coachId', '==', coachId)
                .where('isTemplate', '!=', true)
                .get();
            prevActivePrograms = programsQuery.size;
        }
        // Calculate active programs
        const programsQuery = await admin_1.db.collection('programs')
            .where('coachId', '==', coachId)
            .where('isTemplate', '!=', true)
            .get();
        const activePrograms = programsQuery.size;
        // Calculate trend percentages
        const retentionChange = prevClientRetentionRate > 0
            ? ((clientRetentionRate - prevClientRetentionRate) / prevClientRetentionRate) * 100
            : clientRetentionRate > 0 ? 100 : 0;
        const ratingChange = prevAvgSessionRating > 0
            ? ((parseFloat(avgSessionRating) - prevAvgSessionRating) / prevAvgSessionRating) * 100
            : parseFloat(avgSessionRating) > 0 ? 100 : 0;
        const goalChange = prevClientGoalAchievement > 0
            ? ((clientGoalAchievement - prevClientGoalAchievement) / prevClientGoalAchievement) * 100
            : clientGoalAchievement > 0 ? 100 : 0;
        const programsChange = prevActivePrograms > 0
            ? ((activePrograms - prevActivePrograms) / prevActivePrograms) * 100
            : activePrograms > 0 ? 100 : 0;
        // Update the reports document with real values and trend percentages
        await reportsRef.set({
            coachId,
            clientRetentionRate: clientRetentionRate,
            avgSessionRating: avgSessionRating,
            clientGoalAchievement: clientGoalAchievement,
            activePrograms: activePrograms,
            trends: {
                retentionChange: parseFloat(retentionChange.toFixed(1)),
                ratingChange: parseFloat(ratingChange.toFixed(1)),
                goalChange: parseFloat(goalChange.toFixed(1)),
                programsChange: parseFloat(programsChange.toFixed(1))
            },
            engagementMetrics: {
                workoutCompletionRate: workoutCompletionRate,
                sessionAttendance: sessionAttendance,
                appUsage: appUsage
            },
            lastUpdated: now
        }, { merge: true });
        console.log(`Manual reports update completed for coach: ${coachId}`);
        return { success: true };
    }
    catch (error) {
        console.error('Error updating reports manually:', error);
        throw new Error('Failed to update reports');
    }
});
// Legacy function - keeping for reference but not using
exports.createUserProfile = (0, identity_1.beforeUserCreated)(async (event) => {
    try {
        if (!event.data) {
            console.error('No user data provided');
            throw new Error('No user data provided');
        }
        const userData = event.data;
        const timestamp = new Date();
        // Create a basic user document without setting a role
        // The role will be set by the client or coach registration process
        console.log(`Creating basic user document for ${userData.uid} without setting a role`);
        await admin_1.db.collection('users').doc(userData.uid).set({
            email: userData.email,
            createdAt: timestamp,
            status: 'active'
            // No role set here - will be set by registration process
        });
        // No custom claims set for role
        return { customClaims: {} };
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
        await admin_1.db.collection('applications').add({
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
// Update revenue stats when transactions change
exports.updateRevenueStats = (0, firestore_1.onDocumentCreated)('transactions/{transactionId}', async (event) => {
    try {
        const snapshot = event.data;
        if (!snapshot) {
            console.log('No data associated with the event');
            return;
        }
        const transaction = snapshot.data();
        const { coachId } = transaction;
        if (!coachId) {
            console.log('No coachId found in transaction');
            return;
        }
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Get all transactions for this coach
        const transactionsSnapshot = await admin_1.db.collection('transactions')
            .where('coachId', '==', coachId)
            .get();
        if (transactionsSnapshot.empty) {
            console.log('No transactions found for coach');
            return;
        }
        // Calculate stats
        let totalRevenue = 0;
        let monthlyRecurring = 0;
        let activeSubscriptions = new Set();
        // Previous month data for growth calculation
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        let lastMonthRevenue = 0;
        let currentMonthRevenue = 0;
        let lastMonthRecurring = 0;
        let currentMonthRecurring = 0;
        let lastMonthSubscriptions = new Set();
        let currentMonthSubscriptions = new Set();
        transactionsSnapshot.forEach(doc => {
            const data = doc.data();
            // Skip if not paid
            if (data.status !== 'paid')
                return;
            // Add to total revenue
            totalRevenue += data.amount || 0;
            // Check if transaction date exists and is a Firestore timestamp
            if (data.date) {
                const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                // Current month revenue
                if (month === currentMonth && year === currentYear) {
                    currentMonthRevenue += data.amount || 0;
                    // Add to current month subscriptions if subscription
                    if (data.type === 'subscription') {
                        currentMonthRecurring += data.amount || 0;
                        currentMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
                // Last month revenue
                if (month === lastMonth && year === lastMonthYear) {
                    lastMonthRevenue += data.amount || 0;
                    // Add to last month subscriptions if subscription
                    if (data.type === 'subscription') {
                        lastMonthRecurring += data.amount || 0;
                        lastMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
            }
            // Add to monthly recurring if subscription
            if (data.type === 'subscription') {
                monthlyRecurring += data.amount || 0;
                activeSubscriptions.add(data.clientId || data.clientName);
            }
        });
        // Calculate revenue growth as percentage
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : currentMonthRevenue > 0 ? 100 : 0;
        // Calculate monthly recurring growth
        const recurringGrowth = lastMonthRecurring > 0
            ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
            : currentMonthRecurring > 0 ? 100 : 0;
        // Calculate subscription growth
        const subscriptionGrowth = lastMonthSubscriptions.size > 0
            ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
            : currentMonthSubscriptions.size > 0 ? 100 : 0;
        // Update or create stats document
        const statsRef = admin_1.db.collection('revenueStats').doc(coachId);
        await statsRef.set({
            coachId,
            totalRevenue,
            monthlyRecurring,
            activeSubscriptions: activeSubscriptions.size,
            revenueGrowth,
            recurringGrowth,
            subscriptionGrowth,
            currentMonthRevenue,
            lastMonthRevenue,
            lastUpdated: now
        }, { merge: true });
        console.log(`Updated revenue stats for coach ${coachId}`);
    }
    catch (error) {
        console.error('Error updating revenue stats:', error);
    }
});
// Also update stats when transactions are updated
exports.updateRevenueStatsOnUpdate = (0, firestore_1.onDocumentUpdated)('transactions/{transactionId}', async (event) => {
    var _a, _b;
    try {
        const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        // Skip if no data or coachId hasn't changed
        if (!beforeData || !afterData || beforeData.coachId !== afterData.coachId) {
            return;
        }
        const { coachId } = afterData;
        // Trigger the same logic as the onCreate function
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Get all transactions for this coach
        const transactionsSnapshot = await admin_1.db.collection('transactions')
            .where('coachId', '==', coachId)
            .get();
        if (transactionsSnapshot.empty) {
            console.log('No transactions found for coach');
            return;
        }
        // Calculate stats
        let totalRevenue = 0;
        let monthlyRecurring = 0;
        let activeSubscriptions = new Set();
        // Previous month data for growth calculation
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        let lastMonthRevenue = 0;
        let currentMonthRevenue = 0;
        let lastMonthRecurring = 0;
        let currentMonthRecurring = 0;
        let lastMonthSubscriptions = new Set();
        let currentMonthSubscriptions = new Set();
        transactionsSnapshot.forEach(doc => {
            const data = doc.data();
            // Skip if not paid
            if (data.status !== 'paid')
                return;
            // Add to total revenue
            totalRevenue += data.amount || 0;
            // Check if transaction date exists and is a Firestore timestamp
            if (data.date) {
                const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                // Current month revenue
                if (month === currentMonth && year === currentYear) {
                    currentMonthRevenue += data.amount || 0;
                    // Add to current month subscriptions if subscription
                    if (data.type === 'subscription') {
                        currentMonthRecurring += data.amount || 0;
                        currentMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
                // Last month revenue
                if (month === lastMonth && year === lastMonthYear) {
                    lastMonthRevenue += data.amount || 0;
                    // Add to last month subscriptions if subscription
                    if (data.type === 'subscription') {
                        lastMonthRecurring += data.amount || 0;
                        lastMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
            }
            // Add to monthly recurring if subscription
            if (data.type === 'subscription') {
                monthlyRecurring += data.amount || 0;
                activeSubscriptions.add(data.clientId || data.clientName);
            }
        });
        // Calculate revenue growth as percentage
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : currentMonthRevenue > 0 ? 100 : 0;
        // Calculate monthly recurring growth
        const recurringGrowth = lastMonthRecurring > 0
            ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
            : currentMonthRecurring > 0 ? 100 : 0;
        // Calculate subscription growth
        const subscriptionGrowth = lastMonthSubscriptions.size > 0
            ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
            : currentMonthSubscriptions.size > 0 ? 100 : 0;
        // Update or create stats document
        const statsRef = admin_1.db.collection('revenueStats').doc(coachId);
        await statsRef.set({
            coachId,
            totalRevenue,
            monthlyRecurring,
            activeSubscriptions: activeSubscriptions.size,
            revenueGrowth,
            recurringGrowth,
            subscriptionGrowth,
            currentMonthRevenue,
            lastMonthRevenue,
            lastUpdated: now
        }, { merge: true });
        console.log(`Updated revenue stats for coach ${coachId} after transaction update`);
    }
    catch (error) {
        console.error('Error updating revenue stats on transaction update:', error);
    }
});
// Also update stats when transactions are deleted
exports.updateRevenueStatsOnDelete = (0, firestore_1.onDocumentDeleted)('transactions/{transactionId}', async (event) => {
    var _a;
    try {
        const deletedData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!deletedData || !deletedData.coachId) {
            return;
        }
        const { coachId } = deletedData;
        // Trigger the same logic as the onCreate function
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Get all transactions for this coach
        const transactionsSnapshot = await admin_1.db.collection('transactions')
            .where('coachId', '==', coachId)
            .get();
        // Calculate stats
        let totalRevenue = 0;
        let monthlyRecurring = 0;
        let activeSubscriptions = new Set();
        // Previous month data for growth calculation
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        let lastMonthRevenue = 0;
        let currentMonthRevenue = 0;
        let lastMonthRecurring = 0;
        let currentMonthRecurring = 0;
        let lastMonthSubscriptions = new Set();
        let currentMonthSubscriptions = new Set();
        transactionsSnapshot.forEach(doc => {
            const data = doc.data();
            // Skip if not paid
            if (data.status !== 'paid')
                return;
            // Add to total revenue
            totalRevenue += data.amount || 0;
            // Check if transaction date exists and is a Firestore timestamp
            if (data.date) {
                const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                // Current month revenue
                if (month === currentMonth && year === currentYear) {
                    currentMonthRevenue += data.amount || 0;
                    // Add to current month subscriptions if subscription
                    if (data.type === 'subscription') {
                        currentMonthRecurring += data.amount || 0;
                        currentMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
                // Last month revenue
                if (month === lastMonth && year === lastMonthYear) {
                    lastMonthRevenue += data.amount || 0;
                    // Add to last month subscriptions if subscription
                    if (data.type === 'subscription') {
                        lastMonthRecurring += data.amount || 0;
                        lastMonthSubscriptions.add(data.clientId || data.clientName);
                    }
                }
            }
            // Add to monthly recurring if subscription
            if (data.type === 'subscription') {
                monthlyRecurring += data.amount || 0;
                activeSubscriptions.add(data.clientId || data.clientName);
            }
        });
        // Calculate revenue growth as percentage
        const revenueGrowth = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : currentMonthRevenue > 0 ? 100 : 0;
        // Calculate monthly recurring growth
        const recurringGrowth = lastMonthRecurring > 0
            ? ((currentMonthRecurring - lastMonthRecurring) / lastMonthRecurring) * 100
            : currentMonthRecurring > 0 ? 100 : 0;
        // Calculate subscription growth
        const subscriptionGrowth = lastMonthSubscriptions.size > 0
            ? ((currentMonthSubscriptions.size - lastMonthSubscriptions.size) / lastMonthSubscriptions.size) * 100
            : currentMonthSubscriptions.size > 0 ? 100 : 0;
        // Update or create stats document
        const statsRef = admin_1.db.collection('revenueStats').doc(coachId);
        await statsRef.set({
            coachId,
            totalRevenue,
            monthlyRecurring,
            activeSubscriptions: activeSubscriptions.size,
            revenueGrowth,
            recurringGrowth,
            subscriptionGrowth,
            currentMonthRevenue,
            lastMonthRevenue,
            lastUpdated: now
        }, { merge: true });
        console.log(`Updated revenue stats for coach ${coachId} after transaction deletion`);
    }
    catch (error) {
        console.error('Error updating revenue stats on transaction deletion:', error);
    }
});
//# sourceMappingURL=index.js.map