# How to Run OneSAAS Issue Tracker

## 1. Prerequisites
- **Keycloak**: Must be running on `http://localhost:8080`.
- **Supabase**: Must be active.

## 2. Database Setup (Crucial!)
Since this application uses Supabase, you must ensure the database schema is applied.

1. Open `supabase/schema.sql`.
2. Copy the entire content.
3. Go to your Supabase Dashboard -> SQL Editor.
4. Paste and Run the SQL.
   
   *This creates the `issues` and `users` tables and enables RLS policies.*

## 3. Starting the Application
You can start everything using the provided PowerShell script:

```powershell
./start-dev.ps1
```

Or manually:
1. **Backend**:
   ```bash
   cd backend-reference
   npm run start:dev
   ```
2. **Frontend**:
   ```bash
   npm run dev
   ```

## 4. Access
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Swagger Docs**: [http://localhost:3001/api](http://localhost:3001/api)

## 5. Troubleshooting
- **Database/Auth Errors**: Check `services/supabaseConfig.ts` and ensure schema is applied.
- **Keycloak Errors**: Check `keycloakConfig.ts` corresponds to your Keycloak client setup.
