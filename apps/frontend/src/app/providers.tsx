'use client';

import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { RealAuthProvider, MockAppAuthProvider } from '@/context/AuthContext';
import { keycloakConfig } from '@/auth/keycloakConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// AuthListener import removed
import { MockAuthProvider } from '@/auth/MockAuthProvider';

const queryClient = new QueryClient();

// Improved Mock Mode Detection with explicit configuration support
// Supports NEXT_PUBLIC_AUTH_MODE='mock' for explicit mode setting
const authMode = process.env.NEXT_PUBLIC_AUTH_MODE; // 'mock' or 'keycloak'
const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const useMockEnv = process.env.NEXT_PUBLIC_USE_MOCK;

// Detect if URL is pointing to localhost or unreachable endpoints
const isLocalKeycloak = keycloakUrl?.includes('localhost') || keycloakUrl?.includes('127.0.0.1');

// Auto-detect mock mode if:
// 1. Explicitly requested via NEXT_PUBLIC_AUTH_MODE='mock' or NEXT_PUBLIC_USE_MOCK='true'
// 2. Keycloak URL is missing, empty, or undefined
// 3. Keycloak URL points to localhost (won't work on Vercel)
const shouldUseMock =
    authMode === 'mock' ||
    useMockEnv === 'true' ||
    !keycloakUrl ||
    keycloakUrl === '' ||
    keycloakUrl === 'undefined' ||
    keycloakUrl === 'null' ||
    keycloakUrl === 'mock' ||
    isLocalKeycloak;

// Check for manual override (Self-Healing)
const manualMockOverride = typeof window !== 'undefined' ? localStorage.getItem('onesaas_force_mock') === 'true' : false;

// FAILSAFE: If we are on a Vercel deployment and no explicit mode is set,
// AND Keycloak URL is not properly configured, force Mock Mode
const isVercelRuntime = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const effectiveShouldUseMock = shouldUseMock || manualMockOverride || (isVercelRuntime && !keycloakUrl);

if (typeof window !== 'undefined') {
    console.log('[Providers] Auth Config Check:', {
        authMode: authMode || '(not set)',
        shouldUseMock,
        manualMockOverride,
        effectiveShouldUseMock,
        isVercelRuntime,
        keycloakUrl: keycloakUrl || '(missing)',
        useMockEnv: useMockEnv || '(not set)',
        reason: effectiveShouldUseMock ? 'Using Mock Mode' : 'Using Real Keycloak'
    });
}

export function Providers({ children }: { children: React.ReactNode }) {
    if (effectiveShouldUseMock) {
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
