import React, { createContext, useState, useEffect } from 'react';
import { logout as apiLogout, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: true
    });

    const loadUserData = async () => {
        try {
            const { profile } = await getCurrentUser();
            const user = profile.user;

            setAuthState({
                isAuthenticated: true,
                user,
                profile,
                isLoading: false
            });
        } catch (error) {
            setAuthState({
                isAuthenticated: false,
                user: null,
                profile: null,
                isLoading: false
            });
        }
    };

    useEffect(() => {
        loadUserData();
    }, [authState.isAuthenticated]);

  const handleLogin = async () => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
  };

  const handleLogout = async () => {
      await apiLogout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: false,
      });
    };

  const updateAuthState = (newData) => {
      setAuthState(prev => ({
          ...prev,
          user: newData.user || prev.user,
          profile: newData.profile || prev.profile,
      }));
  };

  return (
      <AuthContext.Provider value={{
        ...authState,
        handleLogin,
        handleLogout,
        updateAuthState,
      }}>
        {!authState.isLoading && children}
      </AuthContext.Provider>
    );
};

