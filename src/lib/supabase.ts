import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http')
);

// Fallback dummy client or real client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in .env (Using High-Performance Local DB with Instant Sync)',
    };
  }

  try {
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) throw error;
    return {
      connected: true,
      message: 'เชื่อมต่อ Supabase PostgreSQL สำเร็จเรียบร้อยแล้ว',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `เชื่อมต่อ Supabase ล้มเหลว: ${err?.message || 'Unknown error'}`,
    };
  }
};

