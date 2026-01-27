-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  display_name text, -- Matches your request for 'username'
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 2. Create Issues Table
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL CHECK (char_length(title) >= 3),
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_by uuid REFERENCES public.users(id),
  assigned_to uuid REFERENCES public.users(id),
  tenant_id text NOT NULL DEFAULT 'default-tenant',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text text NOT NULL,
  issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 5. Create basic access policies (Development Mode: Allow All)
CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- 6. Verify Tables
SELECT * FROM public.users;
