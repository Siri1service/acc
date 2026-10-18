import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Document, Organization } from '../../types';
import { 
  Printer, 
  Download, 
  X, 
  Palette, 
  Check, 
  Copy, 
  Share2,
  FileText
} from 'lucide-react';

interface DocumentPrintModalProps {
  document: Document | null;
  onClose: () => void;
}

type TemplateTheme = 'modern_cyan' | 'minimal_gray' | 'cyber_slate' | 'tax_official' | 'thermal_slip';

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({ document, onClose }) => {
  const { currentOrg, bankAccounts } = useApp();
  const [activeTemplate, setActiveTemplate] = useState<TemplateTheme>(currentOrg.settings.activeTemplate || 'modern_cyan');
  const [printFormat, setPrintFormat] = useState<'a4' | 'slip'>('a4');

  if (!document) return null;

  const docTitleMap: Record<string, { th: string; en: string }> = {
    QT: { th: 'ใบเสนอราคา', en: 'QUOTATION' },
    BL: { th: 'ใบวางบิล / ใบแจ้งหนี้', en: 'BILLING NOTE / INVOICE' },
    TAX: { th: 'ใบกำกับภาษี', en: 'TAX INVOICE' },
    RE: { th: 'ใบเสร็จรับเงิน', en: 'OFFICIAL RECEIPT' },
    CASH: { th: 'ใบกำกับภาษี / ใบเสร็จรับเงิน (ขายเงินสด)', en: 'TAX INVOICE / RECEIPT (CASH SALE)' },
    CN: { th: 'ใบลดหนี้', en: 'CREDIT NOTE' },
    DN: { th: 'ใบเพิ่มหนี้', en: 'DEBIT NOTE' },
    PO: { th: 'ใบสั่งซื้อ', en: 'PURCHASE ORDER' },
    GR: { th: 'ใบรับสินค้า', en: 'GOODS RECEIPT' }
  };

  const docInfo = docTitleMap[document.docType] || { th: 'เอกสาร', en: 'DOCUMENT' };
  const targetBank = bankAccounts.find(b => b.id === document.bankAccountId) || bankAccounts[0];
  const hasLineDiscounts = document.items.some(item => item.discountAmount > 0);
  const hasCompanyStamp = Boolean(currentOrg.stampUrl);

  const handlePrint = () => {
    window.print();
  };

  const templatesList: { id: TemplateTheme; name: string; desc: string; previewColor: string }[] = [
    { id: 'modern_cyan', name: '1. Modern Indigo & Teal', desc: 'โมเดิร์นคอร์ปอเรท สวยงาม ทันสมัย', previewColor: 'bg-primary' },
    { id: 'minimal_gray', name: '2. Minimal Professional', desc: 'เรียบหรู ทางการ โทนเทาเข้ม', previewColor: 'bg-slate-700' },
    { id: 'cyber_slate', name: '3. Cyber Tech Slate', desc: 'ดีไซน์เทคโนโลยี ไฮเทค คมชัด', previewColor: 'bg-teal-700' },
    { id: 'tax_official', name: '4. ตารางมาตรฐานสรรพากร', desc: 'แบบฟอร์มทางการตามระเบียบกรมสรรพากร', previewColor: 'bg-blue-900' },
    { id: 'thermal_slip', name: '5. สลิป 80mm (Thermal POS)', desc: 'ขนาดกะทัดรัดสำหรับเครื่องพิมพ์สลิป', previewColor: 'bg-neutral-800' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-outline-variant/30 bg-surface-container-low flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface">พิมพ์และส่งออกเอกสาร PDF</span>
              <span className="text-[11px] text-outline ml-2">เลขที่: <b className="font-mono text-on-surface">{document.docNumber}</b></span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Format toggle: A4 vs Slip */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs">
              <button
                onClick={() => {
                  setPrintFormat('a4');
                  if (activeTemplate === 'thermal_slip') setActiveTemplate('modern_cyan');
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  printFormat === 'a4' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                ขนาด A4 มาตรฐาน
              </button>
              <button
                onClick={() => {
                  setPrintFormat('slip');
                  setActiveTemplate('thermal_slip');
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  printFormat === 'slip' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'
                }`}
              >
                ขนาดสลิป 80mm
              </button>
            </div>

            {/* Print Action Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์ / บันทึกเป็น PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar */}
        <div className="px-5 py-2.5 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center gap-2 overflow-x-auto shrink-0 print:hidden">
          <span className="text-xs font-semibold text-outline shrink-0 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" />
            <span>เลือกเทมเพลต (5 แบบ):</span>
          </span>
          {templatesList.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTemplate(t.id);
                if (t.id === 'thermal_slip') setPrintFormat('slip');
                else setPrintFormat('a4');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 border transition-all ${
                activeTemplate === t.id
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-outline-variant/40 hover:bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${t.previewColor}`}></span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-neutral-100 flex justify-center custom-scrollbar">
          {/* A4 Printable Sheet */}
          {printFormat === 'a4' && (
            <div className={`w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 p-8 sm:p-12 shadow-md rounded-lg text-xs leading-relaxed flex flex-col justify-between ${
              activeTemplate === 'minimal_gray' ? 'font-sans' :
              activeTemplate === 'cyber_slate' ? 'font-mono' :
              activeTemplate === 'tax_official' ? 'border-2 border-slate-900' : 'font-sans'
            }`}>
              <div>
                {/* Header Section */}
                <div className={`flex justify-between items-start pb-6 ${
                  activeTemplate === 'modern_cyan' ? 'border-b-2 border-primary' :
                  activeTemplate === 'cyber_slate' ? 'border-b-2 border-teal-600' :
                  activeTemplate === 'tax_official' ? 'border-b-2 border-slate-900' : 'border-b border-slate-300'
                }`}>
                  {/* Company Info */}
                  <div className="max-w-[420px]">
                    <div className="flex items-center gap-3">
                      {currentOrg.logoUrl ? <img src={currentOrg.logoUrl} alt="โลโก้กิจการ" className="max-h-14 max-w-28 object-contain" /> : <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">{currentOrg.name.slice(0, 1) || 'A'}</div>}
                      <div>
                        <h2 className="text-base font-bold text-slate-900">{currentOrg.name}</h2>
                    {currentOrg.branch && <div className="text-[11px] text-slate-600 font-medium">{currentOrg.branch}</div>}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      {currentOrg.taxId && <p><b>เลขประจำตัวผู้เสียภาษี:</b> {currentOrg.taxId}</p>}
                      {currentOrg.address && <p>{currentOrg.address}</p>}
                      {(currentOrg.phone || currentOrg.email) && <p>{[currentOrg.phone && `โทรศัพท์: ${currentOrg.phone}`, currentOrg.email && `อีเมล: ${currentOrg.email}`].filter(Boolean).join(' | ')}</p>}
                    </div>
                  </div>

                  {/* Document Title & Number Badge */}
                  <div className="text-right">
                    <div className={`inline-block px-4 py-1.5 rounded-lg text-white font-bold text-sm tracking-wide ${
                      activeTemplate === 'modern_cyan' ? 'bg-primary' :
                      activeTemplate === 'cyber_slate' ? 'bg-teal-800' :
                      activeTemplate === 'tax_official' ? 'bg-slate-900' : 'bg-slate-700'
                    }`}>
                      {docInfo.th}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 tracking-wider mt-0.5 uppercase">
                      {docInfo.en}
                    </div>

                    <div className="mt-4 space-y-1 text-right text-[11px]">
                      <div>
                        <span className="text-slate-500">เลขที่เอกสาร: </span>
                        <b className="text-sm font-mono text-slate-900">{document.docNumber}</b>
                      </div>
                      {document.referenceDocNumber && (
                        <div>
                          <span className="text-slate-500">อ้างอิงเอกสาร: </span>
                          <span className="font-mono font-medium text-slate-700">{document.referenceDocNumber}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">วันที่ออก: </span>
                        <span className="font-medium text-slate-800">{document.issueDate}</span>
                      </div>
                      {document.dueDate && <div>
                        <span className="text-slate-500">วันครบกำหนดชำระ: </span>
                        <span className="font-medium text-slate-800">{document.dueDate}</span>
                      </div>}
                    </div>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      ข้อมูลลูกค้า / ผู้รับบริการ (Customer Details)
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{document.contactName}</h3>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      {document.contactTaxId && <p><b>เลขประจำตัวผู้เสียภาษี:</b> {document.contactTaxId}</p>}
                      {document.contactBranch && <p><b>สาขา:</b> {document.contactBranch}</p>}
                      {document.contactAddress && <p className="line-clamp-2">{document.contactAddress}</p>}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      ช่องทางการชำระเงินที่ระบุบนเอกสาร
                    </span>
                    <div className="text-[11px] text-slate-700 mt-1 space-y-1">
                      <p>
                        <b>รูปแบบการจ่าย:</b> {
                          document.paymentMethod === 'cash' ? 'เงินสด (Cash)' :
                          document.paymentMethod === 'cheque' ? 'เช็คธนาคาร (Cheque)' : 'เงินโอน (Bank Transfer)'
                        }
                      </p>
                      {targetBank && document.paymentMethod === 'transfer' && (
                        <div className="p-2 rounded bg-white border border-slate-200 mt-1 text-[10px]">
                          <div className="font-bold text-slate-800">{targetBank.bankName} ({targetBank.branchName})</div>
                          <div className="font-mono text-slate-900 font-bold">เลขที่: {targetBank.accountNumber}</div>
                          <div className="text-slate-600">{targetBank.accountName}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse my-4">
                  <thead>
                    <tr className={`text-[11px] font-bold text-slate-800 ${
                      activeTemplate === 'tax_official'
                        ? 'border-y-2 border-slate-900 bg-slate-100'
                        : 'border-b border-slate-300 bg-slate-100'
                    }`}>
                      <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                      <th className="py-2.5 px-3">รายการสินค้า / บริการ</th>
                      <th className="py-2.5 px-3 w-20 text-right">จำนวน</th>
                      <th className="py-2.5 px-3 w-20 text-center">หน่วย</th>
                      <th className="py-2.5 px-3 w-28 text-right">ราคา/หน่วย{document.pricesIncludeVat ? ' (รวม VAT)' : ' (ก่อน VAT)'}</th>
                      {hasLineDiscounts && <th className="py-2.5 px-3 w-24 text-right">ส่วนลด</th>}
                      <th className="py-2.5 px-3 w-32 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {document.items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {item.itemName}
                          {item.description && (
                            <div className="text-[10px] text-slate-500 font-normal">{item.description}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">฿{item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                        {hasLineDiscounts && <td className="py-2.5 px-3 text-right font-mono">{item.discountAmount > 0 ? `฿${item.discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : ''}</td>}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary & Calculations Section */}
                <div className="flex justify-between items-start pt-4 border-t border-slate-200 mt-4">
                  <div className="max-w-[380px] space-y-2">
                    {document.notes && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                        <b>หมายเหตุ:</b> {document.notes}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 leading-relaxed">เอกสารนี้จัดทำโดยระบบ AccData</div>
                  </div>

                  <div className="w-72 space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>รวมเป็นเงิน{document.pricesIncludeVat ? ' (รวม VAT แล้ว)' : ' (ก่อน VAT)'}:</span>
                      <span className="font-mono font-bold">฿{document.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {document.discountAmount > 0 && (
                      <div className="flex justify-between py-1 text-red-600">
                        <span>ส่วนลดพิเศษ (Discount):</span>
                        <span className="font-mono">-฿{document.discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {document.vatAmount > 0 && <div className="flex justify-between py-1 text-slate-600">
                      <span>ภาษีมูลค่าเพิ่ม VAT {document.vatRate}%{document.pricesIncludeVat ? ' (รวมอยู่ในราคา)' : ''}:</span>
                      <span className="font-mono font-bold">฿{document.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>}

                    {document.withholdingTaxAmount > 0 && (
                      <div className="flex justify-between py-1 text-amber-700">
                        <span>หักภาษี ณ ที่จ่าย ({document.withholdingTaxRate}%):</span>
                        <span className="font-mono">-฿{document.withholdingTaxAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className={`flex justify-between py-2 text-sm font-bold border-t-2 ${
                      activeTemplate === 'modern_cyan' ? 'border-primary text-primary' : 'border-slate-900 text-slate-900'
                    }`}>
                      <span>จำนวนเงินรวมทั้งสิ้น:</span>
                      <span className="font-mono text-base">฿{document.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures Footer */}
              <div className={`grid ${hasCompanyStamp ? 'grid-cols-3' : 'grid-cols-2'} gap-8 pt-12 border-t border-slate-200 mt-12 text-center text-xs`}>
                <div>
                  <div className="h-12 border-b border-dashed border-slate-400"></div>
                  <div className="font-bold text-slate-800 mt-2">ผู้รับเอกสาร / ผู้มีอำนาจลงนาม</div>
                  <div className="text-[10px] text-slate-500">วันที่: ____ / ____ / ________</div>
                </div>

                <div>
                  <div className="h-12 border-b border-dashed border-slate-400">
                    {currentOrg.signatureUrl && <img src={currentOrg.signatureUrl} alt="ลายเซ็นผู้มีอำนาจ" className="mx-auto h-12 max-w-40 object-contain" />}
                  </div>
                  <div className="font-bold text-slate-800 mt-2">{document.createdByName || currentOrg.name}</div>
                  <div className="text-[10px] text-slate-500">ผู้มีอำนาจลงนาม / ในนามบริษัท</div>
                </div>
                {hasCompanyStamp && <div className="relative flex h-24 items-center justify-center">
                  <img src={currentOrg.stampUrl} alt="ตราประทับกิจการ" className="max-h-24 max-w-36 object-contain" />
                  <div className="absolute bottom-0 w-full border-b border-dashed border-slate-300" />
                  <span className="absolute -bottom-5 text-[10px] text-slate-500">ตราประทับบริษัท</span>
                </div>}
              </div>
            </div>
          )}

          {/* Thermal Slip 80mm Printable Canvas */}
          {printFormat === 'slip' && (
            <div className="w-[320px] bg-white text-slate-900 p-6 shadow-xl rounded-lg font-mono text-[11px] leading-snug border border-slate-300">
              <div className="text-center pb-4 border-b border-dashed border-slate-400">
                {currentOrg.logoUrl && <img src={currentOrg.logoUrl} alt="โลโก้กิจการ" className="mx-auto mb-2 max-h-10 max-w-32 object-contain" />}
                <h2 className="font-bold text-sm text-slate-900">{currentOrg.name}</h2>
                {currentOrg.branch && <p className="text-[10px] text-slate-600">{currentOrg.branch}</p>}
                {currentOrg.taxId && <p className="text-[10px] text-slate-600">Tax ID: {currentOrg.taxId}</p>}
                {currentOrg.phone && <p className="text-[10px] text-slate-600">{currentOrg.phone}</p>}
                <div className="inline-block mt-2 px-2 py-0.5 border border-slate-800 text-[10px] font-bold">
                  {docInfo.th}
                </div>
              </div>

              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
                <div>เลขที่: <b>{document.docNumber}</b></div>
                <div>วันที่: {document.issueDate}</div>
                <div>ลูกค้า: {document.contactName}</div>
                {document.contactTaxId && <div>Tax ID: {document.contactTaxId}</div>}
              </div>

              {/* Items */}
              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
                {document.items.map(item => (
                  <div key={item.id} className="text-[10px]">
                    <div className="font-bold">{item.itemName}</div>
                    <div className="flex justify-between text-slate-600">
                      <span>{item.quantity} x ฿{item.unitPrice.toLocaleString()}</span>
                      <span className="font-bold text-slate-900">฿{item.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2.5 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>รวมเป็นเงิน:</span>
                  <span>฿{document.subtotal.toLocaleString()}</span>
                </div>
                {document.vatAmount > 0 && <div className="flex justify-between">
                  <span>VAT {document.vatRate}%{document.pricesIncludeVat ? ' (รวมในราคา)' : ''}:</span>
                  <span>฿{document.vatAmount.toLocaleString()}</span>
                </div>}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-800">
                  <span>ยอดสุทธิ:</span>
                  <span>฿{document.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                  <span>การชำระ:</span>
                  <span>{document.paymentMethod === 'cash' ? 'เงินสด' : 'เงินโอน'}</span>
                </div>
              </div>

              {/* Barcode & Thank you */}
              <div className="text-center pt-4 border-t border-dashed border-slate-400 space-y-2">
                <div className="font-mono text-center tracking-widest text-xs font-bold">
                  ||||| | |||| ||| |||||||
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {document.docNumber}
                </div>
                <div className="text-[10px] font-bold">ขอบคุณที่ใช้บริการ</div>
                <div className="text-[9px] text-slate-400">Powered by AccData Cloud</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

