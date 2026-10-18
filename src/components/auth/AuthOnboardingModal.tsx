import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EntityType } from '../../types';
import {
  Building2,
  User,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Mail,
  MapPin,
  Check
} from 'lucide-react';

export const AuthOnboardingModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    completeOnboarding, 
    currentOrg, 
    currentUser, 
    organizations,
    switchOrganization 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [entityType, setEntityType] = useState<EntityType>('juristic');
  const [businessName, setBusinessName] = useState('บริษัท นวัตกรรม บัญชีดิจิทัล จำกัด');
  const [taxId, setTaxId] = useState('0105568999123');
  const [branch, setBranch] = useState('สำนักงานใหญ่ (00000)');
  const [address, setAddress] = useState('99 อาคารดิจิทัล พาร์ค ชั้น 10 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900');
  const [shippingAddress, setShippingAddress] = useState('99 อาคารดิจิทัล พาร์ค ชั้น 10 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900');

  // Initial Feature Toggles (Step 3)
  const [featureFlags, setFeatureFlags] = useState({
    sales: true,
    purchases: true,
    taxes: true,
    inventory: true,
    logistics: true,
    crm: true,
    banking: true,
    reports: true,
    marketing: true
  });

  if (!isAuthModalOpen) return null;

  const toggleFeature = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = () => {
    completeOnboarding({
      entityType,
      name: businessName,
      taxId,
      branch,
      address,
      shippingAddress,
      enabledModules: featureFlags
    });
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden my-6 flex flex-col">
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center font-bold text-2xl font-mono mb-2 shadow-inner">
            A
          </div>
          <h2 className="text-lg font-bold">เข้าสู่ระบบด้วย Google (Gmail) & ลงทะเบียนตั้งค่า</h2>
          <p className="text-xs text-white/80 mt-1">
            ยินดีต้อนรับสู่ AccData Cloud Accounting ระบบบัญชีและภาษีคลาวด์อัจฉริยะ
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-8 h-1.5 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></span>
            <span className={`w-8 h-1.5 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></span>
            <span className={`w-8 h-1.5 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></span>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 text-xs space-y-5">
          {/* STEP 1: Gmail Account & Entity Type */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs text-red-500 font-bold shrink-0">
                  G
                </div>
                <div className="flex-1">
                  <div className="font-bold text-on-surface text-xs">{currentUser.fullName}</div>
                  <div className="text-[11px] text-outline font-mono">{currentUser.email}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Google Auth Verified
                </span>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-2">
                  1. เลือกรูปแบบสถานประกอบการของคุณ (Entity Type)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEntityType('juristic')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      entityType === 'juristic'
                        ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">นิติบุคคล (Juristic)</div>
                      <div className="text-[10px] text-outline mt-0.5">บริษัทจำกัด, บมจ., ห้างหุ้นส่วนจำกัด</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntityType('individual')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      entityType === 'individual'
                        ? 'border-secondary bg-secondary/5 shadow-xs ring-2 ring-secondary/20'
                        : 'border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">บุคคลธรรมดา (Individual)</div>
                      <div className="text-[10px] text-outline mt-0.5">ฟรีแลนซ์, ร้านค้าพาณิชย์, ผู้มีเงินได้</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                <span className="text-outline">ขั้นตอนที่ 1 จาก 3</span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container font-bold rounded-xl shadow-xs transition-all"
                >
                  <span>ถัดไป: ข้อมูลใบกำกับภาษี</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Tax & Address Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-bold text-on-surface mb-1">ชื่อองค์กร / ชื่อสถานประกอบการ <span className="text-primary">*</span></label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                  <input
                    type="text"
                    maxLength={13}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">สาขา</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ที่อยู่ออกใบกำกับภาษี</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ที่อยู่สำหรับการจัดส่งและคลังสินค้า</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container font-bold rounded-xl shadow-xs transition-all"
                >
                  <span>ถัดไป: เลือกฟังก์ชันที่ต้องการใช้</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Feature Toggles Selection */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-bold text-on-surface text-sm">
                  3. เลือกฟังก์ชันที่คุณต้องการใช้งานตั้งแต่เริ่มแรก
                </h3>
                <p className="text-outline text-xs mt-0.5">
                  ระบบจะเปิดใช้งานเฉพาะโมดูลที่เลือก (สามารถปรับเปลี่ยนได้ตลอดเวลาจากหน้าตั้งค่า)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {[
                  { key: 'sales' as const, label: 'เอกสารขาย (QT, BL, TAX, RE)' },
                  { key: 'purchases' as const, label: 'เอกสารซื้อ (PO, GR)' },
                  { key: 'taxes' as const, label: 'ภาษีมูลค่าเพิ่ม & หัก ณ ที่จ่าย (50 ทวิ)' },
                  { key: 'inventory' as const, label: 'คลังสินค้าและบาร์โค้ด' },
                  { key: 'logistics' as const, label: 'ขนส่ง & ใบปะหน้าพัสดุ 4x6' },
                  { key: 'crm' as const, label: 'สมุดรายชื่อ CRM & ตรวจสอบ DBD' },
                  { key: 'banking' as const, label: 'Live Thai Bank Feeds & ตรวจสลิป' },
                  { key: 'reports' as const, label: 'งบกำไรขาดทุน & ผังบัญชี' },
                  { key: 'marketing' as const, label: 'Gmail การตลาด (Marketing)' }
                ].map((item) => {
                  const checked = featureFlags[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleFeature(item.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        checked ? 'bg-primary/5 border-primary text-primary font-bold' : 'border-outline-variant/30 text-outline'
                      }`}
                    >
                      <span className="text-[11px]">{item.label}</span>
                      {checked && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>เริ่มใช้งานระบบ AccData ทันที</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

