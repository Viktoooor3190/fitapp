import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

const NewProgramPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hybrid',
    duration: '',
    difficulty: 'intermediate',
    status: 'active',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a program');
      return;
    }
    
    if (!formData.name || !formData.description) {
      setError('Name and description are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a new document ID
      const newProgramRef = doc(db, 'programs', `program_${Date.now()}`);
      
      // Create the program document
      await setDoc(newProgramRef, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        duration: formData.duration,
        difficulty: formData.difficulty,
        status: formData.status,
        coachId: user.uid,
        clientsEnrolled: [],
        workouts: [],
        nutritionPlan: [],
        progressTracking: { avgCompletionRate: "0%" },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isTemplate: false
      });
      
      // Navigate back to programs list
      navigate('/dashboard/programs');
      
    } catch (err) {
      console.error('Error creating program:', err);
      setError('Failed to create program. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => navigate('/dashboard/programs')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Program
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design a new training program for your clients
            </p>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., Weight Loss Pro"
                required
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Describe your program..."
                rows={3}
                required
              />
            </div>
            
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hybrid">Hybrid</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., 8 weeks"
              />
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Program
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProgramPage; 