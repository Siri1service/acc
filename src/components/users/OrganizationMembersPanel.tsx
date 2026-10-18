import React, { useCallback, useEffect, useState } from 'react';
import { MailPlus, RefreshCw, ShieldCheck, UserMinus, UsersRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabase } from '../../lib/supabase';
import { UserRole } from '../../types';

const permissionsList = [
  ['view_documents', 'ดูเอกสาร'], ['create_documents', 'สร้างเอกสาร'], ['edit_documents', 'แก้ไขเอกสาร'],
  ['approve_documents', 'อนุมัติเอกสาร'], ['delete_documents', 'ลบเอกสาร'],
  ['view_contacts', 'ดูผู้ติดต่อ'], ['manage_contacts', 'เพิ่ม/แก้ไขผู้ติดต่อ'],
  ['view_products', 'ดูสินค้า'], ['manage_products', 'เพิ่ม/แก้ไขสินค้า'],
  ['view_banking', 'ดูข้อมูลธนาคารและสลิป'], ['manage_banking', 'จัดการข้อมูลธนาคารและสลิป'],
  ['view_reports', 'ดูรายงานและผังบัญชี'], ['view_taxes', 'ดูข้อมูลภาษี'],
  ['view_logistics', 'ดูการจัดส่ง'], ['manage_logistics', 'จัดการการจัดส่ง'],
  ['view_audit_logs', 'ดูประวัติกิจกรรม'], ['manage_settings', 'แก้ไขการตั้งค่าองค์กร'],
  ['manage_users', 'เชิญและจัดการสมาชิก'],
] as const;

type PermissionKey = typeof permissionsList[number][0];
type Member = { id: string; user_id: string; role: UserRole; permissions: Record<string, boolean>; user_profiles?: { email?: string; full_name?: string; phone?: string } | null };
type Invitation = { id: string; email: string; role: UserRole; status: string; created_at: string };

const roleDefaults: Record<UserRole, Record<string, boolean>> = {
  admin: Object.fromEntries(permissionsList.map(([key]) => [key, true])),
  userSeller: { view_documents: true, create_documents: true, edit_documents: true, view_contacts: true, manage_contacts: true, view_products: true, view_taxes: true },
  user: { view_documents: true, view_contacts: true, view_products: true },
};

