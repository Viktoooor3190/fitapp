import { useSubdomain } from '../contexts/SubdomainContext';
import { useEffect, useState } from 'react';
import { useCoachSubdomain } from '../hooks/useCoach1Subdomain';

export const SubdomainDebug = () => {
  const { subdomain, coachId, coachData, isCoachDomain, loading, error } = useSubdomain();
  const { isCoachSubdomain, coachSubdomain, coachData: coachSubdomainData } = useCoachSubdomain();
  const [isUsingCoachHandler, setIsUsingCoachHandler] = useState(false);

  // Log debug info on mount and when values change
  useEffect(() => {
    console.log('[SubdomainDebug] Current state:', {
      subdomain,
      coachId,
      isCoachDomain,
      loading,
      error,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      isCoachSubdomain,
      coachSubdomain,
      isUsingCoachHandler
    });
    
    // Check if we're using the CoachSubdomainHandler
    if (isCoachSubdomain && !subdomain) {
      setIsUsingCoachHandler(true);
    }
  }, [subdomain, coachId, isCoachDomain, loading, error, isCoachSubdomain, coachSubdomain]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Check if we're on a coach subdomain but subdomain detection failed
  const isCoachLocalhostWithoutSubdomain = 
    !subdomain && 
    window.location.hostname.endsWith('.localhost') &&
    window.location.hostname.split('.')[0].startsWith('coach');

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-md overflow-auto max-h-96">
      <div className="font-bold mb-2">Subdomain Debug</div>
      <div>Status: {loading ? 'Loading...' : 'Ready'}</div>
      <div>Subdomain: {subdomain || 'none'}</div>
      <div>Coach ID: {coachId || (isUsingCoachHandler ? `Using ${coachSubdomain} Handler` : 'none')}</div>
      <div>Is Coach Domain: {isCoachDomain || isUsingCoachHandler ? 'yes' : 'no'}</div>
      <div>Hostname: {window.location.hostname}</div>
      <div>Path: {window.location.pathname}</div>
      
      {error && <div className="text-red-400">Error: {error}</div>}
      
      {isUsingCoachHandler && (
        <div className="mt-2 text-green-300">
          <div>✅ Using {coachSubdomain} Handler workaround</div>
          <div>The main subdomain detection failed, but we're using a special handler for {coachSubdomain}.localhost</div>
        </div>
      )}
      
      {!subdomain && window.location.hostname === 'localhost' && (
        <div className="mt-2 text-yellow-300">
          <div>No subdomain detected. To test with a subdomain:</div>
          <div className="mt-1">• Use coach1.localhost:3000 instead of localhost:3000</div>
          <div>• Make sure your hosts file is configured correctly</div>
        </div>
      )}
      
      {isCoachLocalhostWithoutSubdomain && !isUsingCoachHandler && (
        <div className="mt-2 text-red-300">
          <div>You're on a coach subdomain but subdomain detection failed!</div>
          <div className="mt-1">• Try clearing your browser cache and refreshing</div>
          <div>• Check browser console for debugging info</div>
        </div>
      )}
      
      {subdomain && !coachId && !isUsingCoachHandler && (
        <div className="mt-2 text-yellow-300">
          <div>Subdomain detected but no coach found.</div>
          <div className="mt-1">• Check if "{subdomain}" is a valid coach subdomain</div>
          <div>• Verify the coach exists in the database</div>
        </div>
      )}
      
      {(coachData || (isUsingCoachHandler && coachSubdomainData)) && (
        <div className="mt-2">
          <div className="font-bold">Coach Data:</div>
          <pre className="text-xs mt-1 overflow-auto">
            {JSON.stringify(isUsingCoachHandler ? coachSubdomainData : coachData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 