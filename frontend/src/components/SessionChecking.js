import { useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SessionChecking = ({ children }) => {
    const { handleLogout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const isRedirecting = useRef(false);

    useEffect(() => {
        const handleSessionExpired = () => {
            if (isAuthenticated && !isRedirecting.current) {
                isRedirecting.current = true;
                handleLogout();
                navigate('/login', { replace: true });
                setTimeout(() => {
                    isRedirecting.current = false;
                }, 1000);
            }
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);
        
        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired);
        };
    }, [handleLogout, navigate, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                import('../api/auth').then(({ getCurrentUser }) => {
                    getCurrentUser().catch(async (error) => {
                        if (error.response?.status === 401 || error.response?.status === 403) {
                            if (!isRedirecting.current) {
                                isRedirecting.current = true;
                                await handleLogout();
                                navigate('/login', { replace: true });
                                setTimeout(() => {
                                    isRedirecting.current = false;
                                }, 1000);
                            }
                        }
                    });
                });
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, handleLogout, navigate]);

    return children;
};

export default SessionChecking;