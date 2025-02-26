import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Edit, Trash2, Users, Calendar, Clock, Activity } from 'lucide-react';
import { useProgramData, Program } from '../../../hooks/useProgramData';
import { useClientData } from '../../../hooks/useClientData';

const ProgramDetailsPage = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { programsMap, loading: programsLoading } = useProgramData();
  const { clients } = useClientData();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Get enrolled clients
  const enrolledClients = clients.filter(client => 
    program?.clientsEnrolled?.includes(client.id)
  );
  
  useEffect(() => {
    if (!programId || !user) return;
    
    // If we already have the program in our map, use it
    if (programsMap[programId]) {
      setProgram(programsMap[programId]);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch it directly
    const fetchProgram = async () => {
      try {
        const programDoc = await getDoc(doc(db, 'programs', programId));
        
        if (programDoc.exists()) {
          const programData = programDoc.data();
          
          // Verify this program belongs to the current coach
          if (programData.coachId !== user.uid) {
            setError('You do not have permission to view this program');
            setLoading(false);
            return;
          }
          
          setProgram({
            id: programDoc.id,
            name: programData.name || '',
            description: programData.description || '',
            type: programData.type || 'custom',
            duration: programData.duration || '',
            difficulty: programData.difficulty || 'intermediate',
            status: programData.status || 'draft',
            coachId: programData.coachId,
            clientsEnrolled: programData.clientsEnrolled || [],
            workouts: programData.workouts || [],
            nutritionPlan: programData.nutritionPlan || [],
            lastUpdated: programData.lastUpdated ? new Date(programData.lastUpdated.seconds * 1000) : new Date(),
            createdAt: programData.createdAt ? new Date(programData.createdAt.seconds * 1000) : new Date(),
          });
        } else {
          setError('Program not found');
        }
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Failed to load program details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgram();
  }, [programId, user, programsMap]);
  
  const handleDelete = async () => {
    if (!programId || !user) return;
    
    try {
      await deleteDoc(doc(db, 'programs', programId));
      navigate('/dashboard/programs');
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program');
    }
  };
  
  const handleStatusChange = async (newStatus: 'active' | 'draft') => {
    if (!programId || !user || !program) return;
    
    try {
      await updateDoc(doc(db, 'programs', programId), {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
      
      setProgram({
        ...program,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating program status:', err);
      setError('Failed to update program status');
    }
  };
  
  if (loading || programsLoading) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading program details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full p-6">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
        <button 
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => navigate('/dashboard/programs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </button>
      </div>
    );
  }
  
  if (!program) {
    return (
      <div className="h-full p-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 p-4 rounded-lg">
          Program not found
        </div>
        <button 
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => navigate('/dashboard/programs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </button>
      </div>
    );
  }
  
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
              {program.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {program.description}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => navigate(`/dashboard/programs/edit/${programId}`)}
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setDeleteConfirm(true)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Program Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Activity className="w-5 h-5 mr-2" />
                <span>Type</span>
              </div>
              <span className="text-gray-900 dark:text-white capitalize">
                {program.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Duration</span>
              </div>
              <span className="text-gray-900 dark:text-white">
                {program.duration || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5 mr-2" />
                <span>Difficulty</span>
              </div>
              <span className="text-gray-900 dark:text-white capitalize">
                {program.difficulty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5 mr-2" />
                <span>Clients Enrolled</span>
              </div>
              <span className="text-gray-900 dark:text-white">
                {enrolledClients.length}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    program.status === 'active'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {program.status}
                  </span>
                  <select
                    value={program.status}
                    onChange={(e) => handleStatusChange(e.target.value as 'active' | 'draft')}
                    className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enrolled Clients
          </h3>
          {enrolledClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No clients enrolled
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Assign this program to clients to see them here
              </p>
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/dashboard/clients')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Clients
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {enrolledClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${client.progress?.weightLoss || '0'}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Program
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{program.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetailsPage; 