import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Hardcoded values from .env for this project
const SUPABASE_URL = "https://uoljswwixsevqvuwedln.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbGpzd3dpeHNldnF2dXdlZGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjA0NjgsImV4cCI6MjA3ODc5NjQ2OH0.qDrsfmG4agJMgNi0TigvGGde0LyO4yQl6ohbPSyzTsY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
