import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { TenantSwitcherModal } from './components/layout/TenantSwitcherModal';
import { AuthOnboardingModal } from './components/auth/AuthOnboardingModal';
import { UsageGuideModal } from './components/auth/UsageGuideModal';
import { DocumentEditorModal } from './components/documents/DocumentEditorModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentsView } from './components/documents/DocumentsView';
import { TaxExpensesView } from './components/tax/TaxExpensesView';
import { InventoryView } from './components/inventory/InventoryView';
import { LogisticsView } from './components/logistics/LogisticsView';
import { ContactsView } from './components/contacts/ContactsView';
import { BankingSlipView } from './components/banking/BankingSlipView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/users/UserManagementView';
import { SettingsView } from './components/settings/SettingsView';

import { DocumentType } from './types';
import { LoginPage } from './components/auth/LoginPage';

const MainAppContent: React.FC = () => {
  const { activeView, authUser, authLoading, currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickNewDocType, setQuickNewDocType] = useState<DocumentType | null>(null);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onOpenNewDocModal={(type) => setQuickNewDocType(type)} />;
      case 'documents':
        return <DocumentsView />;
      case 'taxes':
        return <TaxExpensesView />;
      case 'inventory':
        return <InventoryView />;
      case 'logistics':
        return <LogisticsView />;
      case 'contacts':
        return <ContactsView />;
      case 'banking':
        return <BankingSlipView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return currentUser.role === 'admin' ? <UserManagementView /> : <RestrictedAdminView />;
      case 'settings':
        return currentUser.role === 'admin' ? <SettingsView /> : <RestrictedAdminView />;
      default:
        return <DashboardView onOpenNewDocModal={(type) => setQuickNewDocType(type)} />;
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-on-surface-variant">กำลังตรวจสอบการเข้าสู่ระบบ…</div>;
  if (!authUser || !currentUser.isActive) return <LoginPage />;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Fixed Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenNewDocModal={(type) => setQuickNewDocType(type)}
      />

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar (Fixed 64w) */}
        <div className="hidden lg:block fixed top-16 left-0 bottom-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in flex">
            <div className="w-72 bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between">
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
            <div 
              className="flex-1" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex-1 lg:pl-64 pb-20 lg:pb-8 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS & Android) */}
      <MobileNavigation
        onOpenNewDocModal={(type) => setQuickNewDocType(type)}
      />

      {/* Global Modals */}
      <TenantSwitcherModal />
      <AuthOnboardingModal />
      <UsageGuideModal />

      {quickNewDocType && (
        <DocumentEditorModal
          initialType={quickNewDocType}
          onClose={() => setQuickNewDocType(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

const RestrictedAdminView: React.FC = () => (
  <section className="max-w-xl mx-auto mt-12 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 text-center">
    <h1 className="text-lg font-bold text-on-surface">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
    <p className="mt-2 text-sm text-on-surface-variant">หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ</p>
  </section>
);

