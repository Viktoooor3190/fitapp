import { Routes, Route } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import UserLayout from './UserLayout';

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        {/* Add more user routes here */}
      </Route>
    </Routes>
  );
};

export default UserRoutes; 