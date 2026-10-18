import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage first (runtime config), then fallback to Vite .env
export const getSupabaseConfig = () => {
  try {
    const saved = localStorage.getItem('accdata_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey && isValidSupabaseConfig(parsed.url, parsed.anonKey)) {
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
  const normalizedUrl = url.trim();
  const normalizedKey = anonKey.trim();
  if (!isValidSupabaseConfig(normalizedUrl, normalizedKey)) {
    throw new Error('กรุณาใส่ Supabase Project URL และ Publishable/Anon Key จริงให้ครบ');
  }
  localStorage.setItem('accdata_supabase_config', JSON.stringify({ url: normalizedUrl, anonKey: normalizedKey }));
  // Re-instantiate client
  initSupabaseClient();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('accdata_supabase_config');
  initSupabaseClient();
};

let activeSupabaseClient: SupabaseClient | null = null;
let activeConfigured = false;

const isValidSupabaseConfig = (url: string, anonKey: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['https:', 'http:'].includes(parsedUrl.protocol) &&
      Boolean(parsedUrl.hostname) &&
      !/your-project|example/i.test(url) &&
      anonKey.length > 30 &&
      !/your-anon-key|replace-me|placeholder/i.test(anonKey);
  } catch {
    return false;
  }
};

export const initSupabaseClient = (): { client: SupabaseClient | null; configured: boolean } => {
  const config = getSupabaseConfig();
  const isValid = isValidSupabaseConfig(config.url, config.anonKey);

  activeConfigured = isValid;
  if (isValid) {
    try {
      activeSupabaseClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage
        }
      });
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
