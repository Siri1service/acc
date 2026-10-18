import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkSupabaseConnection, isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig } from '../../lib/supabase';
import {
  Settings,
  Sliders,
  FileCode,
  Building2,
  Bell,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Palette,
  ExternalLink,
  Shield,
  RotateCcw
} from 'lucide-react';
import { DocumentType } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    currentOrg, 
    updateOrgSettings, 
    updateOrgDetails, 
    toggleModule, 
    lineSettings, 
    updateLineSettings,
    resetToDemoData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'modules' | 'prefixes' | 'company' | 'integrations'>('modules');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ checked: boolean; connected: boolean; message: string }>({
    checked: false,
    connected: false,
    message: ''
  });

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);

  // Local state for Doc Prefixes
  const [prefixes, setPrefixes] = useState(currentOrg.settings.docPrefixes);

  // Local state for Company Info
  const [companyName, setCompanyName] = useState(currentOrg.name);
  const [taxId, setTaxId] = useState(currentOrg.taxId);
  const [branch, setBranch] = useState(currentOrg.branch);
  const [address, setAddress] = useState(currentOrg.address);
  const [shippingAddress, setShippingAddress] = useState(currentOrg.shippingAddress || currentOrg.address);
  const [phone, setPhone] = useState(currentOrg.phone);
  const [email, setEmail] = useState(currentOrg.email);

  // Local state for Line
  const [lineToken, setLineToken] = useState(lineSettings.lineNotifyToken || '');
  const [notifyOnCreate, setNotifyOnCreate] = useState(lineSettings.notifyOnCreate);
  const [notifyOnApprove, setNotifyOnApprove] = useState(lineSettings.notifyOnApprove);
  const [notifyOnPay, setNotifyOnPay] = useState(lineSettings.notifyOnPay);

  const modules = currentOrg.settings.enabledModules;

  const moduleDefinitions = [
    { key: 'sales' as const, name: 'ระบบงานขาย (Sales Pipeline)', desc: 'ใบเสนอราคา (QT), ใบวางบิล (BL), ใบกำกับภาษี (TAX), ใบเสร็จรับเงิน (RE)' },
    { key: 'purchases' as const, name: 'ระบบจัดซื้อ (Purchase Orders)', desc: 'ใบสั่งซื้อ (PO) และใบรับสินค้า (Goods Receipt)' },
    { key: 'taxes' as const, name: 'ระบบภาษี & 50 ทวิ', desc: 'ภาษีมูลค่าเพิ่ม ภ.พ. 30 และภาษีหัก ณ ที่จ่าย ภ.ง.ด. 3, ภ.ง.ด. 53' },
    { key: 'inventory' as const, name: 'คลังสินค้าและบาร์โค้ด', desc: 'การจัดการสต็อกสินค้า, SKU, บาร์โค้ด และการแจ้งเตือนจุดสั่งซื้อซ้ำ' },
    { key: 'logistics' as const, name: 'โลจิสติกส์ & ใบปะหน้าพัสดุ', desc: 'เชื่อมต่อ Flash, Kerry, ไปรษณีย์ไทย, J&T และพิมพ์ใบปะหน้า 4x6' },
    { key: 'crm' as const, name: 'สมุดรายชื่อ & ตรวจสอบ DBD', desc: 'บันทึกรายชื่อลูกค้า คู่ค้า และระบบตรวจสอบนิติบุคคล DBD' },
    { key: 'banking' as const, name: 'Live Bank Feeds & ตรวจสลิป', desc: 'เชื่อมต่อบัญชีธนาคารไทย และระบบตรวจสลิปโอนเงินอัตโนมัติ' },
    { key: 'reports' as const, name: 'รายงานสรุปผู้บริหาร & ผังบัญชี', desc: 'งบกำไรขาดทุน (P&L), รายงานยอดขาย และผังบัญชี (Chart of Accounts)' },
    { key: 'marketing' as const, name: 'Gmail การตลาด (Marketing)', desc: 'ส่งแคมเปญการตลาด ข่าวสาร และโปรโมชั่นผ่านบัญชี Google Gmail' }
  ];

  const handleTestSupabase = async () => {
    const res = await checkSupabaseConnection();
    setSupabaseStatus({
      checked: true,
      connected: res.connected,
      message: res.message
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Save Doc Prefixes
    updateOrgSettings({ docPrefixes: prefixes });

    // Save Company Details
    updateOrgDetails({
      name: companyName,
      taxId,
      branch,
      address,
      shippingAddress,
      phone,
      email
    });

    // Save Line Settings
    updateLineSettings({
      lineNotifyToken: lineToken,
      notifyOnCreate,
      notifyOnApprove,
      notifyOnPay,
      isActive: Boolean(lineToken.trim())
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            ตั้งค่าระบบ & เชื่อมต่อ API (System Settings)
          </h1>
          <p className="text-xs text-outline mt-1">
            เปิด/ปิดฟังก์ชันที่ต้องการใช้งาน, ตั้งค่าเลขที่เอกสาร, ข้อมูลบริษัท และเชื่อมต่อ Supabase / LINE / Bank API
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการตั้งค่าเรียบร้อย</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'modules' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>เปิด/ปิดฟังก์ชันระบบ (Feature Flags)</span>
        </button>

        <button
          onClick={() => setActiveTab('prefixes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'prefixes' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>รูปแบบเลขที่เอกสาร (Doc Numbering)</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'company' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>ข้อมูลกิจการ & ใบกำกับภาษี</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold transition-all border-b-2 ${
            activeTab === 'integrations' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>เชื่อมต่อ Supabase & LINE API</span>
        </button>
      </div>

      {/* Tab 1: Module Toggles */}
      {activeTab === 'modules' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold text-on-surface">เปิด/ปิดฟังก์ชันการใช้งานระบบ (Feature Switchboard)</h2>
            <p className="text-xs text-outline mt-0.5">
              คุณสามารถเปิดหรือปิดซ่อนระบบที่ไม่ต้องการใช้งานได้ทันที เช่น หากเป็นธุรกิจบริการสามารถปิดระบบขนส่งหรือสต็อกได้
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {moduleDefinitions.map((mod) => {
              const isEnabled = modules[mod.key];
              return (
                <div
                  key={mod.key}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-surface-container-low/60 border-primary/30'
                      : 'bg-surface-container/30 border-outline-variant/20 opacity-70'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-on-surface">{mod.name}</div>
                    <div className="text-[11px] text-outline mt-0.5 leading-relaxed">{mod.desc}</div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => toggleModule(mod.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Document Numbering Prefixes */}
      {activeTab === 'prefixes' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4 animate-in fade-in text-xs">
          <div>
            <h2 className="text-sm font-bold text-on-surface">ตั้งค่ารูปแบบเลขที่เอกสาร (Document Prefix Sequences)</h2>
            <p className="text-xs text-outline mt-0.5">
              กำหนดคำนำหน้าและรูปแบบเลขที่อัตโนมัติของแต่ละหมวดหมู่เอกสาร
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold mb-1">ใบเสนอราคา (Quotation)</label>
              <input
                type="text"
                value={prefixes.QT}
                onChange={(e) => setPrefixes(p => ({ ...p, QT: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบวางบิล / แจ้งหนี้ (Billing Note)</label>
              <input
                type="text"
                value={prefixes.BL}
                onChange={(e) => setPrefixes(p => ({ ...p, BL: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบกำกับภาษี (Tax Invoice)</label>
              <input
                type="text"
                value={prefixes.TAX}
                onChange={(e) => setPrefixes(p => ({ ...p, TAX: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบเสร็จรับเงิน (Official Receipt)</label>
              <input
                type="text"
                value={prefixes.RE}
                onChange={(e) => setPrefixes(p => ({ ...p, RE: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ขายเงินสด (Cash Sale)</label>
              <input
                type="text"
                value={prefixes.CASH}
                onChange={(e) => setPrefixes(p => ({ ...p, CASH: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบลดหนี้ (Credit Note)</label>
              <input
                type="text"
                value={prefixes.CN}
                onChange={(e) => setPrefixes(p => ({ ...p, CN: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบเพิ่มหนี้ (Debit Note)</label>
              <input
                type="text"
                value={prefixes.DN}
                onChange={(e) => setPrefixes(p => ({ ...p, DN: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบสั่งซื้อ (PO)</label>
              <input
                type="text"
                value={prefixes.PO}
                onChange={(e) => setPrefixes(p => ({ ...p, PO: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ใบรับสินค้า (GR)</label>
              <input
                type="text"
                value={prefixes.GR}
                onChange={(e) => setPrefixes(p => ({ ...p, GR: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Company Details */}
      {activeTab === 'company' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4 animate-in fade-in text-xs">
          <div>
            <h2 className="text-sm font-bold text-on-surface">ข้อมูลกิจการสำหรับออกเอกสารและใบกำกับภาษี</h2>
            <p className="text-xs text-outline mt-0.5">
              ข้อมูลนี้จะแสดงอยู่บนหัวเอกสารทุกฉบับที่พิมพ์ออกมาในรูปแบบ PDF / A4 / Slip
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block font-semibold mb-1">ชื่อสถานประกอบการ / องค์กร</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                <input
                  type="text"
                  maxLength={13}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">สาขา</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">ที่อยู่จดทะเบียนตามแบบ ภ.พ.20</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ที่อยู่จัดส่งและคลังสินค้า (สำหรับใบปะหน้า)</label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">อีเมลติดต่อ</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Integrations (Supabase & LINE API) */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in text-xs">
          {/* Supabase Box */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ฐานข้อมูล Supabase PostgreSQL (Cloud Database)</span>
                </h2>
                <p className="text-xs text-outline mt-0.5">
                  เชื่อมต่อตาราง organizations, documents, bank_accounts และ audit_logs
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    handleTestSupabase();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกและเชื่อมต่อ</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold text-primary flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ทดสอบการเชื่อมต่อ</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-on-surface">สถานะการเชื่อมต่อ:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  supabaseStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {supabaseStatus.connected
                    ? 'เชื่อมต่อ Supabase PostgreSQL แล้ว'
                    : isSupabaseConfigured()
                      ? supabaseStatus.checked ? 'เชื่อมต่อ Supabase ไม่สำเร็จ' : 'ตั้งค่าแล้ว (กดทดสอบเพื่อตรวจเช็ค)'
                      : 'โหมด Local Database อัจฉริยะ (พร้อมเชื่อมต่อ)'}
                </span>
              </div>
              <div className="text-[11px] text-outline font-mono">
                ไฟล์ SQL Schema สำหรับนำไปรันบน Supabase อยู่ที่: <b>supabase/schema.sql</b>
              </div>
              {supabaseStatus.checked && (
                <div className={`p-2 rounded text-[11px] font-medium ${
                  supabaseStatus.connected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {supabaseStatus.message}
                </div>
              )}
            </div>
          </div>

          {/* LINE API Box */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>การเชื่อมต่อ LINE Notify & Messaging API</span>
              </h2>
              <p className="text-xs text-outline mt-0.5">
                ส่งการแจ้งเตือนอัตโนมัติเมื่อมีการออกบิล, ชำระเงิน หรือส่งต่อเอกสารรอการอนุมัติ
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">LINE Notify Token / Channel Access Token</label>
                <input
                  type="password"
                  value={lineToken}
                  onChange={(e) => setLineToken(e.target.value)}
                  placeholder="LINE_NOTIFY_ACCESS_TOKEN..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnCreate}
                    onChange={(e) => setNotifyOnCreate(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>แจ้งเตือนเมื่อมีการสร้างเอกสารใหม่ (QT, BL, TAX, RE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnApprove}
                    onChange={(e) => setNotifyOnApprove(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>แจ้งเตือนเมื่อเอกสารได้รับการอนุมัติ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnPay}
                    onChange={(e) => setNotifyOnPay(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>แจ้งเตือนเมื่อตรวจพบเงินโอนเข้าและตรวจสลิปผ่าน</span>
                </label>
              </div>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-between">
            <div>
              <div className="font-bold text-on-surface">รีเซ็ตข้อมูลตัวอย่างในเบราว์เซอร์</div>
              <div className="text-[11px] text-outline">ไม่ลบเอกสารออนไลน์ ไม่ลบการตั้งค่า Supabase และไม่ออกจากระบบ</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('รีเซ็ตเฉพาะข้อมูลตัวอย่างที่เก็บในเบราว์เซอร์หรือไม่? ข้อมูลใน Supabase จะไม่ถูกลบ')) {
                  resetToDemoData();
                  alert('รีเซ็ตข้อมูลสำเร็จเรียบร้อยแล้ว');
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-outline hover:text-error text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูล</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

