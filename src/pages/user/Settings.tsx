import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

interface UserSettings {
  name: string;
  email: string;
  notifications: boolean;
  preferredWorkoutTime: string;
  fitnessGoals: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    notifications: true,
    preferredWorkoutTime: '',
    fitnessGoals: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, 'clients', user.uid));
        if (userDoc.exists()) {
          setSettings(prev => ({
            ...prev,
            ...userDoc.data() as UserSettings
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'clients', user.uid), {
        name: settings.name,
        notifications: settings.notifications,
        preferredWorkoutTime: settings.preferredWorkoutTime,
        fitnessGoals: settings.fitnessGoals
      });

      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    }
  };

  const updateUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updatePassword(user, passwords.new);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Settings */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
            <form onSubmit={saveSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={handleSettingChange}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-gray-400 p-3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleSettingChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-gray-300">
                  Enable notifications
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
            <form onSubmit={updateUserPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg text-white p-3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 