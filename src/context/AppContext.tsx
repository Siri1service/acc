import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  UserProfile,
  UserRole,
  EntityType,
  BankAccount,
  Contact,
  Product,
  Document,
  DocumentType,
  Shipment,
  SlipVerification,
  AuditLog,
  MarketingCampaign,
  ChartOfAccount,
  LineSettings,
} from '../types';
import {
  initialOrganizations,
  initialUsers,
  initialBankAccounts,
  initialContacts,
  initialProducts,
  initialDocuments,
  initialShipments,
  initialSlips,
  initialAuditLogs,
  initialChartOfAccounts,
  initialCampaigns
} from '../lib/mockData';
import { deleteDocumentFromDatabase, loadDocuments, nextNumber, saveDocument } from '../lib/documentRepository';

interface AppContextType {
  // Navigation & View
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // User & Roles
  currentUser: UserProfile;
  users: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  toggleUserStatus: (id: string) => void;

  // Organizations & Multi-Tenant
  currentOrg: Organization;
  organizations: Organization[];
  switchOrganization: (orgId: string) => void;
  createOrganization: (newOrg: Partial<Organization>) => void;
  updateOrgDetails: (details: Partial<Organization>) => void;
  updateOrgSettings: (settingsUpdates: Partial<Organization['settings']>) => void;
  toggleModule: (moduleKey: keyof Organization['settings']['enabledModules'], enabled: boolean) => void;

  // Onboarding & Modal Dialogs
  isOnboardingCompleted: boolean;
  completeOnboarding: (info: {
    entityType: EntityType;
    name: string;
    taxId: string;
    branch: string;
    address: string;
    shippingAddress?: string;
    enabledModules?: Record<string, boolean>;
  }) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOrgSwitcherOpen: boolean;
  setIsOrgSwitcherOpen: (open: boolean) => void;

