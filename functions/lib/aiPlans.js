"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoGeneratePlans = exports.checkTypeformCompletion = exports.generateNutritionPlan = exports.generateWorkoutPlan = void 0;
const functions = require("firebase-functions");
const openai_1 = require("openai");
const cors = require("cors");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
// Initialize CORS middleware
const corsHandler = cors({ origin: true });
// Initialize OpenAI client with a default key for deployment
// In production, replace with your actual OpenAI API key
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-deployment',
});
/**
 * Generate an AI workout plan based on user profile and preferences
 */
exports.generateWorkoutPlan = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Ensure the request method is POST
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }
            const { userId, date } = req.body;
            if (!userId || !date) {
                res.status(400).json({
                    success: false,
                    error: 'The function requires userId and date parameters.'
                });
                return;
            }
            // Fetch user profile from Firestore (Typeform data)
            const userProfile = await fetchUserProfileFromFirestore(userId);
            if (!userProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User profile data not found. Please ensure the user has completed the Typeform questionnaire.'
                });
                return;
            }
            // Format the prompt for the AI
            const prompt = createWorkoutPrompt(userProfile, date);
            // Call OpenAI API
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional fitness trainer specialized in creating personalized workout plans. Provide detailed, structured workout plans based on the user's profile and preferences. Format your response as JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" }
            });
            // Parse the AI response
            const aiResponse = response.choices[0].message.content;
            if (!aiResponse) {
                res.status(500).json({
                    success: false,
                    error: 'Empty response from AI'
                });
                return;
            }
            const workoutPlan = parseWorkoutPlanResponse(aiResponse, date);
            // Save to Firestore
            const db = (0, firestore_1.getFirestore)();
            await db.collection('workoutPlans').doc(`${userId}/plans/${date}`).set(Object.assign(Object.assign({}, workoutPlan), { updatedAt: firestore_1.FieldValue.serverTimestamp(), aiGenerated: true }));
            res.status(200).json({ success: true, data: workoutPlan });
        }
        catch (error) {
            console.error('Error generating workout plan:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate workout plan'
            });
        }
    });
});
/**
 * Generate an AI nutrition plan based on user profile and preferences
 */
exports.generateNutritionPlan = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Ensure the request method is POST
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }
            const { userId, date } = req.body;
            if (!userId || !date) {
                res.status(400).json({
                    success: false,
                    error: 'The function requires userId and date parameters.'
                });
                return;
            }
            // Fetch user profile from Firestore (Typeform data)
            const userProfile = await fetchUserProfileFromFirestore(userId);
            if (!userProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User profile data not found. Please ensure the user has completed the Typeform questionnaire.'
                });
                return;
            }
            // Format the prompt for the AI
            const prompt = createNutritionPrompt(userProfile, date);
            // Call OpenAI API
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional nutritionist specialized in creating personalized meal plans. Provide detailed, structured nutrition plans based on the user's profile and preferences. Format your response as JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" }
            });
            // Parse the AI response
            const aiResponse = response.choices[0].message.content;
            if (!aiResponse) {
                res.status(500).json({
                    success: false,
                    error: 'Empty response from AI'
                });
                return;
            }
            const nutritionPlan = parseNutritionPlanResponse(aiResponse, date);
            // Save to Firestore
            const db = (0, firestore_1.getFirestore)();
            await db.collection('nutritionPlans').doc(`${userId}/plans/${date}`).set(Object.assign(Object.assign({}, nutritionPlan), { updatedAt: firestore_1.FieldValue.serverTimestamp(), aiGenerated: true }));
            res.status(200).json({ success: true, data: nutritionPlan });
        }
        catch (error) {
            console.error('Error generating nutrition plan:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate nutrition plan'
            });
        }
    });
});
/**
 * Create a prompt for the workout plan generation
 */
