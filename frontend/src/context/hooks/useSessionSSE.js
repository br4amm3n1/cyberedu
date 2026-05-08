import { useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../AuthContext';

export const useSessionSSE = () => {
    const { isAuthenticated, handleLogout } = useContext(AuthContext);
    const pollTimeoutRef = useRef(null);
    const isPollingRef = useRef(false);
    
    const longPoll = useCallback(async () => {
        if (!isAuthenticated || !isPollingRef.current) {
            console.log('Stopping long poll: not authenticated or polling stopped');
            return;
        }
        
        try {
            console.log('Long poll request started...');
            const response = await fetch('/api/accounts/session-longpoll/', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Long poll response:', data);
            
            if (data.type === 'session_expired') {
                console.warn('Session expired!', data.reason);
                handleLogout(true);
                return;
            }
            
            if (isPollingRef.current && isAuthenticated) {
                longPoll();
            }
            
        } catch (error) {
            console.error('Long poll error:', error);
            
            if (isPollingRef.current && isAuthenticated) {
                console.log('Reconnecting in 5 seconds...');
                pollTimeoutRef.current = setTimeout(() => {
                    longPoll();
                }, 5000);
            }
        }
    }, [isAuthenticated, handleLogout]);
    
    useEffect(() => {
        if (isAuthenticated) {
            console.log('Starting session long poll');
            isPollingRef.current = true;
            longPoll();
        } else {
            console.log('Stopping session long poll');
            isPollingRef.current = false;
            
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
                pollTimeoutRef.current = null;
            }
        }
        
        return () => {
            isPollingRef.current = false;
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        };
    }, [isAuthenticated, longPoll]);
    
    return {
        stopPolling: () => {
            isPollingRef.current = false;
            if (pollTimeoutRef.current) {
                clearTimeout(pollTimeoutRef.current);
            }
        }
    };
};
