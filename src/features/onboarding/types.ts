export interface Question {
  id: string;
  title: string;
  type: "text" | "number" | "select" | "textarea" | "radio";
  options?: string[];
  tip?: string;
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface FormData {
  [key: string]: string | string[];
}

export interface OnboardingFormData extends FormData {
  weight?: string;
  height?: string;
  fitnessGoal?: string;
  medicalConditions?: string;
  schedule?: string;
  sleep?: string;
  diet?: string;
  equipment?: string;
  preferences?: string;
  experience?: string;
  additionalInfo?: string;
} 