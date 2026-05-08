import { useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../AuthContext';

export const useSessionSSE = () => {
    const { isAuthenticated, handleLogout } = useContext(AuthContext);
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    
    const connect = useCallback(() => {
        if (!isAuthenticated) {
            console.log('Not authenticated, skipping SSE connection');
            return;
        }
    
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        
        console.log('Connecting to SSE stream...');
        
        const eventSource = new EventSource('/api/accounts/session-stream/', {
            withCredentials: true,
        });
        
        eventSourceRef.current = eventSource;
        
        eventSource.onopen = (event) => {
            console.log('SSE connection established');
            reconnectAttempts.current = 0;
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('SSE message received:', data);
                
                switch (data.type) {
                    case 'ping':
                        console.debug('SSE ping received');
                        break;
                        
                    case 'session_expired':
                        console.warn('Session expired!', data.reason);
                        handleLogout(true);
                        break;
                        
                    case 'connection_timeout':
                        console.warn('Connection timeout, reconnecting...');
                        eventSource.close();
                        reconnect();
                        break;
                        
                    case 'connection_closed':
                        console.log('Connection closed by server');
                        break;
                        
                    default:
                        console.log('Unknown event type:', data.type);
                }
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectAttempts.current++;
            
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
                if (isAuthenticated) {
                    connect();
                }
            }, delay);
        };
        
    }, [isAuthenticated, handleLogout]);
    
    const reconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        connect();
    }, [connect]);
    
    useEffect(() => {
        if (isAuthenticated) {
            connect();
        }
        
        return () => {
            if (eventSourceRef.current) {
                console.log('Closing SSE connection');
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isAuthenticated, connect]);
    
    return { reconnect };
};