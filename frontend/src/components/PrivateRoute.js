import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCurrentUser } from '../api/auth';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading, handleLogout } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);
  const [isValid, setIsValid] = useState(true);

   useEffect(() => {
    const verifySession = async () => {
      if (isAuthenticated && !isLoading) {
        setChecking(true);
        try {
          await getCurrentUser();
          setIsValid(true);
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            setIsValid(false);
            handleLogout(false);
          }
        } finally {
          setChecking(false);
        }
      }
    };

    verifySession();
  }, [isAuthenticated, isLoading, handleLogout]);

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff) return <Navigate to="/" />;
  
  return children;
};

export default PrivateRoute;