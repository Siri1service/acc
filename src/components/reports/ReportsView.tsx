import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { documents, chartOfAccounts, currentOrg } = useApp();
  const [reportType, setReportType] = useState<'pnl' | 'coa' | 'sales_by_customer'>('pnl');

  // Completed sales
  const completedDocs = useMemo(() => {
    return documents.filter(d => (d.docType === 'RE' || d.docType === 'CASH') && d.status === 'paid' && d.orgId === currentOrg.id);
  }, [documents, currentOrg.id]);

  // Revenues & Expenses from Chart of Accounts
  const revenueTotal = chartOfAccounts.filter(c => c.category === 'revenue').reduce((s, c) => s + c.balance, 0);
  const expenseTotal = chartOfAccounts.filter(c => c.category === 'expense').reduce((s, c) => s + c.balance, 0);
  const netProfit = revenueTotal - expenseTotal;

  // Sales by Customer aggregation
  const salesByCustomer = useMemo(() => {
    const map: Record<string, { name: string; taxId: string; totalAmount: number; count: number }> = {};
    completedDocs.forEach(d => {
      if (!map[d.contactId]) {
        map[d.contactId] = {
          name: d.contactName,
          taxId: d.contactTaxId,
          totalAmount: 0,
          count: 0
        };
      }
      map[d.contactId]!.totalAmount += d.grandTotal;
      map[d.contactId]!.count += 1;
    });
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [completedDocs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            รายงานสรุปผู้บริหาร & บริหารบัญชี (Financial Reports & Ledger)
          </h1>
          <p className="text-xs text-outline mt-1">
            งบกำไรขาดทุน (P&L), รายงานยอดขายตามลูกค้า และผังบัญชีมาตรฐาน (Chart of Accounts)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-lg text-xs font-semibold text-on-surface transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-primary" />
            <span>พิมพ์รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          onClick={() => setReportType('pnl')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            reportType === 'pnl' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>งบกำไรขาดทุน (Profit & Loss)</span>
        </button>

        <button
          onClick={() => setReportType('sales_by_customer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            reportType === 'sales_by_customer' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>ยอดขายตามลูกค้า (Sales by Customer)</span>
        </button>

        <button
          onClick={() => setReportType('coa')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            reportType === 'coa' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ผังบัญชี (Chart of Accounts)</span>
        </button>
      </div>

      {/* P&L Report */}
      {reportType === 'pnl' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <span className="text-xs font-semibold text-outline">รายได้รวม (Total Revenue)</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
                ฿{revenueTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">รายได้จากการขายและบริการ</div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
              <span className="text-xs font-semibold text-outline">ค่าใช้จ่ายรวม (Total Expenses)</span>
              <div className="text-2xl font-bold font-mono text-red-700 mt-2">
                ฿{expenseTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-outline mt-1">ต้นทุนขาย บริการ และโลจิสติกส์</div>
            </div>

            <div className="p-4 rounded-2xl bg-primary-fixed border border-primary/20 shadow-card">
              <span className="text-xs font-bold text-on-primary-fixed">กำไรสุทธิ (Net Profit)</span>
              <div className="text-2xl font-bold font-mono text-on-primary-fixed mt-2">
                ฿{netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-on-primary-fixed-variant mt-1">อัตรากำไร: {((netProfit / revenueTotal) * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Formal P&L Statement Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6">
            <h2 className="text-sm font-bold text-on-surface mb-1">งบกำไรขาดทุน (Income Statement)</h2>
            <p className="text-xs text-outline mb-4">สำหรับงวดบัญชีปีปัจจุบัน บริษัท {currentOrg.name}</p>

            <div className="space-y-4 text-xs">
              {/* Revenue Section */}
              <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                <div className="bg-surface-container-low px-4 py-2 font-bold text-on-surface flex justify-between">
                  <span>1. รายได้ (Revenues)</span>
                  <span className="font-mono">฿{revenueTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="divide-y divide-outline-variant/20 p-2">
                  {chartOfAccounts.filter(c => c.category === 'revenue').map(c => (
                    <div key={c.id} className="py-1.5 px-3 flex justify-between text-outline">
                      <span>[{c.code}] {c.name}</span>
                      <span className="font-mono text-on-surface font-semibold">฿{c.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Section */}
              <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                <div className="bg-surface-container-low px-4 py-2 font-bold text-on-surface flex justify-between">
                  <span>2. ค่าใช้จ่าย (Expenses)</span>
                  <span className="font-mono text-red-700">฿{expenseTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="divide-y divide-outline-variant/20 p-2">
                  {chartOfAccounts.filter(c => c.category === 'expense').map(c => (
                    <div key={c.id} className="py-1.5 px-3 flex justify-between text-outline">
                      <span>[{c.code}] {c.name}</span>
                      <span className="font-mono text-on-surface font-semibold">฿{c.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Profit Summary Row */}
              <div className="p-4 rounded-xl bg-surface-container font-bold text-sm flex justify-between items-center border border-outline-variant/40">
                <span className="text-on-surface">กำไรสุทธิก่อนภาษี (Net Income Before Tax)</span>
                <span className="font-mono text-lg text-primary">฿{netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales by Customer */}
      {reportType === 'sales_by_customer' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5 animate-in fade-in">
          <h2 className="text-sm font-bold text-on-surface mb-3">รายงานสรุปยอดขายแยกตามรายชื่อลูกค้า</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                <tr>
                  <th className="py-2.5 px-3">ชื่อลูกค้า / บริษัท</th>
                  <th className="py-2.5 px-3">เลขประจำตัวผู้เสียภาษี</th>
                  <th className="py-2.5 px-3 text-center">จำนวนบิลที่ชำระ</th>
                  <th className="py-2.5 px-3 text-right">ยอดซื้อสะสม</th>
                  <th className="py-2.5 px-3 text-right">สัดส่วนยอดขาย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {salesByCustomer.map((item, idx) => {
                  const share = ((item.totalAmount / (revenueTotal || 1)) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-surface-container-low/40">
                      <td className="py-2.5 px-3 font-semibold text-on-surface">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-outline">{item.taxId || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.count} ฉบับ</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                        ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-outline">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart of Accounts */}
      {reportType === 'coa' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5 animate-in fade-in">
          <h2 className="text-sm font-bold text-on-surface mb-3">ผังบัญชีมาตรฐาน (Chart of Accounts)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
                <tr>
                  <th className="py-2.5 px-3">รหัสบัญชี</th>
                  <th className="py-2.5 px-3">ชื่อบัญชี</th>
                  <th className="py-2.5 px-3">หมวดหมู่</th>
                  <th className="py-2.5 px-3 text-right">ยอดยกไป (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {chartOfAccounts.map(coa => (
                  <tr key={coa.id} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{coa.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{coa.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        coa.category === 'asset' ? 'bg-blue-100 text-blue-800' :
                        coa.category === 'liability' ? 'bg-amber-100 text-amber-800' :
                        coa.category === 'revenue' ? 'bg-emerald-100 text-emerald-800' :
                        coa.category === 'expense' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {coa.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                      ฿{coa.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

