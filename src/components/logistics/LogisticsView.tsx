import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shipment, CourierCode } from '../../types';
import {
  Truck,
  Printer,
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Barcode,
  QrCode,
  X
} from 'lucide-react';

export const LogisticsView: React.FC = () => {
  const { shipments, createShipment, updateShipmentStatus, documents, currentOrg } = useApp();
  const [selectedCourier, setSelectedCourier] = useState<CourierCode>('flash');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewingShipment, setPreviewingShipment] = useState<Shipment | null>(null);

  // Available couriers
  const couriers: { code: CourierCode; name: string; tagColor: string; cutoffTime: string }[] = [
    { code: 'flash', name: 'Flash Express', tagColor: 'bg-amber-500 text-white', cutoffTime: '16:00 น.' },
    { code: 'kerry', name: 'Kerry Express (KEX)', tagColor: 'bg-orange-600 text-white', cutoffTime: '17:00 น.' },
    { code: 'thailand_post', name: 'ไปรษณีย์ไทย (EMS/ด่วนพิเศษ)', tagColor: 'bg-red-600 text-white', cutoffTime: '16:30 น.' },
    { code: 'jnt', name: 'J&T Express', tagColor: 'bg-rose-700 text-white', cutoffTime: '18:00 น.' }
  ];

  const handleCreateNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courier = formData.get('courier') as CourierCode;
    const recipientName = formData.get('recipientName') as string;
    const recipientPhone = formData.get('recipientPhone') as string;
    const recipientAddress = formData.get('recipientAddress') as string;
    const codAmount = Number(formData.get('codAmount') || 0);

    createShipment({
      courier,
      recipientName,
      recipientPhone,
      recipientAddress,
      codAmount,
      sortCode: 'BKK-HUB-28'
    });

    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: Shipment['shippingStatus']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>นำจ่ายสำเร็จ</span>
        </span>;
      case 'in_transit':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
          <Truck className="w-3 h-3 text-sky-600" />
          <span>กำลังจัดส่ง</span>
        </span>;
      case 'picked_up':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
          <Clock className="w-3 h-3 text-purple-600" />
          <span>เข้ารับพัสดุแล้ว</span>
        </span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>รอส่งมอบพัสดุ</span>
        </span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-on-surface">
            การจัดส่ง & ใบปะหน้าพัสดุ (Logistics & Shipping Hub)
          </h1>
          <p className="text-xs text-outline mt-1">
            เชื่อมต่อ API ขนส่ง Flash, Kerry, ไปรษณีย์ไทย, J&T ออกใบปะหน้ามาตรฐาน (Waybill 4x6 นิ้ว) พร้อมเช็คสถานะ
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เรียกรถเข้ารับพัสดุ / สร้างใบปะหน้า</span>
        </button>
      </div>

      {/* Courier Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {couriers.map((c) => {
          const count = shipments.filter(s => s.courier === c.code).length;
          return (
            <div
              key={c.code}
              className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.tagColor}`}>
                    {c.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>API Online</span>
                  </span>
                </div>
                <div className="text-sm font-bold text-on-surface mt-2">{c.name}</div>
                <div className="text-[11px] text-outline mt-0.5">ตัดรอบประจำวัน: {c.cutoffTime}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-outline">พัสดุในระบบ:</span>
                <span className="font-mono font-bold text-on-surface">{count} ชิ้น</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shipments Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface">รายการพัสดุและสถานะการจัดส่งเรียลไทม์</h2>
          <span className="text-xs text-outline">{shipments.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low text-[11px] text-outline font-bold border-b border-outline-variant/30">
              <tr>
                <th className="py-3 px-4">ขนส่ง / หมายเลขพัสดุ (Tracking)</th>
                <th className="py-3 px-4">เอกสารอ้างอิง</th>
                <th className="py-3 px-4">ผู้รับพัสดุ</th>
                <th className="py-3 px-4">ยอด COD เก็บปลายทาง</th>
                <th className="py-3 px-4 text-center">สถานะการขนส่ง</th>
                <th className="py-3 px-4 text-center">ปรับสถานะ / ใบปะหน้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {shipments.map((shp) => (
                <tr key={shp.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase bg-surface-container text-on-surface">
                        {shp.courier}
                      </span>
                      <span className="font-mono font-bold text-primary">{shp.trackingNumber}</span>
                    </div>
                    <div className="text-[10px] text-outline font-mono mt-0.5">
                      Sort Code: {shp.sortCode}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-on-surface">
                    {shp.documentNumber || '-'}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-on-surface">{shp.recipientName}</div>
                    <div className="text-[10px] text-outline">{shp.recipientPhone}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold">
                    {shp.codAmount > 0 ? (
                      <span className="text-amber-800">฿{shp.codAmount.toLocaleString()} (COD)</span>
                    ) : (
                      <span className="text-outline">ไม่มี COD</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(shp.shippingStatus)}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Print Waybill Button */}
                      <button
                        onClick={() => setPreviewingShipment(shp)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                        title="ดูและพิมพ์ใบปะหน้ามาตรฐาน (4x6 นิ้ว)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ใบปะหน้า</span>
                      </button>

                      {/* Advance status */}
                      {shp.shippingStatus === 'pending' && (
                        <button
                          onClick={() => updateShipmentStatus(shp.id, 'picked_up')}
                          className="px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[10px]"
                        >
                          เข้ารับแล้ว
                        </button>
                      )}

                      {shp.shippingStatus === 'picked_up' && (
                        <button
                          onClick={() => updateShipmentStatus(shp.id, 'in_transit')}
                          className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-[10px]"
                        >
                          กำลังส่ง
                        </button>
                      )}

                      {shp.shippingStatus === 'in_transit' && (
                        <button
                          onClick={() => updateShipmentStatus(shp.id, 'delivered')}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px]"
                        >
                          ส่งถึงแล้ว
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waybill / Shipping Label Printable Modal */}
      {previewingShipment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-300 relative text-xs">
            <button
              onClick={() => setPreviewingShipment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Waybill 4x6 Format */}
            <div className="border-2 border-slate-900 p-4 rounded space-y-3 font-sans">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                <div className="font-extrabold text-base tracking-tight uppercase">
                  {previewingShipment.courier} EXPRESS
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold">{previewingShipment.sortCode}</div>
                  <div className="text-[9px] text-slate-500">ROUTING CODE</div>
                </div>
              </div>

              {/* Barcode & Tracking */}
              <div className="text-center py-2 border-b border-dashed border-slate-400 space-y-1">
                <div className="font-mono text-xl tracking-widest font-bold">
                  ||| | ||||| || |||||| ||||
                </div>
                <div className="font-mono font-bold text-sm tracking-wider">
                  {previewingShipment.trackingNumber}
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-2 gap-3 text-[10px] border-b border-slate-300 pb-3">
                <div>
                  <div className="font-bold text-slate-500 uppercase">ผู้ส่ง (Sender):</div>
                  <div className="font-bold text-slate-900">{currentOrg.name}</div>
                  <div className="text-slate-600 line-clamp-2">{currentOrg.shippingAddress || currentOrg.address}</div>
                  <div className="text-slate-700">โทร: {currentOrg.phone}</div>
                </div>

                <div className="bg-slate-100 p-2 rounded border border-slate-200">
                  <div className="font-bold text-slate-700 uppercase">ผู้รับ (Recipient):</div>
                  <div className="font-bold text-slate-900 text-xs">{previewingShipment.recipientName}</div>
                  <div className="text-slate-700 mt-0.5">{previewingShipment.recipientAddress}</div>
                  <div className="font-bold text-slate-900 mt-1">โทร: {previewingShipment.recipientPhone}</div>
                </div>
              </div>

              {/* COD & Order Reference */}
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">เลขที่บิล: </span>
                  <span className="font-mono font-bold">{previewingShipment.documentNumber || '-'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">COD: </span>
                  <span className="font-mono font-bold text-sm">
                    {previewingShipment.codAmount > 0 ? `฿${previewingShipment.codAmount.toLocaleString()}` : '0 บาท'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex justify-end gap-2 border-t border-slate-200 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ใบปะหน้าพัสดุ (Direct Thermal 4x6)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <span className="text-sm font-bold text-on-surface">เรียกรถเข้ารับพัสดุ / สร้างใบปะหน้าใหม่</span>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-outline hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">เลือกบริษัทขนส่ง</label>
                <select
                  name="courier"
                  defaultValue="flash"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-medium"
                >
                  <option value="flash">Flash Express (ตัดรอบ 16:00 น.)</option>
                  <option value="kerry">Kerry Express (KEX) (ตัดรอบ 17:00 น.)</option>
                  <option value="thailand_post">ไปรษณีย์ไทย EMS (ตัดรอบ 16:30 น.)</option>
                  <option value="jnt">J&T Express (ตัดรอบ 18:00 น.)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ชื่อผู้รับพัสดุ</label>
                <input
                  name="recipientName"
                  required
                  placeholder="เช่น คุณวรวิทย์ สิทธิโชค"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">เบอร์โทรศัพท์ผู้รับ</label>
                  <input
                    name="recipientPhone"
                    required
                    placeholder="เช่น 089-765-4321"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ยอดเก็บเงินปลายทาง (COD)</label>
                  <input
                    name="codAmount"
                    type="number"
                    defaultValue={0}
                    placeholder="0 = ไม่มี COD"
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ที่อยู่จัดส่งพัสดุ</label>
                <textarea
                  name="recipientAddress"
                  required
                  rows={2}
                  placeholder="เลขที่, อาคาร, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-primary text-on-primary hover:bg-primary-container rounded-lg shadow-sm"
                >
                  สร้างใบปะหน้าและเรียกขนส่ง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

