import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // The main AuthProvider handles the initial loading state.
  // By the time this component renders, the auth status is definitive.

  if (!user) {
    // If not logged in, redirect to the general login page.
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in but not an admin, redirect them to their own dashboard.
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If logged in and is an admin, render the requested admin component.
  return children;
};

export default AdminRoute;
