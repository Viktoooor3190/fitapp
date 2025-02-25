import { Routes, Route, useLocation } from 'react-router-dom';
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
import CoachDashboard from './pages/dashboard/CoachDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import ClientsPage from './pages/dashboard/clients/ClientsPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProgramsPage from './pages/dashboard/programs/ProgramsPage';
import SchedulePage from './pages/dashboard/schedule/SchedulePage';
import MessagesPage from './pages/dashboard/messages/MessagesPage';
import RevenuePage from './pages/dashboard/revenue/RevenuePage';
import ReportsPage from './pages/dashboard/reports/ReportsPage';
import ClientDetailsPage from './pages/dashboard/clients/ClientDetailsPage';
import Questionnaire from './pages/user/Questionnaire';
import UserRoutes from './pages/user/UserRoutes';
import OnboardingGuard from './components/guards/OnboardingGuard';
import RoleSelection from './pages/RoleSelection';
import ClientSignUp from './pages/ClientSignUp';
import { EmulatorWarning } from './components/EmulatorWarning';

const App = () => {
  const location = useLocation();
  
  // Public paths where navbar should be shown
  const publicPaths = [
    '/',
    '/features',
    '/about',
    '/get-started',
    '/login',
    '/signup',
    '/coach-signup',
    '/client-signup',
    '/forgot-password'
  ];

  // Check if current path is a public path that should show navbar
  const shouldShowNavbar = publicPaths.some(path => 
    location.pathname === path || // Exact match for root and simple paths
    (path !== '/' && location.pathname.startsWith(path + '/')) // For nested paths
  );

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <AuthProvider>
          <>
            {shouldShowNavbar && <Navbar />}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/get-started" element={<GetStarted />} />
              
              {/* Auth Routes - With Navbar */}
              <Route path="/signup" element={<RoleSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/coach-signup" element={<SignUp />} />
              <Route path="/client-signup" element={<ClientSignUp />} />
              
              {/* Protected Routes - No Navbar */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<CoachDashboard />} />
                      <Route path="clients" element={<ClientsPage />} />
                      <Route path="clients/:clientId" element={<ClientDetailsPage />} />
                      <Route path="programs" element={<ProgramsPage />} />
                      <Route path="schedule" element={<SchedulePage />} />
                      <Route path="messages" element={<MessagesPage />} />
                      <Route path="revenue" element={<RevenuePage />} />
                      <Route path="reports" element={<ReportsPage />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/onboarding" element={<Questionnaire />} />
              <Route path="/user/*" element={
                <OnboardingGuard>
                  <UserRoutes />
                </OnboardingGuard>
              } />
              
              <Route path="*" element={<Home />} />
            </Routes>
            {import.meta.env.DEV && <EmulatorWarning />}
          </>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
