import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ONBOARDING_QUESTIONS } from "../constants";
import { useOnboardingForm } from "../hooks/useOnboardingForm";
import QuestionStep from "./QuestionStep";
import ReviewStep from "./ReviewStep";

const OnboardingFlow = () => {
  const {
    currentStep,
    formData,
    isLastStep,
    progress,
    handleNext,
    handleBack,
    handleSubmit,
    updateFormData,
  } = useOnboardingForm();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8">
        <Progress value={progress} className="mb-8" />

        {!isLastStep ? (
          <QuestionStep
            question={ONBOARDING_QUESTIONS[currentStep]}
            value={formData[ONBOARDING_QUESTIONS[currentStep].id] || ""}
            onChange={(value) =>
              updateFormData(ONBOARDING_QUESTIONS[currentStep].id, value)
            }
          />
        ) : (
          <ReviewStep formData={formData} questions={ONBOARDING_QUESTIONS} />
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