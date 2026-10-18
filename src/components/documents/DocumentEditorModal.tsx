import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Document, DocumentType, DocumentItem, PaymentMethod } from '../../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  CreditCard, 
  Building2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface DocumentEditorModalProps {
  initialType?: DocumentType;
  editingDocument?: Document | null;
  onClose: () => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  initialType = 'QT',
  editingDocument = null,
  onClose
}) => {
  const { 
    currentOrg, 
    contacts, 
    products, 
    bankAccounts, 
    documents,
    addContact,
    addDocument, 
    updateDocument, 
    getNextDocNumber,
    currentUser,
    authUser
  } = useApp();

  const isEditing = Boolean(editingDocument);
  const canCreateContact = !authUser || currentUser.role === 'admin' || currentUser.organizationPermissions?.manage_contacts === true;
  const docType = editingDocument ? editingDocument.docType : initialType;

  // Form State
  const [docNumber, setDocNumber] = useState('');
  const [contactId, setContactId] = useState('');
  const [referenceDocNumber, setReferenceDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [bankAccountId, setBankAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [vatRate, setVatRate] = useState<number>(currentOrg.settings.vatRate || 7);
  const [withholdingTaxRate, setWithholdingTaxRate] = useState<number>(0);
  
  // Items state
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState('');
  const [newContact, setNewContact] = useState({ name: '', taxId: '', branch: 'สำนักงานใหญ่ (00000)', address: '', phone: '', email: '' });

  // Initialize form
  useEffect(() => {
    if (editingDocument) {
      setDocNumber(editingDocument.docNumber);
      setContactId(editingDocument.contactId);
      setReferenceDocNumber(editingDocument.referenceDocNumber || '');
      setIssueDate(editingDocument.issueDate);
      setDueDate(editingDocument.dueDate);
      setPaymentMethod(editingDocument.paymentMethod || 'transfer');
      setBankAccountId(editingDocument.bankAccountId || bankAccounts[0]?.id || '');
      setPaymentDate(editingDocument.paymentDate || new Date().toISOString().split('T')[0]!);
      setNotes(editingDocument.notes || '');
      setVatRate(editingDocument.vatRate);
      setWithholdingTaxRate(editingDocument.withholdingTaxRate);
      setItems(editingDocument.items);
    } else {
      setDocNumber(getNextDocNumber(docType));
      const defaultContact = contacts.find(contact => contact.contactType !== 'vendor');
      setContactId(defaultContact ? defaultContact.id : '');
      const today = new Date().toISOString().split('T')[0]!;
      setIssueDate(today);
      const due = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]!;
      setDueDate(due);
      setPaymentDate(today);
      setBankAccountId(bankAccounts[0]?.id || '');
      setVatRate(currentOrg.settings.vatRate || 7);
      setWithholdingTaxRate(docType === 'RE' || docType === 'TAX' ? 3 : 0);

      // Add a starter item
      if (products.length > 0) {
        const p = products[0]!;
        setItems([
          {
            id: `item-${Date.now()}`,
            productId: p.id,
            itemName: p.name,
            quantity: 1,
            unit: p.unit,
            unitPrice: p.sellingPrice,
            discountAmount: 0,
            totalAmount: p.sellingPrice
          }
        ]);
      } else {
        setItems([
          {
            id: `item-${Date.now()}`,
            itemName: 'บริการ / สินค้ามาตรฐาน',
            quantity: 1,
            unit: 'รายการ',
            unitPrice: 1000,
            discountAmount: 0,
            totalAmount: 1000
          }
        ]);
      }
    }
  }, [editingDocument, docType]);

  // Handle Item row updates
  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const row = { ...updated[index]!, [field]: value };

      if (field === 'itemName' && row.productId) {
        const selectedProduct = products.find(product => product.id === row.productId);
        if (selectedProduct?.name !== value) row.productId = undefined;
      }

      if (field === 'quantity' || field === 'unitPrice' || field === 'discountAmount') {
        const qty = Number(field === 'quantity' ? value : row.quantity) || 0;
        const price = Number(field === 'unitPrice' ? value : row.unitPrice) || 0;
        const disc = Number(field === 'discountAmount' ? value : row.discountAmount) || 0;
        row.totalAmount = Math.max(0, qty * price - disc);
      }

      updated[index] = row;
      return updated;
    });
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      const row = { ...updated[index]! };
      row.productId = prod.id;
      row.itemName = prod.name;
      row.unit = prod.unit;
      row.unitPrice = docType === 'PO' ? prod.costPrice : prod.sellingPrice;
      row.totalAmount = Math.max(0, row.quantity * row.unitPrice - row.discountAmount);
      updated[index] = row;
      return updated;
    });
  };

  const applyLatestMatchingProduct = (index: number, itemName: string) => {
    const normalizedName = itemName.trim().toLocaleLowerCase('th-TH');
    if (!normalizedName) return;
    // Products are loaded newest first, so the first exact name match carries
    // the latest catalog price and unit when duplicate names exist.
    const latestMatch = products.find(product => product.name.trim().toLocaleLowerCase('th-TH') === normalizedName);
    if (latestMatch) handleSelectProduct(index, latestMatch.id);
  };

  const saveNewContact = async () => {
    if (!newContact.name.trim()) {
      setContactError('กรุณากรอกชื่อลูกค้า');
      return;
    }
    setContactSaving(true);
    setContactError('');
    try {
      const created = await addContact({
        contactType: 'customer', entityType: 'juristic', name: newContact.name.trim(),
        taxId: newContact.taxId.trim(), branch: newContact.branch.trim(), address: newContact.address.trim(),
        shippingAddress: newContact.address.trim(), phone: newContact.phone.trim(), email: newContact.email.trim()
      });
      setContactId(created.id);
      setNewContact({ name: '', taxId: '', branch: 'สำนักงานใหญ่ (00000)', address: '', phone: '', email: '' });
      setIsAddingContact(false);
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'เพิ่มลูกค้าไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setContactSaving(false);
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        itemName: '',
        quantity: 1,
        unit: 'ชิ้น',
        unitPrice: 0,
        discountAmount: 0,
        totalAmount: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const vatAmount = vatRate > 0 ? (subtotal * vatRate) / 100 : 0;
  const withholdingTaxAmount = withholdingTaxRate > 0 ? (subtotal * withholdingTaxRate) / 100 : 0;
  const grandTotal = subtotal + vatAmount - withholdingTaxAmount;

  const selectedContact = contacts.find(c => c.id === contactId);

  // Submit
  const handleSave = async (status: 'draft' | 'approved') => {
    if (!contactId || items.length === 0) {
      alert('กรุณาเลือกผู้ติดต่อและเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const payload: Partial<Document> = {
      docType,
      docNumber,
      referenceDocNumber,
      contactId,
      contactName: selectedContact ? selectedContact.name : '',
      contactTaxId: selectedContact ? selectedContact.taxId : '',
      contactBranch: selectedContact ? selectedContact.branch : 'สำนักงานใหญ่',
      contactAddress: selectedContact ? selectedContact.address : '',
      issueDate,
      dueDate,
      status: docType === 'CASH' ? 'paid' : status,
      paymentMethod,
      bankAccountId: paymentMethod === 'transfer' ? bankAccountId : undefined,
      paymentDate: (docType === 'RE' || docType === 'CASH') ? paymentDate : undefined,
      subtotal,
      discountAmount: items.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
      vatRate,
      vatAmount,
      withholdingTaxRate,
      withholdingTaxAmount,
      grandTotal,
      notes,
      items
    };

    try {
      if (isEditing && editingDocument) {
        await updateDocument(editingDocument.id, payload);
      } else {
        await addDocument(payload);
      }
      onClose();
    } catch (error) {
      console.error('บันทึกเอกสารไม่สำเร็จ:', error);
      alert(`บันทึกเอกสารไม่สำเร็จ: ${error instanceof Error ? error.message : 'กรุณาลองอีกครั้ง'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
              {docType}
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                {isEditing ? `แก้ไขเอกสาร ${docType} (${editingDocument?.docNumber})` : `สร้างเอกสารใหม่ [${docType}]`}
              </h2>
              <span className="text-[11px] text-outline">
                {docType === 'QT' ? 'ใบเสนอราคา (Quotation)' :
                 docType === 'BL' ? 'ใบวางบิล / แจ้งหนี้ (Billing Note)' :
                 docType === 'TAX' ? 'ใบกำกับภาษี (Tax Invoice)' :
                 docType === 'RE' ? 'ใบเสร็จรับเงิน (Official Receipt - ปรับแก้ไขข้อมูลได้ก่อนอนุมัติ)' :
                 docType === 'CASH' ? 'ขายเงินสด (Cash Sale)' :
                 docType === 'PO' ? 'ใบสั่งซื้อ (Purchase Order)' : 'เอกสารทั่วไป'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* Row 1: Document Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/30">
            {/* Document Number (editable) */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                เลขที่เอกสาร <span className="text-primary font-mono">*</span>
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-outline">ปรับแต่งได้ตามต้องการ</span>
            </div>

            {/* Reference Doc */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                เลขที่เอกสารอ้างอิง
              </label>
              <input
                type="text"
                value={referenceDocNumber}
                onChange={(e) => setReferenceDocNumber(e.target.value)}
                placeholder="เช่น QT-2026-10-0001"
                className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface font-mono focus:outline-none focus:border-primary"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                วันที่ออกเอกสาร
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                วันครบกำหนดชำระ
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Special Receipt / Payment Controls (Prompt Requirement: RE editable before approval: doc number, payment amount, payment date, payment method: cash, transfer with bank selector, cheque) */}
          {(docType === 'RE' || docType === 'CASH' || docType === 'TAX') && (
            <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/30 space-y-3">
              <div className="flex items-center gap-2 text-secondary font-bold text-xs">
                <CreditCard className="w-4 h-4" />
                <span>การรับชำระเงิน (สามารถกำหนดช่องทาง และบัญชีธนาคารปลายทางได้)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    รูปแบบการจ่ายเงิน
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="transfer">เงินโอนผ่านธนาคาร (Bank Transfer)</option>
                    <option value="cash">เงินสด (Cash)</option>
                    <option value="cheque">เช็คธนาคาร (Cheque)</option>
                  </select>
                </div>

                {/* Target Bank Account */}
                {paymentMethod === 'transfer' && (
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      เข้าบัญชีธนาคาร (อ้างอิงจากตั้งค่าระบบ)
                    </label>
                    <select
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankCode} - {b.accountNumber} ({b.bankName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    วันที่ชำระเงิน
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Customer / Contact Info */}
          <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">ข้อมูลลูกค้า / ผู้ติดต่อ (Contact Details)</span>
              {selectedContact?.dbdVerified && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ตรวจสอบ DBD สำเร็จ</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  เลือกลูกค้าจากสมุดรายชื่อ
                </label>
                <div className="flex gap-2">
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="min-w-0 flex-1 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">-- เลือกลูกค้า --</option>
                    {contacts.filter(c => c.contactType !== 'vendor').map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.taxId || 'ไม่ระบุเลขภาษี'})</option>
                    ))}
                  </select>
                  {canCreateContact && <button type="button" onClick={() => { setIsAddingContact(value => !value); setContactError(''); }} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2.5 text-primary font-semibold hover:bg-primary/15">
                    <Plus className="h-3.5 w-3.5" /> เพิ่มลูกค้า
                  </button>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  เลขประจำตัวผู้เสียภาษี (Tax ID)
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedContact?.taxId || ''}
                  className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-lg text-outline font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  สาขา
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedContact?.branch || 'สำนักงานใหญ่ (00000)'}
                  className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-lg text-outline"
                />
              </div>
            </div>

            {isAddingContact && (
              <div className="rounded-lg border border-primary/20 bg-surface-container-lowest p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input value={newContact.name} onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))} placeholder="ชื่อลูกค้า / บริษัท *" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                  <input value={newContact.taxId} onChange={e => setNewContact(prev => ({ ...prev, taxId: e.target.value }))} placeholder="เลขประจำตัวผู้เสียภาษี" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                  <input value={newContact.branch} onChange={e => setNewContact(prev => ({ ...prev, branch: e.target.value }))} placeholder="สาขา" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                  <input value={newContact.phone} onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))} placeholder="เบอร์โทร" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                  <input value={newContact.email} onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))} placeholder="อีเมล" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                  <input value={newContact.address} onChange={e => setNewContact(prev => ({ ...prev, address: e.target.value }))} placeholder="ที่อยู่สำหรับออกเอกสาร" className="rounded-lg border border-outline-variant/40 px-3 py-2" />
                </div>
                {contactError && <p role="alert" className="text-error">{contactError}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingContact(false)} className="rounded-lg px-3 py-1.5 text-on-surface-variant hover:bg-surface-container">ยกเลิก</button>
                  <button type="button" disabled={contactSaving} onClick={() => void saveNewContact()} className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white disabled:opacity-50">{contactSaving ? 'กำลังบันทึก…' : 'บันทึกลูกค้า'}</button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                ที่อยู่สำหรับออกใบกำกับภาษี
              </label>
              <textarea
                readOnly
                rows={2}
                value={selectedContact?.address || ''}
                className="w-full px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-lg text-outline resize-none"
              />
            </div>
          </div>

          {/* Row 3: Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">รายการสินค้าและบริการ (Items)</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-lg text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3 min-w-[200px]">สินค้า / บริการ</th>
                    <th className="py-2 px-3 w-24 text-right">จำนวน</th>
                    <th className="py-2 px-3 w-20 text-center">หน่วย</th>
                    <th className="py-2 px-3 w-28 text-right">ราคา/หน่วย</th>
                    <th className="py-2 px-3 w-24 text-right">ส่วนลด</th>
                    <th className="py-2 px-3 w-32 text-right">รวมเป็นเงิน</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/40">
                      <td className="py-2 px-3 text-center text-outline">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            required
                            value={item.itemName}
                            onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                            onBlur={(e) => applyLatestMatchingProduct(idx, e.target.value)}
                            placeholder="พิมพ์ชื่อสินค้าหรือบริการ"
                            className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-on-surface font-medium focus:outline-none focus:border-primary"
                          />
                          {/* Quick Select from Products dropdown */}
                          <select
                            onChange={(e) => handleSelectProduct(idx, e.target.value)}
                            className="w-full text-[10px] text-outline bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
                          >
                            <option value="">-- ค้นหาในคลัง หรือพิมพ์สินค้าใหม่ด้านบน --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (คงเหลือ: {p.stockQuantity})</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-right font-mono text-on-surface focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-center text-on-surface focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-right font-mono text-on-surface focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.discountAmount}
                          onChange={(e) => handleItemChange(idx, 'discountAmount', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-right font-mono text-on-surface focus:outline-none focus:border-primary"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                        ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 rounded text-outline hover:text-error disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 4: Summary & Taxes Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                หมายเหตุเพิ่มเติม / ข้อตกลง
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ระบุเงื่อนไขการส่งมอบ, การรับประกัน หรือบันทึกภายใน..."
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between text-outline">
                <span>รวมเป็นเงิน (Subtotal):</span>
                <span className="font-mono font-bold text-on-surface">฿{subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* VAT Toggle & Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>ภาษีมูลค่าเพิ่ม:</span>
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold"
                  >
                    <option value={7}>VAT 7%</option>
                    <option value={0}>ไม่มี VAT (0%)</option>
                  </select>
                </div>
                <span className="font-mono font-bold text-on-surface">
                  ฿{vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Withholding Tax Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>หัก ณ ที่จ่าย:</span>
                  <select
                    value={withholdingTaxRate}
                    onChange={(e) => setWithholdingTaxRate(Number(e.target.value))}
                    className="px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold"
                  >
                    <option value={0}>ไม่หัก (0%)</option>
                    <option value={1}>1% (ค่าขนส่ง)</option>
                    <option value={2}>2% (โฆษณา)</option>
                    <option value={3}>3% (บริการ/วิชาชีพบัญชี)</option>
                    <option value={5}>5% (ค่าเช่าทรัพย์สิน)</option>
                  </select>
                </div>
                <span className="font-mono text-amber-700 font-bold">
                  {withholdingTaxAmount > 0 ? `-฿${withholdingTaxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '฿0.00'}
                </span>
              </div>

              <div className="pt-2 border-t border-outline-variant/30 flex justify-between text-sm font-bold text-primary">
                <span>ยอดรวมทั้งสิ้น (Grand Total):</span>
                <span className="font-mono text-base">฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-outline-variant/30 bg-surface-container-low/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกแบบร่าง (Draft)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave('approved')}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>บันทึกและอนุมัติทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

