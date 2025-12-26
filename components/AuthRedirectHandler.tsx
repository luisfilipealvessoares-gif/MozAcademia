// FIX: Added 'React' to the import to resolve the 'Cannot find namespace React' error.
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthRedirectHandler: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  // Use a ref to ensure this effect runs only once per confirmation.
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Check if there is a session, if we haven't redirected yet,
    // and if the confirmation flag from the signup process is set.
    if (session && !hasRedirected.current && localStorage.getItem('awaiting_confirmation') === 'true') {
      // Set the ref to true to prevent this from running again.
      hasRedirected.current = true;
      // Clean up the flag from localStorage.
      localStorage.removeItem('awaiting_confirmation');
      // Redirect the user to the welcome page.
      navigate('/welcome', { replace: true });
    }
  }, [session, navigate]);

  // This component does not render any UI elements.
  return null;
};

export default AuthRedirectHandler;
