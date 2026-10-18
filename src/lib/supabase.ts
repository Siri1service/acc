import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage first (runtime config), then fallback to Vite .env
export const getSupabaseConfig = () => {
  try {
    const saved = localStorage.getItem('accdata_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url as string,
          anonKey: parsed.anonKey as string,
          source: 'localStorage' as const
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Supabase config', e);
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl,
    anonKey: envKey,
    source: 'env' as const
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('accdata_supabase_config', JSON.stringify({ url, anonKey }));
  // Re-instantiate client
  initSupabaseClient();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('accdata_supabase_config');
  initSupabaseClient();
};

let activeSupabaseClient: SupabaseClient | null = null;
let activeConfigured = false;

export const initSupabaseClient = (): { client: SupabaseClient | null; configured: boolean } => {
  const config = getSupabaseConfig();
  const isValid = Boolean(
    config.url &&
    config.anonKey &&
    !config.url.includes('your-project') &&
    config.url.startsWith('http')
  );

  activeConfigured = isValid;
  if (isValid) {
    try {
      activeSupabaseClient = createClient(config.url, config.anonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      activeSupabaseClient = null;
      activeConfigured = false;
    }
  } else {
    activeSupabaseClient = null;
  }

  return { client: activeSupabaseClient, configured: activeConfigured };
};

// Initialize on module load
initSupabaseClient();

export const isSupabaseConfigured = () => activeConfigured;
export const getSupabase = () => activeSupabaseClient;

// Connection Diagnostic Check
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; message: string; details?: any }> => {
  const { client, configured } = initSupabaseClient();

  if (!configured || !client) {
    return {
      connected: false,
      message: 'ยังไม่ได้ระบุ Supabase URL และ Anon Key ที่ถูกต้อง (ระบบทำงานในโหมด High-Performance Local DB พร้อมใช้งาน)',
    };
  }

  try {
    // Attempt querying the organizations table or auth health
    const { data, error } = await client.from('organizations').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's still connected to postgres
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'เชื่อมต่อ Supabase สำเร็จ แต่ยังไม่ได้รัน SQL Schema (กรุณานำไฟล์ supabase/schema.sql ไปรันใน Supabase SQL Editor)',
          details: error
        };
      }
      throw error;
    }
    return {
      connected: true,
      message: 'เชื่อมต่อฐานข้อมูล Supabase PostgreSQL สำเร็จเรียบร้อยแล้ว (พร้อมใช้งานจริง)',
      details: data
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `การเชื่อมต่อ Supabase ล้มเหลว: ${err?.message || 'Network error'}`,
      details: err
    };
  }
};
