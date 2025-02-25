import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

export const EmulatorWarning = () => {
  const [isEmulator, setIsEmulator] = useState(false);

  useEffect(() => {
    try {
      const auth = getAuth();
      // Check if we're in emulator mode by checking the auth endpoint
      const authEndpoint = auth.config?.emulator?.url || 
        // @ts-ignore - Fallback for older Firebase versions
        auth._config?.emulator?.url || 
        auth.config?.apiHost;
      
      setIsEmulator(authEndpoint?.includes('localhost') || false);
    } catch (error) {
      console.error('Error checking emulator status:', error);
      setIsEmulator(false);
    }
  }, []);

  if (!isEmulator) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg text-sm z-50">
      🔧 Using Firebase Emulators
    </div>
  );
}; 