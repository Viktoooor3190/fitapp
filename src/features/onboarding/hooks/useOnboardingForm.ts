import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types';
import { ONBOARDING_QUESTIONS } from '../constants';

export const useOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const navigate = useNavigate();

  const isLastStep = currentStep === ONBOARDING_QUESTIONS.length;
  const progress = ((currentStep + 1) / (ONBOARDING_QUESTIONS.length + 1)) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Create a new client object from form data
    const newClient = {
      name: "New Client", // This would come from auth
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      planStatus: "pending",
      lastCheckIn: new Date().toISOString().split("T")[0],
      ...formData,
    };

    // TODO: Implement data submission
    console.log("New client:", newClient);

    // Redirect to dashboard
    navigate("/");
  };

  const updateFormData = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return {
    currentStep,
    formData,
    isLastStep,
    progress,
    handleNext,
    handleBack,
    handleSubmit,
    updateFormData,
  };
}; 