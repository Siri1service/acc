import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Package,
  Menu,
  CreditCard,
  Truck,
  FileSpreadsheet,
  Users,
  Settings,
  X
} from 'lucide-react';
import { DocumentType } from '../../types';

interface MobileNavigationProps {
  onOpenNewDocModal?: (type: DocumentType) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenNewDocModal }) => {
  const { activeView, setActiveView } = useApp();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'documents', label: 'เอกสารขาย', icon: Receipt },
    // Center Action (+)
    { id: 'inventory', label: 'คลังสินค้า', icon: Package },
    { id: 'more', label: 'เมนูอื่นๆ', icon: Menu }
  ];

  return (
    <>
      {/* Floating Action Sheet (+) */}
      {isActionSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-4 lg:hidden animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-4 shadow-2xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-xs font-bold text-on-surface">สร้างเอกสาร & ธุรกรรมด่วน</span>
              <button onClick={() => setIsActionSheetOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                onClick={() => {
                  onOpenNewDocModal?.('QT');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-primary font-bold">QT ใบเสนอราคา</span>
                <span className="text-[10px] text-outline font-normal">Quotation</span>
              </button>

              <button
                onClick={() => {
                  onOpenNewDocModal?.('BL');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-primary font-bold">BL ใบวางบิล</span>
                <span className="text-[10px] text-outline font-normal">Billing Note</span>
              </button>

              <button
                onClick={() => {
                  onOpenNewDocModal?.('TAX');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-secondary font-bold">TAX ใบกำกับภาษี</span>
                <span className="text-[10px] text-outline font-normal">Tax Invoice</span>
              </button>

              <button
                onClick={() => {
                  onOpenNewDocModal?.('RE');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-secondary font-bold">RE ใบเสร็จรับเงิน</span>
                <span className="text-[10px] text-outline font-normal">Official Receipt</span>
              </button>

              <button
                onClick={() => {
                  onOpenNewDocModal?.('CASH');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-tertiary-container font-bold">CS ขายเงินสด (POS)</span>
                <span className="text-[10px] text-outline font-normal">Cash Sale + Receipt</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('banking');
                  setIsActionSheetOpen(false);
                }}
                className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface flex flex-col gap-1 border border-outline-variant/30"
              >
                <span className="text-emerald-700 font-bold">ตรวจสลิปโอนเงิน</span>
                <span className="text-[10px] text-outline font-normal">Bank Slip Check</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Menu Drawer */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-4 lg:hidden animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-4 shadow-2xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="text-xs font-bold text-on-surface">ระบบงานทั้งหมด</span>
              <button onClick={() => setIsMoreMenuOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                onClick={() => { setActiveView('banking'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>ธนาคาร & สลิป</span>
              </button>

              <button
                onClick={() => { setActiveView('taxes'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-secondary" />
                <span>ภาษี & 50 ทวิ</span>
              </button>

              <button
                onClick={() => { setActiveView('logistics'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span>ขนส่ง & ใบปะหน้า</span>
              </button>

              <button
                onClick={() => { setActiveView('contacts'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>สมุดรายชื่อ CRM</span>
              </button>

              <button
                onClick={() => { setActiveView('reports'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>รายงาน & ผังบัญชี</span>
              </button>

              <button
                onClick={() => { setActiveView('settings'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-outline" />
                <span>ตั้งค่าระบบ & API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar (iOS Safe Area bottom padding) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 z-40 lg:hidden flex items-center justify-around px-2 pb-safe">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView === 'dashboard' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ภาพรวม</span>
        </button>

        {/* Tab 2: Documents */}
        <button
          onClick={() => setActiveView('documents')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView === 'documents' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">เอกสาร</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => setIsActionSheetOpen(true)}
            className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="สร้างรายการใหม่"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Inventory */}
        <button
          onClick={() => setActiveView('inventory')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView === 'inventory' ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">สต็อก</span>
        </button>

        {/* Tab 4: More */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-outline hover:text-on-surface`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">เมนู</span>
        </button>
      </nav>
    </>
  );
};

