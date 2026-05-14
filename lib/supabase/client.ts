import { createBrowserClient } from '@supabase/ssr';

let instance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in browser');
  }
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    instance = createBrowserClient(url, key);
  }
  return instance;
}
