import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { logout as apiLogout, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: true
    });

    const loadUserData = useCallback(async () => {
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
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }

        setAuthState({
            isAuthenticated: false,
            user: null,
            profile: null,
            isLoading: false,
        });
    }, []);

    useEffect(() => {  
        loadUserData();

        const handleAuthExpired = () => {
            setAuthState({
                isAuthenticated: false,
                user: null,
                profile: null,
                isLoading: false,
            });
        };

        window.addEventListener('auth-expired', handleAuthExpired);

        return () => {
            window.removeEventListener('auth-expired', handleAuthExpired);
        };
    }, [loadUserData]);

    const handleLogin = async () => {
        await loadUserData();
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

