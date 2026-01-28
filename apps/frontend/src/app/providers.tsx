'use client';

import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { RealAuthProvider, MockAppAuthProvider } from '@/context/AuthContext';
import { keycloakConfig } from '@/auth/keycloakConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// AuthListener import removed
import { MockAuthProvider } from '@/auth/MockAuthProvider';

const queryClient = new QueryClient();

// Detect if we should use Mock Mode
// Uses mock mode when:
// 1. NEXT_PUBLIC_KEYCLOAK_URL is missing (undefined/empty)
// 2. NEXT_PUBLIC_KEYCLOAK_URL contains 'localhost'
// 3. NEXT_PUBLIC_KEYCLOAK_URL is explicitly set to 'mock'
// 4. NEXT_PUBLIC_USE_MOCK is explicitly set to 'true'
const shouldUseMock =
    !process.env.NEXT_PUBLIC_KEYCLOAK_URL ||
    process.env.NEXT_PUBLIC_KEYCLOAK_URL === '' ||
    process.env.NEXT_PUBLIC_KEYCLOAK_URL.includes('localhost') ||
    process.env.NEXT_PUBLIC_KEYCLOAK_URL === 'mock' ||
    process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function Providers({ children }: { children: React.ReactNode }) {
    if (shouldUseMock) {
        console.warn('⚠️ [Mock Mode] Using MockAuthProvider because NEXT_PUBLIC_KEYCLOAK_URL is missing or local.');
        return (
            <MockAuthProvider>
                <MockAppAuthProvider>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </MockAppAuthProvider>
            </MockAuthProvider>
        );
    }

    return (
        <OidcAuthProvider {...keycloakConfig}>
            <RealAuthProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </RealAuthProvider>
        </OidcAuthProvider>
    );
}
