import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // First check if user is actually a client
        const clientDoc = await getDoc(doc(db, 'clients', user.uid));
        if (!clientDoc.exists()) {
          // If not a client, might be a coach trying to access client routes
          const coachDoc = await getDoc(doc(db, 'coaches', user.uid));
          if (coachDoc.exists()) {
            navigate('/dashboard'); // Redirect coaches to coach dashboard
          } else {
            navigate('/login'); // Neither client nor coach
          }
          return;
        }

        const clientData = clientDoc.data();
        if (!clientData?.onboardingCompleted) {
          navigate('/onboarding');
          return;
        }
      } catch (error) {
        console.error('Error checking access:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default OnboardingGuard; 