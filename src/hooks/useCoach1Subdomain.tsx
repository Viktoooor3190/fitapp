import { useState, useEffect } from 'react';

/**
 * Custom hook to handle coach subdomains in local development
 * This is a workaround for the main subdomain detection issues
 */
export const useCoachSubdomain = () => {
  const [coachSubdomain, setCoachSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Extract the subdomain from the hostname
    const hostname = window.location.hostname;
    
    // Check if we're on a coach subdomain (e.g., coach1.localhost, coach2.localhost, coach-milos.localhost)
    const isLocalhost = hostname.endsWith('.localhost');
    
    if (isLocalhost) {
      const parts = hostname.split('.');
      if (parts.length > 1) {
        const subdomain = parts[0];
        // Check if it starts with 'coach'
        if (subdomain.startsWith('coach')) {
          console.log(`[useCoachSubdomain] Detected coach subdomain: ${subdomain}`);
          setCoachSubdomain(subdomain);
        }
      }
    }
    
    // Set loading to false after a short delay
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Return mock coach data for the detected coach subdomain
  const coachData = coachSubdomain ? {
    id: `${coachSubdomain}-id`,
    name: formatCoachName(coachSubdomain),
    subdomain: coachSubdomain,
    email: `${coachSubdomain.replace('-', '.')}@example.com`,
    profileImage: `https://randomuser.me/api/portraits/${coachSubdomain === 'coach1' ? 'men' : 'women'}/1.jpg`,
    bio: "Professional fitness coach with experience in various training methods",
    specialties: ["Weight Loss", "Strength Training", "Nutrition"],
    active: true
  } : null;
  
  return {
    isCoachSubdomain: !!coachSubdomain,
    coachSubdomain,
    isLoading,
    coachData
  };
};

/**
 * Helper function to format coach name from subdomain
 * Handles cases like "coach1" -> "Coach 1" and "coach-milos" -> "Coach Milos"
 */
function formatCoachName(subdomain: string): string {
  // Remove 'coach' prefix
  let name = subdomain.replace(/^coach/, '');
  
  // Handle hyphenated names (e.g., coach-milos -> Milos)
  if (name.startsWith('-')) {
    name = name.substring(1); // Remove the leading hyphen
  }
  
  // Capitalize first letter of each word
  name = name.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  
  // Handle numeric names (e.g., coach1 -> Coach 1)
  if (/^\d+$/.test(name)) {
    name = `Coach ${name}`;
  } else {
    name = `Coach ${name}`;
  }
  
  return name;
} 