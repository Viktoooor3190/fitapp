import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';

const UserSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/user' },
    { name: 'Calendar', icon: Calendar, path: '/user/calendar' },
    { name: 'Settings', icon: Settings, path: '/user/settings' },
  ];

  return (
    <div className="h-screen bg-[#1a1f2b] border-r border-gray-800 w-64 fixed left-0 top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">FitApp</h1>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-500' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="mr-3"
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </motion.div>
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={() => {/* Add logout handler */}}
          className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserSidebar; 