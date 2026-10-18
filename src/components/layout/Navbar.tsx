import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ChevronDown, 
  Search, 
  Plus, 
  Bell, 
  Shield, 
  FileText,
  UserCheck,
  CheckCircle2,
  X,
  CreditCard,
  Package,
  Layers,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { UserRole, DocumentType } from '../../types';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onOpenNewDocModal?: (type: DocumentType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenNewDocModal }) => {
  const { 
    currentOrg, 
    currentUser, 
    authUser,
    switchUserRole, 
    bankAccounts, 
    setIsOrgSwitcherOpen,
    setIsUsageGuideOpen,
    searchQuery,
    setSearchQuery,
    lastLineNotification,
    setActiveView,
    signOut
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNewDocMenuOpen, setIsNewDocMenuOpen] = useState(false);
  const canCreateDocuments = currentUser.role === 'admin' || currentUser.organizationPermissions?.create_documents === true;

  const rolesList: { role: UserRole; title: string; desc: string; badgeColor: string }[] = [
    { 
      role: 'admin', 
      title: 'Admin (ผู้ดูแลระบบสูงสุด)', 
      desc: 'ควบคุมภาพรวม, สิทธิ์, ผังบัญชี, ตั้งค่า และ Gmail การตลาด', 
      badgeColor: 'bg-primary text-on-primary' 
    },
    { 
      role: 'userSeller', 
      title: 'userSeller (ทีมขายในหน่วยงาน)', 
      desc: 'เข้าถึง Data เดียวกัน ออกใบเสนอราคา/บิล และประสานงานขาย', 
      badgeColor: 'bg-secondary text-on-secondary' 
    },
    { 
      role: 'user', 
      title: 'user (เจ้าหน้าที่ทั่วไป)', 
      desc: 'ใช้งานระบบทั่วไปตามสิทธิ์ที่ได้รับมอบหมาย', 
      badgeColor: 'bg-surface-container-high text-on-surface' 
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile hamburger & Organization Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
          aria-label="เปิดเมนู"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Organization / Tenant Switcher Pill */}
        <button
          onClick={() => setIsOrgSwitcherOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-left transition-all group"
          title="สลับองค์กร / บัญชีที่ต้องการใช้งาน"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-on-surface truncate max-w-[170px]">
                {currentOrg.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-primary-fixed text-on-primary-fixed">
                {currentOrg.entityType === 'juristic' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
              </span>
            </div>
            <span className="text-[10px] text-outline truncate max-w-[160px]">
              {currentOrg.branch}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface ml-1" />
        </button>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเอกสาร (QT, IV, TAX), ลูกค้า, เลขที่อ้างอิง... (⌘ + K)"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-container-low focus:bg-surface-container-lowest border border-transparent focus:border-primary/40 rounded-lg text-on-surface placeholder:text-outline focus:outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => setIsUsageGuideOpen(true)}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
          title="เปิดคู่มือการใช้งาน"
          aria-label="เปิดคู่มือการใช้งาน"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Quick New Document Action Dropdown */}
        {canCreateDocuments && <div className="relative">
          <button
            onClick={() => setIsNewDocMenuOpen(!isNewDocMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างเอกสาร</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isNewDocMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/30 py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                เอกสารขาย (Sales)
              </div>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('QT');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>ใบเสนอราคา (Quotation - QT)</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('BL');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>ใบวางบิล / แจ้งหนี้ (BL)</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('TAX');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-secondary" />
                <span>ใบกำกับภาษี (Tax Invoice - TAX)</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('RE');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-secondary" />
                <span>ใบเสร็จรับเงิน (Official Receipt - RE)</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('CASH');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-tertiary-container" />
                <span>ขายเงินสด (Cash Sale)</span>
              </button>
              <div className="h-px bg-outline-variant/30 my-1"></div>
              <div className="px-3 py-1 text-[11px] font-bold text-outline uppercase tracking-wider">
                เอกสารซื้อ (Purchase)
              </div>
              <button
                onClick={() => {
                  onOpenNewDocModal?.('PO');
                  setIsNewDocMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-outline" />
                <span>ใบสั่งซื้อ (PO)</span>
              </button>
            </div>
          )}
        </div>}

        {/* Role switching is only available in demo mode; authenticated roles come from the database. */}
        {!authUser && <>
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-medium border border-outline-variant/30 transition-colors"
            title="สลับสิทธิ์การทดสอบใช้งาน 3 รูปแบบ (admin, userSeller, user)"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-on-surface">
              {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'userSeller' ? 'userSeller' : 'user'}
            </span>
            <ChevronDown className="w-3 h-3 text-outline" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/30 p-2 z-50">
              <div className="px-2 py-1 text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
                สลับบทบาทผู้ใช้งาน (3 รูปแบบ)
              </div>
              {rolesList.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchUserRole(r.role);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg mb-1 transition-all flex items-start gap-2.5 ${
                    currentUser.role === r.role ? 'bg-surface-container text-primary font-medium' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 ${r.badgeColor}`}>
                    {r.role}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-on-surface">{r.title}</div>
                    <div className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">{r.desc}</div>
                  </div>
                  {currentUser.role === r.role && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
        </>}

        {/* User Profile Info */}
        <div 
          onClick={() => setActiveView('users')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="ดูโปรไฟล์และบัญชีผู้ใช้"
        >
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-on-surface leading-tight">
              {currentUser.fullName}
            </span>
            <span className="text-[10px] text-outline leading-tight">
              {currentUser.department?.split('(')[0] || currentUser.email}
            </span>
          </div>
        </div>
        {authUser && (
          <button
            type="button"
            onClick={() => void signOut().catch(error => console.error('ออกจากระบบไม่สำเร็จ:', error))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 px-2.5 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        )}
      </div>

      {/* LINE Notification Banner if active */}
      {lastLineNotification && (
        <div className="fixed top-18 right-6 z-50 max-w-sm bg-emerald-600 text-white p-3 rounded-xl shadow-xl border border-emerald-500 animate-in slide-in-from-top-4 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-xs flex-1 leading-snug">
            {lastLineNotification}
          </div>
        </div>
      )}
    </header>
  );
};

