import React, { useEffect } from 'react';
import { useCoachSubdomain } from '../hooks/useCoach1Subdomain';
import { useSubdomain } from '../contexts/SubdomainContext';

interface CoachSubdomainHandlerProps {
  children: React.ReactNode;
}

/**
 * Special handler component for coach subdomains
 * This component provides a workaround for the main subdomain detection
 * by using the useCoachSubdomain hook to detect any coach*.localhost
 */
export const CoachSubdomainHandler: React.FC<CoachSubdomainHandlerProps> = ({ children }) => {
  const { isCoachSubdomain, coachSubdomain, isLoading } = useCoachSubdomain();
  const { subdomain } = useSubdomain();
  
  // Log warning if subdomain detection fails but we're on a coach subdomain
  useEffect(() => {
    if (isCoachSubdomain && !subdomain && !isLoading) {
      console.warn(
        `CoachSubdomainHandler: Main subdomain detection failed, but CoachSubdomainHandler detected ${coachSubdomain}. ` +
        `Using CoachSubdomainHandler as fallback for ${coachSubdomain}.localhost`
      );
    }
  }, [isCoachSubdomain, coachSubdomain, subdomain, isLoading]);
  
  // Show a loading indicator while the coach subdomain detection is in progress
  if (isLoading && isCoachSubdomain) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading coach portal...</p>
        </div>
      </div>
    );
  }
  
  // Add a small debug overlay in development mode
  const showDebugBadge = process.env.NODE_ENV === 'development' && isCoachSubdomain;
  
  return (
    <>
      {children}
      
      {showDebugBadge && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-50">
          ✓ {coachSubdomain} Handler Active
        </div>
      )}
    </>
  );
};

// For backward compatibility
export const Coach1Handler = CoachSubdomainHandler; 