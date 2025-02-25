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

const App = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <AuthProvider>
          <>
            {!isDashboardRoute && <Navbar />}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/get-started" element={<GetStarted />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CoachDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/clients" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ClientsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/clients/:clientId" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ClientDetailsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/programs" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProgramsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/schedule" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SchedulePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/messages" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MessagesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/revenue" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RevenuePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/reports" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Home />} />
            </Routes>
          </>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
