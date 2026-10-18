import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Barcode,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, adjustStock, currentOrg, currentUser, authUser } = useApp();
  const canManageProducts = !authUser || currentUser.role === 'admin' || currentUser.organizationPermissions?.manage_products === true;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock adjust modal state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('รับสินค้าเข้าคลัง');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.orgId !== currentOrg.id) return false;
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchBarcode && !matchSku) return false;
      }
      return true;
    });
  }, [products, currentOrg.id, selectedCategory, search]);

  // Low stock products count
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderPoint).length;

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<Product> = {
      code: formData.get('code') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      costPrice: Number(formData.get('costPrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      stockQuantity: Number(formData.get('stockQuantity')),
      reorderPoint: Number(formData.get('reorderPoint'))
    };

    try {
      if (editingProduct) await updateProduct(editingProduct.id, data);
      else await addProduct(data);
      setIsAddModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      alert(`บันทึกสินค้าไม่สำเร็จ: ${error instanceof Error ? error.message : 'กรุณาลองอีกครั้ง'}`);
    }
  };

  const handleConfirmAdjust = async () => {
    if (!adjustingProduct) return;
    const finalChange = adjustType === 'in' ? adjustAmount : -adjustAmount;
    try {
      await adjustStock(adjustingProduct.id, finalChange, adjustReason);
      setAdjustingProduct(null);
    } catch (error) {
      alert(`ปรับสต็อกไม่สำเร็จ: ${error instanceof Error ? error.message : 'กรุณาลองอีกครั้ง'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            การจัดการสินค้าและสต็อก (Inventory Hub)
          </h1>
          <p className="text-xs text-outline mt-1">
            รองรับระบบบาร์โค้ด (Barcode 1D/2D), จุดสั่งซื้อซ้ำ (Reorder Alert) และการตัดสต็อกอัตโนมัติ
          </p>
        </div>

        {canManageProducts && <button
          onClick={() => {
            setEditingProduct(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="text-xs font-semibold text-outline">จำนวนสินค้าทั้งหมด</span>
          <div className="text-2xl font-bold font-mono text-on-surface mt-2">
            {products.length} <span className="text-xs font-normal text-outline">รายการ</span>
          </div>
          <div className="text-[11px] text-outline mt-1">ในระบบคลังสินค้า AccData</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="text-xs font-semibold text-outline">มูลค่าสต็อกรวม (Cost Valuation)</span>
          <div className="text-2xl font-bold font-mono text-secondary mt-2">
            ฿{products.reduce((acc, p) => acc + (p.costPrice * p.stockQuantity), 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-outline mt-1">คำนวณตามราคาทุนจริง</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-card ${
          lowStockCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-surface-container-lowest border-outline-variant/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">สินค้าใกล้หมด (Reorder Alerts)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-2">
            {lowStockCount} <span className="text-xs font-normal text-amber-700">รายการ</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1">สต็อกต่ำกว่าเกณฑ์ความปลอดภัย</div>
        </div>
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า, SKU, หรือสแกนบาร์โค้ด..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:border-primary font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container-low text-outline hover:text-on-surface'
              }`}
            >
              {cat === 'ALL' ? 'หมวดหมู่ทั้งหมด' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
              <tr>
                <th className="py-3 px-4">รหัส / บาร์โค้ด</th>
                <th className="py-3 px-4">ชื่อสินค้า</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4 text-right">ราคาทุน</th>
                <th className="py-3 px-4 text-right">ราคาขาย</th>
                <th className="py-3 px-4 text-center">คงเหลือในคลัง</th>
                <th className="py-3 px-4 text-center">ปรับสต็อก / จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity <= p.reorderPoint;
                return (
                  <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-primary">{p.code}</div>
                      <div className="text-[10px] text-outline font-mono flex items-center gap-1 mt-0.5">
                        <Barcode className="w-3 h-3" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-on-surface max-w-xs">
                      {p.name}
                      {p.sku && <div className="text-[10px] text-outline font-mono font-normal">{p.sku}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-outline">
                      ฿{p.costPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-on-surface">
                      ฿{p.sellingPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold">
                        <span className={isLow ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full' : 'text-on-surface'}>
                          {p.stockQuantity} {p.unit}
                        </span>
                      </div>
                      {isLow && (
                        <div className="text-[9px] text-amber-700 font-bold mt-0.5">ใกล้หมด (จุดสั่ง: {p.reorderPoint})</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {!canManageProducts && <span className="text-[11px] text-outline">ดูอย่างเดียว</span>}
                      {canManageProducts && <>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustType('in');
                          }}
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] flex items-center gap-1"
                          title="ปรับยอดสต็อกเข้า/ออก"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          <span>ปรับสต็อก</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      </>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <span className="text-sm font-bold text-on-surface">ปรับยอดสต็อกสินค้า</span>
              <button onClick={() => setAdjustingProduct(null)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-on-surface">{adjustingProduct.name}</div>
              <div className="text-[11px] text-outline font-mono">คงเหลือปัจจุบัน: {adjustingProduct.stockQuantity} {adjustingProduct.unit}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('in')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                  adjustType === 'in' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-outline-variant/40 text-outline'
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>รับเข้า (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('out')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                  adjustType === 'out' ? 'bg-error text-white border-error' : 'border-outline-variant/40 text-outline'
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                <span>เบิกออก (-)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                จำนวน ({adjustingProduct.unit})
              </label>
              <input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                เหตุผลการปรับปรุง
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAdjust}
                className="px-4 py-2 text-xs font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
              >
                ยืนยันการปรับยอด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden my-6">
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <span className="text-sm font-bold text-on-surface">
                  {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ลงคลัง'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-outline hover:text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">รหัสสินค้า (Product Code)</label>
                  <input
                    name="code"
                    required
                    defaultValue={editingProduct?.code || `PRD-${Date.now().toString().slice(-4)}`}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SKU</label>
                  <input
                    name="sku"
                    defaultValue={editingProduct?.sku || `SKU-${Date.now().toString().slice(-6)}`}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">บาร์โค้ด (Barcode 1D/2D EAN-13)</label>
                <input
                  name="barcode"
                  required
                  defaultValue={editingProduct?.barcode || `885${Math.floor(1000000000 + Math.random() * 9000000000)}`}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อสินค้า / บริการ</label>
                <input
                  name="name"
                  required
                  defaultValue={editingProduct?.name || ''}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">หมวดหมู่</label>
                  <input
                    name="category"
                    defaultValue={editingProduct?.category || 'ทั่วไป'}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">หน่วยนับ</label>
                  <input
                    name="unit"
                    defaultValue={editingProduct?.unit || 'ชิ้น'}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ราคาทุน (Cost Price)</label>
                  <input
                    name="costPrice"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.costPrice || 0}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ราคาขาย (Selling Price)</label>
                  <input
                    name="sellingPrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.sellingPrice || 0}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">จำนวนตั้งต้นในคลัง</label>
                  <input
                    name="stockQuantity"
                    type="number"
                    defaultValue={editingProduct?.stockQuantity || 10}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">จุดสั่งซื้อซ้ำ (Reorder Alert)</label>
                  <input
                    name="reorderPoint"
                    type="number"
                    defaultValue={editingProduct?.reorderPoint || 5}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

