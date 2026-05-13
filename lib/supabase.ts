
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Pre-define a dummy client if config is missing to avoid crashing on module load
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      })
    } as any;

if (!supabaseUrl) {
  console.error('Supabase URL is missing! Please add VITE_SUPABASE_URL to your environment variables.');
}
if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key is missing. The app will work in offline mode without cloud storage.');
}
