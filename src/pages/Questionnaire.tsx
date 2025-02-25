import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fitnessGoals: '',
    experienceLevel: '',
    preferredWorkoutDays: [],
    healthConditions: '',
    dietaryPreferences: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }

      const clientRef = doc(db, 'clients', user.uid);
      await updateDoc(clientRef, {
        ...formData,
        questionnaireCompleted: true,
        onboardingCompleted: true
      });

      // Redirect to dashboard
      navigate('/user');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2b] pt-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Let's Customize Your Fitness Journey
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <label className="block text-white mb-2">What are your fitness goals?</label>
              <select
                name="fitnessGoals"
                value={formData.fitnessGoals}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
                required
              >
                <option value="">Select a goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <label className="block text-white mb-2">What's your fitness experience level?</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
                required
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <label className="block text-white mb-2">Any health conditions we should know about?</label>
              <textarea
                name="healthConditions"
                value={formData.healthConditions}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete & Go to Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Questionnaire; 