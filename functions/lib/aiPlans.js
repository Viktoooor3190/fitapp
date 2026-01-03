"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoGeneratePlans = exports.checkTypeformCompletion = exports.generateNutritionPlan = exports.generateWorkoutPlan = void 0;
exports.createWorkoutPrompt = createWorkoutPrompt;
exports.createNutritionPrompt = createNutritionPrompt;
exports.callOpenAI = callOpenAI;
exports.parseWorkoutPlanResponse = parseWorkoutPlanResponse;
exports.parseNutritionPlanResponse = parseNutritionPlanResponse;
exports.fetchUserProfileFromFirestore = fetchUserProfileFromFirestore;
const functions = require("firebase-functions");
const openai_1 = require("openai");
const cors = require("cors");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
// Initialize OpenAI client with a default key for deployment
// In production, replace with your actual OpenAI API key
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-deployment',
});
// Initialize CORS middleware
const corsMiddleware = cors({
    origin: ['http://localhost:3000', 'https://fitness-app-c3a9a.web.app', 'https://fitness-app-c3a9a.firebaseapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours in seconds
});
/**
 * Generate an AI workout plan based on user profile and preferences
 */
exports.generateWorkoutPlan = functions.https.onRequest((req, res) => {
    // Apply CORS middleware
    return corsMiddleware(req, res, async () => {
        try {
            // Handle preflight OPTIONS request
            if (req.method === 'OPTIONS') {
                res.status(204).send('');
                return;
            }
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
    // Apply CORS middleware
    return corsMiddleware(req, res, async () => {
        try {
            // Handle preflight OPTIONS request
            if (req.method === 'OPTIONS') {
                res.status(204).send('');
                return;
            }
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
 * Create a prompt for the AI to generate a workout plan
 */
function createWorkoutPrompt(userProfile, date) {
    var _a, _b, _c, _d;
    // Format the profile data into a structured prompt
    return `Generate a personalized workout plan for ${date} based on the following user profile:
  
  Age: ${userProfile.age || 'Not specified'}
  Gender: ${userProfile.gender || 'Not specified'}
  Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
  Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
  Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
  Fitness Goals: ${((_a = userProfile.fitnessGoals) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'General fitness'}
  Health Conditions: ${((_b = userProfile.healthConditions) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'None'}
  Preferred Workout Duration: ${userProfile.preferredWorkoutDuration || 60} minutes
  Workout Frequency: ${userProfile.workoutFrequency || 3} days per week
  Preferred Exercises: ${((_c = userProfile.preferredExercises) === null || _c === void 0 ? void 0 : _c.join(', ')) || 'Not specified'}
  Disliked Exercises: ${((_d = userProfile.dislikedExercises) === null || _d === void 0 ? void 0 : _d.join(', ')) || 'None'}
  
  Please create a structured workout plan with:
  - A descriptive name for the workout
  - A list of exercises
  - Specific sets, reps, and weight recommendations for each exercise
  - Proper warm-up and cool-down activities
  - Notes for proper form and technique

  Format the response as a JSON object with the following structure:
  {
    "name": "Workout Name",
    "description": "Brief description of the workout",
    "exercises": [
      {
        "name": "Exercise Name",
        "sets": 3,
        "reps": "8-12",
        "weight": "Moderate" or specific weight if applicable,
        "notes": "Form tips or other notes",
        "completed": false
      }
    ],
    "notes": "Overall notes about the workout"
  }`;
}
/**
 * Create a prompt for the AI to generate a nutrition plan
 */
function createNutritionPrompt(userProfile, date) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // Calculate approximate calorie needs based on profile (very simplified)
    let baseCalories = 0;
    let proteinTarget = 0;
    // Very simplified BMR calculation
    if (((_a = userProfile.gender) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'male' && userProfile.weight && userProfile.height && userProfile.age) {
        baseCalories = Math.round(88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age));
    }
    else if (((_b = userProfile.gender) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'female' && userProfile.weight && userProfile.height && userProfile.age) {
        baseCalories = Math.round(447.593 + (9.247 * userProfile.weight) + (3.098 * userProfile.height) - (4.330 * userProfile.age));
    }
    else {
        // Default if incomplete data
        baseCalories = 2000;
    }
    // Adjust based on fitness goals
    if ((_c = userProfile.fitnessGoals) === null || _c === void 0 ? void 0 : _c.includes('weight loss')) {
        baseCalories = Math.round(baseCalories * 0.8); // 20% deficit
        proteinTarget = Math.round((userProfile.weight || 70) * 2); // 2g per kg for weight loss
    }
    else if ((_d = userProfile.fitnessGoals) === null || _d === void 0 ? void 0 : _d.includes('muscle gain')) {
        baseCalories = Math.round(baseCalories * 1.1); // 10% surplus
        proteinTarget = Math.round((userProfile.weight || 70) * 2.2); // 2.2g per kg for muscle gain
    }
    else {
        // Maintenance
        proteinTarget = Math.round((userProfile.weight || 70) * 1.6); // 1.6g per kg for maintenance
    }
    return `Generate a personalized nutrition plan for ${date} based on the following user profile:
  
  Age: ${userProfile.age || 'Not specified'}
  Gender: ${userProfile.gender || 'Not specified'}
  Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
  Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
  Fitness Goals: ${((_e = userProfile.fitnessGoals) === null || _e === void 0 ? void 0 : _e.join(', ')) || 'General fitness'}
  Dietary Restrictions: ${((_f = userProfile.dietaryRestrictions) === null || _f === void 0 ? void 0 : _f.join(', ')) || 'None'}
  Health Conditions: ${((_g = userProfile.healthConditions) === null || _g === void 0 ? void 0 : _g.join(', ')) || 'None'}
  Preferred Foods: ${((_h = userProfile.preferredFoods) === null || _h === void 0 ? void 0 : _h.join(', ')) || 'Not specified'}
  Disliked Foods: ${((_j = userProfile.dislikedFoods) === null || _j === void 0 ? void 0 : _j.join(', ')) || 'None'}
  
  Target calories: approximately ${baseCalories} calories
  Protein target: approximately ${proteinTarget}g
  
  Please create a structured nutrition plan with:
  - 4-5 meals throughout the day including breakfast, lunch, dinner, and snacks
  - Specific meal names and descriptions
  - Detailed macronutrient breakdowns (protein, carbs, fat)
  - Calorie counts for each meal
  - Consideration of dietary restrictions

  Format the response as a JSON object with the following structure:
  {
    "meals": [
      {
        "name": "Meal Name",
        "description": "Ingredients and preparation",
        "calories": 500,
        "protein": 30,
        "carbs": 40,
        "fat": 15,
        "completed": false
      }
    ],
    "totalCalories": 2000,
    "macros": {
      "protein": 150,
      "carbs": 200,
      "fat": 65
    },
    "notes": "Overall notes about the nutrition plan"
  }`;
}
/**
 * Call OpenAI API with a prompt
 */
async function callOpenAI(prompt, type) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: type === 'workout'
                        ? "You are a professional fitness trainer specialized in creating personalized workout plans. Provide detailed, structured workout plans based on the user's profile and preferences. Format your response as JSON."
                        : "You are a professional nutritionist specialized in creating personalized meal plans. Provide detailed, structured nutrition plans based on the user's profile and preferences. Format your response as JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });
        return response.choices[0].message.content;
    }
    catch (error) {
        console.error(`Error calling OpenAI for ${type} plan:`, error);
        return null;
    }
}
/**
 * Parse the AI response for a workout plan
 */
function parseWorkoutPlanResponse(aiResponse, date) {
    try {
        const parsedResponse = JSON.parse(aiResponse);
        // Ensure all exercises have the completed field
        const exercises = (parsedResponse.exercises || []).map((exercise) => (Object.assign(Object.assign({}, exercise), { completed: false })));
        return {
            date,
            name: parsedResponse.name || `Workout for ${date}`,
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
 * Parse the AI response for a nutrition plan
 */
function parseNutritionPlanResponse(aiResponse, date) {
    try {
        const parsedResponse = JSON.parse(aiResponse);
        // Ensure all meals have the completed field
        const meals = (parsedResponse.meals || []).map((meal) => (Object.assign(Object.assign({}, meal), { completed: false })));
        let totalCalories = parsedResponse.totalCalories;
        let macros = parsedResponse.macros;
        // Calculate totals if not provided
        if (!totalCalories) {
            totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
        }
        if (!macros) {
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
            userId, // Add userId to the profile
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
    // Apply CORS middleware
    return corsMiddleware(req, res, async () => {
        var _a, _b, _c;
        try {
            // Handle preflight OPTIONS request
            if (req.method === 'OPTIONS') {
                res.status(204).send('');
                return;
            }
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