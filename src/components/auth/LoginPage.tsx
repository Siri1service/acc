import React, { useState } from 'react';
import { Database, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabaseConfig, isSupabaseConfigured, saveSupabaseConfig } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useApp();
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [ready, setReady] = useState(isSupabaseConfigured());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const saveConfig = () => {
    try {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      setReady(isSupabaseConfigured());
      setError(isSupabaseConfigured() ? '' : 'กรุณาตรวจสอบ URL และ Anon Key');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกการตั้งค่าไม่สำเร็จ');
    }
  };

  const login = async () => {
    setBusy(true); setError('');
    try { await signInWithGoogle(); }
    catch (err) { setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ'); setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-card p-7 space-y-6">
        <header className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-2xl font-bold">A</div>
          <h1 className="text-xl font-bold text-on-surface">เข้าสู่ระบบ AccData</h1>
          <p className="text-sm text-on-surface-variant">ครั้งแรกระบบจะสมัครบัญชีให้โดยอัตโนมัติ ใช้บัญชี Google ของคุณ</p>
        </header>

        {!ready && (
          <div className="space-y-3 rounded-2xl bg-surface-container-low p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Database className="w-4 h-4" /> ตั้งค่า Supabase</div>
            <label className="block text-xs font-medium">Project URL
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-project.supabase.co" className="mt-1 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 font-mono" />
            </label>
            <label className="block text-xs font-medium">Publishable / Anon Key
              <input type="password" value={anonKey} onChange={e => setAnonKey(e.target.value)} placeholder="Supabase public client key" className="mt-1 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 font-mono" />
            </label>
            <button onClick={saveConfig} className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary">บันทึกการเชื่อมต่อ</button>
          </div>
        )}

        {ready && <button disabled={busy} onClick={login} className="w-full rounded-xl bg-white border border-outline-variant px-4 py-3 flex items-center justify-center gap-3 font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-60">
          <span className="font-bold text-lg text-blue-600">G</span><span>{busy ? 'กำลังเชื่อมต่อ Google…' : 'เข้าสู่ระบบ / สมัครด้วย Google'}</span><LogIn className="w-4 h-4" />
        </button>}

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}
        <footer className="space-y-2 text-xs text-on-surface-variant">
          <p className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700" /> สิทธิ์ผู้ดูแลกำหนดในฐานข้อมูลโดยเจ้าของโปรเจกต์เท่านั้น</p>
          <p className="flex gap-2"><LockKeyhole className="w-4 h-4 shrink-0" /> ไม่ใช้หรือเก็บรหัสผ่าน Google ในแอป</p>
        </footer>
      </section>
    </main>
  );
};
