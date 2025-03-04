import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

interface Question {
  id: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'date' | 'time' | 'textarea';
  question: string;
  description?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

const questions: Question[] = [
  {
    id: 'basic_info',
    type: 'text',
    question: "What's your name?",
    description: "We'll use this to personalize your experience",
    validation: { required: true }
  },
  {
    id: 'age',
    type: 'number',
    question: 'How old are you?',
    validation: { required: true, min: 16, max: 100 }
  },
  {
    id: 'gender',
    type: 'radio',
    question: 'What is your gender?',
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
    validation: { required: true }
  },
  {
    id: 'height',
    type: 'number',
    question: 'What is your height? (in cm)',
    validation: { required: true, min: 100, max: 250 }
  },
  {
    id: 'weight',
    type: 'number',
    question: 'What is your current weight? (in kg)',
    validation: { required: true, min: 30, max: 250 }
  },
  {
    id: 'goal',
    type: 'select',
    question: 'What is your primary fitness goal?',
    options: [
      'Lose weight',
      'Build muscle',
      'Improve strength',
      'Increase endurance',
      'Improve flexibility',
      'General fitness',
      'Sports performance'
    ],
    validation: { required: true }
  },
  {
    id: 'experience',
    type: 'radio',
    question: 'What is your fitness experience level?',
    options: [
      'Beginner - New to working out',
      'Intermediate - Some experience',
      'Advanced - Very experienced',
      'Professional - Competitive athlete'
    ],
    validation: { required: true }
  },
  {
    id: 'availability',
    type: 'multiselect',
    question: 'Which days can you work out?',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    validation: { required: true }
  },
  {
    id: 'time_preference',
    type: 'radio',
    question: 'When do you prefer to work out?',
    options: ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Late night'],
    validation: { required: true }
  },
  {
    id: 'medical_conditions',
    type: 'textarea',
    question: 'Do you have any medical conditions or injuries we should know about?',
    description: 'This helps us create a safe and effective program for you'
  },
  {
    id: 'dietary_restrictions',
    type: 'multiselect',
    question: 'Do you have any dietary restrictions?',
    options: [
      'None',
      'Vegetarian',
      'Vegan',
      'Gluten-free',
      'Lactose intolerant',
      'Kosher',
      'Halal',
      'Other'
    ]
  },
  {
    id: 'sleep',
    type: 'number',
    question: 'How many hours do you sleep on average per night?',
    validation: { required: true, min: 3, max: 12 }
  }
];

const Questionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleNext = () => {
    const question = questions[currentQuestion];
    if (question.validation?.required && !answers[question.id]) {
      setError('This question requires an answer');
      return;
    }
    setError('');

    if (currentQuestion === questions.length - 1) {
      handleFinish();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(prev => Math.max(prev - 1, 0));
    setError('');
  };

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
    setError('');
  };

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const clientRef = doc(db, 'clients', user.uid);
      
      // Get the current client document to preserve existing fields
      const clientDoc = await getDoc(clientRef);
      if (!clientDoc.exists()) {
        console.error("Client document doesn't exist");
        return;
      }
      
      const clientData = clientDoc.data();
      console.log("[Questionnaire] Current client data:", clientData);
      
      // Update the client document while preserving important fields
      await updateDoc(clientRef, {
        onboardingAnswers: answers,
        onboardingCompleted: true,
        status: 'active',
        lastUpdated: serverTimestamp(),
        // Preserve these fields if they exist
        role: clientData.role || 'client',
        coachId: clientData.coachId || null
      });
      
      console.log("[Questionnaire] Updated client document with onboarding answers while preserving role and coachId");

      // Also ensure the user document has the correct role
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("[Questionnaire] Current user data:", userData);
        
        // If the role is not 'client', update it
        if (userData.role !== 'client') {
          console.log("[Questionnaire] User role is not 'client', updating to 'client'");
          await updateDoc(userRef, {
            role: 'client',
            updatedAt: serverTimestamp()
          });
          console.log("[Questionnaire] Updated user document with role 'client'");
        }
      } else {
        console.log("[Questionnaire] User document doesn't exist, creating it");
        // Create the user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'client',
          coachId: clientData.coachId || null,
          createdAt: serverTimestamp(),
          isActive: true,
          profileComplete: true
        });
        console.log("[Questionnaire] Created user document with role 'client'");
      }

      // Redirect to user dashboard
      navigate('/user/dashboard');
    } catch (error) {
      console.error('Error saving questionnaire answers:', error);
      setError('Failed to save your answers. Please try again.');
    }
  };

  const renderInput = (question: Question) => {
    switch (question.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={question.type}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your answer here..."
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Type your answer here..."
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full px-4 py-3 text-left text-lg rounded-lg transition-colors ${
                  answers[question.id] === option
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-3">
            {question.options?.map(option => {
              const selected = (answers[question.id] || []).includes(option);
              return (
                <button
                  key={option}
                  onClick={() => {
                    const currentAnswers = answers[question.id] || [];
                    handleAnswer(
                      selected
                        ? currentAnswers.filter((a: string) => a !== option)
                        : [...currentAnswers, option]
                    );
                  }}
                  className={`w-full px-4 py-3 text-left text-lg rounded-lg transition-colors ${
                    selected
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2b] flex items-start justify-center px-4">
      <div className="w-full max-w-2xl mx-auto pt-56">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-1 w-full bg-gray-700 rounded-full">
            <div 
              className="h-1 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1e2433] rounded-2xl p-8 shadow-lg"
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                {questions[currentQuestion].question}
              </h2>
              
              {questions[currentQuestion].description && (
                <p className="text-gray-400">
                  {questions[currentQuestion].description}
                </p>
              )}

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="space-y-4">
                {renderInput(questions[currentQuestion])}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Questionnaire; 