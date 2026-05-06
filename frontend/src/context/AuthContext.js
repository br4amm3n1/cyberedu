import React, { createContext, useState, useEffect } from 'react';
import { logout as apiLogout, getCurrentUser, checkSession } from '../api/auth';

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

    const verifySession = useCallback(async () => {
        try {
            const session = await checkSession();
            
            if (session.is_authenticated) {
                if (!authState.user || authState.user.id !== session.user.id) {
                    await loadUserData();
                }
            } else if (authState.isAuthenticated) {
                handleLogout(false);
            }
        } catch (error) {
            console.error('Ошибка при проверке сессии:', error);
        }
    }, [authState.isAuthenticated, loadUserData, handleLogout]);

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        const interval = setInterval(verifySession, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [verifySession]);

    const handleLogin = async () => {
        await loadUserData();
    };

    const handleLogout = async (redirect = true) => {
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

        if (redirect && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
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

