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
    keycloakUrl === 'null' ||
    keycloakUrl === 'mock' ||
    keycloakUrl === 'mock';

// Check for manual override (Self-Healing)
const manualMockOverride = typeof window !== 'undefined' ? localStorage.getItem('onesaas_force_mock') === 'true' : false;

// FAILSAFE: If we are on a Vercel deployment (determined by hostname)
// and NO Keycloak URL is explicitly provided, we MUST force Mock Mode.
// This prevents the "localhost:8080" crash on the deployed site.
if (typeof window !== 'undefined' && !shouldUseMock) {
    const isVercel = window.location.hostname.includes('vercel.app');
    if (isVercel && !useMockEnv && !keycloakUrl) {
        console.warn('[Providers] Detected Vercel deployment with missing config. Forcing Mock Mode.');
        // We can't re-assign const, but we can rely on this check inside the component or force a reload?
        // Actually, we need to move this logic INSIDE the component or make `shouldUseMock` a let/var? 
        // Better: include this condition in the initial definition.
    }
}

const isVercelRuntime = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const effectiveShouldUseMock = shouldUseMock || manualMockOverride || (isVercelRuntime && !keycloakUrl);

if (typeof window !== 'undefined') {
    console.log('[Providers] Auth Config Check:', {
        shouldUseMock,
        manualMockOverride,
        effectiveShouldUseMock,
        isVercelRuntime,
        keycloakUrl: keycloakUrl || '(missing)',
        useMockEnv: useMockEnv || '(missing)',
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
