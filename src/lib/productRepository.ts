import { Organization, Product } from '../types';
import { getSupabase } from './supabase';
import { organizationId } from './documentRepository';

const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

export async function loadProducts(org: Organization): Promise<Product[] | null> {
  const db = getSupabase();
  if (!db) return null;
  const orgId = await organizationId(org);
  const { data, error } = await db.from('products').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any): Product => ({
    id: row.id, orgId: org.id, code: row.code, sku: row.sku || '', barcode: row.barcode || '', name: row.name,
    category: row.category || 'ทั่วไป', unit: row.unit || 'ชิ้น', costPrice: Number(row.cost_price || 0),
    sellingPrice: Number(row.selling_price || 0), stockQuantity: Number(row.stock_quantity || 0),
    reorderPoint: Number(row.reorder_point || 0), isVatInclusive: Boolean(row.is_vat_inclusive),
    imageUrl: row.image_url || undefined, isActive: row.is_active ?? true,
  }));
}

export async function saveProduct(org: Organization, product: Product): Promise<Product> {
  const db = getSupabase();
  if (!db) return product;
  const orgId = await organizationId(org);
  const row = {
    organization_id: orgId, code: product.code, sku: product.sku || null, barcode: product.barcode || null,
    name: product.name, category: product.category, unit: product.unit, cost_price: product.costPrice,
    selling_price: product.sellingPrice, stock_quantity: product.stockQuantity, reorder_point: product.reorderPoint,
    is_vat_inclusive: product.isVatInclusive, image_url: product.imageUrl || null, is_active: product.isActive,
    updated_at: new Date().toISOString(),
  };
  const query = isUuid(product.id)
    ? db.from('products').update(row).eq('id', product.id).eq('organization_id', orgId).select('id').single()
    : db.from('products').insert(row).select('id').single();
  const { data, error } = await query;
  if (error) throw error;
  return { ...product, id: data.id };
}
