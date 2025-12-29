
import React from 'react';
import UserSidebar from './UserSidebar';

// This layout component assumes it will be rendered within a page
// that already has a Header and Footer. It provides the two-column
// structure for the user's dashboard area.
interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
        <UserSidebar />
        <main className="flex-1">
            {children}
        </main>
    </div>
  );
};

export default UserLayout;
