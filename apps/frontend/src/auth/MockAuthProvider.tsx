import React, { useState, useEffect, useContext, createContext } from 'react';
import { User } from 'oidc-client-ts';

// Mock Auth Context to match react-oidc-context interface effectively
export const MockAuthContext = createContext<any>(null);

export const MockAuthProvider = ({ children, ...props }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Build a fake user from local storage or default
        const stored = localStorage.getItem('mock_auth_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse mock user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const signinRedirect = () => {
        // Simulate login delay
        setIsLoading(true);
        setTimeout(() => {
            const mockUser = {
                profile: {
                    sub: 'mock-user-123',
                    email: 'demo@onesaas.local',
                    name: 'Demo User',
                    preferred_username: 'demo_user',
                    realm_access: {
                        roles: ['member', 'admin']
                    }
                },
                access_token: 'mock-token-123',
            } as any;

            setUser(mockUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
        }, 800);
    };

    const removeUser = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('mock_auth_user');
    };

    const signoutRedirect = () => {
        removeUser();
        if (props.onSignoutCallback) {
            props.onSignoutCallback();
        }
        window.location.href = '/';
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        signinRedirect,
        removeUser,
        signoutRedirect,
        error: null,
        events: {
            addUserLoaded: () => { },
            removeUserLoaded: () => { },
            addAccessTokenExpiring: () => { },
            removeAccessTokenExpiring: () => { },
            addAccessTokenExpired: () => { },
            removeAccessTokenExpired: () => { },
            addSilentRenewError: () => { },
            removeSilentRenewError: () => { },
            addUserSignedOut: () => { },
            removeUserSignedOut: () => { },
        }
    };

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
};

export const useMockAuth = () => useContext(MockAuthContext);
