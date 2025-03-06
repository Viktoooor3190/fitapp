import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

// Types
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string; // Format: "10kg, 12kg, 15kg" for each set
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
}

export interface NutritionPlan {
  id?: string;
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalCalories: number;
  macros: Macros;
  notes?: string;
}

// Workouts Functions
export const saveWorkoutPlan = async (clientId: string, workoutPlan: WorkoutPlan) => {
  try {
    const dateStr = workoutPlan.date;
    const docRef = doc(db, `workoutPlans/${clientId}/plans`, dateStr);
    await setDoc(docRef, {
      ...workoutPlan,
      updatedAt: Timestamp.now()
    });
    return { success: true, id: dateStr };
  } catch (error) {
    console.error('Error saving workout plan:', error);
    return { success: false, error };
  }
};

export const getWorkoutPlan = async (clientId: string, date: string) => {
  try {
    const docRef = doc(db, `workoutPlans/${clientId}/plans`, date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as WorkoutPlan };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting workout plan:', error);
    return { success: false, error };
  }
};

export const getMonthWorkoutPlans = async (clientId: string, year: number, month: number) => {
  try {
    // Format: YYYY-MM
    const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
    const monthEnd = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const plansRef = collection(db, `workoutPlans/${clientId}/plans`);
    const q = query(
      plansRef,
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    );
    
    const querySnapshot = await getDocs(q);
    const plans: WorkoutPlan[] = [];
    
    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as WorkoutPlan);
    });
    
    return { success: true, data: plans };
  } catch (error) {
    console.error('Error getting month workout plans:', error);
    return { success: false, error };
  }
};

export const updateWorkoutExerciseStatus = async (
  clientId: string, 
  date: string, 
  exerciseIndex: number, 
  completed: boolean
) => {
  try {
    const docRef = doc(db, `workoutPlans/${clientId}/plans`, date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const workoutPlan = docSnap.data() as WorkoutPlan;
      if (workoutPlan.exercises && workoutPlan.exercises[exerciseIndex]) {
        workoutPlan.exercises[exerciseIndex].completed = completed;
        await updateDoc(docRef, { exercises: workoutPlan.exercises });
        return { success: true };
      }
    }
    return { success: false, error: 'Workout not found' };
  } catch (error) {
    console.error('Error updating exercise status:', error);
    return { success: false, error };
  }
};

// Nutrition Functions
export const saveNutritionPlan = async (clientId: string, nutritionPlan: NutritionPlan) => {
  try {
    const dateStr = nutritionPlan.date;
    const docRef = doc(db, `nutritionPlans/${clientId}/plans`, dateStr);
    await setDoc(docRef, {
      ...nutritionPlan,
      updatedAt: Timestamp.now()
    });
    return { success: true, id: dateStr };
  } catch (error) {
    console.error('Error saving nutrition plan:', error);
    return { success: false, error };
  }
};

export const getNutritionPlan = async (clientId: string, date: string) => {
  try {
    const docRef = doc(db, `nutritionPlans/${clientId}/plans`, date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as NutritionPlan };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting nutrition plan:', error);
    return { success: false, error };
  }
};

export const getMonthNutritionPlans = async (clientId: string, year: number, month: number) => {
  try {
    // Format: YYYY-MM
    const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
    const monthEnd = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const plansRef = collection(db, `nutritionPlans/${clientId}/plans`);
    const q = query(
      plansRef,
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    );
    
    const querySnapshot = await getDocs(q);
    const plans: NutritionPlan[] = [];
    
    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() } as NutritionPlan);
    });
    
    return { success: true, data: plans };
  } catch (error) {
    console.error('Error getting month nutrition plans:', error);
    return { success: false, error };
  }
};

export const updateMealStatus = async (
  clientId: string, 
  date: string, 
  mealIndex: number, 
  completed: boolean
) => {
  try {
    const docRef = doc(db, `nutritionPlans/${clientId}/plans`, date);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const nutritionPlan = docSnap.data() as NutritionPlan;
      if (nutritionPlan.meals && nutritionPlan.meals[mealIndex]) {
        nutritionPlan.meals[mealIndex].completed = completed;
        await updateDoc(docRef, { meals: nutritionPlan.meals });
        return { success: true };
      }
    }
    return { success: false, error: 'Nutrition plan not found' };
  } catch (error) {
    console.error('Error updating meal status:', error);
    return { success: false, error };
  }
};

// Helper function to get today's plans
export const getTodaysPlans = async (clientId: string) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const [workoutResult, nutritionResult] = await Promise.all([
      getWorkoutPlan(clientId, dateStr),
      getNutritionPlan(clientId, dateStr)
    ]);
    
    return {
      success: true,
      workout: workoutResult.data,
      nutrition: nutritionResult.data
    };
  } catch (error) {
    console.error('Error getting today\'s plans:', error);
    return { success: false, error };
  }
}; 