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
            const { user, profile } = await getCurrentUser();
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
      await loadUserData();
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

  const updateUserProfile = async (updates) => {
      const { user, profile } = await getCurrentUser();
      setAuthState(prev => ({
          ...prev,
          user: { ...user, ...updates.user },
          profile: { ...profile, ...updates.profile }
      }));
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
        updateUserProfile,
        updateAuthState,
      }}>
        {!authState.isLoading && children}
      </AuthContext.Provider>
    );
};

