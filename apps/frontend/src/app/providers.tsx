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
// Detect if we should use Mock Mode
// Logic: Default to Mock if:
// 1. Explicitly requested via NEXT_PUBLIC_USE_MOCK='true'
// 2. Keycloak URL is missing, empty, or 'undefined'
// 3. Keycloak URL points to localhost (which won't work on Vercel)
const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const useMockEnv = process.env.NEXT_PUBLIC_USE_MOCK;

const shouldUseMock =
    useMockEnv === 'true' ||
    !keycloakUrl ||
    keycloakUrl === '' ||
    keycloakUrl === 'undefined' ||
    keycloakUrl === 'null' ||
    keycloakUrl === 'mock' ||
    keycloakUrl.includes('localhost');

if (typeof window !== 'undefined') {
    console.log('[Providers] Auth Config Check:', {
        shouldUseMock,
        keycloakUrl: keycloakUrl || '(missing)',
        useMockEnv: useMockEnv || '(missing)',
        reason: shouldUseMock ? 'Using Mock Mode' : 'Using Real Keycloak'
    });
}

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
