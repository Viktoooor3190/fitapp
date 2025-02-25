import { Routes, Route } from 'react-router-dom';
import UserLayout from './components/UserLayout';
import UserDashboard from './UserDashboard';
import Calendar from './Calendar';
import Settings from './Settings';

const UserRoutes = () => {
  return (
    <UserLayout>
      <Routes>
        <Route index element={<UserDashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </UserLayout>
  );
};

export default UserRoutes; 