function createWorkoutPrompt(userProfile, date) {
    var _a, _b, _c, _d;
    return `
Create a detailed workout plan for a person with the following profile:
- Age: ${userProfile.age || 'Not specified'}
- Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
- Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}
- Fitness Goals: ${((_a = userProfile.fitnessGoals) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Not specified'}
- Health Conditions: ${((_b = userProfile.healthConditions) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'None'}
- Preferred Workout Duration: ${userProfile.preferredWorkoutDuration ? `${userProfile.preferredWorkoutDuration} minutes` : 'Not specified'}
- Workout Frequency: ${userProfile.workoutFrequency ? `${userProfile.workoutFrequency} days per week` : 'Not specified'}
- Preferred Exercises: ${((_c = userProfile.preferredExercises) === null || _c === void 0 ? void 0 : _c.join(', ')) || 'Not specified'}
- Disliked Exercises: ${((_d = userProfile.dislikedExercises) === null || _d === void 0 ? void 0 : _d.join(', ')) || 'None'}

The workout plan is for date: ${date}

Please provide a structured workout plan with the following JSON format:
{
  "name": "Workout Plan Name",
  "description": "Brief description of the workout plan",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "8-12",
      "weight": "moderate",
      "notes": "Additional instructions or tips",
      "completed": false
    }
  ],
  "notes": "Any additional notes or recommendations"
}

Make sure to include a variety of exercises targeting different muscle groups as appropriate for the user's goals and fitness level.
`;
}
/**
 * Create a prompt for the nutrition plan generation
 */
function createNutritionPrompt(userProfile, date) {
    var _a, _b, _c, _d, _e;
    return `
Create a detailed nutrition plan for a person with the following profile:
- Age: ${userProfile.age || 'Not specified'}
- Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
- Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Not specified'}
- Fitness Goals: ${((_a = userProfile.fitnessGoals) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Not specified'}
- Dietary Restrictions: ${((_b = userProfile.dietaryRestrictions) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'None'}
- Health Conditions: ${((_c = userProfile.healthConditions) === null || _c === void 0 ? void 0 : _c.join(', ')) || 'None'}
- Preferred Foods: ${((_d = userProfile.preferredFoods) === null || _d === void 0 ? void 0 : _d.join(', ')) || 'Not specified'}
- Disliked Foods: ${((_e = userProfile.dislikedFoods) === null || _e === void 0 ? void 0 : _e.join(', ')) || 'None'}

The nutrition plan is for date: ${date}

Please provide a structured nutrition plan with the following JSON format:
{
  "meals": [
    {
      "name": "Meal Name (e.g., Breakfast)",
      "description": "Detailed description of the meal with ingredients and preparation instructions",
      "calories": 500,
      "protein": 30,
      "carbs": 50,
      "fat": 15,
      "completed": false
    }
  ],
  "totalCalories": 2000,
  "macros": {
    "protein": 150,
    "carbs": 200,
    "fat": 70
  },
  "notes": "Any additional dietary recommendations or tips"
}

Include at least 3-5 meals (breakfast, lunch, dinner, and snacks) with appropriate macronutrient distribution based on the user's goals.
`;
}
/**
 * Parse the AI response for workout plan
 */
function parseWorkoutPlanResponse(aiResponse, date) {
    try {
        const parsedResponse = JSON.parse(aiResponse);
        // Ensure exercises have the completed property
        const exercises = parsedResponse.exercises.map((exercise) => (Object.assign(Object.assign({}, exercise), { completed: false })));
        return {
            date,
            name: parsedResponse.name || 'AI Generated Workout Plan',
            description: parsedResponse.description || '',
            exercises,
            notes: parsedResponse.notes || '',
            aiGenerated: true
        };
    }
    catch (error) {
        console.error('Error parsing workout plan response:', error);
        throw new Error('Failed to parse AI response for workout plan');
    }
}
/**
 * Parse the AI response for nutrition plan
 */
