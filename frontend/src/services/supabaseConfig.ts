// ============================================================================
// 🔌 SUPABASE CONNECTION SETTINGS
// ============================================================================

export const SUPABASE_URL: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inqqjossxelydrdabglj.supabase.co";

export const SUPABASE_ANON_KEY: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucXFqb3NzeGVseWRyZGFiZ2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjUwOTYsImV4cCI6MjA4MTEwMTA5Nn0.hQdVyB2p0D5OQw1fHg_hfSkHZ5YMjThkcHd1I8VL680";
