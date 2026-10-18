import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Document, DocumentType, DocumentStatus } from '../../types';
import { DocumentPrintModal } from './DocumentPrintModal';
import { DocumentEditorModal } from './DocumentEditorModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowRight,
  Printer,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';

interface DocumentsViewProps {
  initialType?: DocumentType;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ initialType }) => {
  const { 
    documents, 
    currentOrg, 
    currentUser, 
    approveDocument, 
    convertDocument, 
    deleteDocument,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialType || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [printingDoc, setPrintingDoc] = useState<Document | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [selectedNewType, setSelectedNewType] = useState<DocumentType>('QT');

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (doc.orgId !== currentOrg.id) return false;
      if (activeTab !== 'ALL' && doc.docType !== activeTab) return false;
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNumber = doc.docNumber.toLowerCase().includes(q);
        const matchContact = doc.contactName.toLowerCase().includes(q);
        const matchRef = doc.referenceDocNumber?.toLowerCase().includes(q);
        if (!matchNumber && !matchContact && !matchRef) return false;
      }

      return true;
    });
  }, [documents, currentOrg.id, activeTab, statusFilter, searchQuery]);

  const tabs: { id: string; label: string; count: number; color?: string }[] = [
    { id: 'ALL', label: 'ทั้งหมด', count: documents.filter(d => d.orgId === currentOrg.id).length },
    { id: 'QT', label: 'ใบเสนอราคา (QT)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'QT').length },
    { id: 'BL', label: 'ใบวางบิล (BL)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'BL').length },
    { id: 'TAX', label: 'ใบกำกับภาษี (TAX)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'TAX').length },
    { id: 'RE', label: 'ใบเสร็จรับเงิน (RE)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'RE').length },
    { id: 'CASH', label: 'ขายเงินสด (CS)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'CASH').length },
    { id: 'CN', label: 'ใบลดหนี้ (CN)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'CN').length },
    { id: 'DN', label: 'ใบเพิ่มหนี้ (DN)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'DN').length },
    { id: 'PO', label: 'ใบสั่งซื้อ (PO)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'PO').length },
    { id: 'GR', label: 'ใบรับสินค้า (GR)', count: documents.filter(d => d.orgId === currentOrg.id && d.docType === 'GR').length }
  ];

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['DocNumber,DocType,IssueDate,DueDate,ContactName,ContactTaxId,Subtotal,VatAmount,GrandTotal,Status'];
    const rows = filteredDocs.map(d => 
      `"${d.docNumber}","${d.docType}","${d.issueDate}","${d.dueDate}","${d.contactName}","${d.contactTaxId}",${d.subtotal},${d.vatAmount},${d.grandTotal},"${d.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accdata_documents_${activeTab}_${Date.now()}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>ชำระเงินแล้ว</span>
        </span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>อนุมัติแล้ว</span>
        </span>;
      case 'pending_approval':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>รออนุมัติ</span>
        </span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
          <span>จัดส่งแล้ว</span>
        </span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
          แบบร่าง (Draft)
        </span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            เอกสารขายและการเชื่อมโยงสถานะ (Sales Pipeline)
          </h1>
          <p className="text-xs text-outline mt-1">
            รองรับระบบแปลงสถานะเอกสารใน 1 คลิก (QT ➔ BL ➔ TAX ➔ RE) และพิมพ์ PDF ได้มากกว่า 5 เทมเพลต
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export to CSV/Excel */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-semibold rounded-lg transition-colors shadow-xs"
            title="ส่งออกเอกสารในมุมมองนี้เป็น Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Export Excel / CSV</span>
          </button>

          {/* New Document Button */}
          <button
            onClick={() => {
              setSelectedNewType(activeTab === 'ALL' ? 'QT' : activeTab as DocumentType);
              setEditingDoc(null);
              setIsNewDocModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างเอกสาร {activeTab !== 'ALL' ? activeTab : 'ใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1 border-b border-outline-variant/30 overflow-x-auto pb-1 text-xs custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary font-bold bg-primary/5'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === tab.id ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-outline'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเลขที่, ชื่อลูกค้า, หรือเลขอ้างอิง..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-outline">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="draft">แบบร่าง (Draft)</option>
            <option value="pending_approval">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="paid">ชำระเงินแล้ว</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่เอกสาร / ชนิด</th>
                <th className="py-3 px-4">ลูกค้า / ผู้รับเอกสาร</th>
                <th className="py-3 px-4">วันที่ออก / ครบกำหนด</th>
                <th className="py-3 px-4 text-right">ยอดรวมสุทธิ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4">การแปลงสถานะ (Pipeline)</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">ไม่พบเอกสารในหมวดหมู่นี้</p>
                    <p className="text-[11px] mt-0.5">กดปุ่ม "สร้างเอกสาร" ด้านบนเพื่อเพิ่มรายการใหม่</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  return (
                    <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      {/* Column 1: Document Number & Type */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            doc.docType === 'QT' ? 'bg-primary-fixed text-on-primary-fixed' :
                            doc.docType === 'BL' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                            doc.docType === 'TAX' ? 'bg-amber-100 text-amber-900' :
                            doc.docType === 'RE' ? 'bg-emerald-100 text-emerald-900' :
                            doc.docType === 'CASH' ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {doc.docType}
                          </span>
                          <span className="font-bold font-mono text-on-surface">{doc.docNumber}</span>
                        </div>
                        {doc.referenceDocNumber && (
                          <div className="text-[10px] text-outline mt-0.5 flex items-center gap-1">
                            <span>อ้างอิง:</span>
                            <span className="font-mono text-primary font-medium">{doc.referenceDocNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-on-surface truncate max-w-[200px]">
                          {doc.contactName}
                        </div>
                        <div className="text-[10px] text-outline font-mono mt-0.5">
                          Tax ID: {doc.contactTaxId || '-'}
                        </div>
                      </td>

                      {/* Column 3: Dates */}
                      <td className="py-3 px-4">
                        <div>ออก: <span className="font-medium">{doc.issueDate}</span></div>
                        <div className="text-[10px] text-outline">ครบ: {doc.dueDate}</div>
                      </td>

                      {/* Column 4: Total Amount */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold font-mono text-sm text-on-surface">
                          ฿{doc.grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-outline">
                          (VAT: ฿{doc.vatAmount.toLocaleString()})
                        </div>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(doc.status)}
                        </div>
                      </td>

                      {/* Column 6: Pipeline 1-Click Conversion */}
                      <td className="py-3 px-4">
                        {doc.docType === 'QT' && (
                          <button
                            onClick={() => convertDocument(doc.id, 'BL')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[11px] transition-all"
                            title="แปลงใบเสนอราคานี้เป็น ใบวางบิล (BL) ทันที"
                          >
                            <span>แปลงเป็น BL</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {doc.docType === 'BL' && (
                          <button
                            onClick={() => convertDocument(doc.id, 'TAX')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-bold text-[11px] transition-all"
                            title="แปลงใบวางบิลนี้เป็น ใบกำกับภาษี (TAX)"
                          >
                            <span>แปลงเป็น TAX</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {doc.docType === 'TAX' && (
                          <button
                            onClick={() => convertDocument(doc.id, 'RE')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-all"
                            title="ออกใบเสร็จรับเงิน (RE) จากใบกำกับภาษีนี้"
                          >
                            <span>ออกใบเสร็จ RE</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {doc.docType === 'PO' && (
                          <button
                            onClick={() => convertDocument(doc.id, 'GR')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline font-bold text-[11px] transition-all"
                            title="แปลงใบสั่งซื้อเป็น ใบรับสินค้า (GR)"
                          >
                            <span>รับสินค้า GR</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {(doc.docType === 'RE' || doc.docType === 'CASH') && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ขั้นตอนสมบูรณ์</span>
                          </span>
                        )}
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Print PDF Button */}
                          <button
                            onClick={() => setPrintingDoc(doc)}
                            className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                            title="พิมพ์ / ดูตัวอย่าง PDF (เลือกได้ 5 เทมเพลต)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsNewDocModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                            title="แก้ไขเอกสาร (ใบเสร็จ RE สามารถแก้ไขเลขที่, ยอดชำระ, ธนาคาร ได้ก่อนอนุมัติ)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Quick Approve Button if draft */}
                          {doc.status !== 'approved' && doc.status !== 'paid' && (
                            <button
                              onClick={() => approveDocument(doc.id)}
                              className="p-1.5 rounded-lg text-outline hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="อนุมัติเอกสารนี้"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`คุณต้องการลบเอกสาร ${doc.docNumber} ใช่หรือไม่?`)) {
                                  deleteDocument(doc.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                              title="ลบเอกสาร (เฉพาะ Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Print & PDF Modal */}
      {printingDoc && (
        <DocumentPrintModal
          document={printingDoc}
          onClose={() => setPrintingDoc(null)}
        />
      )}

      {/* Document Create / Edit Modal */}
      {isNewDocModalOpen && (
        <DocumentEditorModal
          initialType={selectedNewType}
          editingDocument={editingDoc}
          onClose={() => {
            setIsNewDocModalOpen(false);
            setEditingDoc(null);
          }}
        />
      )}
    </div>
  );
};

