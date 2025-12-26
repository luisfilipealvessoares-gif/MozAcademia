import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // The main AuthProvider handles the initial loading state.
  // By the time this component renders, the auth status is definitive.

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a logged-in user is an admin, they should not be on user-protected routes.
  // Redirect them to their own dashboard to enforce role separation.
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
