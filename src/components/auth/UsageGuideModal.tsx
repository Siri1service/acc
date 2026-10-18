import React, { useEffect } from 'react';
import { BookOpen, FilePlus2, UsersRound, Settings2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UsageGuideModal: React.FC = () => {
  const { authUser, currentOrg, isOnboardingCompleted, isUsageGuideOpen, setIsUsageGuideOpen } = useApp();
  const storageKey = authUser ? `accdata_usage_guide_seen_${authUser.id}` : '';

  useEffect(() => {
    if (!storageKey || !isOnboardingCompleted) return;
    if (localStorage.getItem(storageKey) !== '1') setIsUsageGuideOpen(true);
  }, [storageKey, isOnboardingCompleted, setIsUsageGuideOpen]);

  const close = () => {
    if (storageKey) localStorage.setItem(storageKey, '1');
    setIsUsageGuideOpen(false);
  };

  if (!isUsageGuideOpen || !isOnboardingCompleted) return null;
  const items = [
    { icon: FilePlus2, title: 'สร้างเอกสาร', text: 'เปิดเมนูเอกสาร เลือกชนิดเอกสาร เพิ่มรายการสินค้า แล้วบันทึกร่างหรือพิมพ์ PDF' },
    { icon: UsersRound, title: 'เพิ่มข้อมูลกิจการและคู่ค้า', text: 'เพิ่มลูกค้า ผู้ขาย และสินค้าในเมนูที่เกี่ยวข้อง ข้อมูลเหล่านี้ช่วยเติมรายละเอียดในเอกสาร' },
    { icon: Settings2, title: 'ตั้งค่าระบบ', text: 'ผู้ดูแลตั้งค่าเลขที่เอกสาร ภาษี และรูปแบบเอกสารได้จากเมนูตั้งค่าระบบ' },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="usage-guide-title">
      <section className="w-full max-w-lg rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></span>
            <div>
              <h2 id="usage-guide-title" className="text-lg font-bold text-on-surface">เริ่มต้นใช้งาน AccData</h2>
              <p className="mt-1 text-xs text-on-surface-variant">ตั้งค่า {currentOrg.name} เรียบร้อยแล้ว</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="ปิดคำแนะนำ" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-3">
          {items.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-surface-container-low p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary text-xs font-bold">{index + 1}</span>
              <div className="min-w-0"><h3 className="flex items-center gap-2 text-sm font-semibold text-on-surface"><Icon className="h-4 w-4 text-primary" />{title}</h3><p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{text}</p></div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-outline">เริ่มจากเพิ่มรายชื่อและสินค้า จากนั้นสร้างเอกสารจริง ระบบไม่ได้เติมข้อมูลตัวอย่างให้อัตโนมัติ</p>
        <button type="button" onClick={close} className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container">เข้าใช้งานระบบ</button>
      </section>
    </div>
  );
};
