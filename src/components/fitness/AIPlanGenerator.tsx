import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessLevel?: string;
  fitnessGoals: string[];
  dietaryRestrictions: string[];
  healthConditions: string[];
  preferredWorkoutDuration?: number;
  workoutFrequency?: number;
  preferredExercises: string[];
  dislikedExercises: string[];
  preferredFoods: string[];
  dislikedFoods: string[];
}

interface AIPlanGeneratorProps {
  clientId: string;
  onPlanGenerated?: () => void;
}

interface TypeformStatus {
  hasCompletedTypeform: boolean;
  profileData: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
    fitnessLevel?: string;
    fitnessGoalsCount: number;
    dietaryRestrictionsCount: number;
    healthConditionsCount: number;
  } | null;
}

const AIPlanGenerator: React.FC<AIPlanGeneratorProps> = ({ clientId, onPlanGenerated }) => {
  const { user } = useAuth();
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('profile');
  const [typeformStatus, setTypeformStatus] = useState<TypeformStatus | null>(null);
  const [isCheckingTypeform, setIsCheckingTypeform] = useState(true);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: undefined,
    weight: undefined,
    height: undefined,
    gender: '',
    fitnessLevel: 'beginner',
    fitnessGoals: [],
    dietaryRestrictions: [],
    healthConditions: [],
    preferredWorkoutDuration: 60,
    workoutFrequency: 3,
    preferredExercises: [],
    dislikedExercises: [],
    preferredFoods: [],
    dislikedFoods: []
  });

  const [newGoal, setNewGoal] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newHealthCondition, setNewHealthCondition] = useState('');
  const [newPreferredExercise, setNewPreferredExercise] = useState('');
  const [newDislikedExercise, setNewDislikedExercise] = useState('');
  const [newPreferredFood, setNewPreferredFood] = useState('');
  const [newDislikedFood, setNewDislikedFood] = useState('');

  useEffect(() => {
    const checkTypeformCompletion = async () => {
      if (!user) return;
      
      setIsCheckingTypeform(true);
      
      try {
        const checkTypeform = httpsCallable(functions, 'aiCheckTypeformCompletion');
        const result = await checkTypeform({ userId: clientId });
        
        // Cast the result data to our TypeformStatus interface
        setTypeformStatus(result.data as TypeformStatus);
      } catch (error) {
        console.error('Error checking Typeform completion:', error);
        toast({
          title: "Error",
          description: "Failed to check if the client has completed the Typeform questionnaire.",
          variant: "destructive"
        });
      } finally {
        setIsCheckingTypeform(false);
      }
    };
    
    checkTypeformCompletion();
  }, [user, clientId]);

  const handleAddItem = (field: keyof UserProfile, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    
    setUserProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
    setter('');
  };

  const handleRemoveItem = (field: keyof UserProfile, index: number) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value ? Number(value) : undefined
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to generate a plan.",
        variant: "destructive"
      });
      return;
    }

    if (!typeformStatus?.hasCompletedTypeform) {
      toast({
        title: "Typeform Not Completed",
        description: "The client must complete the Typeform questionnaire before generating a plan.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingWorkout(true);
    
    try {
      const generateAIWorkoutPlan = httpsCallable(functions, 'aiGenerateWorkoutPlan');
      const result = await generateAIWorkoutPlan({
        userId: clientId,
        date: selectedDate
      });
      
      toast({
        title: "Success!",
        description: "Workout plan generated successfully.",
      });
      
      if (onPlanGenerated) {
        onPlanGenerated();
      }
    } catch (error: any) {
      console.error('Error generating workout plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const generateNutritionPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to generate a plan.",
        variant: "destructive"
      });
      return;
    }

    if (!typeformStatus?.hasCompletedTypeform) {
      toast({
        title: "Typeform Not Completed",
        description: "The client must complete the Typeform questionnaire before generating a plan.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingNutrition(true);
    
    try {
      const generateAINutritionPlan = httpsCallable(functions, 'aiGenerateNutritionPlan');
      const result = await generateAINutritionPlan({
        userId: clientId,
        date: selectedDate
      });
      
      toast({
        title: "Success!",
        description: "Nutrition plan generated successfully.",
      });
      
      if (onPlanGenerated) {
        onPlanGenerated();
      }
    } catch (error: any) {
      console.error('Error generating nutrition plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate nutrition plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingNutrition(false);
    }
  };

  if (isCheckingTypeform) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Checking if client has completed the Typeform questionnaire...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!typeformStatus?.hasCompletedTypeform) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Plan Generator</CardTitle>
          <CardDescription>
            Generate personalized workout and nutrition plans using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Typeform Not Completed</AlertTitle>
            <AlertDescription>
              This client has not completed the Typeform questionnaire. They need to complete it before you can generate AI plans for them.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Plan Generator</CardTitle>
        <CardDescription>
          Generate personalized workout and nutrition plans using AI based on client's Typeform data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTitle>Client Profile Summary</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>Age: {typeformStatus.profileData?.age || 'Not specified'}</div>
              <div>Weight: {typeformStatus.profileData?.weight ? `${typeformStatus.profileData.weight} kg` : 'Not specified'}</div>
              <div>Height: {typeformStatus.profileData?.height ? `${typeformStatus.profileData.height} cm` : 'Not specified'}</div>
              <div>Gender: {typeformStatus.profileData?.gender || 'Not specified'}</div>
              <div>Fitness Level: {typeformStatus.profileData?.fitnessLevel || 'Not specified'}</div>
              <div>Fitness Goals: {typeformStatus.profileData?.fitnessGoalsCount || 0} specified</div>
              <div>Dietary Restrictions: {typeformStatus.profileData?.dietaryRestrictionsCount || 0} specified</div>
              <div>Health Conditions: {typeformStatus.profileData?.healthConditionsCount || 0} specified</div>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Plan Date</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="w-full sm:w-auto"
          onClick={generateWorkoutPlan} 
          disabled={isGeneratingWorkout || isGeneratingNutrition}
        >
          {isGeneratingWorkout ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Workout Plan...
            </>
          ) : (
            'Generate Workout Plan'
          )}
        </Button>
        <Button 
          className="w-full sm:w-auto"
          onClick={generateNutritionPlan} 
          disabled={isGeneratingWorkout || isGeneratingNutrition}
        >
          {isGeneratingNutrition ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Nutrition Plan...
            </>
          ) : (
            'Generate Nutrition Plan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIPlanGenerator; 