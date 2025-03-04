import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, firestore } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Instagram, Globe, Target, Users } from 'lucide-react';
import { slugify, generateRandomString } from "../utils/stringUtils";

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    website: '',
    instagram: '',
    specialties: '',
    clientCount: '',
    goals: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const generateSubdomain = (businessName: string): string => {
    // Convert business name to lowercase, remove special chars, replace spaces with hyphens
    let subdomain = slugify(businessName);
    
    // Ensure it starts with 'coach-' if it doesn't already start with 'coach'
    if (!subdomain.startsWith('coach')) {
      subdomain = `coach-${subdomain}`;
    }
    
    return subdomain;
  };

  // Update subdomain preview when business name changes
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const businessName = e.target.value;
    setFormData({ ...formData, businessName });
    
    if (businessName) {
      const generatedSubdomain = generateSubdomain(businessName);
      setSubdomain(generatedSubdomain);
    } else {
      setSubdomain('');
    }
  };

  // Check if a subdomain is available
  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    try {
      // Check if subdomain exists in the subdomains collection
      const subdomainDoc = await getDoc(doc(firestore, 'subdomains', subdomain));
      return !subdomainDoc.exists();
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      throw error;
    }
  };

  // Generate a unique subdomain by adding a random suffix if needed
  const generateUniqueSubdomain = async (businessName: string): Promise<string> => {
    let subdomain = generateSubdomain(businessName);
    let isAvailable = await checkSubdomainAvailability(subdomain);
    
    // If the subdomain is not available, add a random suffix
    if (!isAvailable) {
      const randomSuffix = generateRandomString(4);
      subdomain = `${subdomain}-${randomSuffix}`;
      isAvailable = await checkSubdomainAvailability(subdomain);
      
      // If still not available (very unlikely), try again with a longer suffix
      if (!isAvailable) {
        const longerSuffix = generateRandomString(8);
        subdomain = `${generateSubdomain(businessName)}-${longerSuffix}`;
      }
    }
    
    return subdomain;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // Generate a unique subdomain from business name
      const subdomain = await generateUniqueSubdomain(formData.businessName);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // Create coach document
      const coachRef = doc(db, 'coaches', userCredential.user.uid);
      await setDoc(coachRef, {
        name: formData.name,
        businessName: formData.businessName,
        email: formData.email,
        website: formData.website,
        instagram: formData.instagram,
        specialties: formData.specialties,
        clientCount: formData.clientCount,
        goals: formData.goals,
        createdAt: serverTimestamp(),
        status: 'pending',
        clients: [],
        programs: [],
        revenue: { total: 0, monthly: 0 },
        settings: { notifications: true, darkMode: false },
        profilePicture: "",
        subdomain: subdomain // Add subdomain to coach document
      });
      
      // Create user document with role
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      
      // First, check if the user document already exists (created by Cloud Function)
      const existingUserDoc = await getDoc(userRef);
      
      if (existingUserDoc.exists()) {
        console.log("[SignUp] User document already exists, updating with coach role:", existingUserDoc.data());
        
        // Update the existing document with the coach role and other fields
        await updateDoc(userRef, {
          displayName: formData.name,
          subdomain: subdomain,
          role: 'coach',
          isActive: true,
          profileComplete: false,
          updatedAt: serverTimestamp()
        });
      } else {
        console.log("[SignUp] Creating new user document with role 'coach'");
        
        // Create a new user document
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: formData.email,
          displayName: formData.name,
          subdomain: subdomain,
          role: 'coach',
          createdAt: serverTimestamp(),
          isActive: true,
          profileComplete: false
        });
      }
      
      console.log("[SignUp] User document set with role 'coach'");
      
      // Verify user document was updated correctly
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        console.log("[SignUp] Verified user document:", userDoc.data());
      } else {
        console.error("[SignUp] Failed to verify user document");
      }
      
      // Add an additional check after a short delay to ensure the role is set correctly
      setTimeout(async () => {
        try {
          const finalUserDoc = await getDoc(userRef);
          if (finalUserDoc.exists()) {
            const userData = finalUserDoc.data();
            console.log("[SignUp] Final user document check:", userData);
            
            // If the role is still not 'coach', update it again
            if (userData.role !== 'coach') {
              console.log("[SignUp] Role is not 'coach', updating again");
              await updateDoc(userRef, {
                role: 'coach',
                updatedAt: serverTimestamp()
              });
            }
          }
        } catch (err) {
          console.error("[SignUp] Error in final user document check:", err);
        }
      }, 2000); // 2 second delay
      
      // Create a separate subdomain document for faster lookups
      await setDoc(doc(firestore, 'subdomains', subdomain), {
        userId: userCredential.user.uid,
        subdomain: subdomain,
        businessName: formData.businessName,
        createdAt: serverTimestamp(),
        isActive: true
      });
      
      // Initialize empty collections for the coach (except clients)
      const programsCollectionRef = doc(db, 'programs', `${userCredential.user.uid}_placeholder`);
      const sessionsCollectionRef = doc(db, 'sessions', `${userCredential.user.uid}_placeholder`);
      const messagesCollectionRef = doc(db, 'messages', `${userCredential.user.uid}_placeholder`);
      const revenueCollectionRef = doc(db, 'revenue', `${userCredential.user.uid}_placeholder`);
      const reportsCollectionRef = doc(db, 'reports', `${userCredential.user.uid}_placeholder`);
      
      // Create placeholder documents to establish the collections
      await Promise.all([
        setDoc(programsCollectionRef, { placeholder: true }),
        setDoc(sessionsCollectionRef, { placeholder: true }),
        setDoc(messagesCollectionRef, { placeholder: true }),
        setDoc(revenueCollectionRef, { placeholder: true }),
        setDoc(reportsCollectionRef, { placeholder: true, 
          coachId: userCredential.user.uid,
          clientRetentionRate: "0%",
          avgSessionRating: "0/5",
          clientGoalAchievement: "0%",
          engagementMetrics: { 
            workoutCompletionRate: "0%", 
            sessionAttendance: "0%", 
            appUsage: "0%" 
          }
        })
      ]);

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2b] pt-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[900px] mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Join FitApp and Grow Your Coaching Business
            </h1>
            <p className="text-xl text-gray-400">
              We work with dedicated fitness coaches to provide them with the tools they need to train clients, 
              automate programs, and expand their brand.
            </p>
          </div>

          <div className="bg-[#1e2433] rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h2 className="ml-4 text-2xl font-semibold text-white">
                Tell Us About You
              </h2>
            </div>
            <p className="text-gray-400 mb-8">
              Fill out the form below, and our team will personally reach out to help you set up your coaching platform.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleBusinessNameChange}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Fitness Brand"
                  />
                  {subdomain && (
                    <div className="mt-2 text-sm text-gray-400">
                      Your subdomain will be: <span className="text-blue-400 font-medium">{subdomain}.yourdomain.com</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram Handle
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your website"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Coaching Specialties
                    </div>
                  </label>
                  <textarea
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What type of training do you specialize in? (e.g., Strength Training, Weight Loss, Athletic Performance)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Current Number of Clients
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.clientCount}
                    onChange={(e) => setFormData({ ...formData, clientCount: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Goals
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What are your main goals for your coaching business?"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-[#252b3b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-500 hover:text-blue-400">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-500 hover:text-blue-400">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.agreeToTerms}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp; 