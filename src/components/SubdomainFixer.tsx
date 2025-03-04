import React, { useState } from 'react';
import { createTestCoach } from '../utils/createTestCoach';
import { getSubdomain } from '../utils/subdomain';

const SubdomainFixer: React.FC = () => {
  const [coachId, setCoachId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  
  const currentSubdomain = getSubdomain();

  const handleFixSubdomain = async () => {
    if (!currentSubdomain) {
      setResult({
        success: false,
        error: 'No subdomain detected. Please access this page using a subdomain.'
      });
      return;
    }

    if (!coachId) {
      setResult({
        success: false,
        error: 'Please enter a coach ID.'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createTestCoach(
        currentSubdomain, 
        coachId,
        businessName || 'Test Business'
      );
      setResult(result);
      
      if (result.success) {
        // Reload the page after 2 seconds to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentSubdomain) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Subdomain Fixer</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {expanded && (
        <div className="space-y-4">
          <p className="text-sm">
            This tool will create or update a coach with the current subdomain: 
            <span className="font-bold ml-1">{currentSubdomain}</span>
          </p>
          
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Coach ID
              </label>
              <input
                type="text"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                placeholder="Enter coach ID"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Business Name (optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
              />
            </div>
            
            <button
              onClick={handleFixSubdomain}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md text-white font-medium text-sm"
            >
              {loading ? 'Processing...' : 'Fix Subdomain'}
            </button>
          </div>
          
          {result && (
            <div className={`mt-4 p-3 rounded-md text-sm ${result.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {result.success ? (
                <div>
                  <p className="font-medium text-green-400">Success!</p>
                  <p className="mt-1">{result.message}</p>
                  <p className="mt-2 text-xs">Reloading page in 2 seconds...</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-400">Error</p>
                  <p className="mt-1">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubdomainFixer; 