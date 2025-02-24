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

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
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
          <Route path="*" element={<Home />} />
        </Routes>
      </>
    </ThemeProvider>
  );
};

export default App;
