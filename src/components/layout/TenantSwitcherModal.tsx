import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  User, 
  Plus, 
  CheckCircle2, 
  X, 
  MapPin, 
  FileText, 
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { EntityType } from '../../types';

export const TenantSwitcherModal: React.FC = () => {
  const { 
    isOrgSwitcherOpen, 
    setIsOrgSwitcherOpen, 
    organizations, 
    currentOrg, 
    switchOrganization, 
    createOrganization,
    currentUser
  } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newEntityType, setNewEntityType] = useState<EntityType>('juristic');
  const [newTaxId, setNewTaxId] = useState('');
  const [newBranch, setNewBranch] = useState('สำนักงานใหญ่ (00000)');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!isOrgSwitcherOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    createOrganization({
      name: newOrgName,
      entityType: newEntityType,
      taxId: newTaxId || '0105560000000',
      branch: newBranch,
      address: newAddress || 'กรุงเทพมหานคร',
      phone: newPhone || '02-000-0000'
    });

    setIsCreatingNew(false);
    setIsOrgSwitcherOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50">
          <div>
            <h2 className="text-sm font-bold text-on-surface">เลือกข้อมูลองค์กร / ประเภท App (Multi-Tenant)</h2>
            <p className="text-xs text-outline mt-0.5">
              เลือก Userdata หรือบริษัทที่คุณเป็นเจ้าของหรือได้รับเชิญเข้าร่วมงาน
            </p>
          </div>
          <button
            onClick={() => {
              setIsOrgSwitcherOpen(false);
              setIsCreatingNew(false);
            }}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isCreatingNew ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-outline uppercase tracking-wider">
                องค์กรและบริษัทที่คุณมีสิทธิ์เข้าถึง ({organizations.length})
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg.id;
                  return (
                    <div
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org.id);
                        setIsOrgSwitcherOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          org.entityType === 'juristic'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {org.entityType === 'juristic' ? (
                            <Building2 className="w-5 h-5" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-on-surface">{org.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              org.entityType === 'juristic'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}>
                              {org.entityType === 'juristic' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                            </span>
                          </div>
                          <div className="text-[11px] text-outline mt-0.5 flex items-center gap-1.5">
                            <span>เลขประจำตัวผู้เสียภาษี: {org.taxId}</span>
                            <span>•</span>
                            <span>{org.branch}</span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate max-w-xs mt-1">
                            {org.address}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-[11px] text-outline">
                  สิทธิ์ผู้ใช้ปัจจุบัน: <b className="text-on-surface">{currentUser.role}</b>
                </span>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>สร้างองค์กร / ธุรกิจใหม่</span>
                </button>
              </div>
            </div>
          ) : (
            /* Create New Organization Form */
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <span className="text-xs font-bold text-on-surface">ลงทะเบียนองค์กรใหม่</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-primary hover:underline"
                >
                  ย้อนกลับ
                </button>
              </div>

              {/* Entity Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  รูปแบบผู้เสียภาษี
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewEntityType('juristic')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      newEntityType === 'juristic'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'border-outline-variant/40 hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <div>
                      <div className="text-xs">นิติบุคคล (บริษัท / หจก.)</div>
                      <div className="text-[10px] text-outline font-normal">บจก., บมจ., ห้างหุ้นส่วน</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEntityType('individual')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      newEntityType === 'individual'
                        ? 'border-secondary bg-secondary/5 text-secondary font-bold'
                        : 'border-outline-variant/40 hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <div>
                      <div className="text-xs">บุคคลธรรมดา / ฟรีแลนซ์</div>
                      <div className="text-[10px] text-outline font-normal">ร้านค้า, ผู้มีเงินได้ 40(1)-(8)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  ชื่อองค์กร / ชื่อสถานประกอบการ <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="เช่น บริษัท สยาม คอนซัลติ้ง จำกัด หรือ ร้านสมชายการช่าง"
                  className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Tax ID & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    เลขประจำตัวผู้เสียภาษี (13 หลัก)
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={newTaxId}
                    onChange={(e) => setNewTaxId(e.target.value.replace(/\D/g, ''))}
                    placeholder="เช่น 0105560123456"
                    className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    สาขา
                  </label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    placeholder="สำนักงานใหญ่ (00000)"
                    className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  ที่อยู่จดทะเบียนสำหรับใบกำกับภาษี
                </label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="เลขที่, อาคาร, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                  className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/40 rounded-lg text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  บันทึกและสลับใช้งานทันที
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

