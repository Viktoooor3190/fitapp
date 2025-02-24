import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <svg 
              className="w-10 h-10 text-blue-600"
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.5 3.5h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3Z" />
              <path d="m12 8-4 4 4 4" />
              <path d="m16 8-4 4 4 4" />
            </svg>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent tracking-tight">
              FitApp
            </span>
          </Link>

          {/* Navigation Links - Tighter Spacing */}
          <div className="hidden md:flex items-center space-x-6">
            {['Features', 'Pricing', 'About'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2 text-sm font-medium"
              >
                <span className="relative group">
                  {item}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100 duration-300" />
                </span>
              </Link>
            ))}
          </div>

          {/* Enhanced Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium px-2 py-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="relative group px-5 py-2.5 text-sm font-semibold rounded-lg 
                overflow-hidden transition-all duration-300
                hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]
                active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 opacity-0 group-hover:opacity-100 animate-gradient-xy" />
              <span className="relative text-white">Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 