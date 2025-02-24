import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { questions } from "./questions";
import QuestionStep from "./QuestionStep";
import ReviewStep from "./ReviewStep";

export interface FormData {
  [key: string]: string | string[];
}

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});

  const isLastStep = currentStep === questions.length;
  const progress = ((currentStep + 1) / (questions.length + 1)) * 100;

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    // TODO: Implement Firebase submission
    console.log("Form submitted:", formData);

    // Create a new client object from form data
    const newClient = {
      name: "New Client", // This would come from auth
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      planStatus: "pending",
      lastCheckIn: new Date().toISOString().split("T")[0],
      ...formData,
    };

    // In a real app, this would be saved to Firebase
    console.log("New client:", newClient);

    // Redirect to dashboard
    navigate("/");
  };

  const updateFormData = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8">
        <Progress value={progress} className="mb-8" />

        {!isLastStep ? (
          <QuestionStep
            question={questions[currentStep]}
            value={formData[questions[currentStep].id] || ""}
            onChange={(value) =>
              updateFormData(questions[currentStep].id, value)
            }
          />
        ) : (
          <ReviewStep formData={formData} questions={questions} />
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {!isLastStep ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
