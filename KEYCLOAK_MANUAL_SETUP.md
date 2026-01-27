# Keycloak Manual Setup Guide

This guide details exactly how to configure your local Keycloak instance to work with the **oneSAAS Issue Tracker**.

## Prerequisites
- Keycloak is running at [http://localhost:8080](http://localhost:8080)
- You can access the administration console.
- Credentials: `admin` / `admin`

---

## 1. Login
1. Open [http://localhost:8080](http://localhost:8080) in your browser.
2. Click **Administration Console**.
3. Log in with:
    - **Username**: `admin`
    - **Password**: `admin`

## 2. Create Realm
1. Hover over the dropdown **"Master"** in the top-left corner.
2. Click **Create Realm**.
3. In the **Realm name** field, enter exactly:
   ```
   onesaas
   ```
4. Click **Create**.

## 3. Create Client
1. In the left sidebar menu, click **Clients**.
2. Click the **Create client** button.
3. **Step 1: General Settings**:
    - **Client type**: `OpenID Connect`
    - **Client ID**: `issue-tracker`
    - Click **Next**.
4. **Step 2: Capability config**:
    - **Client authentication**: **OFF** (This must be off for a frontend React app)
    - **Authorization**: **OFF**
    - **Authentication flow**:
        - [x] Standard flow
        - [x] Direct access grants
    - Click **Next**.
5. **Step 3: Login settings**:
    - **Root URL**: `http://localhost:3000`
    - **Home URL**: `http://localhost:3000`
    - **Valid redirect URIs**:
        ```
        http://localhost:3000/*
        ```
    - **Web origins**:
        ```
        *
        ```
        *(Or `http://localhost:3000` for stricter security, but `*` reduces CORS headaches in dev).*
    - Click **Save**.

## 4. Create User
1. In the left sidebar menu, click **Users**.
2. Click **Add user**.
3. Fill in the basics:
    - **Username**: `testuser`
    - **Email**: `test@example.com`
    - **First name**: `Test`
    - **Last name**: `User`
    - **Email verified**: **Yes** (Toggle this ON to avoid verification emails)
4. Click **Create**.

## 5. Set Password
1. After creating the user, click the **Credentials** tab at the top of the user page.
2. Click **Set password**.
3. Enter password: `password` (or whatever you prefer).
4. **Temporary**: **OFF** (Toggle this OFF so you don't have to change it on first login).
5. Click **Save** -> **Save password**.

---

## Verification
1. Go to your app: [http://localhost:3000](http://localhost:3000)
2. Click **Login**.
3. You should be redirected to standard Keycloak login page.
4. Log in with `testuser` / `password`.
5. You should be redirected back to the app and logged in!
