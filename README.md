# OneSAAS Issue Tracker - Project Documentation

Welcome to the **OneSAAS Issue Tracker**. This document provides a detailed explanation of the project's architecture, technologies, and inner workings.

---

## 🏗️ Architecture Overview

This application uses a modern **Backend-for-Frontend (BFF)** style architecture, separating the User Interface (Frontend) from the Business Logic (Backend), secured by an Identity Provider.

```mermaid
graph TD
    User((User)) -->|Browser| Frontend[React + Vite Frontend]
    
    subgraph "Authentication"
        Frontend -->|Login Redirect| Keycloak[Keycloak IDP]
        Keycloak -->|JWT Token| Frontend
    end

    subgraph "Application Logic"
        Frontend -->|API Request (Token + TenantID)| Backend[NestJS Backend API]
        Backend -->|Verify Token| Keycloak
        Backend -->|Read/Write Data| Database[(Supabase PostgreSQL)]
    end
```

---

## 🛠️ Tech Stack & Learning Guide

Here is "Each and Every Thing" used in this project and **WHY**:

### 1. Frontend: **React + Vite**
*   **What**: React is the library for building the UI. Vite is the build tool (replacing generic Webpack) for instant start times.
*   **Why**: React is the industry standard for dynamic web apps. Vite offers a superior developer experience (fast HMR).
*   **Key Dependencies**:
    *   `axios`: For making HTTP requests to the backend.
    *   `@tanstack/react-query`: For managing server state (caching API responses).
    *   `react-oidc-context`: For handling the complex OpenID Connect (OIDC) login flow with Keycloak.

### 2. Backend: **NestJS**
*   **What**: A progressive Node.js framework for building efficient, scalable server-side applications.
*   **Why**: Unlike Express (which is unstructured), NestJS provides a strict "Angular-like" structure (Controllers, Services, Modules). This is critical for enterprise apps to remain maintainable.
*   **Key Dependencies**:
    *   `@nestjs/swagger`: Generates the API Documentation (OpenAPI) automatically.
    *   `passport-jwt`: Validates the Security Tokens.

### 3. Database: **Supabase (PostgreSQL)**
*   **What**: A hosted PostgreSQL database with built-in APIs.
*   **Why**: We need a relational database to store Issues and Users. PostgreSQL is the most robust open-source option. Supabase adds a nice UI and Row Level Security (RLS).
*   **Integration**: We use the `supabase-js` client in the backend to query data.

### 4. Authentication: **Keycloak**
*   **What**: An open-source Identity and Access Management solution.
*   **Why**: Security is hard. Instead of writing "Login" logic ourselves (and risking bugs), we use Keycloak. It handles Passwords, 2FA, Sessions, and generating standard **JWT (JSON Web Tokens)**.

---

## 📂 Project Structure Explained

```text
onesaas-issue-tracker/
├── backend-reference/          # The Backend Code (NestJS)
│   ├── src/
│   │   ├── auth/               # Security Logic (Guards, Strategies)
│   │   ├── issues/             # The "Issues" Feature
│   │   │   ├── dto/            # Data Transfer Objects (Validation)
│   │   │   ├── issues.controller.ts # "The Receptionist" (Receive Requests)
│   │   │   ├── issues.service.ts    # "The Worker" (Talk to DB)
│   │   └── main.ts             # App Entry Point (Swagger setup)
│
├── src/                        # The Frontend Code (React)
│   ├── auth/                   # Keycloak Config
│   ├── components/             # Reusable UI (Navbar, Buttons)
│   ├── context/                # Global State (AuthContext for user session)
│   ├── pages/                  # Screen Views (IssueList, Login)
│   ├── services/               # API Communication
│   │   ├── api.ts              # Generated Hooks (by Orval)
│   │   ├── axiosInstance.ts    # The "Interceptor" (Injects Token)
│
├── supabase/                   # Database
│   ├── migrations/             # SQL Files to create tables
```

---

## ⚙️ How It Works (The Flow)

### Scenario: "A User views the Issue List"

1.  **Login**: 
    The user clicks "Login". `react-oidc-context` redirects them to **Keycloak**. The user enters `admin/admin`. Keycloak validates them and sends them back with a **JWT Access Token**.

2.  **Request**: 
    The `IssueList.tsx` component needs data. It calls `useIssuesControllerFindAll()`.
    
3.  **Interception**: 
    Before the request leaves the browser, `axiosInstance.ts` wakes up.
    *   It checks Local Storage for the **Token**. Adds header: `Authorization: Bearer <token>`.
    *   It sets the **Tenant**: Adds header `x-tenant-id: default-tenant`.

4.  **Backend Processing**:
    *   **Guard**: `JwtAuthGuard` checks if the Token is valid (signed by Keycloak).
    *   **Controller**: `IssuesController` receives the request. Extract `x-tenant-id`.
    *   **Service**: `IssuesService` takes the Tenant ID and queries Supabase: `SELECT * FROM issues WHERE tenant_id = 'default-tenant'`.

5.  **Response**:
    The List of issues is returned to React and displayed.

---

## 🌟 Key Features Deep Dive

### 1. Multi-Tenancy (Tenant Architecture)
We implemented "Application-Level Multi-Tenancy".
*   **Database**: Every row in the `issues` table has a `tenant_id` column.
*   **Security**: The Backend `IssuesService` **always** adds `.eq('tenant_id', tenantId)` to every query. This ensures User A never sees User B's data (if they are in different tenants).
*   **Frontend**: Sends the Tenant ID via Headers.

### 2. Role-Based Access Control (RBAC)
We distinguish between `admin` and `viewer`.
*   **Keycloak**: Roles are assigned to users in the Admin Console.
*   **Backend**: We use a custom `@Roles('admin')` decorator.
*   **Guard**: `RolesGuard` reads the Token. If the user doesn't have the role, query is blocked (`403 Forbidden`).

---

## 🚀 How to Run

1.  **Frontend**: `npm run dev` (Port 3000)
2.  **Backend**: `cd backend-reference` -> `npm run start:dev` (Port 3001)
3.  **Keycloak**: (Run via startup script) (Port 8080)
