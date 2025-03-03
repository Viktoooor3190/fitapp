import React, { useEffect, useState } from 'react';
import { useSubdomain } from '../contexts/SubdomainContext';

interface SubdomainMiddlewareProps {
  children: React.ReactNode;
}

/**
 * Middleware component that ensures subdomain detection works correctly
 * This component is no longer needed as we're using Coach1Handler,
 * but we'll keep it as a reference for future subdomain handling
 */
export const SubdomainMiddleware: React.FC<SubdomainMiddlewareProps> = ({ children }) => {
  const { loading, subdomain } = useSubdomain();
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Set ready after subdomain context has loaded
    if (!loading) {
      setReady(true);
    }
    
    // Fallback: ensure we don't get stuck in loading state
    const timeout = setTimeout(() => {
      if (!ready) {
        setReady(true);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [loading, ready]);

  // Simply render children - actual subdomain handling is now in Coach1Handler
  return <>{children}</>;
}; 