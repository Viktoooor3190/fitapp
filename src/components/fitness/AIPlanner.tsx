import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { toast } from '../../components/ui/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Separator } from '../../components/ui/separator';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import axios from 'axios';

const functions = getFunctions();

interface AIPlannerProps {
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

const AIPlanner: React.FC<AIPlannerProps> = ({ clientId, onPlanGenerated }) => {
  const { user } = useAuth();
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [typeformStatus, setTypeformStatus] = useState<TypeformStatus | null>(null);
  const [isCheckingTypeform, setIsCheckingTypeform] = useState(true);
  
  useEffect(() => {
    const checkTypeformCompletion = async () => {
      if (!user) return;
      
      setIsCheckingTypeform(true);
      
      try {
        // Using Firebase callable function
        const checkTypeformFunction = httpsCallable(functions, 'aiCheckTypeformCompletion');
        const response = await checkTypeformFunction({ userId: clientId });
        
        // Access data from the callable function response
        const result = response.data as any;
        
        setTypeformStatus({
          hasCompletedTypeform: result.hasCompletedTypeform,
          profileData: result.profileData
        });
      } catch (error) {
        console.error('Error checking Typeform completion:', error);
        setTypeformStatus({
          hasCompletedTypeform: false,
          profileData: null
        });
      } finally {
        setIsCheckingTypeform(false);
      }
    };
    
    checkTypeformCompletion();
  }, [user, clientId]);

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
      // Using Firebase callable function
      const generateWorkoutFunction = httpsCallable(functions, 'aiGenerateWorkoutPlan');
      const response = await generateWorkoutFunction({
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
      // Using Firebase callable function
      const generateNutritionFunction = httpsCallable(functions, 'aiGenerateNutritionPlan');
      const response = await generateNutritionFunction({
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
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
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

export default AIPlanner; 