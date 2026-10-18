import { Contact, Organization } from '../types';
import { getSupabase } from './supabase';
import { organizationId } from './documentRepository';

const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

export async function loadContacts(org: Organization): Promise<Contact[] | null> {
  const db = getSupabase();
  if (!db) return null;
  const orgId = await organizationId(org);
  const { data, error } = await db.from('contacts').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any): Contact => ({
    id: row.id, orgId: org.id, contactType: row.contact_type, entityType: row.entity_type || 'juristic',
    code: row.code || '', name: row.name, taxId: row.tax_id || '', branch: row.branch || '', address: row.address || '',
    shippingAddress: row.shipping_address || '', contactPerson: row.contact_person || '', phone: row.phone || '', email: row.email || '',
    creditTermDays: Number(row.credit_term_days ?? 30), creditLimit: Number(row.credit_limit ?? 0), dbdVerified: Boolean(row.dbd_verified), notes: row.notes || '',
  }));
}

export async function saveContact(org: Organization, contact: Contact): Promise<Contact> {
  const db = getSupabase();
  if (!db) return contact;
  const orgId = await organizationId(org);
  const row = {
    organization_id: orgId, contact_type: contact.contactType, entity_type: contact.entityType,
    code: contact.code || null, name: contact.name, tax_id: contact.taxId || null,
    branch: contact.branch || null, address: contact.address || null, shipping_address: contact.shippingAddress || null,
    contact_person: contact.contactPerson || null, phone: contact.phone || null, email: contact.email || null,
    credit_term_days: contact.creditTermDays, credit_limit: contact.creditLimit, dbd_verified: contact.dbdVerified, notes: contact.notes || null,
  };
  const query = isUuid(contact.id)
    ? db.from('contacts').update(row).eq('id', contact.id).eq('organization_id', orgId).select('id').single()
    : db.from('contacts').insert(row).select('id').single();
  const { data, error } = await query;
  if (error) throw error;
  return { ...contact, id: data.id };
}

export async function deleteContactFromDatabase(org: Organization, id: string): Promise<void> {
  const db = getSupabase();
  if (!db || !isUuid(id)) return;
  const orgId = await organizationId(org);
  const { error } = await db.from('contacts').delete().eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}
