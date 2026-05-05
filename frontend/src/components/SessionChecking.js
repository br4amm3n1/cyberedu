import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SessionChecking = ({ children }) => {
    const { handleLogout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => {
            if (isAuthenticated) {
                handleLogout();
                navigate('/login', { replace: true });
            }
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);
        
        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired);
        };
    }, [handleLogout, navigate, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const checkInterval = setInterval(async () => {
            try {
                const { getCurrentUser } = await import('../api/auth');
                await getCurrentUser();
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleLogout();
                    navigate('/login', { replace: true });
                }
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(checkInterval);
    }, [isAuthenticated, handleLogout, navigate]);

    return children;
};

export default SessionChecking;