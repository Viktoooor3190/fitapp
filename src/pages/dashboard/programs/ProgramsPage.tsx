import { useState } from 'react';
import { 
  Activity, Search, Filter, Plus, 
  MoreVertical, Calendar, Users, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp, cardHover } from '../../../animations/dashboard';

interface Program {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'hybrid' | 'custom';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  clientCount: number;
  status: 'active' | 'draft';
  lastUpdated: string;
}

const ProgramsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Dummy data - replace with Firestore data later
  const programs: Program[] = [
    {
      id: '1',
      name: 'Weight Loss Pro',
      description: 'Complete weight loss program with nutrition guide',
      type: 'hybrid',
      duration: '12 weeks',
      difficulty: 'intermediate',
      clientCount: 15,
      status: 'active',
      lastUpdated: '2024-02-20'
    },
    {
      id: '2',
      name: 'Strength Builder',
      description: 'Progressive overload strength training',
      type: 'strength',
      duration: '8 weeks',
      difficulty: 'advanced',
      clientCount: 8,
      status: 'active',
      lastUpdated: '2024-02-18'
    },
    // Add more programs as needed
  ];

  return (
    <motion.div 
      className="h-full p-6"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Programs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your training programs
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create Program
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search programs..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Programs</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={fadeInUp}
      >
        {programs.map((program) => (
          <motion.div
            key={program.id}
            variants={fadeInUp}
            {...cardHover}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {program.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {program.description}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  {program.duration}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  program.status === 'active'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {program.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  {program.clientCount} clients
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {program.difficulty}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ProgramsPage; 