import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1f2b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Start Your Fitness Journey
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Choose your role to get started
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/coach-signup')}
            className="w-full flex items-center p-4 bg-[#1e2433] rounded-lg hover:bg-[#252b3b] transition-all duration-200"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="ml-4 text-left">
              <h2 className="text-white text-lg font-semibold">
                I'm a Coach
              </h2>
              <p className="text-gray-400 text-sm">
                Create and manage workout plans for clients
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/client-signup')}
            className="w-full flex items-center p-4 bg-[#1e2433] rounded-lg hover:bg-[#252b3b] transition-all duration-200"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="ml-4 text-left">
              <h2 className="text-white text-lg font-semibold">
                I'm Looking for Training
              </h2>
              <p className="text-gray-400 text-sm">
                Get personalized workouts and coaching
              </p>
            </div>
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-3 w-full inline-flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-[#1e2433] hover:bg-[#252b3b] transition-all duration-200"
          >
            Log in to your account
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 