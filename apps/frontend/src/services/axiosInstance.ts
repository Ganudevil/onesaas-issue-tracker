import axios from 'axios';
import { User } from 'oidc-client-ts';

// Create a custom Axios instance
// In production, we point directly to the backend URL.
// In development, we use the /api proxy to avoid CORS/port issues.
const baseURL = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const axiosInstance = axios.create({
    baseURL,
});

// Request interceptor to add the specific Keycloak token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Attempt to retrieve the OIDC user from local storage
            const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('oidc.user'));

            // Match the key format used in keycloakConfig.ts: client_id = issue-tracker
            // Key format: oidc.user:<authority>:<client_id>
            const authority = process.env.NEXT_PUBLIC_KEYCLOAK_URL
                ? `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'onesaas'}`
                : 'http://localhost:8080/realms/onesaas';

            const oidcKey = `oidc.user:${authority}:${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'issue-tracker'}`;
            const oidcStorage = localStorage.getItem(oidcKey);

            if (oidcStorage) {
                try {
                    const user = User.fromStorageString(oidcStorage);
                    if (user && user.access_token) {
                        config.headers.Authorization = `Bearer ${user.access_token}`;
                    }
                } catch (e) {
                    console.error("Error parsing OIDC user from local storage", e);
                }
            }
        }

        // Tenant ID Injection
        if (!config.headers) config.headers = {} as any;

        // Read from Zustand store (onesaas-auth-storage)
        let tenantId = '11111111-1111-1111-1111-111111111111'; // Default
        if (typeof window !== 'undefined') {
            try {
                const storageRaw = localStorage.getItem('onesaas-auth-storage');
                if (storageRaw) {
                    const parsed = JSON.parse(storageRaw);
                    // parsed.state contains the actual state
                    if (parsed.state && parsed.state.tenantId) {
                        tenantId = parsed.state.tenantId;
                    }
                }
            } catch (e) {
                console.error("Error parsing auth storage for tenantId", e);
            }
        }

        config.headers['x-tenant-id'] = tenantId;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Custom fetch function for Orval
export const customInstance = <T>(config: any, options?: any): Promise<T> => {
    const source = axios.CancelToken.source();
    const promise = axiosInstance({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};