function parseNutritionPlanResponse(aiResponse, date) {
    try {
        const parsedResponse = JSON.parse(aiResponse);
        // Ensure meals have the completed property
        const meals = parsedResponse.meals.map((meal) => (Object.assign(Object.assign({}, meal), { completed: false })));
        // Calculate total calories and macros if not provided
        let totalCalories = parsedResponse.totalCalories || 0;
        let macros = parsedResponse.macros || { protein: 0, carbs: 0, fat: 0 };
        if (totalCalories === 0 || !parsedResponse.totalCalories) {
            totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
        }
        if (!parsedResponse.macros) {
            macros = {
                protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
                carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
                fat: meals.reduce((sum, meal) => sum + meal.fat, 0)
            };
        }
        return {
            date,
            meals,
            totalCalories,
            macros,
            notes: parsedResponse.notes || '',
            aiGenerated: true
        };
    }
    catch (error) {
        console.error('Error parsing nutrition plan response:', error);
        throw new Error('Failed to parse AI response for nutrition plan');
    }
}
/**
 * Fetch user profile data from Typeform responses in Firestore
 */
async function fetchUserProfileFromFirestore(userId) {
    try {
        const db = (0, firestore_1.getFirestore)();
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.log(`User document not found for userId: ${userId}`);
            return null;
        }
        const userData = userDoc.data();
        // Check if there's a typeformResponses field
        if (!(userData === null || userData === void 0 ? void 0 : userData.typeformResponses)) {
            console.log(`No typeform responses found for userId: ${userId}`);
            return null;
        }
        // Map Typeform responses to UserProfile structure
        const userProfile = {
            age: userData.typeformResponses.age || undefined,
            weight: userData.typeformResponses.weight || undefined,
            height: userData.typeformResponses.height || undefined,
            gender: userData.typeformResponses.gender || '',
            fitnessLevel: userData.typeformResponses.fitnessLevel || 'beginner',
            fitnessGoals: userData.typeformResponses.fitnessGoals || [],
            dietaryRestrictions: userData.typeformResponses.dietaryRestrictions || [],
            healthConditions: userData.typeformResponses.healthConditions || [],
            preferredWorkoutDuration: userData.typeformResponses.preferredWorkoutDuration || 60,
            workoutFrequency: userData.typeformResponses.workoutFrequency || 3,
            preferredExercises: userData.typeformResponses.preferredExercises || [],
            dislikedExercises: userData.typeformResponses.dislikedExercises || [],
            preferredFoods: userData.typeformResponses.preferredFoods || [],
            dislikedFoods: userData.typeformResponses.dislikedFoods || []
        };
        return userProfile;
    }
    catch (error) {
        console.error('Error fetching user profile from Firestore:', error);
        return null;
    }
}
/**
 * Check if a user has completed the Typeform questionnaire
 */
exports.checkTypeformCompletion = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b, _c;
        try {
            // Ensure the request method is POST
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }
            const { userId } = req.body;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    error: 'The function requires a userId parameter.'
                });
                return;
            }
            const userProfile = await fetchUserProfileFromFirestore(userId);
            res.status(200).json({
                success: true,
                hasCompletedTypeform: !!userProfile,
                profileData: userProfile ? {
                    age: userProfile.age,
                    weight: userProfile.weight,
                    height: userProfile.height,
                    gender: userProfile.gender,
                    fitnessLevel: userProfile.fitnessLevel,
                    // Include only counts for arrays to avoid sending too much data
                    fitnessGoalsCount: ((_a = userProfile.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    dietaryRestrictionsCount: ((_b = userProfile.dietaryRestrictions) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    healthConditionsCount: ((_c = userProfile.healthConditions) === null || _c === void 0 ? void 0 : _c.length) || 0
                } : null
            });
        }
        catch (error) {
            console.error('Error checking Typeform completion:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check Typeform completion status'
            });
        }
    });
});
/**
 * Automatically generate workout and nutrition plans when a user completes the Typeform questionnaire
 */
