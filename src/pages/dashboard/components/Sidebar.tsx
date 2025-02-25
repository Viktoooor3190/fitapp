import { motion } from 'framer-motion';
import { listItem } from '../../../animations/dashboard';

const Sidebar = () => {
  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        mass: 1
      }}
      className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          {/* Logo/Brand */}
        </motion.div>

        <nav>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              variants={listItem}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={index}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className="mb-2"
            >
              <Link
                to={item.path}
                className="flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
}; 