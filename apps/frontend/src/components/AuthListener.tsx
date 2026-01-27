
'use client';

import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export function AuthListener() {
    const auth = useAuth();
    const { setSession, clearSession, tenantId, user } = useAuthStore();

    useEffect(() => {
        if (auth.isLoading) return;
        if (auth.isAuthenticated && auth.user) {
            // Extract role from token payload if available, or fetch from userInfo
            const roles = (auth.user.profile as any).realm_access?.roles || [];
            let role: 'admin' | 'member' | 'viewer' = 'viewer';
            if (roles.includes('admin')) role = 'admin';
            else if (roles.includes('member')) role = 'member';

            // Respect existing tenant selection or default to tenant1
            const targetTenant = tenantId || 'tenant1';

            setSession(
                {
                    id: auth.user.profile.sub || '',
                    email: auth.user.profile.email || '',
                    name: auth.user.profile.name,
                },
                auth.user.access_token,
                targetTenant,
                role
            );
        } else if (!auth.isLoading && !auth.isAuthenticated) {
            clearSession();
        }
    }, [auth.isAuthenticated, auth.user, auth.isLoading, setSession, clearSession]);

    // Separate effect to ensure user exists in the CURRENT tenant whenever it changes
    useEffect(() => {
        const syncUser = async () => {
            if (user && tenantId && auth.isAuthenticated) {
                console.log(`[AuthListener] Syncing user ${user.email} to ${tenantId}`);
                try {
                    // We need the token from store or auth.user
                    if (auth.user?.access_token) {
                        // We need to import db. Let's add the import.
                        await import('../services/db').then(m => m.db.ensureUserExists(
                            user.id,
                            user.email,
                            'member', // Or derive from token again
                            user.name || user.email,
                            auth.user!.access_token
                        ));
                    }
                } catch (e) {
                    console.error("[AuthListener] Failed to sync user to tenant", e);
                }
            }
        };
        syncUser();
    }, [tenantId, user?.id, auth.isAuthenticated]); // Depend on tenantId change

    return null;
}
