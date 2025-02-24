import React from "react";
import { Question } from "./questions";
import { FormData } from "./OnboardingFlow";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReviewStepProps {
  formData: FormData;
  questions: Question[];
}

const ReviewStep = ({ formData, questions }: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please review your answers before submitting.
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <h3 className="font-medium">{question.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formData[question.id] || "Not provided"}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReviewStep;
