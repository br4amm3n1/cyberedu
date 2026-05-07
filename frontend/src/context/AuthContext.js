import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { logout as apiLogout, getCurrentUser, checkSession } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        profile: null,
        isLoading: true
    });

    const authStateRef = useRef(authState);

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

    const handleLogout = useCallback(async (redirect = true) => {
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
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    useEffect(() => {
        authStateRef.current = authState;
    }, [authState]);

    useEffect(() => {
        const verifySession = async () => {
            const currentState = authStateRef.current;
            
            if (!currentState.isAuthenticated) return;
            
            try {
                const session = await checkSession();
                
                if (session.is_authenticated) {
                    if (!currentState.user || currentState.user.id !== session.user.id) {
                        await loadUserData();
                    }
                } else {
                    await handleLogout(false);
                }
            } catch (error) {
                console.error('Ошибка проверки сессии:', error);
            }
        };

        const interval = setInterval(verifySession, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadUserData, handleLogout]);

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

