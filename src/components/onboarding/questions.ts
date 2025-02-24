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

export const questions: Question[] = [
  {
    id: "weight",
    title: "What is your current weight (in lbs)?",
    type: "number",
    placeholder: "Enter your weight",
    tip: "This helps us track your progress and customize your fitness plan.",
    validation: {
      required: true,
      min: 50,
      max: 500,
    },
  },
  {
    id: "height",
    title: "How tall are you (in inches)?",
    type: "number",
    placeholder: "Enter your height",
    tip: "We use this to calculate your BMI and recommend appropriate exercises.",
    validation: {
      required: true,
      min: 36,
      max: 96,
    },
  },
  {
    id: "fitnessGoal",
    title: "What is your primary fitness goal?",
    type: "select",
    options: ["Weight Loss", "Muscle Gain", "Endurance", "General Health"],
    tip: "Your goal helps us tailor your workout plan to achieve your desired results.",
    validation: { required: true },
  },
  {
    id: "medicalConditions",
    title:
      "Do you have any existing injuries or medical conditions we should be aware of?",
    type: "textarea",
    placeholder: "Please describe any conditions...",
    tip: "This information ensures we provide safe exercise recommendations.",
    validation: { required: true },
  },
  {
    id: "schedule",
    title: "What is your typical weekly schedule for workouts?",
    type: "select",
    options: ["Morning", "Afternoon", "Evening", "Flexible"],
    tip: "Knowing your schedule helps us plan workouts at times that work best for you.",
    validation: { required: true },
  },
  {
    id: "sleep",
    title: "How many hours of sleep do you typically get each night?",
    type: "number",
    placeholder: "Enter hours",
    tip: "Sleep is crucial for recovery and achieving your fitness goals.",
    validation: {
      required: true,
      min: 1,
      max: 24,
    },
  },
  {
    id: "diet",
    title: "What is your current diet or eating pattern?",
    type: "select",
    options: ["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Other"],
    tip: "Your diet plays a key role in reaching your fitness goals.",
    validation: { required: true },
  },
  {
    id: "equipment",
    title: "What equipment do you have access to?",
    type: "select",
    options: ["Full Gym", "Home Gym", "Minimal Equipment", "No Equipment"],
    tip: "This helps us recommend exercises based on available equipment.",
    validation: { required: true },
  },
  {
    id: "preferences",
    title:
      "Are there any exercises or activities you dislike or want to avoid?",
    type: "textarea",
    placeholder: "Enter exercises to avoid...",
    tip: "We want to create a workout plan you'll enjoy and stick with.",
  },
  {
    id: "experience",
    title: "Have you ever worked with a personal trainer before?",
    type: "radio",
    options: ["Yes", "No"],
    tip: "This helps us understand your familiarity with guided workouts.",
    validation: { required: true },
  },
  {
    id: "additionalInfo",
    title:
      "Is there any other information you'd like us to know about your fitness journey?",
    type: "textarea",
    placeholder: "Share any additional information...",
    tip: "The more we know, the better we can help you achieve your goals.",
  },
];
