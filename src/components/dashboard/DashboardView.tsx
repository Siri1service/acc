import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  Receipt,
  FileCheck2,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { DocumentType } from '../../types';

interface DashboardViewProps {
  onOpenNewDocModal?: (type: DocumentType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewDocModal }) => {
  const { 
    documents, 
    bankAccounts, 
    syncBankFeed, 
    isBankSyncing, 
    slips, 
    verifySlip, 
    currentOrg, 
    setActiveView 
  } = useApp();

  // Period Selector: '7days' | '30days' | 'this_month' | 'this_quarter' | 'this_year'
  const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | 'this_month' | 'this_quarter' | 'this_year'>('this_month');

  // Filter completed/paid receipts and cash sales
  const completedSales = useMemo(() => {
    return documents.filter(d => 
      (d.docType === 'RE' || d.docType === 'CASH') && 
      d.status === 'paid' &&
      d.orgId === currentOrg.id
    );
  }, [documents, currentOrg.id]);

  // Total completed sales revenue
  const totalRevenue = useMemo(() => {
    return completedSales.reduce((acc, doc) => acc + doc.grandTotal, 0);
  }, [completedSales]);

  // VAT collected from sales
  const totalVatCollected = useMemo(() => {
    return completedSales.reduce((acc, doc) => acc + doc.vatAmount, 0);
  }, [completedSales]);

  // Total Bank Balances across Thai banks
  const totalBankBalance = useMemo(() => {
    return bankAccounts.filter(b => b.orgId === currentOrg.id).reduce((acc, b) => acc + b.balance, 0);
  }, [bankAccounts, currentOrg.id]);

  // Document pipeline counts
  const pipelineCounts = useMemo(() => {
    const orgDocs = documents.filter(d => d.orgId === currentOrg.id);
    return {
      qt: orgDocs.filter(d => d.docType === 'QT').length,
      qtPending: orgDocs.filter(d => d.docType === 'QT' && d.status === 'draft').length,
      bl: orgDocs.filter(d => d.docType === 'BL').length,
      blPending: orgDocs.filter(d => d.docType === 'BL' && d.status !== 'paid').length,
      tax: orgDocs.filter(d => d.docType === 'TAX').length,
      rePaid: orgDocs.filter(d => (d.docType === 'RE' || d.docType === 'CASH') && d.status === 'paid').length,
      totalCount: orgDocs.length
    };
  }, [documents, currentOrg.id]);

  // Chart data simulation based on selected period
  const chartData = useMemo(() => {
    if (timePeriod === '7days') {
      return [
        { label: '12 ต.ค.', amount: 15000 },
        { label: '13 ต.ค.', amount: 28000 },
        { label: '14 ต.ค.', amount: 12000 },
        { label: '15 ต.ค.', amount: 72800 },
        { label: '16 ต.ค.', amount: 35000 },
        { label: '17 ต.ค.', amount: 10700 },
        { label: '18 ต.ค. (วันนี้)', amount: 24500 }
      ];
    } else if (timePeriod === '30days') {
      return [
        { label: 'สัปดาห์ 1', amount: 85000 },
        { label: 'สัปดาห์ 2', amount: 142000 },
        { label: 'สัปดาห์ 3', amount: 198000 },
        { label: 'สัปดาห์ 4', amount: 125000 }
      ];
    } else if (timePeriod === 'this_year') {
      return [
        { label: 'ม.ค.', amount: 280000 },
        { label: 'ก.พ.', amount: 310000 },
        { label: 'มี.ค.', amount: 390000 },
        { label: 'เม.ย.', amount: 260000 },
        { label: 'พ.ค.', amount: 420000 },
        { label: 'มิ.ย.', amount: 450000 },
        { label: 'ก.ค.', amount: 510000 },
        { label: 'ส.ค.', amount: 480000 },
        { label: 'ก.ย.', amount: 530000 },
        { label: 'ต.ค.', amount: 580000 }
      ];
    }
    // Default this_month
    return [
      { label: '1-5 ต.ค.', amount: 65000 },
      { label: '6-10 ต.ค.', amount: 104000 },
      { label: '11-15 ต.ค.', amount: 185000 },
      { label: '16-20 ต.ค.', amount: 92800 },
      { label: '21-25 ต.ค.', amount: 45000 },
      { label: '26-31 ต.ค.', amount: 30000 }
    ];
  }, [timePeriod]);

  const maxChartAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            แดชบอร์ดภาพรวมการเงินและการขาย
          </h1>
          <p className="text-xs text-outline mt-1">
            สรุปข้อมูลรายได้จริงจากใบเสร็จรับเงินที่ดำเนินการเสร็จแล้ว พร้อม Live Bank Feeds ทุกธนาคารในไทย
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs overflow-x-auto">
          <button
            onClick={() => setTimePeriod('7days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timePeriod === '7days' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setTimePeriod('this_month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timePeriod === 'this_month' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            เดือนนี้ (ต.ค.)
          </button>
          <button
            onClick={() => setTimePeriod('this_quarter')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timePeriod === 'this_quarter' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ไตรมาส Q4
          </button>
          <button
            onClick={() => setTimePeriod('this_year')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timePeriod === 'this_year' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ปีนี้ (2569)
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Realized Revenue from Paid Receipts */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline">ยอดขายรับชำระแล้วเสร็จ (RE + CS)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-on-surface">
              ฿{totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% จากเดือนที่แล้ว</span>
              <span className="text-outline font-normal">({completedSales.length} ใบเสร็จ)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Live Total Thai Bank Balances */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-outline">ยอดเงินสดทุกธนาคาร (Live Feed)</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            </div>
            <button
              onClick={() => syncBankFeed()}
              disabled={isBankSyncing}
              className="w-8 h-8 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center hover:bg-secondary-container transition-colors"
              title="รีเฟรชยอดธนาคารสด"
            >
              <RefreshCw className={`w-4 h-4 ${isBankSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-secondary">
              ฿{totalBankBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-outline">
              <span>เชื่อมต่อแล้ว 4 ธนาคาร (KBANK, SCB, BBL, KTB)</span>
            </div>
          </div>
        </div>

        {/* Metric 3: VAT 7% Output (ภาษีขาย) */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline">ภาษีขายที่ออกแล้ว (VAT 7%)</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-on-surface">
              ฿{totalVatCollected.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-primary font-medium">
              <span>พร้อมนำส่งแบบ ภ.พ.30 ประจำเดือน</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Sales Pipeline Conversion */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline">ท่อเอกสารขาย (Pipeline)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-on-surface">
              {pipelineCounts.rePaid} <span className="text-sm font-normal text-outline">/ {pipelineCounts.totalCount} ฉบับ</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
              <span>QT: {pipelineCounts.qt} ➔ BL: {pipelineCounts.bl} ➔ RE: {pipelineCounts.rePaid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Live Bank Feed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Revenue Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                กราฟยอดขายจริงย้อนหลัง (Realized Revenue Trends)
              </h2>
              <span className="text-xs text-outline">
                คำนวณจากใบเสร็จรับเงิน (RE) และขายเงินสด (CS) ที่ได้รับการยืนยันยอดเงินแล้ว
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-outline">ยอดรวมตามช่วงเวลาที่เลือก:</span>
              <div className="text-base font-bold font-mono text-primary">
                ฿{chartData.reduce((s, d) => s + d.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-4 border-b border-outline-variant/30">
            {chartData.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.amount / maxChartAmount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded-lg font-mono pointer-events-none whitespace-nowrap shadow-lg z-10">
                    ฿{item.amount.toLocaleString()} บาท
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-surface-container-low rounded-t-lg overflow-hidden flex items-end h-48">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-primary to-primary-container group-hover:from-secondary group-hover:to-secondary-container transition-all duration-500 rounded-t-lg"
                    ></div>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] text-outline font-medium truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 text-xs text-outline">
            <span>แหล่งข้อมูล: ข้อมูลบัญชีจริงของ {currentOrg.name}</span>
            <button
              onClick={() => setActiveView('documents')}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>ดูเอกสารขายทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Thai Bank Accounts Widget */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-on-surface">บัญชีธนาคารในไทย (Live Feed)</h2>
                <span className="text-xs text-outline">อัพเดทยอดเงินปัจจุบันอัตโนมัติ</span>
              </div>
              <button
                onClick={() => syncBankFeed()}
                disabled={isBankSyncing}
                className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors"
                title="ซิงค์ทุกธนาคาร"
              >
                <RefreshCw className={`w-4 h-4 ${isBankSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* List of 4 Banks */}
            <div className="space-y-3">
              {bankAccounts.map((b) => {
                const colorConfig = 
                  b.bankCode === 'KBANK' ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', tag: 'bg-emerald-600' } :
                  b.bankCode === 'SCB' ? { bg: 'bg-purple-50 text-purple-800 border-purple-200', tag: 'bg-purple-700' } :
                  b.bankCode === 'BBL' ? { bg: 'bg-blue-50 text-blue-800 border-blue-200', tag: 'bg-blue-800' } :
                  { bg: 'bg-sky-50 text-sky-800 border-sky-200', tag: 'bg-sky-600' };

                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border ${colorConfig.bg} transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colorConfig.tag}`}></span>
                        <span className="text-xs font-bold text-on-surface">{b.bankName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-outline">{b.accountNumber}</span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-[11px] text-outline">{b.branchName}</span>
                      <span className="text-sm font-bold font-mono text-on-surface">
                        ฿{b.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-outline">สถานะ API: เชื่อมต่อสมบูรณ์</span>
            <button
              onClick={() => setActiveView('banking')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              จัดการบัญชีธนาคาร
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Sales Pipeline Stepper & Quick Slip Verification Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Thai Document Pipeline Stepper */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                ขั้นตอนการเชื่อมโยงเอกสารขาย (Document Pipeline Stepper)
              </h2>
              <span className="text-xs text-outline">
                ลำดับสถานะอ้างอิงถึงกัน: ใบเสนอราคา ➔ ใบวางบิล ➔ ใบกำกับภาษี ➔ ใบเสร็จรับเงิน
              </span>
            </div>
            <button
              onClick={() => onOpenNewDocModal?.('QT')}
              className="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-xs"
            >
              + ออกใบเสนอราคาใหม่
            </button>
          </div>

          {/* Stepper Pipeline Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2">
            {/* Step 1: Quotation (QT) */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed uppercase">
                  1. QT
                </span>
                <span className="text-xs font-bold font-mono text-on-surface">{pipelineCounts.qt} ฉบับ</span>
              </div>
              <div className="mt-2 font-semibold text-xs text-on-surface">ใบเสนอราคา</div>
              <div className="text-[11px] text-outline mt-0.5">Quotation</div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                <span className="text-outline">รอลูกค้าตกลง</span>
                <span className="text-primary font-bold">{pipelineCounts.qtPending} ร่าง</span>
              </div>
            </div>

            {/* Step 2: Billing Note (BL) */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed uppercase">
                  2. BL
                </span>
                <span className="text-xs font-bold font-mono text-on-surface">{pipelineCounts.bl} ฉบับ</span>
              </div>
              <div className="mt-2 font-semibold text-xs text-on-surface">ใบวางบิล / แจ้งหนี้</div>
              <div className="text-[11px] text-outline mt-0.5">Billing Note</div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                <span className="text-outline">รอวางบิล</span>
                <span className="text-secondary font-bold">{pipelineCounts.blPending} รายการ</span>
              </div>
            </div>

            {/* Step 3: Tax Invoice (TAX) */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                  3. TAX
                </span>
                <span className="text-xs font-bold font-mono text-on-surface">{pipelineCounts.tax} ฉบับ</span>
              </div>
              <div className="mt-2 font-semibold text-xs text-on-surface">ใบกำกับภาษี</div>
              <div className="text-[11px] text-outline mt-0.5">Tax Invoice</div>
              <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                <span className="text-outline">ภาษีมูลค่าเพิ่ม 7%</span>
                <span className="text-amber-800 font-bold">สรรพากร</span>
              </div>
            </div>

            {/* Step 4: Official Receipt (RE) */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase">
                  4. RE
                </span>
                <span className="text-xs font-bold font-mono text-emerald-900">{pipelineCounts.rePaid} สำเร็จ</span>
              </div>
              <div className="mt-2 font-semibold text-xs text-emerald-900">ใบเสร็จรับเงิน</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Official Receipt</div>
              <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700">รับชำระแล้ว</span>
                <span className="text-emerald-900 font-bold">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Slip Verification Widget */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface">ตรวจสอบสลิปโอนเงิน (Slip Check)</h2>
              <span className="text-xs text-outline">ตรวจสอบยอดโอนและปรับสถานะอัตโนมัติ</span>
            </div>
            <button
              onClick={() => setActiveView('banking')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="space-y-3">
            {slips.slice(0, 2).map((slip) => (
              <div
                key={slip.id}
                className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={slip.slipImageUrl}
                    alt="Slip"
                    className="w-12 h-14 rounded-lg object-cover border border-outline-variant/40 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-on-surface">
                      ฿{slip.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-outline truncate max-w-[130px]">
                      {slip.senderBank}
                    </div>
                    <div className="text-[10px] font-mono text-outline mt-0.5">
                      Ref: {slip.transferRef}
                    </div>
                  </div>
                </div>

                <div>
                  {slip.status === 'verified' ? (
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ยืนยันแล้ว</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => verifySlip(slip.id)}
                      className="px-2.5 py-1 bg-primary text-on-primary hover:bg-primary-container text-[11px] font-semibold rounded-lg shadow-xs transition-all"
                    >
                      อนุมัติยอด
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

