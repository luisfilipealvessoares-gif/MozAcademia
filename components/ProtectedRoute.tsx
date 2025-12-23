import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user is an admin, they should not be on user-protected routes.
  // Redirect them to their own dashboard to enforce role separation.
  if (isAdmin) {
    return <Navigate to="/admin" />;
  }
  
  return children;
};

export default ProtectedRoute;