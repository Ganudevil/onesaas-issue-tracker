'use client';

import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { AuthProvider as AppAuthProvider } from '@/context/AuthContext';
import { keycloakConfig } from '@/auth/keycloakConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthListener } from '@/components/AuthListener';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <OidcAuthProvider {...keycloakConfig}>
            <AppAuthProvider>
                <AuthListener />
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </AppAuthProvider>
        </OidcAuthProvider>
    );
}
