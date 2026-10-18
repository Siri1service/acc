import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankAccount, ThaiBankCode } from '../../types';
import {
  CreditCard,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const BankingSlipView: React.FC = () => {
  const { 
    bankAccounts, 
    syncBankFeed, 
    isBankSyncing, 
    addBankAccount, 
    updateBankAccount,
    slips, 
    verifySlip, 
    rejectSlip, 
    uploadSlip,
    documents,
    currentOrg 
  } = useApp();

  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isUploadSlipModalOpen, setIsUploadSlipModalOpen] = useState(false);
  const [selectedSlipForPreview, setSelectedSlipForPreview] = useState<any>(null);

  const totalBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  const bankConfigs: Record<ThaiBankCode, { name: string; color: string; border: string }> = {
    KBANK: { name: 'ธนาคารกสิกรไทย', color: 'bg-emerald-600', border: 'border-emerald-300' },
    SCB: { name: 'ธนาคารไทยพาณิชย์', color: 'bg-purple-700', border: 'border-purple-300' },
    BBL: { name: 'ธนาคารกรุงเทพ', color: 'bg-blue-800', border: 'border-blue-300' },
    KTB: { name: 'ธนาคารกรุงไทย', color: 'bg-sky-600', border: 'border-sky-300' },
    BAY: { name: 'ธนาคารกรุงศรีอยุธยา', color: 'bg-amber-600', border: 'border-amber-300' },
    GSB: { name: 'ธนาคารออมสิน', color: 'bg-pink-600', border: 'border-pink-300' },
    TTB: { name: 'ธนาคารทหารไทยธนชาต', color: 'bg-blue-600', border: 'border-blue-300' }
  };

  const handleAddBank = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bankCode = formData.get('bankCode') as ThaiBankCode;
    const config = bankConfigs[bankCode] || { name: 'ธนาคารในไทย', color: 'bg-slate-700', border: 'border-slate-300' };

    addBankAccount({
      bankCode,
      bankName: config.name,
      accountName: formData.get('accountName') as string,
      accountNumber: formData.get('accountNumber') as string,
      branchName: formData.get('branchName') as string,
      balance: Number(formData.get('balance') || 0)
    });

    setIsAddBankModalOpen(false);
  };

  const handleManualUploadSlip = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const matchedDoc = documents.find(d => d.id === formData.get('docId'));

    uploadSlip({
      documentId: matchedDoc ? matchedDoc.id : '',
      documentNumber: matchedDoc ? matchedDoc.docNumber : 'CS-2026-MANUAL',
      amount,
      senderBank: formData.get('senderBank') as string,
      receiverBank: 'KBANK (บจก. แอคดาต้า โซลูชั่นส์)',
      transferRef: `REF${Date.now()}`
    });

    setIsUploadSlipModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            บัญชีธนาคาร & ตรวจสอบสลิปโอนเงิน (Live Thai Banks & Slip AI)
          </h1>
          <p className="text-xs text-outline mt-1">
            เชื่อมต่อ API ธนาคารอัพเดทยอดเงินสดปัจจุบัน และระบบตรวจสอบสลิปโอนเงินอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => syncBankFeed()}
            disabled={isBankSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-lg text-xs font-semibold text-on-surface transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-secondary ${isBankSyncing ? 'animate-spin' : ''}`} />
            <span>ซิงค์ยอดเงินทุกธนาคาร</span>
          </button>

          <button
            onClick={() => setIsUploadSlipModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>อัพโหลดสลิปตรวจสอบ</span>
          </button>
        </div>
      </div>

      {/* Connected Thai Banks Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-bold text-on-surface">บัญชีธนาคารที่เชื่อมต่อในไทย ({bankAccounts.length})</span>
          </div>

          <button
            onClick={() => setIsAddBankModalOpen(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มบัญชีธนาคาร</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map((b) => {
            const cfg = bankConfigs[b.bankCode] || { name: b.bankName, color: 'bg-slate-700', border: 'border-slate-300' };
            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${cfg.color}`}>
                      {b.bankCode}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live Sync</span>
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xs font-bold text-on-surface">{b.bankName}</h3>
                    <div className="text-[11px] font-mono text-outline font-semibold mt-0.5">{b.accountNumber}</div>
                    <div className="text-[10px] text-outline truncate mt-0.5">{b.accountName}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20">
                  <div className="text-[10px] text-outline">ยอดเงินสดปัจจุบัน:</div>
                  <div className="text-lg font-bold font-mono text-on-surface">
                    ฿{b.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slip Verification Workbench */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">ระบบตรวจสอบยอดโอน (Slip Verification & Reconciliation)</h2>
            <p className="text-xs text-outline mt-0.5">
              ตรวจจับสลิปโอนเงิน ถอดรหัส QR Payload และปรับสถานะเอกสารเป็น "ชำระเงินแล้ว" อัตโนมัติ
            </p>
          </div>
          <span className="text-xs font-bold text-primary font-mono">{slips.length} สลิปในระบบ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slips.map((slip) => {
            const isVerified = slip.status === 'verified';
            return (
              <div
                key={slip.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isVerified
                    ? 'bg-surface-container-low/40 border-outline-variant/30'
                    : 'bg-amber-50/50 border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={slip.slipImageUrl}
                    alt="Slip"
                    onClick={() => setSelectedSlipForPreview(slip)}
                    className="w-20 h-28 object-cover rounded-xl border border-outline-variant/40 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                  />

                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-mono text-on-surface">
                        ฿{slip.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ยืนยันแล้ว</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>รอยืนยัน</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-outline">
                      <b>โอนจาก:</b> {slip.senderBank}
                    </div>
                    <div className="text-[11px] text-outline">
                      <b>เข้าบัญชี:</b> {slip.receiverBank}
                    </div>
                    <div className="text-[11px] font-mono text-outline">
                      <b>เลขอ้างอิง:</b> {slip.transferRef}
                    </div>
                    {slip.documentNumber && (
                      <div className="text-[11px] text-primary font-mono font-bold pt-1">
                        ผูกกับเอกสาร: {slip.documentNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-outline">{slip.transferDatetime}</span>

                  {!isVerified ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectSlip(slip.id)}
                        className="px-2.5 py-1 text-[11px] rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                      >
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => verifySlip(slip.id)}
                        className="px-3 py-1 text-[11px] rounded-lg font-bold bg-primary text-on-primary hover:bg-primary-container shadow-xs transition-all"
                      >
                        อนุมัติและปรับสถานะบิล
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      ลงบัญชีและเงินเข้าบัญชีเรียบร้อย
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Bank Account Modal */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <span className="text-sm font-bold text-on-surface">เพิ่มบัญชีธนาคารใหม่</span>
              <button onClick={() => setIsAddBankModalOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBank} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">เลือกธนาคารในไทย</label>
                <select
                  name="bankCode"
                  defaultValue="KBANK"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                >
                  <option value="KBANK">ธนาคารกสิกรไทย (KBANK)</option>
                  <option value="SCB">ธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="BBL">ธนาคารกรุงเทพ (BBL)</option>
                  <option value="KTB">ธนาคารกรุงไทย (KTB)</option>
                  <option value="BAY">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                  <option value="GSB">ธนาคารออมสิน (GSB)</option>
                  <option value="TTB">ธนาคารทหารไทยธนชาต (TTB)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อบัญชี</label>
                <input
                  name="accountName"
                  required
                  defaultValue={currentOrg.name}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">เลขที่บัญชี (Account Number)</label>
                <input
                  name="accountNumber"
                  required
                  placeholder="เช่น 045-8-91234-5"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">สาขา</label>
                  <input
                    name="branchName"
                    defaultValue="สำนักงานใหญ่"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ยอดเงินสดตั้งต้น (บาท)</label>
                  <input
                    name="balance"
                    type="number"
                    step="0.01"
                    defaultValue={100000}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  เชื่อมต่อบัญชีธนาคาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Upload Slip Modal */}
      {isUploadSlipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/30 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <span className="text-sm font-bold text-on-surface">อัพโหลดสลิปโอนเงินเพื่อตรวจสอบ</span>
              <button onClick={() => setIsUploadSlipModalOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualUploadSlip} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">ผูกกับเอกสารใบแจ้งหนี้ / ใบเสร็จ</label>
                <select
                  name="docId"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                >
                  {documents.filter(d => d.status !== 'paid').map(d => (
                    <option key={d.id} value={d.id}>
                      {d.docNumber} - {d.contactName} (฿{d.grandTotal.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ยอดเงินตามสลิป (บาท)</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="เช่น 72800"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ธนาคารต้นทางผู้โอน</label>
                <input
                  name="senderBank"
                  defaultValue="ธนาคารไทยพาณิชย์ (SCB)"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsUploadSlipModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  บันทึกสลิป
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

