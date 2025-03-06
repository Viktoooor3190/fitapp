import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Dumbbell, 
  Apple, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Info
} from 'lucide-react';
import { 
  WorkoutPlan, 
  NutritionPlan, 
  Exercise, 
  Meal, 
  Macros,
  saveWorkoutPlan,
  saveNutritionPlan,
  getWorkoutPlan,
  getNutritionPlan
} from '../../firebase/fitnessData';

interface PlanEditorProps {
  clientId: string;
  selectedDate: Date;
  onSave: () => void;
  onCancel: () => void;
}

const PlanEditor = ({ clientId, selectedDate, onSave, onCancel }: PlanEditorProps) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const [isLoading, setIsLoading] = useState(true);
  
  // Workout state
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({
    date: format(selectedDate, 'yyyy-MM-dd'),
    name: '',
    exercises: [],
    notes: ''
  });
  
  // Nutrition state
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>({
    date: format(selectedDate, 'yyyy-MM-dd'),
    meals: [],
    totalCalories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    notes: ''
  });

  useEffect(() => {
    const fetchExistingPlans = async () => {
      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        // Fetch existing workout plan
        const workoutResult = await getWorkoutPlan(clientId, dateStr);
        if (workoutResult.success && workoutResult.data) {
          setWorkoutPlan(workoutResult.data);
        }
        
        // Fetch existing nutrition plan
        const nutritionResult = await getNutritionPlan(clientId, dateStr);
        if (nutritionResult.success && nutritionResult.data) {
          setNutritionPlan(nutritionResult.data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExistingPlans();
  }, [clientId, selectedDate]);

  // Workout handlers
  const handleWorkoutNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutPlan(prev => ({ ...prev, name: e.target.value }));
  };
  
  const handleWorkoutNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkoutPlan(prev => ({ ...prev, notes: e.target.value }));
  };
  
  const addExercise = () => {
    const newExercise: Exercise = {
      name: '',
      sets: 3,
      reps: '10, 10, 10',
      weight: '0kg, 0kg, 0kg',
      completed: false
    };
    
    setWorkoutPlan(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };
  
  const updateExercise = (index: number, field: keyof Exercise, value: string | number | boolean) => {
    setWorkoutPlan(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value
      };
      return { ...prev, exercises: updatedExercises };
    });
  };
  
  const removeExercise = (index: number) => {
    setWorkoutPlan(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises.splice(index, 1);
      return { ...prev, exercises: updatedExercises };
    });
  };

  // Nutrition handlers
  const handleNutritionNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNutritionPlan(prev => ({ ...prev, notes: e.target.value }));
  };
  
  const addMeal = () => {
    const newMeal: Meal = {
      name: '',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      completed: false
    };
    
    setNutritionPlan(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal]
    }));
  };
  
  const updateMeal = (index: number, field: keyof Meal, value: string | number | boolean) => {
    setNutritionPlan(prev => {
      const updatedMeals = [...prev.meals];
      updatedMeals[index] = {
        ...updatedMeals[index],
        [field]: value
      };
      
      // Recalculate total calories and macros
      const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const protein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const carbs = updatedMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const fat = updatedMeals.reduce((sum, meal) => sum + meal.fat, 0);
      
      return { 
        ...prev, 
        meals: updatedMeals,
        totalCalories,
        macros: { protein, carbs, fat }
      };
    });
  };
  
  const removeMeal = (index: number) => {
    setNutritionPlan(prev => {
      const updatedMeals = [...prev.meals];
      updatedMeals.splice(index, 1);
      
      // Recalculate total calories and macros
      const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const protein = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const carbs = updatedMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const fat = updatedMeals.reduce((sum, meal) => sum + meal.fat, 0);
      
      return { 
        ...prev, 
        meals: updatedMeals,
        totalCalories,
        macros: { protein, carbs, fat }
      };
    });
  };

  // Save both plans
  const handleSave = async () => {
    try {
      // Save workout plan if it has a name and at least one exercise
      if (workoutPlan.name && workoutPlan.exercises.length > 0) {
        await saveWorkoutPlan(clientId, workoutPlan);
      }
      
      // Save nutrition plan if it has at least one meal
      if (nutritionPlan.meals.length > 0) {
        await saveNutritionPlan(clientId, nutritionPlan);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving plans:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">
          Edit Plan for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center text-sm"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'workout'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('workout')}
        >
          <Dumbbell className="w-4 h-4 mr-1.5" />
          Workout
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'nutrition'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('nutrition')}
        >
          <Apple className="w-4 h-4 mr-1.5" />
          Nutrition
        </button>
      </div>

      {/* Workout Plan Editor */}
      {activeTab === 'workout' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="workoutName" className="block text-sm font-medium text-gray-400 mb-1">
              Workout Name
            </label>
            <input
              id="workoutName"
              type="text"
              value={workoutPlan.name}
              onChange={handleWorkoutNameChange}
              placeholder="e.g., Upper Body Strength"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Exercises
              </label>
              <button
                onClick={addExercise}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 p-1 rounded-lg flex items-center text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Exercise
              </button>
            </div>

            {workoutPlan.exercises.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-4 text-center text-gray-400 text-sm">
                No exercises added yet. Click "Add Exercise" to start building the workout.
              </div>
            ) : (
              <div className="space-y-3">
                {workoutPlan.exercises.map((exercise, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        placeholder="Exercise name"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full max-w-[250px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeExercise(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Sets</label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          placeholder="e.g., 10, 8, 8"
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Weight</label>
                        <input
                          type="text"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          placeholder="e.g., 20kg, 25kg, 25kg"
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                        placeholder="Optional instructions or notes"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="workoutNotes" className="block text-sm font-medium text-gray-400 mb-1">
              Workout Notes
            </label>
            <textarea
              id="workoutNotes"
              value={workoutPlan.notes || ''}
              onChange={handleWorkoutNotesChange}
              placeholder="Additional instructions or notes for the entire workout"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Nutrition Plan Editor */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="bg-gray-700/30 rounded-lg p-3 flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Add meals to create a nutrition plan. Total calories and macros will be calculated automatically.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Total Calories</p>
              <p className="text-white font-semibold mt-1">{nutritionPlan.totalCalories}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Protein</p>
              <p className="text-white font-semibold mt-1">{nutritionPlan.macros.protein}g</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">Carbs / Fats</p>
              <p className="text-white font-semibold mt-1">{nutritionPlan.macros.carbs}g / {nutritionPlan.macros.fat}g</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Meals
              </label>
              <button
                onClick={addMeal}
                className="bg-green-600/20 hover:bg-green-600/30 text-green-500 p-1 rounded-lg flex items-center text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Meal
              </button>
            </div>

            {nutritionPlan.meals.length === 0 ? (
              <div className="bg-gray-700/50 rounded-lg p-4 text-center text-gray-400 text-sm">
                No meals added yet. Click "Add Meal" to start building the nutrition plan.
              </div>
            ) : (
              <div className="space-y-3">
                {nutritionPlan.meals.map((meal, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => updateMeal(index, 'name', e.target.value)}
                        placeholder="Meal name"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full max-w-[250px] focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={() => removeMeal(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={meal.description}
                        onChange={(e) => updateMeal(index, 'description', e.target.value)}
                        placeholder="e.g., Grilled chicken with rice and vegetables"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Calories</label>
                        <input
                          type="number"
                          min="0"
                          value={meal.calories}
                          onChange={(e) => updateMeal(index, 'calories', parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                        <input
                          type="number"
                          min="0"
                          value={meal.protein}
                          onChange={(e) => updateMeal(index, 'protein', parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          min="0"
                          value={meal.carbs}
                          onChange={(e) => updateMeal(index, 'carbs', parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                        <input
                          type="number"
                          min="0"
                          value={meal.fat}
                          onChange={(e) => updateMeal(index, 'fat', parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="nutritionNotes" className="block text-sm font-medium text-gray-400 mb-1">
              Nutrition Notes
            </label>
            <textarea
              id="nutritionNotes"
              value={nutritionPlan.notes || ''}
              onChange={handleNutritionNotesChange}
              placeholder="Additional instructions or notes for the nutrition plan"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanEditor; 