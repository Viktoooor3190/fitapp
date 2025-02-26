import { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, 
  MoreVertical, Mail, Phone 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientData, Client } from '../../../hooks/useClientData';
import { useProgramData } from '../../../hooks/useProgramData';

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  // Fetch client and program data
  const { clients, loading: clientsLoading, error: clientsError } = useClientData();
  const { programsMap, loading: programsLoading } = useProgramData();
  
  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filter by status
      if (filter !== 'all' && client.status !== filter) {
        return false;
      }
      
      // Search by name or email
      if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !client.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [clients, filter, searchTerm]);
  
  // Calculate progress percentage for display
  const getProgressPercentage = (client: Client) => {
    if (!client.progress) return 0;
    
    // This is a simplified example - adjust based on your actual progress structure
    if (typeof client.progress === 'object' && client.progress.weightLoss) {
      // If progress is stored as percentages like "60%"
      return parseInt(client.progress.weightLoss, 10) || 0;
    }
    
    // Default fallback
    return 0;
  };
  
  // Get program name from program ID
  const getProgramName = (programId: string) => {
    if (!programId) return 'No Program';
    return programsMap[programId]?.name || 'Unknown Program';
  };

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your clients and their programs
          </p>
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/dashboard/clients/new')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Client
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
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
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {(clientsLoading || programsLoading) && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
        </div>
      )}

      {/* Error State */}
      {clientsError && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {clientsError}
        </div>
      )}

      {/* Empty State */}
      {!clientsLoading && !clientsError && filteredClients.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter' 
              : 'Get started by adding your first client'}
          </p>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/dashboard/clients/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Client
          </button>
        </div>
      )}

      {/* Clients Table */}
      {!clientsLoading && !clientsError && filteredClients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {getProgramName(client.programId)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getProgressPercentage(client)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getProgressPercentage(client)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add actions menu logic here
                      }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsPage; 