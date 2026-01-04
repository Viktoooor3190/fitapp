import OpenAI from 'openai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onRequest, Request, Response } from 'firebase-functions/v2/https';

// Initialize OpenAI client with a default key for deployment
// In production, replace with your actual OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-deployment',
});

// CORS configuration for v2 functions
const corsOptions = {
  origin: ['http://localhost:3000', 'https://fitness-app-c3a9a.web.app', 'https://fitness-app-c3a9a.firebaseapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours in seconds
};

// Types
export interface UserProfile {
  userId?: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: string;
  fitnessLevel?: string; // beginner, intermediate, advanced
  fitnessGoals?: string[];
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  preferredWorkoutDuration?: number; // in minutes
  workoutFrequency?: number; // days per week
  preferredExercises?: string[];
  dislikedExercises?: string[];
  preferredFoods?: string[];
  dislikedFoods?: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  completed: boolean;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutPlan {
  id?: string;
  date: string; // YYYY-MM-DD format
  name: string;
  description?: string;
  exercises: Exercise[];
  notes?: string;
  aiGenerated: boolean;
}

export interface NutritionPlan {
  id?: string;
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalCalories: number;
  macros: Macros;
  notes?: string;
  aiGenerated: boolean;
}

/**
 * Generate an AI workout plan based on user profile and preferences
 */
export const generateWorkoutPlan = onRequest(
  {
    cors: corsOptions,
  },
  async (request: Request, response: Response): Promise<void> => {
    try {
      // Ensure the request method is POST
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const body = await request.json();
      const { userId, date } = body;
      
      if (!userId || !date) {
        response.status(400).json({
          success: false,
          error: 'The function requires userId and date parameters.'
        });
        return;
      }

      // Fetch user profile from Firestore (Typeform data)
      const userProfile = await fetchUserProfileFromFirestore(userId);
      
      if (!userProfile) {
        response.status(404).json({
          success: false,
          error: 'User profile data not found. Please ensure the user has completed the Typeform questionnaire.'
        });
        return;
      }
      
      // Format the prompt for the AI
      const prompt = createWorkoutPrompt(userProfile, date);
      
      // Call OpenAI API
      const aiResponse = await openai.chat.completions.create({
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
      const aiResponseContent = aiResponse.choices[0].message.content;
      if (!aiResponseContent) {
        response.status(500).json({
          success: false,
          error: 'Empty response from AI'
        });
        return;
      }

      const workoutPlan = parseWorkoutPlanResponse(aiResponseContent, date);
      
      // Save to Firestore
      const db = getFirestore();
      await db.collection('workoutPlans').doc(`${userId}/plans/${date}`).set({
        ...workoutPlan,
        updatedAt: FieldValue.serverTimestamp(),
        aiGenerated: true
      });

      response.status(200).json({ success: true, data: workoutPlan });
    } catch (error) {
      console.error('Error generating workout plan:', error);
      response.status(500).json({
        success: false,
        error: 'Failed to generate workout plan'
      });
    }
  }
);

/**
 * Generate an AI nutrition plan based on user profile and preferences
 */
export const generateNutritionPlan = onRequest(
  {
    cors: corsOptions,
  },
  async (request: Request, response: Response): Promise<void> => {
    try {
      // Ensure the request method is POST
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const body = await request.json();
      const { userId, date } = body;
      
      if (!userId || !date) {
        response.status(400).json({
          success: false,
          error: 'The function requires userId and date parameters.'
        });
        return;
      }

      // Fetch user profile from Firestore (Typeform data)
      const userProfile = await fetchUserProfileFromFirestore(userId);
      
      if (!userProfile) {
        response.status(404).json({
          success: false,
          error: 'User profile data not found. Please ensure the user has completed the Typeform questionnaire.'
        });
        return;
      }
      
      // Format the prompt for the AI
      const prompt = createNutritionPrompt(userProfile, date);
      
      // Call OpenAI API
      const aiResponse = await openai.chat.completions.create({
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
      const aiResponseContent = aiResponse.choices[0].message.content;
      if (!aiResponseContent) {
        response.status(500).json({
          success: false,
          error: 'Empty response from AI'
        });
        return;
      }

      const nutritionPlan = parseNutritionPlanResponse(aiResponseContent, date);
      
      // Save to Firestore
      const db = getFirestore();
      await db.collection('nutritionPlans').doc(`${userId}/plans/${date}`).set({
        ...nutritionPlan,
        updatedAt: FieldValue.serverTimestamp(),
        aiGenerated: true
      });

      response.status(200).json({ success: true, data: nutritionPlan });
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      response.status(500).json({
        success: false,
        error: 'Failed to generate nutrition plan'
      });
    }
  }
);

/**
 * Create a prompt for the AI to generate a workout plan
 */
export function createWorkoutPrompt(userProfile: UserProfile, date: string): string {
  // Format the profile data into a structured prompt
  return `Generate a personalized workout plan for ${date} based on the following user profile:
  
  Age: ${userProfile.age || 'Not specified'}
  Gender: ${userProfile.gender || 'Not specified'}
  Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
  Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
  Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
  Fitness Goals: ${userProfile.fitnessGoals?.join(', ') || 'General fitness'}
  Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}
  Preferred Workout Duration: ${userProfile.preferredWorkoutDuration || 60} minutes
  Workout Frequency: ${userProfile.workoutFrequency || 3} days per week
  Preferred Exercises: ${userProfile.preferredExercises?.join(', ') || 'Not specified'}
  Disliked Exercises: ${userProfile.dislikedExercises?.join(', ') || 'None'}
  
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
export function createNutritionPrompt(userProfile: UserProfile, date: string): string {
  // Calculate approximate calorie needs based on profile (very simplified)
  let baseCalories = 0;
  let proteinTarget = 0;
  
  // Very simplified BMR calculation
  if (userProfile.gender?.toLowerCase() === 'male' && userProfile.weight && userProfile.height && userProfile.age) {
    baseCalories = Math.round(88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age));
  } else if (userProfile.gender?.toLowerCase() === 'female' && userProfile.weight && userProfile.height && userProfile.age) {
    baseCalories = Math.round(447.593 + (9.247 * userProfile.weight) + (3.098 * userProfile.height) - (4.330 * userProfile.age));
  } else {
    // Default if incomplete data
    baseCalories = 2000;
  }
  
  // Adjust based on fitness goals
  if (userProfile.fitnessGoals?.includes('weight loss')) {
    baseCalories = Math.round(baseCalories * 0.8); // 20% deficit
    proteinTarget = Math.round((userProfile.weight || 70) * 2); // 2g per kg for weight loss
  } else if (userProfile.fitnessGoals?.includes('muscle gain')) {
    baseCalories = Math.round(baseCalories * 1.1); // 10% surplus
    proteinTarget = Math.round((userProfile.weight || 70) * 2.2); // 2.2g per kg for muscle gain
  } else {
    // Maintenance
    proteinTarget = Math.round((userProfile.weight || 70) * 1.6); // 1.6g per kg for maintenance
  }
  
  return `Generate a personalized nutrition plan for ${date} based on the following user profile:
  
  Age: ${userProfile.age || 'Not specified'}
  Gender: ${userProfile.gender || 'Not specified'}
  Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not specified'}
  Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not specified'}
  Fitness Goals: ${userProfile.fitnessGoals?.join(', ') || 'General fitness'}
  Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
  Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}
  Preferred Foods: ${userProfile.preferredFoods?.join(', ') || 'Not specified'}
  Disliked Foods: ${userProfile.dislikedFoods?.join(', ') || 'None'}
  
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
export async function callOpenAI(prompt: string, type: string): Promise<string | null> {
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
  } catch (error) {
    console.error(`Error calling OpenAI for ${type} plan:`, error);
    return null;
  }
}

/**
 * Parse the AI response for a workout plan
 */
export function parseWorkoutPlanResponse(aiResponse: string, date: string): WorkoutPlan {
  try {
    const parsedResponse = JSON.parse(aiResponse);
    
    // Ensure all exercises have the completed field
    const exercises = (parsedResponse.exercises || []).map((exercise: any) => ({
      ...exercise,
      completed: false
    }));
    
    return {
      date,
      name: parsedResponse.name || `Workout for ${date}`,
      description: parsedResponse.description || '',
      exercises,
      notes: parsedResponse.notes || '',
      aiGenerated: true
    };
  } catch (error) {
    console.error('Error parsing workout plan response:', error);
    throw new Error('Failed to parse AI response for workout plan');
  }
}

/**
 * Parse the AI response for a nutrition plan
 */
export function parseNutritionPlanResponse(aiResponse: string, date: string): NutritionPlan {
  try {
    const parsedResponse = JSON.parse(aiResponse);
    
    // Ensure all meals have the completed field
    const meals = (parsedResponse.meals || []).map((meal: any) => ({
      ...meal,
      completed: false
    }));
    
    let totalCalories = parsedResponse.totalCalories;
    let macros = parsedResponse.macros;
    
    // Calculate totals if not provided
    if (!totalCalories) {
      totalCalories = meals.reduce((sum: number, meal: Meal) => sum + meal.calories, 0);
    }
    
    if (!macros) {
      macros = {
        protein: meals.reduce((sum: number, meal: Meal) => sum + meal.protein, 0),
        carbs: meals.reduce((sum: number, meal: Meal) => sum + meal.carbs, 0),
        fat: meals.reduce((sum: number, meal: Meal) => sum + meal.fat, 0)
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
  } catch (error) {
    console.error('Error parsing nutrition plan response:', error);
    throw new Error('Failed to parse AI response for nutrition plan');
  }
}

/**
 * Fetch user profile data from Typeform responses in Firestore
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`User document not found for userId: ${userId}`);
      return null;
    }
    
    const userData = userDoc.data();
    
    // Check if there's a typeformResponses field
    if (!userData?.typeformResponses) {
      console.log(`No typeform responses found for userId: ${userId}`);
      return null;
    }
    
    // Map Typeform responses to UserProfile structure
    const userProfile: UserProfile = {
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
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

/**
 * Check if a user has completed the Typeform questionnaire
 */
export const checkTypeformCompletion = onRequest(
  {
    cors: corsOptions,
  },
  async (request: Request, response: Response): Promise<void> => {
    try {
      // Ensure the request method is POST
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      const body = await request.json();
      const { userId } = body;
      
      if (!userId) {
        response.status(400).json({
          success: false,
          error: 'The function requires a userId parameter.'
        });
        return;
      }

      const userProfile = await fetchUserProfileFromFirestore(userId);
      
      response.status(200).json({ 
        success: true, 
        hasCompletedTypeform: !!userProfile,
        profileData: userProfile ? {
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          gender: userProfile.gender,
          fitnessLevel: userProfile.fitnessLevel,
          // Include only counts for arrays to avoid sending too much data
          fitnessGoalsCount: userProfile.fitnessGoals?.length || 0,
          dietaryRestrictionsCount: userProfile.dietaryRestrictions?.length || 0,
          healthConditionsCount: userProfile.healthConditions?.length || 0
        } : null
      });
    } catch (error) {
      console.error('Error checking Typeform completion:', error);
      response.status(500).json({
        success: false,
        error: 'Failed to check Typeform completion status'
      });
    }
  }
);

/**
 * Automatically generate workout and nutrition plans when a user completes the Typeform questionnaire
 */
export const autoGeneratePlans = onDocumentUpdated('users/{userId}', async (event) => {
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
    const db = getFirestore();
    const batch = db.batch();
    
    // Save workout plan
    const workoutPlanRef = db.collection('workoutPlans').doc(`${userId}/plans/${tomorrowStr}`);
    batch.set(workoutPlanRef, {
      ...workoutPlan,
      updatedAt: FieldValue.serverTimestamp(),
      aiGenerated: true,
      autoGenerated: true
    });
    
    // Save nutrition plan
    const nutritionPlanRef = db.collection('nutritionPlans').doc(`${userId}/plans/${tomorrowStr}`);
    batch.set(nutritionPlanRef, {
      ...nutritionPlan,
      updatedAt: FieldValue.serverTimestamp(),
      aiGenerated: true,
      autoGenerated: true
    });
    
    // Update user profile to indicate plans have been auto-generated
    const userProfileRef = db.collection('users').doc(userId);
    batch.update(userProfileRef, { 
      plansAutoGenerated: true,
      plansAutoGeneratedAt: FieldValue.serverTimestamp(),
      plansAutoGeneratedDate: tomorrowStr
    });
    
    // Commit all changes
    await batch.commit();
    
    console.log(`Successfully auto-generated plans for user ${userId} for date ${tomorrowStr}`);
    return { success: true };
    
  } catch (error: any) {
    console.error('Error auto-generating plans:', error);
    return { success: false, error: error.message };
  }
}); 