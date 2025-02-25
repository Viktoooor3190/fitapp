import { useSubdomain } from '../contexts/SubdomainContext';

export const SubdomainDebug = () => {
  const { subdomain, coachId, isCoachDomain } = useSubdomain();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      <div>Subdomain: {subdomain || 'none'}</div>
      <div>Coach ID: {coachId || 'none'}</div>
      <div>Is Coach Domain: {isCoachDomain ? 'yes' : 'no'}</div>
      <div>Hostname: {window.location.hostname}</div>
    </div>
  );
}; 