exports.autoGeneratePlans = (0, firestore_2.onDocumentUpdated)('profiles/{userId}', async (event) => {
    try {
        // Check if data exists
        if (!event.data) {
            console.log('No data associated with the event');
            return null;
        }
        const afterData = event.data.after.data();
        const beforeData = event.data.before.data();
        const userId = event.params.userId;
        // Check if Typeform data was just added
        const typeformJustCompleted = !beforeData.typeformResponses && afterData.typeformResponses;
        // Check if we should auto-generate plans
        if (!typeformJustCompleted || afterData.plansAutoGenerated) {
            console.log('Skipping auto-generation: typeform not just completed or plans already auto-generated');
            return null;
        }
        console.log(`Auto-generating plans for user ${userId}`);
        // Get tomorrow's date for the plans
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        // Fetch user profile
        const userProfile = await fetchUserProfileFromFirestore(userId);
        if (!userProfile) {
            console.error(`Failed to fetch user profile for ${userId}`);
            return null;
        }
        // Create workout plan
        const workoutPrompt = createWorkoutPrompt(userProfile, tomorrowStr);
        const workoutResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional fitness trainer specialized in creating personalized workout plans. Provide detailed, structured workout plans based on the user's profile and preferences. Format your response as JSON."
                },
                {
                    role: "user",
                    content: workoutPrompt
                }
            ],
            response_format: { type: "json_object" }
        });
        // Parse workout response
        const workoutAiResponse = workoutResponse.choices[0].message.content;
        if (!workoutAiResponse) {
            throw new Error('Empty response from AI for workout plan');
        }
        const workoutPlan = parseWorkoutPlanResponse(workoutAiResponse, tomorrowStr);
        // Create nutrition plan
        const nutritionPrompt = createNutritionPrompt(userProfile, tomorrowStr);
        const nutritionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional nutritionist specialized in creating personalized meal plans. Provide detailed, structured nutrition plans based on the user's profile and preferences. Format your response as JSON."
                },
                {
                    role: "user",
                    content: nutritionPrompt
                }
            ],
            response_format: { type: "json_object" }
        });
        // Parse nutrition response
        const nutritionAiResponse = nutritionResponse.choices[0].message.content;
        if (!nutritionAiResponse) {
            throw new Error('Empty response from AI for nutrition plan');
        }
        const nutritionPlan = parseNutritionPlanResponse(nutritionAiResponse, tomorrowStr);
        // Save plans to Firestore
        const db = (0, firestore_1.getFirestore)();
        const batch = db.batch();
        // Save workout plan
        const workoutPlanRef = db.collection('workoutPlans').doc(`${userId}/plans/${tomorrowStr}`);
        batch.set(workoutPlanRef, Object.assign(Object.assign({}, workoutPlan), { updatedAt: firestore_1.FieldValue.serverTimestamp(), aiGenerated: true, autoGenerated: true }));
        // Save nutrition plan
        const nutritionPlanRef = db.collection('nutritionPlans').doc(`${userId}/plans/${tomorrowStr}`);
        batch.set(nutritionPlanRef, Object.assign(Object.assign({}, nutritionPlan), { updatedAt: firestore_1.FieldValue.serverTimestamp(), aiGenerated: true, autoGenerated: true }));
        // Update user profile to indicate plans have been auto-generated
        const userProfileRef = db.collection('profiles').doc(userId);
        batch.update(userProfileRef, {
            plansAutoGenerated: true,
            plansAutoGeneratedAt: firestore_1.FieldValue.serverTimestamp(),
            plansAutoGeneratedDate: tomorrowStr
        });
        // Commit all changes
        await batch.commit();
        console.log(`Successfully auto-generated plans for user ${userId} for date ${tomorrowStr}`);
        return { success: true };
    }
    catch (error) {
        console.error('Error auto-generating plans:', error);
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=aiPlans.js.map