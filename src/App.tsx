import { Routes, Route } from 'react-router-dom';
import Home from './components/home';
import FeaturesPage from './pages/Features';
import Navbar from './components/navbar/Navbar';
import AboutPage from './pages/About';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import { ThemeProvider } from './components/theme-provider';
import GetStarted from './pages/GetStarted';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <AuthProvider>
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Home />} />
            </Routes>
          </>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
