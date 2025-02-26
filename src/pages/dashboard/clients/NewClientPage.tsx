import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { useProgramData } from '../../../hooks/useProgramData';
import { ArrowLeft, Save } from 'lucide-react';

const NewClientPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { programs, loading: programsLoading } = useProgramData();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    programId: '',
    status: 'active',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a client');
      return;
    }
    
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a new document ID
      const newClientRef = doc(db, 'clients', `client_${Date.now()}`);
      
      // Create the client document
      await setDoc(newClientRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        programId: formData.programId,
        status: formData.status,
        coachId: user.uid,
        progress: {},
        upcomingSessions: [],
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
        isTemplate: false
      });
      
      // If a program is selected, update the program's clientsEnrolled array
      if (formData.programId) {
        const programRef = doc(db, 'programs', formData.programId);
        // Note: This is a simplified approach. In a production app, you might want to use
        // a transaction or batch write to ensure both operations succeed or fail together.
        // await updateDoc(programRef, {
        //   clientsEnrolled: arrayUnion(newClientRef.id)
        // });
      }
      
      // Navigate back to clients list
      navigate('/dashboard/clients');
      
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
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
            onClick={() => navigate('/dashboard/clients')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Client
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new client profile
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Client's full name"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="client@example.com"
                required
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="+1 234 567 8900"
              />
            </div>
            
            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program
              </label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={programsLoading}
              >
                <option value="">No Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
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
                <option value="inactive">Inactive</option>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientPage; 