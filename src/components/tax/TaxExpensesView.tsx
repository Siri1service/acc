import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Printer,
  Calendar,
  Building2,
  FileCheck2,
  CheckCircle2,
  Eye,
  X,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  docNumber: string;
  date: string;
  vendorName: string;
  vendorTaxId: string;
  category: string;
  description: string;
  subtotal: number;
  vatAmount: number;
  withholdingTaxRate: number; // 1, 2, 3, 5%
  withholdingTaxAmount: number;
  formType: 'ภ.ง.ด.3' | 'ภ.ง.ด.53';
  grandTotal: number;
  status: 'paid' | 'pending';
}

export const TaxExpensesView: React.FC = () => {
  const { currentOrg, documents } = useApp();
  const [activeTab, setActiveTab] = useState<'vat30' | 'wht' | 'expenses'>('vat30');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [previewing50Tawi, setPreviewing50Tawi] = useState<ExpenseItem | null>(null);

  // Sample expenses data
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: 'exp-01',
      docNumber: 'EXP-2026-0081',
      date: '2026-10-14',
      vendorName: 'บริษัท เจริญซัพพลายส์ แอนด์ โลจิสติกส์ จำกัด',
      vendorTaxId: '0105557001999',
      category: 'ค่าอุปกรณ์และวัสดุสิ้นเปลือง',
      description: 'สั่งซื้อเครื่องอ่านบาร์โค้ดและกระดาษความร้อนเข้าคลัง',
      subtotal: 48000.00,
      vatAmount: 3360.00,
      withholdingTaxRate: 0,
      withholdingTaxAmount: 0,
      formType: 'ภ.ง.ด.53',
      grandTotal: 51360.00,
      status: 'paid'
    },
    {
      id: 'exp-02',
      docNumber: 'EXP-2026-0082',
      date: '2026-10-12',
      vendorName: 'บริษัท สยาม โลจิสติกส์ เอ็กซ์เพรส จำกัด',
      vendorTaxId: '0105558004567',
      category: 'ค่าขนส่งและโลจิสติกส์',
      description: 'ค่าบริการขนส่งพัสดุ Flash & Kerry ประจำรอบ',
      subtotal: 15000.00,
      vatAmount: 1050.00,
      withholdingTaxRate: 1, // 1% for transport
      withholdingTaxAmount: 150.00,
      formType: 'ภ.ง.ด.53',
      grandTotal: 15900.00,
      status: 'paid'
    },
    {
      id: 'exp-03',
      docNumber: 'EXP-2026-0083',
      date: '2026-10-08',
      vendorName: 'นายพงษ์ศักดิ์ ธรรมรัตน์ (วิศวกรที่ปรึกษา)',
      vendorTaxId: '1100500123456',
      category: 'ค่าบริการวิชาชีพ',
      description: 'ค่าบริการดูแลระบบความปลอดภัย Cloud Server',
      subtotal: 30000.00,
      vatAmount: 0,
      withholdingTaxRate: 3, // 3% for services
      withholdingTaxAmount: 900.00,
      formType: 'ภ.ง.ด.3',
      grandTotal: 29100.00,
      status: 'paid'
    },
    {
      id: 'exp-04',
      docNumber: 'EXP-2026-0084',
      date: '2026-10-02',
      vendorName: 'บริษัท อาคาร สาทร ทาวเวอร์ แอสเซท จำกัด',
      vendorTaxId: '0105549008888',
      category: 'ค่าเช่าสถานที่สำนักงาน',
      description: 'ค่าเช่าพื้นที่สำนักงานชั้น 18 ประจำเดือนตุลาคม',
      subtotal: 45000.00,
      vatAmount: 3150.00,
      withholdingTaxRate: 5, // 5% for rent
      withholdingTaxAmount: 2250.00,
      formType: 'ภ.ง.ด.53',
      grandTotal: 45900.00,
      status: 'paid'
    }
  ]);

  // VAT calculations
  // Output Tax (ภาษีขาย) from paid receipts & tax invoices
  const outputVatDocs = useMemo(() => {
    return documents.filter(d => (d.docType === 'TAX' || d.docType === 'RE' || d.docType === 'CASH') && d.orgId === currentOrg.id);
  }, [documents, currentOrg.id]);

  const totalSalesSubtotal = outputVatDocs.reduce((sum, d) => sum + d.subtotal, 0);
  const totalOutputVat = outputVatDocs.reduce((sum, d) => sum + d.vatAmount, 0);

  // Input Tax (ภาษีซื้อ) from expenses
  const totalPurchaseSubtotal = expenses.reduce((sum, e) => sum + e.subtotal, 0);
  const totalInputVat = expenses.reduce((sum, e) => sum + e.vatAmount, 0);

  // Net VAT for ภ.พ.30
  const netVatPayable = totalOutputVat - totalInputVat;

  // Withholding Tax totals
  const pnd3Items = expenses.filter(e => e.formType === 'ภ.ง.ด.3' && e.withholdingTaxAmount > 0);
  const pnd53Items = expenses.filter(e => e.formType === 'ภ.ง.ด.53' && e.withholdingTaxAmount > 0);

  const totalPnd3Tax = pnd3Items.reduce((sum, e) => sum + e.withholdingTaxAmount, 0);
  const totalPnd53Tax = pnd53Items.reduce((sum, e) => sum + e.withholdingTaxAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            ระบบการจัดการค่าใช้จ่ายและภาษี (Tax & Expense Hub)
          </h1>
          <p className="text-xs text-outline mt-1">
            คำนวณภาษีมูลค่าเพิ่ม (ภ.พ. 30), ภาษีหัก ณ ที่จ่าย (ภ.ง.ด. 3, 53) และออกหนังสือรับรอง 50 ทวิ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
            <Calendar className="w-3.5 h-3.5 text-outline" />
            <span className="font-semibold text-on-surface">งวดภาษี:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-0 p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('vat30')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'vat30'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>แบบ ภ.พ. 30 (ภาษีมูลค่าเพิ่ม 7%)</span>
        </button>

        <button
          onClick={() => setActiveTab('wht')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'wht'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>ภาษีหัก ณ ที่จ่าย (ภ.ง.ด. 3, 53 & 50 ทวิ)</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'expenses'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>บันทึกค่าใช้จ่ายทั้งหมด ({expenses.length})</span>
        </button>
      </div>

      {/* Tab 1: ภ.พ. 30 (VAT 7%) */}
      {activeTab === 'vat30' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Output Tax (ภาษีขาย) */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <span className="text-xs font-semibold text-outline">1. ภาษีขาย (Output Tax)</span>
              <div className="text-2xl font-bold font-mono text-primary mt-2">
                ฿{totalOutputVat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">
                จากยอดขายฐานภาษี: ฿{totalSalesSubtotal.toLocaleString()}
              </div>
            </div>

            {/* Card 2: Input Tax (ภาษีซื้อ) */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <span className="text-xs font-semibold text-outline">2. ภาษีซื้อ (Input Tax)</span>
              <div className="text-2xl font-bold font-mono text-secondary mt-2">
                ฿{totalInputVat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">
                จากยอดซื้อและค่าใช้จ่าย: ฿{totalPurchaseSubtotal.toLocaleString()}
              </div>
            </div>

            {/* Card 3: Net Tax Payable or Refundable */}
            <div className={`p-4 rounded-2xl border shadow-card ${
              netVatPayable >= 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-xs font-semibold text-slate-700">
                3. {netVatPayable >= 0 ? 'ภาษีมูลค่าเพิ่มที่ต้องชำระ (ภ.พ. 30)' : 'ภาษีชำระเกิน (ขอคืน/ยกไป)'}
              </span>
              <div className={`text-2xl font-bold font-mono mt-2 ${
                netVatPayable >= 0 ? 'text-amber-800' : 'text-emerald-700'
              }`}>
                ฿{Math.abs(netVatPayable).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                กำหนดนำส่งกรมสรรพากรภายในวันที่ 15 ของเดือนถัดไป
              </div>
            </div>
          </div>

          {/* Detailed Tax Invoices Table for PP.30 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-on-surface">รายงานภาษีขายประจำงวด (Sales Tax Report)</h2>
                <span className="text-xs text-outline">เอกสารอ้างอิงสำหรับยื่นแบบ ภ.พ. 30</span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-primary transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์รายงาน ภ.พ. 30</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="py-2.5 px-3">วันที่</th>
                    <th className="py-2.5 px-3">เลขที่ใบกำกับภาษี</th>
                    <th className="py-2.5 px-3">ชื่อผู้ซื้อสินค้า/ผู้รับบริการ</th>
                    <th className="py-2.5 px-3">เลขประจำตัวผู้เสียภาษี</th>
                    <th className="py-2.5 px-3">สถานประกอบการ</th>
                    <th className="py-2.5 px-3 text-right">มูลค่าสินค้า (Subtotal)</th>
                    <th className="py-2.5 px-3 text-right">ภาษีมูลค่าเพิ่ม (7%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {outputVatDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-container-low/40">
                      <td className="py-2.5 px-3">{doc.issueDate}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">{doc.docNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-on-surface">{doc.contactName}</td>
                      <td className="py-2.5 px-3 font-mono text-outline">{doc.contactTaxId || '-'}</td>
                      <td className="py-2.5 px-3 text-outline">{doc.contactBranch}</td>
                      <td className="py-2.5 px-3 text-right font-mono">฿{doc.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">฿{doc.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Withholding Tax (ภ.ง.ด. 3, 53 & 50 ทวิ) */}
      {activeTab === 'wht' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary WHT Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-outline">ภ.ง.ด. 3 (หัก ณ ที่จ่ายบุคคลธรรมดา)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                  {pnd3Items.length} รายการ
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-primary mt-2">
                ฿{totalPnd3Tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">
                อัตรา 1%, 2%, 3%, 5% ตามประเภทเงินได้ 40(2)-(8)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-outline">ภ.ง.ด. 53 (หัก ณ ที่จ่ายนิติบุคคล)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-bold">
                  {pnd53Items.length} รายการ
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-secondary mt-2">
                ฿{totalPnd53Tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">
                นำส่งสำหรับค่าบริการ ค่าเช่า ค่าขนส่งของนิติบุคคล
              </div>
            </div>
          </div>

          {/* List of Withheld Taxes */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-on-surface">รายการหักภาษี ณ ที่จ่ายประจำงวด</h2>
                <span className="text-xs text-outline">สามารถพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) ได้ทันที</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="py-2.5 px-3">วันที่จ่าย</th>
                    <th className="py-2.5 px-3">แบบภาษี</th>
                    <th className="py-2.5 px-3">ผู้ถูกหักภาษี ณ ที่จ่าย</th>
                    <th className="py-2.5 px-3">ประเภทเงินได้</th>
                    <th className="py-2.5 px-3 text-right">จำนวนเงินจ่าย</th>
                    <th className="py-2.5 px-3 text-center">อัตราภาษี</th>
                    <th className="py-2.5 px-3 text-right">ภาษีที่หักไว้</th>
                    <th className="py-2.5 px-3 text-center">หนังสือรับรอง 50 ทวิ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {expenses.filter(e => e.withholdingTaxAmount > 0).map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/40">
                      <td className="py-2.5 px-3">{item.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.formType === 'ภ.ง.ด.3' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}>
                          {item.formType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-on-surface">{item.vendorName}</div>
                        <div className="text-[10px] text-outline font-mono">Tax ID: {item.vendorTaxId}</div>
                      </td>
                      <td className="py-2.5 px-3 text-outline">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono">฿{item.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700">{item.withholdingTaxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                        ฿{item.withholdingTaxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setPreviewing50Tawi(item)}
                          className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-primary font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>พิมพ์ 50 ทวิ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: All Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">บันทึกค่าใช้จ่ายและเอกสารซื้อทั้งหมด</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                  <tr>
                    <th className="py-2.5 px-3">เลขที่เอกสาร</th>
                    <th className="py-2.5 px-3">วันที่</th>
                    <th className="py-2.5 px-3">ผู้จำหน่าย / คู่ค้า</th>
                    <th className="py-2.5 px-3">หมวดหมู่ค่าใช้จ่าย</th>
                    <th className="py-2.5 px-3 text-right">มูลค่า (ก่อน VAT)</th>
                    <th className="py-2.5 px-3 text-right">VAT 7%</th>
                    <th className="py-2.5 px-3 text-right">ยอดรวมสุทธิ</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-container-low/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">{e.docNumber}</td>
                      <td className="py-2.5 px-3">{e.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-on-surface">{e.vendorName}</td>
                      <td className="py-2.5 px-3 text-outline">{e.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono">฿{e.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right font-mono">฿{e.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">฿{e.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ชำระแล้ว
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 50 Tawi Modal Preview */}
      {previewing50Tawi && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-300 relative text-xs">
            <button
              onClick={() => setPreviewing50Tawi(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b-2 border-slate-900">
              <h2 className="text-sm font-bold">หนังสือรับรองการหักภาษี ณ ที่จ่าย</h2>
              <p className="text-[11px] text-slate-600">ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</p>
            </div>

            {/* Payer */}
            <div className="py-3 border-b border-slate-300 space-y-1">
              <div className="font-bold text-slate-700">ผู้มีหน้าที่หักภาษี ณ ที่จ่าย:</div>
              <div className="text-xs font-bold text-slate-900">{currentOrg.name}</div>
              <div className="text-[11px] text-slate-600">เลขประจำตัวผู้เสียภาษี: <b>{currentOrg.taxId}</b></div>
              <div className="text-[11px] text-slate-600">ที่อยู่: {currentOrg.address}</div>
            </div>

            {/* Payee */}
            <div className="py-3 border-b border-slate-300 space-y-1">
              <div className="font-bold text-slate-700">ผู้ถูกหักภาษี ณ ที่จ่าย:</div>
              <div className="text-xs font-bold text-slate-900">{previewing50Tawi.vendorName}</div>
              <div className="text-[11px] text-slate-600">เลขประจำตัวผู้เสียภาษี: <b>{previewing50Tawi.vendorTaxId}</b></div>
            </div>

            {/* Amounts */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>ประเภทเงินได้:</span>
                <span className="font-bold">{previewing50Tawi.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>จำนวนเงินที่จ่าย:</span>
                <span className="font-mono font-bold">฿{previewing50Tawi.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>อัตราภาษีที่หัก:</span>
                <span className="font-mono font-bold">{previewing50Tawi.withholdingTaxRate}%</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-slate-900 text-slate-900">
                <span>จำนวนเงินภาษีที่หักและนำส่งไว้:</span>
                <span className="font-mono text-base">฿{previewing50Tawi.withholdingTaxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-end border-t border-slate-300 text-center">
              <div>
                <div className="text-[10px] text-slate-500">วันที่ออกหนังสือรับรอง: {previewing50Tawi.date}</div>
              </div>
              <div>
                <div className="w-48 h-8 border-b border-dashed border-slate-400 mx-auto"></div>
                <div className="font-bold mt-1">ผู้มีหน้าที่หักภาษี ณ ที่จ่าย</div>
                <div className="text-[10px] text-slate-500">(ลงลายมือชื่อและประทับตรา)</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์หนังสือรับรอง (Print 50 ทวิ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

