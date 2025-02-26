import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, Clock, Activity, Users } from 'lucide-react';
import { useProgramData, Program } from '../../../hooks/useProgramData';
import { useClientData } from '../../../hooks/useClientData';

const ProgramsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { programs, loading, error } = useProgramData();
  const { clients } = useClientData();

  // Filter programs based on search term and filter
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && program.status === 'active';
    if (filter === 'draft') return matchesSearch && program.status === 'draft';
    
    return matchesSearch;
  });

  // Get client count for each program
  const getClientCount = (program: Program) => {
    return program.clientsEnrolled?.length || 0;
  };

  // Handle card click
  const handleProgramClick = (programId: string) => {
    navigate(`/dashboard/programs/${programId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading programs...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="h-full p-6">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Programs</h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/dashboard/programs/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Program
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Programs</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No programs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter !== 'all'
              ? "No programs match your search criteria. Try adjusting your filters."
              : "You haven't created any programs yet. Get started by creating your first program."}
          </p>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/dashboard/programs/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProgramClick(program.id)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {program.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      program.status === 'active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                  >
                    {program.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                  {program.description || 'No description provided'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Activity className="w-4 h-4 mr-2" />
                    <span className="text-sm capitalize">{program.type || 'Custom'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{program.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm capitalize">{program.difficulty}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{getClientCount(program)} clients</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsPage; 