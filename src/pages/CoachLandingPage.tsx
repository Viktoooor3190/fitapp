import { useAuth } from '../contexts/AuthContext';
import { useSubdomain } from '../contexts/SubdomainContext';
import { Link } from 'react-router-dom';

const CoachLandingPage = () => {
  const { user } = useAuth();
  const { coachId } = useSubdomain();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Your Personal Fitness Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join our community and get personalized coaching to achieve your fitness goals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-lg font-semibold"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachLandingPage; 