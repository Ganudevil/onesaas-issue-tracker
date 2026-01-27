
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name?: string;
    email: string;
}

interface AuthState {
    user: User | null;
    tenantId: string | null;
    role: 'admin' | 'member' | 'viewer' | null;
    token: string | null;

    isAuthenticated: boolean;

    setSession: (user: User, token: string, tenantId: string, role: 'admin' | 'member' | 'viewer') => void;
    clearSession: () => void;
    setTenant: (tenantId: string) => void;
    setRole: (role: 'admin' | 'member' | 'viewer') => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            tenantId: null,
            role: null,
            token: null,
            isAuthenticated: false,

            setSession: (user, token, tenantId, role) => set({
                user,
                token,
                tenantId,
                role,
                isAuthenticated: true
            }),

            clearSession: () => set({
                user: null,
                token: null,
                tenantId: null,
                role: null,
                isAuthenticated: false
            }),

            setTenant: (tenantId) => set({ tenantId }),
            setRole: (role) => set({ role }),
        }),
        {
            name: 'onesaas-auth-storage', // unique name
        }
    )
);
