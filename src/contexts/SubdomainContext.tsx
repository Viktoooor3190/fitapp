import { createContext, useContext, useEffect, useState } from 'react';
import { getSubdomain, getCoachIdFromSubdomain } from '../utils/subdomain';

interface SubdomainContextType {
  subdomain: string | null;
  coachId: string | null;
  isCoachDomain: boolean;
  loading: boolean;
}

const SubdomainContext = createContext<SubdomainContextType>({
  subdomain: null,
  coachId: null,
  isCoachDomain: false,
  loading: true
});

interface SubdomainProviderProps {
  children: (contextValue: SubdomainContextType) => React.ReactNode;
}

export const SubdomainProvider = ({ children }: SubdomainProviderProps) => {
  const [state, setState] = useState<SubdomainContextType>({
    subdomain: null,
    coachId: null,
    isCoachDomain: false,
    loading: true
  });

  useEffect(() => {
    const initSubdomain = async () => {
      const sub = getSubdomain();
      
      if (sub && sub !== 'www') {
        const id = await getCoachIdFromSubdomain();
        setState({
          subdomain: sub,
          coachId: id,
          isCoachDomain: true,
          loading: false
        });
      } else {
        setState({
          subdomain: null,
          coachId: null,
          isCoachDomain: false,
          loading: false
        });
      }
    };

    initSubdomain();
  }, []);

  return children(state);
};

export const useSubdomain = () => useContext(SubdomainContext); 