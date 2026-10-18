import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import {
  ShieldCheck,
  Users,
  Mail,
  Send,
  History,
  CheckCircle2,
  Lock,
  UserPlus,
  Shield,
  Edit,
  Power,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { OrganizationMembersPanel } from './OrganizationMembersPanel';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    authUser,
    switchUserById, 
    updateUserProfile, 
    toggleUserStatus, 
    auditLogs,
    campaigns,
    sendMarketingCampaign,
    currentOrg 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roles' | 'marketing' | 'audit'>('roles');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Marketing Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [targetGroup, setTargetGroup] = useState<'all_customers' | 'active_clients' | 'inactive_clients' | 'all_vendors' | 'internal_staff'>('all_customers');
  const [campaignContent, setCampaignContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isAdmin = currentUser.role === 'admin';
  const canManageMembers = isAdmin || currentUser.organizationPermissions?.manage_users === true;

  const handleSendMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignSubject || !campaignContent) return;

    setIsSending(true);
    setTimeout(() => {
      sendMarketingCampaign({
        title: campaignTitle,
        subject: campaignSubject,
        targetGroup,
        content: campaignContent,
        recipientCount: targetGroup === 'all_customers' ? 142 : targetGroup === 'internal_staff' ? users.length : 48
      });
      setIsSending(false);
      setCampaignTitle('');
      setCampaignSubject('');
      setCampaignContent('');
      alert('ส่งแคมเปญการตลาดผ่าน Gmail ไปยังกลุ่มเป้าหมายเรียบร้อยแล้ว!');
    }, 1000);
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    updateUserProfile(userId, { role: newRole });
  };

  if (authUser) {
    return canManageMembers ? <OrganizationMembersPanel /> : (
      <section className="max-w-xl mx-auto mt-12 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 text-center">
        <h1 className="text-lg font-bold text-on-surface">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="mt-2 text-sm text-on-surface-variant">หน้านี้สงวนไว้สำหรับผู้ดูแลที่ได้รับสิทธิ์จัดการสมาชิก</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="max-w-xl mx-auto mt-12 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 text-center">
        <h1 className="text-lg font-bold text-on-surface">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="mt-2 text-sm text-on-surface-variant">หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            การจัดการผู้ใช้ 3 รูปแบบ & การตลาด Gmail (User Hub & Marketing)
          </h1>
          <p className="text-xs text-outline mt-1">
            ควบคุมสิทธิ์ User, UserSeller, Admin, ประวัติการใช้งาน (Audit Trail) และส่งอีเมลการตลาดผ่าน Gmail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
            isAdmin ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant/30 text-outline'
          }`}>
            สิทธิ์ของคุณ: <b className="uppercase">{currentUser.role}</b>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'roles' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ผู้ใช้งาน 3 รูปแบบ ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'marketing' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>การตลาดผ่าน Gmail ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'audit' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ประวัติกิจกรรม & ตรวจสอบสิทธิ์ (Audit Trail)</span>
        </button>
      </div>

      {/* Tab 1: 3-Role User Management */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>โครงสร้างระดับสิทธิ์ผู้ใช้ 3 รูปแบบของระบบ AccData</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-on-primary uppercase">
                  1. Admin
                </span>
                <div className="font-bold text-on-surface text-xs mt-2">ผู้ดูแลระบบสูงสุด</div>
                <div className="text-[11px] text-outline mt-0.5 leading-relaxed">
                  ควบคุมภาพรวมทั้งหมด, บัญชีธนาคาร, ปรับเปลี่ยนแก้ไขสิทธิ์ User, เปิด/ปิดฟังก์ชันระบบ และส่งข้อความการตลาดผ่าน Gmail
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-on-secondary uppercase">
                  2. userSeller
                </span>
                <div className="font-bold text-on-surface text-xs mt-2">บุคลากรฝ่ายขาย / แผนกในหน่วยงาน</div>
                <div className="text-[11px] text-outline mt-0.5 leading-relaxed">
                  ใช้ฐานข้อมูล (UserData) เดียวกันในองค์กร ออกใบเสนอราคา (QT), วางบิล (BL), เปิดบิลขาย และดูแลลูกค้า
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface uppercase">
                  3. user
                </span>
                <div className="font-bold text-on-surface text-xs mt-2">เจ้าหน้าที่ทั่วไป (Staff)</div>
                <div className="text-[11px] text-outline mt-0.5 leading-relaxed">
                  ใช้งานระบบทั่วไปตามสิทธิ์ที่ได้รับมอบหมาย เช่น คลังสินค้า, พิมพ์ใบปะหน้า, บันทึกค่าใช้จ่าย
                </div>
              </div>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">รายชื่อผู้ใช้งานในองค์กร {currentOrg.name}</h2>
              <span className="text-xs text-outline">{users.length} คน</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="py-3 px-4">ผู้ใช้งาน</th>
                    <th className="py-3 px-4">แผนก / ตำแหน่ง</th>
                    <th className="py-3 px-4">ระดับสิทธิ์ (3 รูปแบบ)</th>
                    <th className="py-3 px-4">สถานะบัญชี</th>
                    <th className="py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                    <th className="py-3 px-4 text-center">สลับทดสอบ / แก้ไข</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-on-surface flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-primary text-on-primary">
                                    คุณ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-outline font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-outline">{u.department}</td>

                        <td className="py-3 px-4">
                          {isAdmin ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                              className="px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/40 font-bold text-xs"
                            >
                              <option value="admin">Admin (ผู้ดูแลสูงสุด)</option>
                              <option value="userSeller">userSeller (ทีมขายในหน่วยงาน)</option>
                              <option value="user">user (เจ้าหน้าที่ทั่วไป)</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              u.role === 'admin' ? 'bg-primary text-on-primary' :
                              u.role === 'userSeller' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'
                            }`}>
                              {u.role}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {u.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>ใช้งานปกติ</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              ระงับการใช้งาน
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-outline font-mono text-[11px]">
                          {u.lastLogin || 'ไม่เคยเข้าสู่ระบบ'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Switch viewpoint button */}
                            {!isSelf && (
                              <button
                                onClick={() => switchUserById(u.id)}
                                className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-[11px] font-bold text-primary transition-colors"
                                title="สลับไปทดสอบมุมมองของผู้ใช้นี้"
                              >
                                สลับมองมุมนี้
                              </button>
                            )}

                            {isAdmin && !isSelf && (
                              <button
                                onClick={() => toggleUserStatus(u.id)}
                                className="p-1 rounded text-outline hover:text-error"
                                title={u.isActive ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gmail Marketing Tool */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Left 2 Cols: Compose Broadcast Email via Gmail */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>ส่งข้อความการตลาดผ่าน Gmail (Gmail Marketing Broadcast)</span>
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Admin สามารถส่งข้อเสนอ โปรโมชั่น ใบแจ้งยอด หรือข่าวสารผ่านบัญชี Google Gmail ไปยังกลุ่มลูกค้าและทีมงาน
              </p>
            </div>

            <form onSubmit={handleSendMarketing} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">ชื่อแคมเปญการตลาด (สำหรับบันทึกในระบบ)</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="เช่น แคมเปญส่วนลดต่ออายุสมาชิกรายปี และแนะนำฮาร์ดแวร์บาร์โค้ด"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">กลุ่มเป้าหมายผู้รับ (Target Audience)</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface"
                  >
                    <option value="all_customers">ลูกค้าทั้งหมด (All Customers - 142 รายการ)</option>
                    <option value="active_clients">ลูกค้าประจำที่มียอดซื้อต่อเนื่อง (Active)</option>
                    <option value="inactive_clients">ลูกค้าที่ขาดการติดต่อนานเกิน 60 วัน</option>
                    <option value="all_vendors">ซัพพลายเออร์และคู่ค้าทั้งหมด</option>
                    <option value="internal_staff">บุคลากรภายในหน่วยงาน (Internal Team)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">ส่งผ่านบัญชี Gmail</label>
                  <input
                    type="text"
                    readOnly
                    value={`${currentUser.email} (Google Workspace API)`}
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-lg text-outline font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">หัวข้ออีเมล (Email Subject)</label>
                <input
                  type="text"
                  required
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="เช่น [สิทธิพิเศษ] รับส่วนลด 15% สำหรับซอฟต์แวร์บัญชีคลาวด์และเครื่องพิมพ์สลิป"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">เนื้อหาอีเมล (Message Content / HTML Template)</label>
                <textarea
                  required
                  rows={5}
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  placeholder="พิมพ์ข้อความที่ต้องการส่งถึงลูกค้า สามารถระบุโปรโมชั่น ลิงก์ใบเสนอราคา หรือข้อความขอบคุณ..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-bold rounded-lg shadow-sm transition-all"
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
                  <span>{isSending ? 'กำลังส่งผ่าน Gmail API...' : 'ส่งอีเมลการตลาดเดี๋ยวนี้'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Sent Campaigns History */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-on-surface">ประวัติแคมเปญที่ส่งแล้ว</h3>
            <div className="space-y-3">
              {campaigns.map(camp => (
                <div key={camp.id} className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      ส่งสำเร็จ {camp.sentCount} ราย
                    </span>
                    <span className="text-[10px] text-outline font-mono">{camp.sentAt?.split('T')[0]}</span>
                  </div>
                  <div className="font-bold text-on-surface">{camp.title}</div>
                  <div className="text-[11px] text-outline line-clamp-1">{camp.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4 animate-in fade-in text-xs">
          <div>
            <h2 className="text-sm font-bold text-on-surface">บันทึกกิจกรรมความปลอดภัยและสิทธิ์ (Security Audit Trail)</h2>
            <p className="text-xs text-outline mt-0.5">
              ระบบบันทึกประวัติการสร้าง แก้ไข อนุมัติเอกสาร ตรวจสลิป และการเข้าถึงระบบโดยละเอียด
            </p>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/30 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    LOG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{log.userName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container font-mono font-bold text-primary">
                        {log.action}
                      </span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      {log.details}
                    </div>
                    <div className="text-[10px] text-outline font-mono mt-1">
                      IP: {log.ipAddress || '127.0.0.1'} • Entity: {log.entityType} ({log.entityId})
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-outline font-mono shrink-0 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

