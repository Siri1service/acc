import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, EntityType } from '../../types';
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact, verifyDbdTaxId, currentOrg } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'customer' | 'vendor'>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [verifyingDbd, setVerifyingDbd] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (c.orgId !== currentOrg.id) return false;
      if (filterType !== 'ALL' && c.contactType !== filterType && c.contactType !== 'both') return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchTax = c.taxId.includes(q);
        const matchPhone = c.phone.includes(q);
        if (!matchName && !matchTax && !matchPhone) return false;
      }
      return true;
    });
  }, [contacts, currentOrg.id, filterType, search]);

  const handleVerifyDbd = async (contactId: string, taxId: string) => {
    setVerifyingDbd(contactId);
    const result = await verifyDbdTaxId(taxId);
    if (result.valid) {
      updateContact(contactId, { dbdVerified: true });
    }
    setVerifyingDbd(null);
  };

  const handleSaveContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<Contact> = {
      name: formData.get('name') as string,
      contactType: formData.get('contactType') as any,
      entityType: formData.get('entityType') as EntityType,
      taxId: formData.get('taxId') as string,
      branch: formData.get('branch') as string,
      address: formData.get('address') as string,
      shippingAddress: formData.get('shippingAddress') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      creditTermDays: Number(formData.get('creditTermDays')),
      creditLimit: Number(formData.get('creditLimit')),
      dbdVerified: formData.get('taxId')?.toString().length === 13
    };

    if (editingContact) {
      updateContact(editingContact.id, data);
    } else {
      addContact(data);
    }

    setIsModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            สมุดรายชื่อผู้ติดต่อและคู่ค้า (CRM & DBD Directory)
          </h1>
          <p className="text-xs text-outline mt-1">
            บันทึกข้อมูลลูกค้า ซัพพลายเออร์ เลขประจำตัวผู้เสียภาษี 13 หลัก พร้อมระบบตรวจสอบนิติบุคคล DBD AI
          </p>
        </div>

        <button
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้ติดต่อใหม่</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs w-fit">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'ALL' ? 'bg-primary text-on-primary shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            ทั้งหมด ({contacts.length})
          </button>
          <button
            onClick={() => setFilterType('customer')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'customer' ? 'bg-primary text-on-primary shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            ลูกค้า (Customers)
          </button>
          <button
            onClick={() => setFilterType('vendor')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterType === 'vendor' ? 'bg-primary text-on-primary shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            คู่ค้า / ผู้จำหน่าย (Vendors)
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, เลขประจำตัวผู้เสียภาษี, เบอร์โทร..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((c) => {
          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex flex-col justify-between hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      c.entityType === 'juristic' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {c.entityType === 'juristic' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        c.contactType === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {c.contactType === 'customer' ? 'ลูกค้า' : 'คู่ค้า/ผู้จำหน่าย'}
                      </span>
                    </div>
                  </div>

                  {/* DBD Status */}
                  {c.dbdVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>DBD ผ่านแล้ว</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerifyDbd(c.id, c.taxId)}
                      disabled={verifyingDbd === c.id}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{verifyingDbd === c.id ? 'กำลังตรวจ...' : 'ตรวจ DBD'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-on-surface line-clamp-1">{c.name}</h3>
                  <div className="text-[11px] text-outline font-mono mt-0.5">
                    Tax ID: {c.taxId || 'ไม่ระบุ'} • {c.branch}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
                  {c.contactPerson && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span className="truncate">{c.contactPerson}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span className="font-mono">{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-outline shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-2 text-[11px] text-outline">
                      <MapPin className="w-3.5 h-3.5 text-outline shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                <div className="text-[11px] text-outline">
                  เครดิต: <b className="text-on-surface">{c.creditTermDays} วัน</b> (วงเงิน ฿{c.creditLimit.toLocaleString()})
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingContact(c);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`ลบผู้ติดต่อ ${c.name}?`)) deleteContact(c.id);
                    }}
                    className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden my-6">
            <form onSubmit={handleSaveContact} className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                <span className="text-sm font-bold text-on-surface">
                  {editingContact ? 'แก้ไขข้อมูลผู้ติดต่อ' : 'เพิ่มผู้ติดต่อใหม่'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-outline hover:text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ประเภทผู้ติดต่อ</label>
                  <select
                    name="contactType"
                    defaultValue={editingContact?.contactType || 'customer'}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  >
                    <option value="customer">ลูกค้า (Customer)</option>
                    <option value="vendor">คู่ค้า / ซัพพลายเออร์ (Vendor)</option>
                    <option value="both">เป็นทั้งลูกค้าและคู่ค้า</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">รูปแบบบุคคล</label>
                  <select
                    name="entityType"
                    defaultValue={editingContact?.entityType || 'juristic'}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  >
                    <option value="juristic">นิติบุคคล (บริษัท/หจก.)</option>
                    <option value="individual">บุคคลธรรมดา</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อบริษัท / ร้านค้า / นามบุคคล <span className="text-primary">*</span></label>
                <input
                  name="name"
                  required
                  defaultValue={editingContact?.name || ''}
                  placeholder="เช่น บริษัท สยาม อินโนเวชั่น จำกัด"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                  <input
                    name="taxId"
                    maxLength={13}
                    defaultValue={editingContact?.taxId || ''}
                    placeholder="เช่น 0105560123456"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">สาขา</label>
                  <input
                    name="branch"
                    defaultValue={editingContact?.branch || 'สำนักงานใหญ่ (00000)'}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ชื่อผู้ติดต่อประสานงาน</label>
                  <input
                    name="contactPerson"
                    defaultValue={editingContact?.contactPerson || ''}
                    placeholder="คุณ..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">เบอร์โทรศัพท์</label>
                  <input
                    name="phone"
                    defaultValue={editingContact?.phone || ''}
                    placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">อีเมล</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingContact?.email || ''}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ที่อยู่ออกใบกำกับภาษี</label>
                <textarea
                  name="address"
                  rows={2}
                  defaultValue={editingContact?.address || ''}
                  placeholder="เลขที่, อาคาร, ถนน, แขวง, เขต, จังหวัด, รหัสไปรษณีย์"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ระยะเวลาเครดิตเทอม (วัน)</label>
                  <input
                    name="creditTermDays"
                    type="number"
                    defaultValue={editingContact?.creditTermDays || 30}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">วงเงินเครดิตสูงสุด (บาท)</label>
                  <input
                    name="creditLimit"
                    type="number"
                    defaultValue={editingContact?.creditLimit || 500000}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  บันทึกผู้ติดต่อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

