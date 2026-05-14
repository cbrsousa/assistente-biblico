
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