  // Documents
  documents: Document[];
  addDocument: (doc: Partial<Document>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => void;
  approveDocument: (id: string) => void;
  convertDocument: (sourceDocId: string, targetType: DocumentType) => Document;
  getNextDocNumber: (type: DocumentType) => string;

  // Banking
  bankAccounts: BankAccount[];
  syncBankFeed: (bankId?: string) => Promise<void>;
  isBankSyncing: boolean;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  addBankAccount: (bank: Partial<BankAccount>) => void;

  // Slips
  slips: SlipVerification[];
  uploadSlip: (slip: Partial<SlipVerification>) => void;
  verifySlip: (slipId: string, matchedDocId?: string) => void;
  rejectSlip: (slipId: string) => void;

  // Logistics
  shipments: Shipment[];
  createShipment: (shipment: Partial<Shipment>) => Shipment;
  updateShipmentStatus: (id: string, status: Shipment['shippingStatus']) => void;

  // Contacts
  contacts: Contact[];
  addContact: (c: Partial<Contact>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  verifyDbdTaxId: (taxId: string) => Promise<{ valid: boolean; companyName?: string; registeredCapital?: string }>;

  // Inventory
  products: Product[];
  addProduct: (p: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  adjustStock: (productId: string, quantityChange: number, reason: string) => void;

  // Accounting & Reports
  chartOfAccounts: ChartOfAccount[];
  
  // Marketing & Communications
  campaigns: MarketingCampaign[];
  sendMarketingCampaign: (campaign: Partial<MarketingCampaign>) => void;
  
  // Line Notification
  lineSettings: LineSettings;
  updateLineSettings: (settings: Partial<LineSettings>) => void;
  lastLineNotification: string | null;

  // Security Audit Trail
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;

  // Reset to defaults
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Storage Key Helpers
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`accdata_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStored = (key: string, value: any) => {
    try {
      localStorage.setItem(`accdata_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  // State initialization with persistence
  const [organizations, setOrganizations] = useState<Organization[]>(() => loadStored('orgs', initialOrganizations));
  const [currentOrgId, setCurrentOrgId] = useState<string>(() => loadStored('currentOrgId', initialOrganizations[0]?.id || 'org-accdata-01'));
  const [users, setUsers] = useState<UserProfile[]>(() => loadStored('users', initialUsers));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStored('currentUserId', initialUsers[0]?.id || 'usr-admin-01'));
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadStored('banks', initialBankAccounts));
  const [contacts, setContacts] = useState<Contact[]>(() => loadStored('contacts', initialContacts));
  const [products, setProducts] = useState<Product[]>(() => loadStored('products', initialProducts));
  const [documents, setDocuments] = useState<Document[]>(() => loadStored('documents', initialDocuments));
  const [shipments, setShipments] = useState<Shipment[]>(() => loadStored('shipments', initialShipments));
  const [slips, setSlips] = useState<SlipVerification[]>(() => loadStored('slips', initialSlips));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('logs', initialAuditLogs));
  const [chartOfAccounts] = useState<ChartOfAccount[]>(() => loadStored('coa', initialChartOfAccounts));
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => loadStored('campaigns', initialCampaigns));

  const [lineSettings, setLineSettings] = useState<LineSettings>(() => loadStored('line', {
    lineNotifyToken: 'LINE_NOTIFY_DEMO_TOKEN_ACCDATA_2026',
    channelId: '2001928374',
    channelSecret: 'demo_channel_secret_48937210',
    notifyOnCreate: true,
    notifyOnApprove: true,
    notifyOnPay: true,
    isActive: true
  }));

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => loadStored('onboarded', true));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState<boolean>(false);
  const [isBankSyncing, setIsBankSyncing] = useState<boolean>(false);
  const [lastLineNotification, setLastLineNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => saveStored('orgs', organizations), [organizations]);
  useEffect(() => saveStored('currentOrgId', currentOrgId), [currentOrgId]);
  useEffect(() => saveStored('users', users), [users]);
  useEffect(() => saveStored('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveStored('banks', bankAccounts), [bankAccounts]);
  useEffect(() => saveStored('contacts', contacts), [contacts]);
  useEffect(() => saveStored('products', products), [products]);
  useEffect(() => saveStored('documents', documents), [documents]);
  useEffect(() => saveStored('shipments', shipments), [shipments]);
  useEffect(() => saveStored('slips', slips), [slips]);
  useEffect(() => saveStored('logs', auditLogs), [auditLogs]);
  useEffect(() => saveStored('campaigns', campaigns), [campaigns]);
  useEffect(() => saveStored('line', lineSettings), [lineSettings]);
  useEffect(() => saveStored('onboarded', isOnboardingCompleted), [isOnboardingCompleted]);

  // Derived current values with bulletproof defaults
  // Derived current values with bulletproof defaults
  const rawOrg = organizations.find(o => o.id === currentOrgId) || organizations[0] || initialOrganizations[0]!;
  const mergedSettings: Organization['settings'] = {
    vatRate: rawOrg.settings?.vatRate ?? 7,
    withholdingTaxEnabled: rawOrg.settings?.withholdingTaxEnabled ?? true,
    stockEnabled: rawOrg.settings?.stockEnabled ?? true,
    logisticsEnabled: rawOrg.settings?.logisticsEnabled ?? true,
    lineNotifyEnabled: rawOrg.settings?.lineNotifyEnabled ?? true,
    bankFeedEnabled: rawOrg.settings?.bankFeedEnabled ?? true,
    activeTemplate: rawOrg.settings?.activeTemplate || 'modern_cyan',
    docPrefixes: {
      QT: rawOrg.settings?.docPrefixes?.QT || 'QT-2026-',
      BL: rawOrg.settings?.docPrefixes?.BL || 'BL-2026-',
      TAX: rawOrg.settings?.docPrefixes?.TAX || 'TAX-2026-',
      RE: rawOrg.settings?.docPrefixes?.RE || 'RE-2026-',
      CASH: rawOrg.settings?.docPrefixes?.CASH || 'CS-2026-',
      CN: rawOrg.settings?.docPrefixes?.CN || 'CN-2026-',
      DN: rawOrg.settings?.docPrefixes?.DN || 'DN-2026-',
      PO: rawOrg.settings?.docPrefixes?.PO || 'PO-2026-',
      GR: rawOrg.settings?.docPrefixes?.GR || 'GR-2026-'
    },
    enabledModules: {
      sales: rawOrg.settings?.enabledModules?.sales ?? true,
      purchases: rawOrg.settings?.enabledModules?.purchases ?? true,
      taxes: rawOrg.settings?.enabledModules?.taxes ?? true,
      inventory: rawOrg.settings?.enabledModules?.inventory ?? true,
      logistics: rawOrg.settings?.enabledModules?.logistics ?? true,
      crm: rawOrg.settings?.enabledModules?.crm ?? true,
      banking: rawOrg.settings?.enabledModules?.banking ?? true,
      reports: rawOrg.settings?.enabledModules?.reports ?? true,
      auditLogs: rawOrg.settings?.enabledModules?.auditLogs ?? true,
      marketing: rawOrg.settings?.enabledModules?.marketing ?? true
    }
  };
  const currentOrg: Organization = {
    ...rawOrg,
    settings: mergedSettings
  };
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || initialUsers[0]!;

  useEffect(() => {
    let cancelled = false;
    loadDocuments(currentOrg).then(rows => {
      if (!cancelled && rows) setDocuments(previous => [...rows, ...previous.filter(d => d.orgId !== currentOrg.id)]);
    }).catch(error => console.error('โหลดเอกสารจาก Supabase ไม่สำเร็จ:', error));
    return () => { cancelled = true; };
  }, [currentOrg.id]);

  // Audit Log helper
  const addAuditLog = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orgId: currentOrg.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      entityType,
      entityId,
      ipAddress: '171.100.22.45 (Bangkok, TH)',
      details,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Line notification simulation
  const sendLineNotify = (message: string) => {
    if (!lineSettings.isActive) return;
    setLastLineNotification(message);
    setTimeout(() => {
      setLastLineNotification(null);
    }, 6000);
  };

  // User & Role Switching
  const switchUserRole = (role: UserRole) => {
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser) {
      setCurrentUserId(matchingUser.id);
      addAuditLog('SWITCH_ROLE', 'User Role', role, `สลับบทบาทการใช้งานเป็น ${role}`);
    } else {
      // Update current user's role
      const updated = { ...currentUser, role };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
      addAuditLog('CHANGE_ROLE', 'User Role', role, `เปลี่ยนระดับสิทธิ์ของ ${currentUser.fullName} เป็น ${role}`);
    }
  };

  const switchUserById = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      addAuditLog('SWITCH_USER', 'User Profile', target.email, `สลับการใช้งานเป็นผู้ใช้: ${target.fullName} (${target.role})`);
    }
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addAuditLog('UPDATE_USER', 'User Profile', id, `แก้ไขข้อมูลผู้ใช้ ID: ${id}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    addAuditLog('TOGGLE_USER_STATUS', 'User Profile', id, `เปิด/ปิดการเข้าใช้งานของผู้ใช้ ID: ${id}`);
  };

  // Organizations
  const switchOrganization = (orgId: string) => {
    const target = organizations.find(o => o.id === orgId);
    if (target) {
      setCurrentOrgId(target.id);
      addAuditLog('SWITCH_ORGANIZATION', 'Organization', target.name, `สลับการทำงานไปยังองค์กร: ${target.name}`);
    }
  };

  const createOrganization = (newOrg: Partial<Organization>) => {
    const orgId = `org-${Date.now()}`;
    const fullOrg: Organization = {
      id: orgId,
      name: newOrg.name || 'องค์กรใหม่',
      entityType: newOrg.entityType || 'juristic',
      taxId: newOrg.taxId || '0000000000000',
      branch: newOrg.branch || 'สำนักงานใหญ่',
      address: newOrg.address || '',
      shippingAddress: newOrg.shippingAddress || newOrg.address || '',
      phone: newOrg.phone || '',
      email: newOrg.email || '',
      settings: {
        vatRate: 7,
        withholdingTaxEnabled: true,
        stockEnabled: true,
        logisticsEnabled: true,
        lineNotifyEnabled: true,
        bankFeedEnabled: true,
        docPrefixes: {
          QT: 'QT-',
          BL: 'BL-',
          TAX: 'TAX-',
          RE: 'RE-',
          CASH: 'CS-',
          CN: 'CN-',
          DN: 'DN-',
          PO: 'PO-',
          GR: 'GR-'
        },
        activeTemplate: 'modern_cyan',
        enabledModules: {
          sales: true,
          purchases: true,
          taxes: true,
          inventory: true,
          logistics: true,
          crm: true,
          banking: true,
          reports: true,
          auditLogs: true,
          marketing: true,
        }
      },
      createdAt: new Date().toISOString()
    };

    setOrganizations(prev => [...prev, fullOrg]);
    setCurrentOrgId(orgId);
    addAuditLog('CREATE_ORGANIZATION', 'Organization', fullOrg.name, `ลงทะเบียนองค์กรใหม่: ${fullOrg.name}`);
  };

  const updateOrgDetails = (details: Partial<Organization>) => {
    setOrganizations(prev => prev.map(o => o.id === currentOrg.id ? { ...o, ...details } : o));
    addAuditLog('UPDATE_ORGANIZATION', 'Organization', currentOrg.id, `แก้ไขข้อมูลรายละเอียดองค์กร`);
  };

  const updateOrgSettings = (settingsUpdates: Partial<Organization['settings']>) => {
    setOrganizations(prev => prev.map(o => {
      if (o.id === currentOrg.id) {
        return {
          ...o,
          settings: {
            ...o.settings,
            ...settingsUpdates
          }
        };
      }
      return o;
    }));
    addAuditLog('UPDATE_SETTINGS', 'Settings', currentOrg.id, `ปรับปรุงการตั้งค่าระบบองค์กร`);
  };

  const toggleModule = (moduleKey: keyof Organization['settings']['enabledModules'], enabled: boolean) => {
    setOrganizations(prev => prev.map(o => {
      if (o.id === currentOrg.id) {
        return {
          ...o,
          settings: {
            ...o.settings,
            enabledModules: {
              ...o.settings.enabledModules,
              [moduleKey]: enabled
            }
          }
        };
      }
      return o;
    }));
    addAuditLog('TOGGLE_MODULE', 'Feature Flag', String(moduleKey), `ตั้งค่าฟังก์ชัน ${String(moduleKey)}: ${enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`);
  };

  // Onboarding
  const completeOnboarding = (info: {
    entityType: EntityType;
    name: string;
    taxId: string;
    branch: string;
    address: string;
    shippingAddress?: string;
    enabledModules?: Record<string, boolean>;
  }) => {
    const updatedOrg: Organization = {
      ...currentOrg,
      name: info.name,
      entityType: info.entityType,
      taxId: info.taxId,
      branch: info.branch,
      address: info.address,
      shippingAddress: info.shippingAddress || info.address,
      settings: {
        ...currentOrg.settings,
        enabledModules: {
          ...currentOrg.settings.enabledModules,
          ...(info.enabledModules as any)
        }
      }
    };

    setOrganizations(prev => prev.map(o => o.id === currentOrg.id ? updatedOrg : o));
    setIsOnboardingCompleted(true);
    addAuditLog('COMPLETE_ONBOARDING', 'Onboarding', currentOrg.id, `เสร็จสิ้นขั้นตอนการลงทะเบียนตั้งค่าเริ่มต้นสำหรับ ${info.name}`);
  };

  // Document Helpers
  const getNextDocNumber = (type: DocumentType): string => {
    // Keep the document type code stable; legacy prefixes such as QT-2026- or
    // QT-IND- must not leak year or tenant labels into the issued number.
    const prefix = type === 'CASH' ? 'CS' : type;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const numberPrefix = `${prefix}-${year}-${month}-`;
    const latestSequence = documents.reduce((latest, document) => {
      if (document.orgId !== currentOrg.id || document.docType !== type || !document.docNumber.startsWith(numberPrefix)) {
        return latest;
      }

      const sequence = Number(document.docNumber.slice(numberPrefix.length));
      return Number.isInteger(sequence) ? Math.max(latest, sequence) : latest;
    }, 0);

    return `${numberPrefix}${String(latestSequence + 1).padStart(4, '0')}`;
  };

  const addDocument = async (doc: Partial<Document>): Promise<Document> => {
    const docType = doc.docType || 'QT';
    const issueDate = doc.issueDate || new Date().toISOString().split('T')[0]!;
    const docNumber = await nextNumber(currentOrg, docType, issueDate) || doc.docNumber || getNextDocNumber(docType);
    
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      orgId: currentOrg.id,
      docType,
      docNumber,
      contactId: doc.contactId || contacts[0]?.id || '',
      contactName: doc.contactName || contacts[0]?.name || '',
      contactTaxId: doc.contactTaxId || contacts[0]?.taxId || '',
      contactBranch: doc.contactBranch || contacts[0]?.branch || '',
      contactAddress: doc.contactAddress || contacts[0]?.address || '',
      issueDate: doc.issueDate || new Date().toISOString().split('T')[0]!,
      dueDate: doc.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]!,
      status: doc.status || 'draft',
      paymentMethod: doc.paymentMethod || 'transfer',
      bankAccountId: doc.bankAccountId || bankAccounts[0]?.id,
      paymentDate: doc.paymentDate,
      subtotal: doc.subtotal || 0,
      discountAmount: doc.discountAmount || 0,
      vatRate: doc.vatRate !== undefined ? doc.vatRate : currentOrg.settings.vatRate,
      vatAmount: doc.vatAmount || 0,
      withholdingTaxRate: doc.withholdingTaxRate || 0,
      withholdingTaxAmount: doc.withholdingTaxAmount || 0,
      grandTotal: doc.grandTotal || 0,
      notes: doc.notes || '',
      termsConditions: doc.termsConditions || '',
      createdBy: currentUser.id,
      createdByName: currentUser.fullName,
      items: doc.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referenceDocId: doc.referenceDocId,
      referenceDocNumber: doc.referenceDocNumber
    };

    const savedDoc = await saveDocument(currentOrg, newDoc);
    setDocuments(prev => [savedDoc, ...prev]);
    addAuditLog('CREATE_DOCUMENT', docType, docNumber, `สร้างเอกสาร ${docType} เลขที่ ${docNumber}`);

    if (lineSettings.notifyOnCreate) {
      sendLineNotify(`🔔 แจ้งเตือน AccData: มีการสร้างเอกสารใหม่ [${docType}] เลขที่ ${docNumber} ยอดเงิน ฿${newDoc.grandTotal.toLocaleString()} โดย ${currentUser.fullName}`);
    }

    return savedDoc;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    const target = documents.find(d => d.id === id);
    if (target) await saveDocument(currentOrg, { ...target, ...updates, updatedAt: new Date().toISOString() });
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
    addAuditLog('UPDATE_DOCUMENT', 'Document', id, `แก้ไขเอกสาร ID: ${id}`);
  };

  const deleteDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    void deleteDocumentFromDatabase(id).catch(error => console.error('ลบเอกสารจาก Supabase ไม่สำเร็จ:', error));
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (target) {
      addAuditLog('DELETE_DOCUMENT', target.docType, target.docNumber, `ลบเอกสาร ${target.docType} เลขที่ ${target.docNumber}`);
    }
  };

  const approveDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    if (!target) return;

    const updated: Document = {
      ...target,
      status: 'approved',
      approvedBy: currentUser.id,
      approvedByName: currentUser.fullName,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments(prev => prev.map(d => d.id === id ? updated : d));
    addAuditLog('APPROVE_DOCUMENT', target.docType, target.docNumber, `อนุมัติเอกสาร ${target.docType} เลขที่ ${target.docNumber} โดย ${currentUser.fullName}`);

    if (lineSettings.notifyOnApprove) {
      sendLineNotify(`✅ อนุมัติเอกสารสำเร็จ: [${target.docType}] เลขที่ ${target.docNumber} ได้รับการอนุมัติแล้วโดย ${currentUser.fullName}`);
    }
  };

  // 1-Click Document Pipeline Stepper Conversion
  // e.g. QT -> BL, BL -> TAX, TAX -> RE, PO -> GR
  const convertDocument = (sourceDocId: string, targetType: DocumentType): Document => {
    const source = documents.find(d => d.id === sourceDocId);
    if (!source) throw new Error('Source document not found');

    const newDocNumber = getNextDocNumber(targetType);
    const convertedDoc: Document = {
      id: `doc-${Date.now()}`,
      orgId: source.orgId,
      docType: targetType,
      docNumber: newDocNumber,
      referenceDocId: source.id,
      referenceDocNumber: source.docNumber,
      contactId: source.contactId,
      contactName: source.contactName,
      contactTaxId: source.contactTaxId,
      contactBranch: source.contactBranch,
      contactAddress: source.contactAddress,
      issueDate: new Date().toISOString().split('T')[0]!,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]!,
      status: targetType === 'RE' ? 'draft' : 'draft', // RE is editable before approval
      paymentMethod: source.paymentMethod || 'transfer',
      bankAccountId: source.bankAccountId || bankAccounts[0]?.id,
      paymentDate: targetType === 'RE' ? new Date().toISOString().split('T')[0]! : undefined,
      subtotal: source.subtotal,
      discountAmount: source.discountAmount,
      vatRate: source.vatRate,
      vatAmount: source.vatAmount,
      withholdingTaxRate: source.withholdingTaxRate,
      withholdingTaxAmount: source.withholdingTaxAmount,
      grandTotal: source.grandTotal,
      notes: `แปลงสถานะจากเอกสารอ้างอิง ${source.docType} เลขที่ ${source.docNumber}`,
      termsConditions: source.termsConditions,
      createdBy: currentUser.id,
      createdByName: currentUser.fullName,
      items: source.items.map(item => ({ ...item, id: `item-${Date.now()}-${Math.random()}` })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments(prev => [convertedDoc, ...prev]);
    addAuditLog('CONVERT_DOCUMENT', targetType, newDocNumber, `แปลงเอกสารจาก ${source.docNumber} เป็น ${targetType} เลขที่ ${newDocNumber}`);

    if (lineSettings.notifyOnCreate) {
      sendLineNotify(`🔄 แปลงเอกสารสำเร็จ: ${source.docNumber} ➔ [${targetType}] ${newDocNumber} ยอดเงิน ฿${convertedDoc.grandTotal.toLocaleString()}`);
    }

    return convertedDoc;
  };

  // Thai Bank Feeds Live Sync
  const syncBankFeed = async (bankId?: string) => {
    setIsBankSyncing(true);
    await new Promise(r => setTimeout(r, 1200));

    // Simulate minor live fluctuation or confirmed balances
    setBankAccounts(prev => prev.map(b => {
      if (!bankId || b.id === bankId) {
        return {
          ...b,
          lastSyncedAt: new Date().toISOString(),
          liveSyncStatus: 'connected'
        };
      }
      return b;
    }));

    setIsBankSyncing(false);
    addAuditLog('LIVE_BANK_SYNC', 'Bank Feed', bankId || 'ALL', `เชื่อมต่อและซิงค์ยอดเงินปัจจุบันจากระบบธนาคารไทย (KBANK, SCB, BBL, KTB) เรียบร้อย`);
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addAuditLog('UPDATE_BANK', 'Bank Account', id, `แก้ไขบัญชีธนาคาร ID: ${id}`);
  };

  const addBankAccount = (bank: Partial<BankAccount>) => {
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      orgId: currentOrg.id,
      bankCode: bank.bankCode || 'KBANK',
      bankName: bank.bankName || 'ธนาคารกสิกรไทย',
      accountName: bank.accountName || currentOrg.name,
      accountNumber: bank.accountNumber || '000-0-00000-0',
      branchName: bank.branchName || 'สำนักงานใหญ่',
      balance: bank.balance || 0,
      isDefault: Boolean(bank.isDefault),
      isActive: true,
      liveSyncStatus: 'connected',
      lastSyncedAt: new Date().toISOString()
    };
    setBankAccounts(prev => [...prev, newBank]);
    addAuditLog('ADD_BANK', 'Bank Account', newBank.accountNumber, `เพิ่มบัญชีธนาคาร ${newBank.bankCode} ${newBank.accountNumber}`);
  };

  // Slip Verifications
  const uploadSlip = (slip: Partial<SlipVerification>) => {
    const newSlip: SlipVerification = {
      id: `slip-${Date.now()}`,
      orgId: currentOrg.id,
      documentId: slip.documentId || '',
      documentNumber: slip.documentNumber || '',
      slipImageUrl: slip.slipImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      transferRef: slip.transferRef || `REF${Date.now()}`,
      senderBank: slip.senderBank || 'ธนาคารไทยพาณิชย์ (SCB)',
      receiverBank: slip.receiverBank || 'ธนาคารกสิกรไทย (KBANK)',
      amount: slip.amount || 0,
      transferDatetime: slip.transferDatetime || new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setSlips(prev => [newSlip, ...prev]);
    addAuditLog('UPLOAD_SLIP', 'Slip Verification', newSlip.transferRef, `อัพโหลดสลิปยอดโอน ฿${newSlip.amount.toLocaleString()}`);
  };

  const verifySlip = (slipId: string, matchedDocId?: string) => {
    const slip = slips.find(s => s.id === slipId);
    if (!slip) return;

    setSlips(prev => prev.map(s => s.id === slipId ? {
      ...s,
      status: 'verified',
      verifiedBy: currentUser.id,
      verifiedAt: new Date().toISOString()
    } : s));

    const targetDocId = matchedDocId || slip.documentId;
    if (targetDocId) {
      // Mark document as paid
      setDocuments(prev => prev.map(d => {
        if (d.id === targetDocId) {
          return {
            ...d,
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0]!,
            updatedAt: new Date().toISOString()
          };
        }
        return d;
      }));
    }

    // Add balance to receiving bank
    setBankAccounts(prev => prev.map(b => {
      if (b.isDefault || b.bankCode === 'KBANK') {
        return { ...b, balance: b.balance + slip.amount };
      }
      return b;
    }));

    addAuditLog('VERIFY_SLIP', 'Slip Verification', slip.transferRef, `ตรวจสอบสลิปยอดเงิน ฿${slip.amount.toLocaleString()} ถูกต้องเรียบร้อย ปรับสถานะเป็นชำระเงินแล้ว`);
    
    if (lineSettings.notifyOnPay) {
      sendLineNotify(`💰 ยืนยันยอดโอนสำเร็จ! ตรวจพบยอดเงินโอนเข้า ฿${slip.amount.toLocaleString()} อ้างอิงสลิป ${slip.transferRef}`);
    }
  };

  const rejectSlip = (slipId: string) => {
    setSlips(prev => prev.map(s => s.id === slipId ? { ...s, status: 'rejected' } : s));
    addAuditLog('REJECT_SLIP', 'Slip Verification', slipId, `ปฏิเสธสลิปการโอนเงิน ID: ${slipId}`);
  };

  // Shipments & Courier Logistics
  const createShipment = (data: Partial<Shipment>): Shipment => {
    const courier = data.courier || 'flash';
    const trackingPrefix = courier === 'flash' ? 'TH' : courier === 'kerry' ? 'KEX' : courier === 'thailand_post' ? 'ED' : 'JT';
    const trackingNumber = data.trackingNumber || `${trackingPrefix}${Math.floor(1000000000 + Math.random() * 9000000000)}TH`;
    
    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      orgId: currentOrg.id,
      documentId: data.documentId || '',
      documentNumber: data.documentNumber || '',
      courier,
      trackingNumber,
      shippingStatus: 'pending',
      codAmount: data.codAmount || 0,
      shippingFee: data.shippingFee || 50,
      recipientName: data.recipientName || '',
      recipientPhone: data.recipientPhone || '',
      recipientAddress: data.recipientAddress || '',
      barcodeData: trackingNumber,
      sortCode: data.sortCode || 'BKK-HUB-01',
      createdAt: new Date().toISOString()
    };

    setShipments(prev => [newShipment, ...prev]);
    addAuditLog('CREATE_SHIPMENT', courier.toUpperCase(), trackingNumber, `สร้างใบปะหน้าและเรียกขนส่ง ${courier.toUpperCase()} Tracking: ${trackingNumber}`);
    return newShipment;
  };

  const updateShipmentStatus = (id: string, status: Shipment['shippingStatus']) => {
    setShipments(prev => prev.map(s => s.id === id ? {
      ...s,
      shippingStatus: status,
      shippedAt: status === 'in_transit' && !s.shippedAt ? new Date().toISOString() : s.shippedAt,
      deliveredAt: status === 'delivered' && !s.deliveredAt ? new Date().toISOString() : s.deliveredAt
    } : s));
    addAuditLog('UPDATE_SHIPMENT_STATUS', 'Logistics', id, `อัพเดตสถานะการจัดส่งพัสดุเป็น ${status}`);
  };

  // Contacts
  const addContact = (c: Partial<Contact>) => {
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      orgId: currentOrg.id,
      contactType: c.contactType || 'customer',
      entityType: c.entityType || 'juristic',
      code: c.code || `CUST-${contacts.length + 1}`,
      name: c.name || 'ผู้ติดต่อใหม่',
      taxId: c.taxId || '0000000000000',
      branch: c.branch || 'สำนักงานใหญ่',
      address: c.address || '',
      shippingAddress: c.shippingAddress || c.address || '',
      contactPerson: c.contactPerson || '',
      phone: c.phone || '',
      email: c.email || '',
      creditTermDays: c.creditTermDays || 30,
      creditLimit: c.creditLimit || 100000,
      dbdVerified: Boolean(c.dbdVerified),
      notes: c.notes || ''
    };
    setContacts(prev => [newContact, ...prev]);
    addAuditLog('ADD_CONTACT', newContact.contactType, newContact.name, `เพิ่มผู้ติดต่อใหม่: ${newContact.name}`);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addAuditLog('UPDATE_CONTACT', 'Contact', id, `แก้ไขข้อมูลผู้ติดต่อ ID: ${id}`);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    addAuditLog('DELETE_CONTACT', 'Contact', id, `ลบผู้ติดต่อ ID: ${id}`);
  };

  const verifyDbdTaxId = async (taxId: string): Promise<{ valid: boolean; companyName?: string; registeredCapital?: string }> => {
    await new Promise(r => setTimeout(r, 600));
    if (taxId.length === 13) {
      return {
        valid: true,
        companyName: 'บริษัทที่จดทะเบียนถูกต้องตามฐานข้อมูลกรมพัฒนาธุรกิจการค้า (DBD Active)',
        registeredCapital: '5,000,000 บาท'
      };
    }
    return { valid: false };
  };

  // Inventory & Stock
  const addProduct = (p: Partial<Product>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      orgId: currentOrg.id,
      code: p.code || `PRD-${products.length + 1}`,
      sku: p.sku || `SKU-${Date.now()}`,
      barcode: p.barcode || `885${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: p.name || 'สินค้าใหม่',
      category: p.category || 'ทั่วไป',
      unit: p.unit || 'ชิ้น',
      costPrice: p.costPrice || 0,
      sellingPrice: p.sellingPrice || 0,
      stockQuantity: p.stockQuantity || 0,
      reorderPoint: p.reorderPoint || 10,
      isVatInclusive: p.isVatInclusive !== undefined ? p.isVatInclusive : true,
      imageUrl: p.imageUrl,
      isActive: true
    };
    setProducts(prev => [newProd, ...prev]);
    addAuditLog('ADD_PRODUCT', 'Inventory', newProd.code, `เพิ่มสินค้าใหม่: ${newProd.name} (${newProd.code})`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog('UPDATE_PRODUCT', 'Inventory', id, `แก้ไขข้อมูลสินค้า ID: ${id}`);
  };

  const adjustStock = (productId: string, quantityChange: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newQty = Math.max(0, p.stockQuantity + quantityChange);
        return { ...p, stockQuantity: newQty };
      }
      return p;
    }));
    addAuditLog('ADJUST_STOCK', 'Inventory', productId, `ปรับยอดสต็อก (${quantityChange > 0 ? '+' : ''}${quantityChange}): ${reason}`);
  };

  // Marketing via Gmail
  const sendMarketingCampaign = (campaign: Partial<MarketingCampaign>) => {
    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      orgId: currentOrg.id,
      title: campaign.title || 'แคมเปญใหม่',
      subject: campaign.subject || 'แจ้งข่าวสารจาก AccData',
      targetGroup: campaign.targetGroup || 'all_customers',
      content: campaign.content || '',
      recipientCount: campaign.recipientCount || 85,
      sentCount: campaign.recipientCount || 85,
      status: 'sent',
      sentAt: new Date().toISOString()
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    addAuditLog('SEND_GMAIL_MARKETING', 'Marketing', newCampaign.title, `ส่งแคมเปญการตลาดผ่าน Gmail ไปยังกลุ่ม ${newCampaign.targetGroup} จำนวน ${newCampaign.sentCount} รายการ`);
  };

  const updateLineSettings = (settings: Partial<LineSettings>) => {
    setLineSettings(prev => ({ ...prev, ...settings }));
    addAuditLog('UPDATE_LINE_SETTINGS', 'LINE API', 'Config', `บันทึกการตั้งค่า LINE API & Webhook`);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setOrganizations(initialOrganizations);
    setCurrentOrgId(initialOrganizations[0]?.id || 'org-accdata-01');
    setUsers(initialUsers);
    setCurrentUserId(initialUsers[0]?.id || 'usr-admin-01');
    setBankAccounts(initialBankAccounts);
    setContacts(initialContacts);
    setProducts(initialProducts);
    setDocuments(initialDocuments);
    setShipments(initialShipments);
    setSlips(initialSlips);
    setAuditLogs(initialAuditLogs);
    setCampaigns(initialCampaigns);
    setIsOnboardingCompleted(true);
  };

  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView,
      searchQuery,
      setSearchQuery,

      currentUser,
      users,
      switchUserRole,
      switchUserById,
      updateUserProfile,
      toggleUserStatus,

      currentOrg,
      organizations,
      switchOrganization,
      createOrganization,
      updateOrgDetails,
      updateOrgSettings,
      toggleModule,

      isOnboardingCompleted,
      completeOnboarding,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isOrgSwitcherOpen,
      setIsOrgSwitcherOpen,

      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      approveDocument,
      convertDocument,
      getNextDocNumber,

      bankAccounts,
      syncBankFeed,
      isBankSyncing,
      updateBankAccount,
      addBankAccount,

      slips,
      uploadSlip,
      verifySlip,
      rejectSlip,

      shipments,
      createShipment,
      updateShipmentStatus,

      contacts,
      addContact,
      updateContact,
      deleteContact,
      verifyDbdTaxId,

      products,
      addProduct,
      updateProduct,
      adjustStock,

      chartOfAccounts,
      campaigns,
      sendMarketingCampaign,

      lineSettings,
      updateLineSettings,
      lastLineNotification,

      auditLogs,
      addAuditLog,

      resetToDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

