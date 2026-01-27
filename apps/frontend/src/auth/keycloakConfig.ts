import { AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

export const keycloakConfig: AuthProviderProps = {
    authority: process.env.NEXT_PUBLIC_KEYCLOAK_URL
        ? `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`
        : "http://localhost:8080/realms/onesaas",
    client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "issue-tracker",
    redirect_uri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    scope: "openid profile email",
    response_type: "code",
    userStore: typeof window !== "undefined" ? new WebStorageStateStore({ store: window.localStorage }) : undefined,
    stateStore: typeof window !== "undefined" ? new WebStorageStateStore({ store: window.localStorage }) : undefined,
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
};
