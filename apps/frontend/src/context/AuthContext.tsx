'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useAuth as useOidcAuth } from "react-oidc-context";
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useOidcAuth();
    const { setRole, tenantId, setTenant } = useAuthStore();
    const [user, setUser] = useState<User | null>(null);

    // Remove local tenant state to avoid de-sync with Navbar/Store
    // const [tenantId, _setTenantId] = useState(...) 

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
        if (auth.error.message.includes("No matching state")) {
            // Auto-recover from state mismatch
            console.warn("State mismatch detected. Clearing storage and retrying...");
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
            return null;
        }

        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h1>Authentication Error</h1>
                <pre>{auth.error.message}</pre>
                <button onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                }} style={{ padding: '10px', marginTop: '10px' }}>
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
