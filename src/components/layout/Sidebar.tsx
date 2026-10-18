import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Building2,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles,
  RefreshCw,
  LogOut,
  Mail
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { 
    activeView, 
    setActiveView, 
    currentOrg, 
    currentUser, 
    bankAccounts,
    syncBankFeed,
    isBankSyncing,
    setIsAuthModalOpen
  } = useApp();

  const enabled = currentOrg.settings.enabledModules;

  const menuSections = [
    {
      title: 'ภาพรวมและการเงิน',
      items: [
        { id: 'dashboard', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard, enabled: true },
        { id: 'banking', label: 'ธนาคาร & ตรวจสลิป', icon: CreditCard, enabled: enabled.banking, badge: 'Live Feed' }
      ]
    },
    {
      title: 'เอกสารขายและซื้อ',
      items: [
        { id: 'documents', label: 'เอกสารขายทั้งหมด (Pipeline)', icon: Receipt, enabled: enabled.sales, badge: 'QT➔RE' },
        { id: 'taxes', label: 'ค่าใช้จ่ายและภาษี (ภ.พ.30, 50 ทวิ)', icon: FileSpreadsheet, enabled: enabled.taxes }
      ]
    },
    {
      title: 'คลังสินค้าและจัดส่ง',
      items: [
        { id: 'inventory', label: 'สินค้าและสต็อก (Barcode Hub)', icon: Package, enabled: enabled.inventory },
        { id: 'contacts', label: 'สมุดรายชื่อ (CRM & DBD AI)', icon: Users, enabled: enabled.crm },
        { id: 'logistics', label: 'การจัดส่ง & ใบปะหน้าพัสดุ', icon: Truck, enabled: enabled.logistics }
      ]
    },
    {
      title: 'รายงานและการบริหาร',
      items: [
        { id: 'reports', label: 'รายงานสรุป & ผังบัญชี (P&L)', icon: BarChart3, enabled: enabled.reports }
      ]
    },
    {
      title: 'การจัดการระบบ',
      items: [
        { id: 'users', label: 'ผู้ใช้ 3 รูปแบบ & Gmail การตลาด', icon: ShieldCheck, enabled: true },
        { id: 'settings', label: 'ตั้งค่าระบบ & เชื่อมต่อ API', icon: Settings, enabled: true }
      ]
    }
  ];

  const handleNav = (viewId: string) => {
    setActiveView(viewId);
    onCloseMobile?.();
  };

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  return (
    <aside className="w-64 h-screen bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between select-none">
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-outline-variant/30">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <span className="font-bold text-lg text-white font-mono">A</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-on-surface">AccData</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold bg-secondary-container text-on-secondary-container">
                Cloud
              </span>
            </div>
            <span className="text-[10px] text-outline font-medium">Accounting & Tax ERP</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)] custom-scrollbar">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.filter(item => item.enabled).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary font-semibold shadow-sm shadow-primary/20'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-on-primary' : 'text-outline'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Live Bank Feed Mini-Card */}
      <div className="p-3 border-t border-outline-variant/30 space-y-2 bg-surface-container-low/50">
        <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[11px] font-bold text-on-surface">Live Bank Feed</span>
            </div>
            <button
              onClick={() => syncBankFeed()}
              disabled={isBankSyncing}
              className="text-outline hover:text-primary transition-colors"
              title="ซิงค์ยอดธนาคาร"
            >
              <RefreshCw className={`w-3 h-3 ${isBankSyncing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>

          <div className="text-[10px] text-outline">ยอดเงินสดรวมในทุกบัญชี:</div>
          <div className="text-sm font-bold font-mono text-on-surface">
            ฿{totalBankBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>

          {/* Quick Bank Badges */}
          <div className="flex items-center gap-1 mt-2">
            {bankAccounts.map((b) => (
              <span
                key={b.id}
                title={`${b.bankName}: ฿${b.balance.toLocaleString()}`}
                className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  b.bankCode === 'KBANK' ? 'bg-emerald-100 text-emerald-800' :
                  b.bankCode === 'SCB' ? 'bg-purple-100 text-purple-800' :
                  b.bankCode === 'BBL' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'
                }`}
              >
                {b.bankCode}
              </span>
            ))}
          </div>
        </div>

        {/* Login / Switch Account Button */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-on-surface-variant hover:text-primary transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>สลับบัญชี Google / ลงทะเบียน</span>
        </button>
      </div>
    </aside>
  );
};

