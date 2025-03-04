import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db, firestore } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { useSubdomain } from "../contexts/SubdomainContext";
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useCoachSubdomain } from "../hooks/useCoach1Subdomain";

const ClientSignUp = () => {
  const navigate = useNavigate();
  const { subdomain, coachId } = useSubdomain();
  const { isCoachSubdomain, coachSubdomain, coachData } = useCoachSubdomain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [effectiveCoachId, setEffectiveCoachId] = useState<string | null>(null);
  const [effectiveSubdomain, setEffectiveSubdomain] = useState<string | null>(null);

  // Create Google Provider instance
  const googleProvider = new GoogleAuthProvider();

  // Determine the effective coach ID and subdomain to use
  useEffect(() => {
    // Log the current state for debugging
    console.log("[ClientSignUp] SubdomainContext values:", { subdomain, coachId });
    console.log("[ClientSignUp] CoachSubdomain values:", { 
      isCoachSubdomain, 
      coachSubdomain, 
      coachId: coachData?.id 
    });
    console.log("[ClientSignUp] Current hostname:", window.location.hostname);
    console.log("[ClientSignUp] Current pathname:", window.location.pathname);
    
    // Use the coachId from SubdomainContext if available
    if (coachId) {
      setEffectiveCoachId(coachId);
      setEffectiveSubdomain(subdomain);
      console.log("[ClientSignUp] Using coachId from SubdomainContext:", coachId);
    } 
    // Fallback to the coachId from useCoachSubdomain if available
    else if (isCoachSubdomain && coachData?.id) {
      setEffectiveCoachId(coachData.id);
      setEffectiveSubdomain(coachSubdomain);
      console.log("[ClientSignUp] Using coachId from useCoachSubdomain:", coachData.id);
    } else {
      setEffectiveCoachId(null);
      setEffectiveSubdomain(null);
      console.log("[ClientSignUp] No coach ID available from either context");
      
      // Additional fallback for local development
      if (window.location.hostname.includes('coach')) {
        console.log("[ClientSignUp] Detected coach in hostname, attempting fallback");
        // Extract coach number from hostname
        const match = window.location.hostname.match(/coach(\d+)/);
        if (match && match[1]) {
          const coachNumber = match[1];
          const fallbackCoachId = `test-coach-id-${coachNumber}`;
          console.log(`[ClientSignUp] Using fallback coachId: ${fallbackCoachId}`);
          setEffectiveCoachId(fallbackCoachId);
          setEffectiveSubdomain(`coach${coachNumber}`);
        }
      }
    }
  }, [subdomain, coachId, isCoachSubdomain, coachSubdomain, coachData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      console.log("[ClientSignUp] Starting user registration with coach connection:", {
        effectiveCoachId,
        effectiveSubdomain
      });

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // Create client profile
      const clientRef = doc(db, 'clients', userCredential.user.uid);
      await setDoc(clientRef, {
        name: formData.name,
        email: formData.email,
        coachId: effectiveCoachId,
        registeredViaSubdomain: effectiveSubdomain,
        createdAt: serverTimestamp(),
        status: 'pending',
        onboardingCompleted: false,
        role: 'client'
      });

      console.log("[ClientSignUp] Created client document with coachId:", effectiveCoachId);

      // Verify client document was created correctly
      const clientDoc = await getDoc(clientRef);
      if (clientDoc.exists()) {
        console.log("[ClientSignUp] Verified client document:", clientDoc.data());
      } else {
        console.error("[ClientSignUp] Failed to verify client document");
      }

      // Create user document with role 'client'
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      
      // First, check if the user document already exists (created by Cloud Function)
      const existingUserDoc = await getDoc(userRef);
      
      if (existingUserDoc.exists()) {
        console.log("[ClientSignUp] User document already exists, updating with client role:", existingUserDoc.data());
        
        // Update the existing document with the client role and other fields
        await updateDoc(userRef, {
          displayName: formData.name,
          role: 'client',
          coachId: effectiveCoachId,
          registeredViaSubdomain: effectiveSubdomain,
          isActive: true,
          profileComplete: false,
          updatedAt: serverTimestamp()
        });
      } else {
        console.log("[ClientSignUp] Creating new user document with role 'client'");
        
        // Create a new user document
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: formData.email,
          displayName: formData.name,
          role: 'client',
          coachId: effectiveCoachId,
          registeredViaSubdomain: effectiveSubdomain,
          createdAt: serverTimestamp(),
          isActive: true,
          profileComplete: false
        });
      }

      console.log("[ClientSignUp] User document set with role 'client'");

      // Verify user document was updated correctly
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        console.log("[ClientSignUp] Verified user document:", userDoc.data());
      } else {
        console.error("[ClientSignUp] Failed to verify user document");
      }

      // Add an additional check after a short delay to ensure the role is set correctly
      setTimeout(async () => {
        try {
          const finalUserDoc = await getDoc(userRef);
          if (finalUserDoc.exists()) {
            const userData = finalUserDoc.data();
            console.log("[ClientSignUp] Final user document check:", userData);
            
            // If the role is still not 'client', update it again
            if (userData.role !== 'client') {
              console.log("[ClientSignUp] Role is not 'client', updating again");
              await updateDoc(userRef, {
                role: 'client',
                updatedAt: serverTimestamp()
              });
            }
          }
        } catch (err) {
          console.error("[ClientSignUp] Error in final user document check:", err);
        }
      }, 2000); // 2 second delay

      // Add client to coach's clients array if there's a coach ID
      if (effectiveCoachId) {
        const coachRef = doc(db, 'coaches', effectiveCoachId);
        
        // Check if coach document exists
        const coachDoc = await getDoc(coachRef);
        if (coachDoc.exists()) {
          console.log("[ClientSignUp] Coach document exists:", coachDoc.data());
          await updateDoc(coachRef, {
            clients: arrayUnion(userCredential.user.uid)
          });
          console.log("[ClientSignUp] Added client to coach's clients array:", effectiveCoachId);
        } else {
          console.error("[ClientSignUp] Coach document does not exist for ID:", effectiveCoachId);
        }
      } else {
        console.warn("[ClientSignUp] No coach ID available, client not linked to any coach");
      }

      navigate('/onboarding');
    } catch (err) {
      console.error("[ClientSignUp] Registration error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log("[ClientSignUp] Starting Google sign-in with coach connection:", {
        effectiveCoachId,
        effectiveSubdomain
      });

      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Create client profile for Google sign-in
        const clientRef = doc(db, 'clients', result.user.uid);
        await setDoc(clientRef, {
          name: result.user.displayName || '',
          email: result.user.email || '',
          coachId: effectiveCoachId,
          registeredViaSubdomain: effectiveSubdomain,
          createdAt: serverTimestamp(),
          status: 'pending',
          onboardingCompleted: false,
          role: 'client'
        });

        console.log("[ClientSignUp] Created client document with coachId:", effectiveCoachId);

        // Create user document with role 'client'
        const userRef = doc(firestore, 'users', result.user.uid);
        
        // First, check if the user document already exists (created by Cloud Function)
        const existingUserDoc = await getDoc(userRef);
        
        if (existingUserDoc.exists()) {
          console.log("[ClientSignUp] User document already exists, updating with client role:", existingUserDoc.data());
          
          // Update the existing document with the client role and other fields
          await updateDoc(userRef, {
            displayName: result.user.displayName || '',
            role: 'client',
            coachId: effectiveCoachId,
            registeredViaSubdomain: effectiveSubdomain,
            isActive: true,
            profileComplete: false,
            updatedAt: serverTimestamp()
          });
        } else {
          console.log("[ClientSignUp] Creating new user document with role 'client'");
          
          // Create a new user document
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || '',
            role: 'client',
            coachId: effectiveCoachId,
            registeredViaSubdomain: effectiveSubdomain,
            createdAt: serverTimestamp(),
            isActive: true,
            profileComplete: false
          });
        }

        console.log("[ClientSignUp] User document set with role 'client'");

        // Verify user document was updated correctly
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          console.log("[ClientSignUp] Verified user document:", userDoc.data());
        } else {
          console.error("[ClientSignUp] Failed to verify user document");
        }

        // Add an additional check after a short delay to ensure the role is set correctly
        setTimeout(async () => {
          try {
            const finalUserDoc = await getDoc(userRef);
            if (finalUserDoc.exists()) {
              const userData = finalUserDoc.data();
              console.log("[ClientSignUp] Final user document check:", userData);
              
              // If the role is still not 'client', update it again
              if (userData.role !== 'client') {
                console.log("[ClientSignUp] Role is not 'client', updating again");
                await updateDoc(userRef, {
                  role: 'client',
                  updatedAt: serverTimestamp()
                });
              }
            }
          } catch (err) {
            console.error("[ClientSignUp] Error in final user document check:", err);
          }
        }, 2000); // 2 second delay

        // Add client to coach's clients array if there's a coach ID
        if (effectiveCoachId) {
          const coachRef = doc(db, 'coaches', effectiveCoachId);
          await updateDoc(coachRef, {
            clients: arrayUnion(result.user.uid)
          });
          console.log("[ClientSignUp] Added client to coach's clients array:", effectiveCoachId);
        } else {
          console.warn("[ClientSignUp] No coach ID available, client not linked to any coach");
        }

        navigate('/onboarding');
      }
    } catch (err) {
      console.error("[ClientSignUp] Google Sign In Error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred during Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Display coach information if available
  const renderCoachInfo = () => {
    if (effectiveCoachId && (effectiveSubdomain || isCoachSubdomain)) {
      return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
          You're signing up with {coachData?.name || `a coach (${effectiveSubdomain})`}. 
          Your account will be automatically connected to their coaching services.
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#1a1f2b] pt-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Fitness Journey
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your account to get personalized coaching
            </p>
          </div>

          {renderCoachInfo()}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Log in
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientSignUp; 