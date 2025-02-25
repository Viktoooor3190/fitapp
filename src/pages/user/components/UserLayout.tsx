import { ReactNode } from 'react';
import UserSidebar from './UserSidebar';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  return (
    <div className="flex">
      <UserSidebar />
      <div className="ml-64 w-full min-h-screen bg-[#1a1f2b]">
        {children}
      </div>
    </div>
  );
};

export default UserLayout; 