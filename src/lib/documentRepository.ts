import { Document, DocumentItem, DocumentType, Organization } from '../types';
import { getSupabase } from './supabase';

const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

export async function organizationId(org: Organization): Promise<string> {
  const db = getSupabase();
  if (!db) throw new Error('ยังไม่ได้ตั้งค่าการเชื่อมต่อ Supabase');
  if (isUuid(org.id)) return org.id;
  const { data: authData } = await db.auth.getUser();
  if (!authData.user) throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างองค์กร');
  const { data: membership, error: membershipError } = await db.from('organization_members')
    .select('organization_id, organizations!inner(tax_id)')
    .eq('user_id', authData.user.id)
    .eq('organizations.tax_id', org.taxId)
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (membership?.organization_id) return membership.organization_id;
  const { data: existing, error: lookupError } = await db.from('organizations').select('id').eq('tax_id', org.taxId).limit(1).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.id) return existing.id;
  const { data, error } = await db.from('organizations').insert({
    owner_user_id: authData.user.id,
    name: org.name, entity_type: org.entityType, tax_id: org.taxId, branch: org.branch,
    address: org.address, shipping_address: org.shippingAddress, phone: org.phone,
    email: org.email, settings: org.settings
  }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function nextNumber(org: Organization, type: DocumentType, issueDate: string): Promise<string | null> {
  const db = getSupabase();
  if (!db) return null;
  const orgId = await organizationId(org);
  const { data, error } = await db.rpc('next_document_number', {
    p_organization_id: orgId, p_doc_type: type, p_issue_date: issueDate
  });
  if (error) throw error;
  return data as string;
}

export async function loadDocuments(org: Organization): Promise<Document[] | null> {
  const db = getSupabase();
  if (!db) return null;
  const orgId = await organizationId(org);
  const { data, error } = await db.from('documents').select('*, contacts(name,tax_id,branch,address), document_items(*)').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id, orgId: org.id, docType: row.doc_type, docNumber: row.doc_number,
    referenceDocId: row.reference_doc_id || undefined, referenceDocNumber: row.reference_doc_number || undefined,
    contactId: row.contact_id || '', contactName: row.contacts?.name || row.contact_name || '', contactTaxId: row.contacts?.tax_id || row.contact_tax_id || '',
    contactBranch: row.contacts?.branch || row.contact_branch || '', contactAddress: row.contacts?.address || row.contact_address || '',
    issueDate: row.issue_date, dueDate: row.due_date || '', status: row.status,
    paymentMethod: row.payment_method || 'transfer', bankAccountId: row.bank_account_id || undefined,
    paymentDate: row.payment_date || undefined, subtotal: Number(row.subtotal || 0), discountAmount: Number(row.discount_amount || 0),
    vatRate: Number(row.vat_rate || 0), vatAmount: Number(row.vat_amount || 0),
    withholdingTaxRate: Number(row.withholding_tax_rate || 0), withholdingTaxAmount: Number(row.withholding_tax_amount || 0),
    grandTotal: Number(row.grand_total || 0), notes: row.notes || '', termsConditions: row.terms_conditions || '',
    createdBy: row.created_by || '', createdByName: '', approvedBy: row.approved_by || undefined,
    approvedByName: '', approvedAt: row.approved_at || undefined, items: (row.document_items || []).map((item: any): DocumentItem => ({
      id: item.id, productId: item.product_id || undefined, itemName: item.item_name,
      description: item.description || undefined, quantity: Number(item.quantity), unit: item.unit || '',
      unitPrice: Number(item.unit_price), discountAmount: Number(item.discount_amount || 0), totalAmount: Number(item.total_amount)
    })), createdAt: row.created_at, updatedAt: row.updated_at
  }));
}

export async function saveDocument(org: Organization, doc: Document, saveItems = true): Promise<Document> {
  const db = getSupabase();
  if (!db) return doc;
  const orgId = await organizationId(org);
  const row = {
    organization_id: orgId, doc_type: doc.docType, doc_number: doc.docNumber,
    reference_doc_id: isUuid(doc.referenceDocId) ? doc.referenceDocId : null,
    reference_doc_number: doc.referenceDocNumber || null,
    contact_id: isUuid(doc.contactId) ? doc.contactId : null,
    contact_name: doc.contactName, contact_tax_id: doc.contactTaxId, contact_branch: doc.contactBranch, contact_address: doc.contactAddress,
    issue_date: doc.issueDate, due_date: doc.dueDate || null, status: doc.status,
    payment_method: doc.paymentMethod, bank_account_id: isUuid(doc.bankAccountId) ? doc.bankAccountId : null,
    payment_date: doc.paymentDate || null, subtotal: doc.subtotal, discount_amount: doc.discountAmount,
    vat_rate: doc.vatRate, vat_amount: doc.vatAmount, withholding_tax_rate: doc.withholdingTaxRate,
    withholding_tax_amount: doc.withholdingTaxAmount, grand_total: doc.grandTotal, notes: doc.notes,
    terms_conditions: doc.termsConditions, created_by: isUuid(doc.createdBy) ? doc.createdBy : null,
    approved_by: isUuid(doc.approvedBy) ? doc.approvedBy : null, approved_at: doc.approvedAt || null,
    updated_at: new Date().toISOString()
  };
  const query = isUuid(doc.id)
    ? db.from('documents').update(row).eq('id', doc.id).select('id').single()
    : db.from('documents').insert(row).select('id').single();
  const { data, error } = await query;
  if (error) throw error;
  if (saveItems) {
    const { error: deleteItemsError } = await db.from('document_items').delete().eq('document_id', data.id);
    if (deleteItemsError) throw deleteItemsError;
  }
  if (saveItems && doc.items.length) {
    const { error: itemsError } = await db.from('document_items').insert(doc.items.map(item => ({
      document_id: data.id, product_id: isUuid(item.productId) ? item.productId : null,
      item_name: item.itemName, description: item.description || null, quantity: item.quantity,
      unit: item.unit, unit_price: item.unitPrice, discount_amount: item.discountAmount, total_amount: item.totalAmount
    })));
    if (itemsError) throw itemsError;
  }
  return { ...doc, id: data.id };
}

export async function deleteDocumentFromDatabase(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const db = getSupabase();
  if (!db) return;
  const { error } = await db.from('documents').delete().eq('id', id);
  if (error) throw error;
}
