
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const getEnv = (key: string): string => {
  // Check import.meta.env (Vite standard)
  if (import.meta.env && import.meta.env[key]) return import.meta.env[key];
  
  // Check process.env (Node fallback/shim)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  } catch (e) {}

  // Check localStorage (User-defined fallback)
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || '';

// Debug logging (safe)
if (typeof window !== 'undefined') {
  console.log('Supabase check:', {
    hasUrl: !!supabaseUrl,
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'none',
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
  });
}

// Pre-define a dummy client if config is missing to avoid crashing on module load
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signUp: async () => {
          console.error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.');
          return { data: { user: null }, error: new Error('Configuração do Supabase ausente') };
        },
        signInWithPassword: async () => {
          console.error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.');
          return { data: { user: null }, error: new Error('Configuração do Supabase ausente') };
        },
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

// Compatibilidade com código legado que usa 'supabase'
export const supabase = supabaseClient;


if (!supabaseUrl) {
  console.error('URL do Supabase não encontrada! Por favor, adicione VITE_SUPABASE_URL às suas variáveis de ambiente.');
}
if (!supabaseAnonKey) {
  console.warn('Chave Anon do Supabase não encontrada. O aplicativo funcionará em modo offline sem armazenamento na nuvem.');
}
