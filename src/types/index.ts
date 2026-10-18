// ==============================================================================
// AccData Cloud Accounting - TypeScript Type Definitions
// ==============================================================================

export type UserRole = 'admin' | 'userSeller' | 'user';
export type EntityType = 'individual' | 'juristic';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  currentOrgId: string;
  isActive: boolean;
  department?: string;
  registeredAt: string;
  lastLogin?: string;
  organizationPermissions?: Record<string, boolean>;
}

export interface OrganizationSettings {
  vatRate: number; // default 7
  withholdingTaxEnabled: boolean;
  stockEnabled: boolean;
  logisticsEnabled: boolean;
  lineNotifyEnabled: boolean;
  bankFeedEnabled: boolean;
  docPrefixes: {
    QT: string;
    BL: string;
    TAX: string;
    RE: string;
    CASH: string;
    CN: string;
    DN: string;
    PO: string;
    GR: string;
  };
  activeTemplate: 'modern_cyan' | 'minimal_gray' | 'cyber_slate' | 'tax_official' | 'thermal_slip';
  enabledModules: {
    sales: boolean;
    purchases: boolean;
    taxes: boolean;
    inventory: boolean;
    logistics: boolean;
    crm: boolean;
    banking: boolean;
    reports: boolean;
    auditLogs: boolean;
    marketing: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  entityType: EntityType;
  taxId: string;
  branch: string;
  address: string;
  shippingAddress?: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  settings: OrganizationSettings;
  createdAt: string;
}

export type ThaiBankCode = 'KBANK' | 'SCB' | 'BBL' | 'KTB' | 'BAY' | 'GSB' | 'TTB';

export interface BankAccount {
  id: string;
  orgId: string;
  bankCode: ThaiBankCode;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  liveSyncStatus: 'connected' | 'syncing' | 'error';
  lastSyncedAt: string;
}

export interface Contact {
  id: string;
  orgId: string;
  contactType: 'customer' | 'vendor' | 'both';
  entityType: EntityType;
  code: string;
  name: string;
  taxId: string;
  branch: string;
  address: string;
  shippingAddress?: string;
  contactPerson?: string;
  phone: string;
  email: string;
  creditTermDays: number;
  creditLimit: number;
  dbdVerified: boolean;
  notes?: string;
}

export interface Product {
  id: string;
  orgId: string;
  code: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  isVatInclusive: boolean;
  imageUrl?: string;
  isActive: boolean;
}

export type DocumentType = 
  | 'QT'   // ใบเสนอราคา (Quotation)
  | 'BL'   // ใบวางบิล / แจ้งหนี้ (Billing Note / Invoice Note)
  | 'TAX'  // ใบกำกับภาษี (Tax Invoice)
  | 'RE'   // ใบเสร็จรับเงิน (Official Receipt)
  | 'CASH' // ขายเงินสด (Cash Sale)
  | 'CN'   // ใบลดหนี้ (Credit Note)
  | 'DN'   // ใบเพิ่มหนี้ (Debit Note)
  | 'PO'   // ใบสั่งซื้อ (Purchase Order)
  | 'GR';  // ใบรับสินค้า (Goods Receipt)

export type DocumentStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'paid' 
  | 'cancelled' 
  | 'shipped';

export type PaymentMethod = 'cash' | 'transfer' | 'cheque';

export interface DocumentItem {
  id: string;
  productId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
}

export interface Document {
  id: string;
  orgId: string;
  docType: DocumentType;
  docNumber: string;
  referenceDocId?: string;
  referenceDocNumber?: string;
  contactId: string;
  contactName: string;
  contactTaxId: string;
  contactBranch: string;
  contactAddress: string;
  issueDate: string;
  dueDate: string;
  status: DocumentStatus;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  paymentDate?: string;
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  withholdingTaxRate: number; // 0, 1, 2, 3, 5%
  withholdingTaxAmount: number;
  pricesIncludeVat?: boolean;
  grandTotal: number;
  notes?: string;
  termsConditions?: string;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  items: DocumentItem[];
  createdAt: string;
  updatedAt: string;
}

export type AccountingDocument = Document;

export type CourierCode = 'flash' | 'kerry' | 'thailand_post' | 'jnt';

export interface Shipment {
  id: string;
  orgId: string;
  documentId: string;
  documentNumber: string;
  courier: CourierCode;
  trackingNumber: string;
  shippingStatus: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned';
  codAmount: number;
  shippingFee: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  barcodeData: string;
  sortCode: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface SlipVerification {
  id: string;
  orgId: string;
  documentId: string;
  documentNumber: string;
  slipImageUrl: string;
  transferRef: string;
  senderBank: string;
  receiverBank: string;
  amount: number;
  transferDatetime: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface LineSettings {
  lineNotifyToken?: string;
  channelId?: string;
  channelSecret?: string;
  channelAccessToken?: string;
  notifyOnCreate: boolean;
  notifyOnApprove: boolean;
  notifyOnPay: boolean;
  approvalLineUserId?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  details: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  orgId: string;
  title: string;
  subject: string;
  targetGroup: 'all_customers' | 'active_clients' | 'inactive_clients' | 'all_vendors' | 'internal_staff';
  content: string;
  recipientCount: number;
  sentCount: number;
  status: 'draft' | 'sending' | 'sent';
  sentAt?: string;
}

export interface ChartOfAccount {
  id: string;
  orgId: string;
  code: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

