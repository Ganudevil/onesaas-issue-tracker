# Setup Notes

## Database Changes
- Added `comments` table to `supabase/schema.sql`.
- **Schema Updates**:
    - `comments` table uses `text` column (not content) and `created_by` (not user_id) to match frontend code.
    - Added `deleted_at` column to `users`, `issues`, and `comments` to support soft deletes used in the code.
- Created migration file `supabase/migrations/20241222000000_add_comments.sql`.

## Environment Variables
- Configured `frontend/.env.local`.
- Configured `backend-reference/.env`.

## Next Steps
1. **Docker Services**:
   I have triggered a restart of the Docker services to apply the new schema.
   If needed, you can manually run:
   ```powershell
   docker-compose down -v
   docker-compose up -d
   ```

2. **Keycloak Setup**:
   - Access Keycloak at `http://localhost:8080`.
   - Login with `admin` / `admin`.
   - **Create Realm**: Name it `onesaas`.
   - **Create Client**: Name it `onesaas-frontend`.
     - Valid Redirect URIs: `http://localhost:3000/*`
     - Web Origins: `http://localhost:3000` (or `*`)
   - **Create User**: Create a test user in the `onesaas` realm.

3. **Run Application**:
   - Frontend: `cd frontend` -> `npm run dev`
   - Backend: `cd backend-reference` -> `npm run start:dev`