export const OrganizationMembersPanel: React.FC = () => {
  const { currentOrg, currentUser } = useApp();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(roleDefaults.user);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const canManage = currentUser.role === 'admin' || currentUser.organizationPermissions?.manage_users === true;

  const load = useCallback(async () => {
    const db = getSupabase();
    if (!db || !currentOrg.id) return;
    await db.rpc('accept_pending_org_invitations');
    const [{ data: memberRows, error: memberError }, { data: invitationRows }, { data: organization }] = await Promise.all([
      db.from('organization_members').select('id,user_id,role,permissions,user_profiles(email,full_name,phone)')
        .eq('organization_id', currentOrg.id).order('created_at', { ascending: true }),
      db.from('organization_invitations').select('id,email,role,status,created_at')
        .eq('organization_id', currentOrg.id).eq('status', 'pending').order('created_at', { ascending: false }),
      db.from('organizations').select('owner_user_id').eq('id', currentOrg.id).maybeSingle(),
    ]);
    if (memberError) setError(memberError.message);
    else {
      const nextMembers = (memberRows || []) as unknown as Member[];
      if (organization?.owner_user_id && !nextMembers.some(member => member.user_id === organization.owner_user_id)) {
        nextMembers.unshift({
          id: `owner-${organization.owner_user_id}`, user_id: organization.owner_user_id, role: 'admin', permissions: {},
          user_profiles: organization.owner_user_id === currentUser.id ? { email: currentUser.email, full_name: currentUser.fullName, phone: currentUser.phone } : { full_name: 'เจ้าขององค์กร' },
        });
      }
      setMembers(nextMembers);
    }
    setInvitations((invitationRows || []) as Invitation[]);
  }, [currentOrg.id]);

  useEffect(() => { void load(); }, [load]);

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      const db = getSupabase();
      if (!db) throw new Error('ยังไม่ได้เชื่อมต่อ Supabase');
      const { data, error: invokeError } = await db.functions.invoke('invite-organization-member', {
        body: { email, role, permissions, organizationId: currentOrg.id, redirectTo: window.location.origin },
      });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setNotice(data?.message || 'บันทึกคำเชิญแล้ว');
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เชิญผู้ใช้ไม่สำเร็จ');
    } finally { setBusy(false); }
  };

  const updateMember = async (member: Member, changes: Partial<Pick<Member, 'role' | 'permissions'>>) => {
    const db = getSupabase();
    if (!db) return;
    const { error: updateError } = await db.from('organization_members').update(changes).eq('id', member.id);
    if (updateError) setError(updateError.message); else await load();
  };

  const removeMember = async (member: Member) => {
    if (!confirm(`นำ ${member.user_profiles?.email || 'สมาชิก'} ออกจากองค์กรหรือไม่?`)) return;
    const db = getSupabase();
    if (!db) return;
    const { error: deleteError } = await db.from('organization_members').delete().eq('id', member.id);
    if (deleteError) setError(deleteError.message); else await load();
  };

  const revokeInvitation = async (invitation: Invitation) => {
    const db = getSupabase();
    if (!db) return;
    const { error: revokeError } = await db.from('organization_invitations').update({ status: 'revoked' }).eq('id', invitation.id);
    if (revokeError) setError(revokeError.message); else await load();
  };

  if (!canManage) return <div className="rounded-2xl border bg-surface-container-lowest p-6 text-sm">ไม่มีสิทธิ์จัดการสมาชิกองค์กร</div>;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold text-on-surface">สมาชิกและสิทธิ์การเข้าถึง</h1><p className="mt-1 text-xs text-on-surface-variant">องค์กร {currentOrg.name} · สิทธิ์ถูกบังคับตรวจในฐานข้อมูล</p></div>
        <button onClick={() => void load()} className="rounded-lg border p-2 text-on-surface-variant hover:bg-surface-container" title="โหลดรายชื่อใหม่"><RefreshCw className="h-4 w-4" /></button>
      </header>

      {error && <div role="alert" className="rounded-xl bg-error/10 p-3 text-sm text-error">{error}</div>}
      {notice && <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

      <form onSubmit={sendInvite} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2"><MailPlus className="h-5 w-5 text-primary" /><h2 className="font-bold">เชิญผู้ใช้เข้าองค์กร</h2></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <label className="text-xs font-semibold">อีเมลผู้ใช้<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border bg-surface-container-low px-3 py-2 text-sm" placeholder="name@example.com" /></label>
          <label className="text-xs font-semibold">Role<select value={role} onChange={e => { const value = e.target.value as UserRole; setRole(value); setPermissions(roleDefaults[value]); }} className="mt-1 w-full rounded-lg border bg-surface-container-low px-3 py-2 text-sm"><option value="user">ผู้ใช้ทั่วไป</option><option value="userSeller">ฝ่ายขาย</option><option value="admin">ผู้ดูแลองค์กร</option></select></label>
        </div>
        <fieldset className="rounded-xl border border-outline-variant/30 p-3">
          <legend className="px-1 text-xs font-semibold">กำหนดข้อมูลและการทำงานที่เข้าถึงได้</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {permissionsList.map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg bg-surface-container-low px-2.5 py-2 text-xs"><input type="checkbox" disabled={role === 'admin'} checked={Boolean(permissions[key])} onChange={e => setPermissions(p => ({ ...p, [key]: e.target.checked }))} className="accent-primary" />{label}</label>)}
          </div>
        </fieldset>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-60"><MailPlus className="h-4 w-4" />{busy ? 'กำลังส่งคำเชิญ…' : 'ส่งคำเชิญ'}</button>
        <p className="text-[11px] leading-relaxed text-outline">ผู้ใช้ใหม่จะได้รับอีเมลจาก Supabase และถูกเพิ่มเข้าองค์กรหลังยืนยันบัญชี ผู้ใช้ที่มีบัญชีอยู่แล้วจะถูกเพิ่มเมื่อเข้าสู่ระบบครั้งถัดไป</p>
      </form>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b p-4"><h2 className="flex items-center gap-2 font-bold"><UsersRound className="h-4 w-4 text-primary" />สมาชิก ({members.length})</h2></div>
        <div className="divide-y divide-outline-variant/30">
          {members.map(member => {
            const profile = Array.isArray(member.user_profiles) ? member.user_profiles[0] : member.user_profiles;
            const self = member.user_id === currentUser.id;
            const owner = member.id.startsWith('owner-');
            return <div key={member.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><div className="flex items-center gap-2 font-semibold text-sm"><ShieldCheck className="h-4 w-4 text-primary" />{profile?.full_name || profile?.email || member.user_id}{self && <span className="text-[10px] text-outline">(คุณ)</span>}</div><div className="mt-1 text-xs text-on-surface-variant">{profile?.email} {profile?.phone && `· ${profile.phone}`}</div></div>
                <div className="flex items-center gap-2">
                  <select disabled={self || owner} value={member.role} onChange={e => { const nextRole = e.target.value as UserRole; void updateMember(member, { role: nextRole, permissions: roleDefaults[nextRole] }); }} className="rounded-lg border bg-surface-container-low px-2 py-1.5 text-xs"><option value="user">ผู้ใช้ทั่วไป</option><option value="userSeller">ฝ่ายขาย</option><option value="admin">ผู้ดูแลองค์กร</option></select>
                  {!self && !owner && <button onClick={() => void removeMember(member)} className="rounded-lg p-2 text-error hover:bg-error/10" title="นำออกจากองค์กร"><UserMinus className="h-4 w-4" /></button>}
                </div>
              </div>
              {member.role !== 'admin' && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{permissionsList.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-[11px] text-on-surface-variant"><input type="checkbox" checked={Boolean(member.permissions?.[key])} disabled={self || owner} onChange={e => void updateMember(member, { permissions: { ...member.permissions, [key]: e.target.checked } })} className="accent-primary" />{label}</label>)}</div>}
            </div>;
          })}
          {members.length === 0 && <p className="p-5 text-sm text-on-surface-variant">ยังไม่มีสมาชิกที่ยืนยันการเข้าร่วม</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-card overflow-hidden">
        <div className="border-b p-4"><h2 className="font-bold">คำเชิญที่รอตอบรับ ({invitations.length})</h2></div>
        <div className="divide-y divide-outline-variant/30">{invitations.map(invite => <div key={invite.id} className="flex items-center justify-between gap-3 p-4 text-sm"><span>{invite.email} <span className="text-xs text-outline">· {invite.role}</span></span><button onClick={() => void revokeInvitation(invite)} className="text-xs font-semibold text-error hover:underline">ยกเลิกคำเชิญ</button></div>)}{invitations.length === 0 && <p className="p-5 text-sm text-on-surface-variant">ไม่มีคำเชิญค้าง</p>}</div>
      </section>
    </div>
  );
};
