import { createClient } from '@supabase/supabase-js';

// Read credentials from Expo public environment variables with live Supabase production defaults
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mcogwiuetrugstrjskjx.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iDw739hP677zVWbtzbxSAA_wOfodnKy';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

// If not yet configured, initialize with safe placeholders so the app compiles without error
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
