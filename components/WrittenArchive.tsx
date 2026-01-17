
import React, { useState, useRef } from 'react';

declare var html2canvas: any;

const YemenLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

interface ArchiveRow {
  id: number;
  saleNumber: string;
  saleDate: string;
  vehicleType: string;
  color: string;
  model: string;
  chassisNumber: string;
  engineNumber: string;
  plateNumber: string;
  sellerName: string;
  buyerName: string;
  sellerPhone: string;
  buyerPhone: string;
}

// Add onNotify to props to fix TypeScript error
const WrittenArchive: React.FC<{ onBack: () => void, onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void }> = ({ onBack, onNotify }) => {
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [rows, setRows] = useState<ArchiveRow[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      saleNumber: '',
      saleDate: '',
      vehicleType: '',
      color: '',
      model: '',
      chassisNumber: '',
      engineNumber: '',
      plateNumber: '',
      sellerName: '',
      buyerName: '',
      sellerPhone: '',
      buyerPhone: ''
    }))
  );

  const [headerInfo, setHeaderInfo] = useState({
    showroomName: '',
    fromDate: '',
    toDate: '',
    year: '١٤٤٧'
  });

  const updateRow = (id: number, field: keyof ArchiveRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleExportImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `Showroom_Archive_${headerInfo.showroomName || 'record'}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      alert("تعذر حفظ السجل كصورة");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/50 py-10 px-4 font-['Cairo'] print:bg-white print:p-0">
      
      {isExporting && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[500] flex flex-col items-center justify-center text-white">
           <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
           <h3 className="text-2xl font-black mb-2">جاري أرشفة الدفتر رقمياً...</h3>
           <p className="text-slate-400 font-bold">نقوم بتحسين الدقة لضمان وضوح كافة البيانات المدخلة</p>
        </div>
      )}

      {/* Control Panel */}
      <div className="max-w-[1400px] mx-auto mb-10 flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 print:hidden gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">🖋️</div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">أرشفة سجلات المعارض</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">توليد تقارير رسمية بمعايير الإدارة العامة للمرور</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={onBack} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all">العودة للنظام</button>
           <button onClick={handleExportImage} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">حفظ كصورة (PNG)</button>
           <button onClick={() => window.print()} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">طباعة PDF</button>
        </div>
      </div>

      {/* A4 Landscape Document Area */}
      <div className="flex justify-center items-start overflow-x-auto custom-scrollbar pb-20 print:overflow-visible">
        <div 
          ref={printRef}
          id="print-area"
          className="bg-white text-slate-900 relative shadow-2xl print:shadow-none flex flex-col p-[10mm] border-[1px] border-slate-200"
          style={{ width: '297mm', height: '210mm', minWidth: '297mm' }}
        >
          {/* Official Framing */}
          <div className="absolute inset-[5mm] border-[3px] border-slate-900 pointer-events-none"></div>
          <div className="absolute inset-[6.5mm] border-[1px] border-slate-900 pointer-events-none"></div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
             <YemenLogo className="w-[180mm]" />
          </div>

          <div className="relative z-10 h-full flex flex-col px-6 py-4">
            {/* Document Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="text-center space-y-1">
                <h3 className="text-[14px] font-black">الجمهورية اليمنية</h3>
                <h3 className="text-[14px] font-black">وزارة الداخلية</h3>
                <p className="text-[11px] font-bold">الإدارة العامة للمرور</p>
                <p className="text-[11px] font-bold">شعبة التحري والبحث الجنائي</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 border-2 border-slate-900 rounded-xl flex items-center justify-center mx-auto mb-2 bg-white">
                  <YemenLogo className="w-12 h-12" />
                </div>
                <h1 className="text-[20px] font-black underline underline-offset-4 decoration-2">سجل حركة مبيعات المعارض (نصف شهرية)</h1>
                <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">Traffic Department Sales Ledger</p>
              </div>

              <div className="text-right space-y-1 text-[11px] font-black">
                <p>رقم الصفحة: ١ / ١</p>
                <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                <p>الموافق: ..... / ..... / ١٤٤٧ هـ</p>
              </div>
            </div>

            {/* Showroom Info Bar */}
            <div className="grid grid-cols-3 gap-10 mb-6 bg-slate-50 border-y-2 border-slate-900 p-3">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black">اسم المعرض:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-slate-400 outline-none font-black text-blue-600 text-[13px]" value={headerInfo.showroomName} onChange={e => setHeaderInfo({...headerInfo, showroomName: e.target.value})} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black">من تاريخ:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-slate-400 outline-none font-black text-center" value={headerInfo.fromDate} onChange={e => setHeaderInfo({...headerInfo, fromDate: e.target.value})} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black">إلى تاريخ:</span>
                <input type="text" className="flex-1 bg-transparent border-b border-slate-400 outline-none font-black text-center" value={headerInfo.toDate} onChange={e => setHeaderInfo({...headerInfo, toDate: e.target.value})} />
              </div>
            </div>

            {/* The Main Data Table */}
            <div className="flex-1 overflow-hidden border-2 border-slate-900">
               <table className="w-full h-full border-collapse text-[9.5px] font-black text-center">
                  <thead className="bg-slate-100 border-b-2 border-slate-900">
                    <tr className="h-10">
                      <th className="border-l border-slate-900 p-1 w-8">م</th>
                      <th className="border-l border-slate-900 p-1 w-20">رقم المبايعة</th>
                      <th className="border-l border-slate-900 p-1 w-20">تاريخها</th>
                      <th className="border-l border-slate-900 p-1">نوع السيارة</th>
                      <th className="border-l border-slate-900 p-1 w-16">اللون</th>
                      <th className="border-l border-slate-900 p-1 w-16">الموديل</th>
                      <th className="border-l border-slate-900 p-1 w-36">رقم القاعدة (VIN)</th>
                      <th className="border-l border-slate-900 p-1 w-20">رقم اللوحة</th>
                      <th className="border-l border-slate-900 p-1">اسم البائع</th>
                      <th className="border-l border-slate-900 p-1">اسم المشتري</th>
                      <th className="p-1 w-24">رقم المشتري</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-900 h-8 group even:bg-slate-50/50">
                        <td className="border-l border-slate-900 bg-slate-100 font-black">{row.id}</td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.saleNumber} onChange={e => updateRow(row.id, 'saleNumber', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.saleDate} onChange={e => updateRow(row.id, 'saleDate', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.vehicleType} onChange={e => updateRow(row.id, 'vehicleType', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.color} onChange={e => updateRow(row.id, 'color', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.model} onChange={e => updateRow(row.id, 'model', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent font-mono text-[10px]" value={row.chassisNumber} onChange={e => updateRow(row.id, 'chassisNumber', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent font-black text-[11px] text-blue-700" value={row.plateNumber} onChange={e => updateRow(row.id, 'plateNumber', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.sellerName} onChange={e => updateRow(row.id, 'sellerName', e.target.value)} /></td>
                        <td className="border-l border-slate-900"><input className="w-full h-full p-1 text-center outline-none bg-transparent font-bold" value={row.buyerName} onChange={e => updateRow(row.id, 'buyerName', e.target.value)} /></td>
                        <td><input className="w-full h-full p-1 text-center outline-none bg-transparent" value={row.buyerPhone} onChange={e => updateRow(row.id, 'buyerPhone', e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {/* Signatures Area */}
            <div className="mt-6 flex justify-between items-end px-4">
               <div className="text-center space-y-8">
                  <p className="text-[13px] font-black">ختم وتوقيع مالك المعرض</p>
                  <div className="w-24 h-24 border-4 border-dashed border-slate-200 rounded-full flex items-center justify-center text-[9px] text-slate-300 font-black">الختم الرسمي</div>
               </div>
               
               <div className="text-center max-w-md pb-4">
                  <p className="text-[11px] font-black leading-relaxed text-slate-500">نقر نحن إدارة المعرض بصحة جميع البيانات المدونة أعلاه تحت طائلة المسؤولية القانونية الكاملة، ونتعهد بتبليغ الإدارة العامة للمرور عن أي عملية بيع فور حدوثها.</p>
               </div>

               <div className="text-center space-y-12">
                  <p className="text-[13px] font-black">مصادقة شعبة التحري والبحث الجنائي</p>
                  <div className="w-64 h-0.5 bg-slate-900"></div>
               </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[8px] font-black text-slate-400">
               <span>نظام الأرشفة الذكي الموحد - إصدار دفاتر المعارض v4.3</span>
               <span className="uppercase tracking-[0.3em]">Official Smart Archive Record</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #print-area {
            border: none !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          input { border: none !important; background: transparent !important; }
        }
      `}</style>
    </div>
  );
};

export default WrittenArchive;
