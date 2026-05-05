import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.is_staff) return <Navigate to="/" />;
  
  return children;
};

export default AdminRoute;