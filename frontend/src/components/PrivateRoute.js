import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCurrentUser } from '../api/auth';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);
  const [isValid, setIsValid] = useState(true);

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  };
  
  return children;
};

export default PrivateRoute;