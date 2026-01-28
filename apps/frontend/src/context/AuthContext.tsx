'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useAuth as useOidcAuth } from "react-oidc-context";
import { useMockAuth } from "../auth/MockAuthProvider";
import { db } from '../services/db';
import { useAuthStore } from '../store/useAuthStore';

interface AuthContextType {
    user: User | null;
    login: () => void;
    signup: () => void;
    logout: () => void;
    isAuthenticated: boolean;
    tenantId: string | null;
    isLoading: boolean;
    token?: string;
    updateRole: (role: UserRole) => Promise<void>;
    setTenantId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inner component that contains the shared logic
const AuthProviderInner: React.FC<{ children: React.ReactNode, auth: any }> = ({ children, auth }) => {
    const { setRole, tenantId, setTenant, setSession, clearSession } = useAuthStore();
    const [user, setUser] = useState<User | null>(null);

    // Wrapper to match interface if needed, or just expose setTenant directly
    const setTenantId = (id: string) => {
        setTenant(id);
    };

    const [isDbSyncing, setIsDbSyncing] = useState(false);

    useEffect(() => {
        const syncUser = async () => {
            if (auth.isAuthenticated && auth.user) {
                setIsDbSyncing(true);
                try {
                    // Map Keycloak user to app user
                    const profile = auth.user.profile as any;
                    const realmRoles = profile.realm_access?.roles || [];

                    console.log('DEBUG: Keycloak Profile:', profile);
                    console.log('DEBUG: Realm Roles:', realmRoles);

                    let role: UserRole = UserRole.MEMBER;
                    // Case-insensitive check and check for no roles
                    if (realmRoles.some((r: string) => r.toLowerCase() === 'admin')) {
                        role = UserRole.ADMIN;
                    } else if (realmRoles.some((r: string) => r.toLowerCase() === 'viewer')) {
                        role = UserRole.VIEWER;
                    }
                    console.log('DEBUG: Mapped Role:', role);

                    const email = profile.email || '';
                    const displayName = profile.name || profile.preferred_username || 'User';

                    // Sync with Database to get the correct UUID for FKs
                    const token = auth.user.access_token;

                    // Add timeout to prevent hanging
                    const syncPromise = db.ensureUserExists(auth.user.profile.sub || '', email, role, displayName, token);
                    const timeoutPromise = new Promise<null>((_, reject) =>
                        setTimeout(() => reject(new Error('Sync timeout')), 15000)
                    );

                    const dbUser = await Promise.race([syncPromise, timeoutPromise]);

                    if (dbUser) {
                        setUser(dbUser);
                        setRole(dbUser.role as any);

                        // Sync to AuthStore Session
                        const targetTenant = tenantId || 'tenant1';
                        setSession(
                            {
                                id: dbUser.id || auth.user.profile.sub || '',
                                email: dbUser.email,
                                name: dbUser.displayName,
                            },
                            token || '',
                            targetTenant,
                            dbUser.role as any
                        );
                    }

                } catch (err) {
                    console.error("Failed to sync user with DB", err);
                    // Fallback to local user if sync fails so app loads
                    setUser({
                        id: 'temp-id', // This might break FKs but allows UI to load
                        email: auth.user.profile.email || '',
                        role: UserRole.MEMBER, // Default to member on fail
                        displayName: auth.user.profile.preferred_username || 'User'
                    });
                } finally {
                    setIsDbSyncing(false);
                }
            } else {
                setUser(null);
                clearSession();
                setIsDbSyncing(false);
            }
        };

        if (!auth.isLoading) {
            syncUser();
        }
    }, [auth.isAuthenticated, auth.user, auth.isLoading, tenantId]);

    const login = () => {
        auth.signinRedirect();
    };

    const signup = () => {
        auth.signinRedirect({ extraQueryParams: { kc_action: 'register' } });
    };

    const logout = () => {
        auth.removeUser();
        auth.signoutRedirect({ post_logout_redirect_uri: window.location.origin });
    };

    const updateRole = async (newRole: UserRole) => {
        if (user && auth.user?.access_token) {
            const updated = await db.updateUserRole(user.email, newRole, auth.user.access_token);
            setUser(updated);
        }
    };

    if (auth.error) {
        const errorMessage = auth.error.message || 'Unknown authentication error';

        // Auto-recover from state mismatch
        if (errorMessage.includes("No matching state")) {
            console.warn("State mismatch detected. Clearing storage and retrying...");
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
            return null;
        }

        // Check if it's a network/connection error (Keycloak unreachable)
        const isNetworkError = errorMessage.toLowerCase().includes('fetch') ||
            errorMessage.toLowerCase().includes('network') ||
            errorMessage.toLowerCase().includes('failed to fetch');

        if (isNetworkError) {
            return (
                <div style={{ padding: '20px', color: '#d32f2f', maxWidth: '600px', margin: '40px auto', backgroundColor: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800' }}>
                    <h1 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>🔌 Connection Error</h1>
                    <p style={{ marginBottom: '12px' }}>Unable to connect to authentication server.</p>
                    <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                        This usually means the app is configured to use real Keycloak but it's not available.
                    </p>
                    <p style={{ marginBottom: '16px', color: '#666' }}>
                        💡 <strong>Tip:</strong> Set <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>NEXT_PUBLIC_USE_MOCK=true</code> in your environment variables to use mock authentication instead.
                    </p>
                    <details style={{ marginBottom: '16px' }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Technical Details</summary>
                        <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>{errorMessage}</pre>
                    </details>
                    <button onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/';
                    }} style={{
                        padding: '12px 24px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Retry (Clear Cache & Go Home)
                    </button>
                </div>
            );
        }

        // Generic error handling for other types of errors
        return (
            <div style={{ padding: '20px', color: 'red', maxWidth: '600px', margin: '40px auto' }}>
                <h1>Authentication Error</h1>
                <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>{errorMessage}</pre>
                <button onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                }} style={{ padding: '10px', marginTop: '10px', cursor: 'pointer' }}>
                    Retry (Clear Cache & Go Home)
                </button>
            </div>
        );
    }

    if (auth.isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Connecting to Authorization Server...</p>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid blue', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            isAuthenticated: auth.isAuthenticated,
            tenantId,
            setTenantId,
            isLoading: auth.isLoading || isDbSyncing,
            token: auth.user?.access_token,
            updateRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const RealAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useOidcAuth();
    return <AuthProviderInner auth={auth}>{children}</AuthProviderInner>;
};

export const MockAppAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useMockAuth();
    return <AuthProviderInner auth={auth}>{children}</AuthProviderInner>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
