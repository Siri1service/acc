-- ==============================================================================
-- AccData Cloud Accounting Database Schema (Supabase PostgreSQL)
-- Multi-Tenant, Role-based, Thailand Tax & Accounting Standards
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Companies / Businesses)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'juristic', -- 'individual' (บุคคลธรรมดา) หรือ 'juristic' (นิติบุคคล)
    tax_id VARCHAR(20),
    branch VARCHAR(100) DEFAULT 'สำนักงานใหญ่ (00000)',
    address TEXT,
    shipping_address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    settings JSONB DEFAULT '{
      "vat_rate": 7,
      "withholding_tax_enabled": true,
      "stock_enabled": true,
      "logistics_enabled": true,
      "line_notify_enabled": true,
      "bank_feed_enabled": true,
      "doc_prefixes": {
        "QT": "QT-",
        "BL": "BL-",
        "TAX": "TAX-",
        "RE": "RE-",
        "CASH": "CS-",
        "CN": "CN-",
        "DN": "DN-",
        "PO": "PO-",
        "GR": "GR-"
      },
      "active_template": "modern_cyan"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'userSeller', 'user'
    current_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Organization Memberships (Multi-Tenant Mapping)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'userSeller', 'user'
    permissions JSONB DEFAULT '{
      "can_approve_documents": false,
      "can_manage_users": false,
      "can_view_financial_reports": true,
      "can_export_data": true,
      "can_edit_settings": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Bank Accounts (Thai Bank Feeds & Payment Tracking)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    bank_code VARCHAR(20) NOT NULL, -- 'KBANK', 'SCB', 'BBL', 'KTB', 'BAY', 'GSB', 'TTB'
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    branch_name VARCHAR(100),
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    live_sync_status VARCHAR(50) DEFAULT 'connected', -- 'connected', 'syncing', 'error'
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Contacts (Customers & Vendors / CRM)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'vendor', 'both'
    entity_type VARCHAR(50) DEFAULT 'juristic', -- 'individual', 'juristic'
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(20),
    branch VARCHAR(100) DEFAULT 'สำนักงานใหญ่',
    address TEXT,
    shipping_address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    credit_term_days INT DEFAULT 30,
    credit_limit NUMERIC(15, 2) DEFAULT 0.00,
    dbd_verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Products & Inventory
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'ทั่วไป',
    unit VARCHAR(50) DEFAULT 'ชิ้น',
    cost_price NUMERIC(15, 2) DEFAULT 0.00,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    reorder_point INT DEFAULT 10,
    is_vat_inclusive BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Documents (Sales & Purchases)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL, -- 'QT', 'BL', 'TAX', 'RE', 'CASH', 'CN', 'DN', 'PO', 'GR'
    doc_number VARCHAR(100) NOT NULL,
    reference_doc_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    reference_doc_number VARCHAR(100),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'paid', 'cancelled', 'shipped'
    payment_method VARCHAR(50), -- 'cash', 'transfer', 'cheque'
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    payment_date DATE,
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    vat_rate NUMERIC(5, 2) DEFAULT 7.00,
    vat_amount NUMERIC(15, 2) DEFAULT 0.00,
    withholding_tax_rate NUMERIC(5, 2) DEFAULT 0.00, -- 1%, 2%, 3%, 5%
    withholding_tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Snapshot recipient identity on each document so imported/local contacts that
-- do not yet have database UUIDs still print correctly after reload.
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_tax_id VARCHAR(20);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_branch VARCHAR(100);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- Monthly document sequences are stored per organization and document type.
-- The RPC locks a single counter row, so concurrent users cannot receive the
-- same number. CASH uses the customer-facing code CS.
CREATE TABLE IF NOT EXISTS public.document_number_sequences (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL,
    period CHAR(6) NOT NULL,
    last_number BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (organization_id, doc_type, period)
);

CREATE OR REPLACE FUNCTION public.next_document_number(
    p_organization_id UUID,
    p_doc_type VARCHAR,
    p_issue_date DATE DEFAULT CURRENT_DATE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_period TEXT := to_char(p_issue_date, 'YYYYMM');
    v_prefix TEXT := CASE WHEN p_doc_type = 'CASH' THEN 'CS' ELSE p_doc_type END;
    v_number BIGINT;
BEGIN
    INSERT INTO public.document_number_sequences (organization_id, doc_type, period, last_number)
    SELECT p_organization_id, p_doc_type, v_period,
      COALESCE(MAX(NULLIF(substring(d.doc_number FROM '-([0-9]+)$'), '')::BIGINT), 0) + 1
    FROM public.documents d
    WHERE d.organization_id = p_organization_id
      AND d.doc_type = p_doc_type
      AND d.doc_number LIKE v_prefix || '-' || to_char(p_issue_date, 'YYYY-MM') || '-%'
    ON CONFLICT (organization_id, doc_type, period)
    DO UPDATE SET last_number = public.document_number_sequences.last_number + 1
    RETURNING last_number INTO v_number;

    RETURN v_prefix || '-' || to_char(p_issue_date, 'YYYY-MM') || '-' || lpad(v_number::TEXT, 4, '0');
END;
$$;

-- 8. Document Items
CREATE TABLE IF NOT EXISTS public.document_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'ชิ้น',
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00
);

-- 9. Logistics & Shipments
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    courier VARCHAR(50) NOT NULL, -- 'flash', 'kerry', 'thailand_post', 'jnt'
    tracking_number VARCHAR(100) NOT NULL,
    shipping_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'picked_up', 'in_transit', 'delivered', 'returned'
    cod_amount NUMERIC(15, 2) DEFAULT 0.00,
    shipping_fee NUMERIC(15, 2) DEFAULT 0.00,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    recipient_address TEXT,
    label_barcode_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Slip Verifications
CREATE TABLE IF NOT EXISTS public.slip_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    slip_image_url TEXT,
    transfer_ref VARCHAR(100),
    sender_bank VARCHAR(50),
    receiver_bank VARCHAR(50),
    transfer_amount NUMERIC(15, 2) NOT NULL,
    transfer_datetime TIMESTAMP WITH TIME ZONE,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'mismatched', 'rejected'
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. LINE Notify & Messaging Settings
CREATE TABLE IF NOT EXISTS public.line_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    line_notify_token TEXT,
    channel_id VARCHAR(100),
    channel_secret TEXT,
    channel_access_token TEXT,
    notify_on_qt_create BOOLEAN DEFAULT TRUE,
    notify_on_iv_issue BOOLEAN DEFAULT TRUE,
    notify_on_payment_received BOOLEAN DEFAULT TRUE,
    notify_on_approval_needed BOOLEAN DEFAULT TRUE,
    approval_line_user_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Security Audit Logs & Activity Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- 'CREATE_DOC', 'UPDATE_DOC', 'APPROVE_DOC', 'VERIFY_SLIP', 'EXPORT_EXCEL', 'SYNC_BANK'
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Chart of Accounts (ผังบัญชี)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_documents_org_type ON public.documents(organization_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_issue_date ON public.documents(organization_id, issue_date);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON public.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id, created_at DESC);

