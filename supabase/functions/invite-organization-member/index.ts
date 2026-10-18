import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const allowedPermissions = new Set([
  'view_documents', 'create_documents', 'edit_documents', 'approve_documents', 'delete_documents',
  'view_contacts', 'manage_contacts', 'view_products', 'manage_products', 'view_banking',
  'manage_banking', 'view_reports', 'view_logistics', 'manage_logistics', 'view_taxes',
  'view_audit_logs', 'write_audit_logs', 'manage_users', 'manage_settings',
]);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return respond({ error: 'ต้องเข้าสู่ระบบก่อนส่งคำเชิญ' }, 401);
    const projectUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const actorClient = createClient(projectUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await actorClient.auth.getUser();
    if (authError || !user?.email) return respond({ error: 'เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' }, 401);

    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const organizationId = String(body.organizationId || '');
    const role = String(body.role || 'user');
    const permissions = Object.fromEntries(Object.entries(body.permissions || {})
      .filter(([key, value]) => allowedPermissions.has(key) && typeof value === 'boolean'));
    if (!/^\S+@\S+\.\S+$/.test(email) || !organizationId || !['admin', 'userSeller', 'user'].includes(role)) {
      return respond({ error: 'อีเมล องค์กร หรือ Role ไม่ถูกต้อง' }, 400);
    }

    const admin = createClient(projectUrl, serviceKey);
    const [{ data: organization }, { data: member }, { data: profile }] = await Promise.all([
      admin.from('organizations').select('id,owner_user_id,name').eq('id', organizationId).maybeSingle(),
      admin.from('organization_members').select('role,permissions').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle(),
      admin.from('user_profiles').select('role').eq('id', user.id).maybeSingle(),
    ]);
    const canManage = Boolean(organization && (
      organization.owner_user_id === user.id ||
      member?.role === 'admin' || member?.role === 'owner' || member?.permissions?.manage_users === true ||
      (profile?.role === 'admin' && (organization.owner_user_id === user.id || member))
    ));
    if (!canManage) return respond({ error: 'คุณไม่มีสิทธิ์เชิญสมาชิกในองค์กรนี้' }, 403);
    if (email === user.email.toLowerCase()) return respond({ error: 'ไม่สามารถเชิญอีเมลบัญชีตัวเองซ้ำได้' }, 400);

    const { error: invitationError } = await admin.from('organization_invitations').insert({
      organization_id: organizationId, email, role, permissions, invited_by: user.id, status: 'pending',
    });
    if (invitationError) {
      // A pending invitation may already exist because the partial unique index
      // uses lower(email); fall back to an update using a case-insensitive match.
      const { data: pending } = await admin.from('organization_invitations').select('id')
        .eq('organization_id', organizationId).eq('status', 'pending').ilike('email', email).maybeSingle();
      if (!pending) return respond({ error: invitationError.message }, 400);
      const { error: updateError } = await admin.from('organization_invitations').update({ role, permissions, invited_by: user.id })
        .eq('id', pending.id);
      if (updateError) return respond({ error: updateError.message }, 400);
    }

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: String(body.redirectTo || ''),
      data: { invited_organization: organizationId, invited_role: role },
    });
    if (inviteError) {
      const duplicate = /already|registered|exists/i.test(inviteError.message);
      return respond({
        success: true,
        emailSent: false,
        alreadyRegistered: duplicate,
        message: duplicate
          ? 'บันทึกคำเชิญแล้ว ผู้ใช้นี้เข้าสู่ระบบอีกครั้งเพื่อเข้าร่วมองค์กร'
          : `บันทึกสิทธิ์แล้ว แต่ส่งอีเมลไม่สำเร็จ: ${inviteError.message}`,
      });
    }
    return respond({ success: true, emailSent: true, message: `ส่งคำเชิญไปยัง ${email} แล้ว` });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดภายในระบบ' }, 500);
  }
});
