
import React, { useState, useMemo, useRef } from 'react';
import { VehicleRecord, Committee, OfficialFormRecord, CustomsArchiveRecord, FinancialRecord, PlateType } from '../types';
import { STATUS_CONFIG } from '../constants';

declare var html2canvas: any;

const YemenLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

interface AdminReportsProps {
  records: VehicleRecord[];
  officialRecords: OfficialFormRecord[];
  customsRecords: CustomsArchiveRecord[];
  financeItems: FinancialRecord[];
  committees: Committee[];
  currency: string;
  onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

type ReportCategory = 'TRANSACTIONS' | 'OFFICIAL' | 'CUSTOMS' | 'FINANCIAL';
type ReportPeriod = 'DAILY' | 'BIWEEKLY' | 'MONTHLY';

const AdminReports: React.FC<AdminReportsProps> = ({ records, officialRecords, customsRecords, financeItems, committees, currency, onNotify }) => {
  const [category, setCategory] = useState<ReportCategory>('TRANSACTIONS');
  const [period, setPeriod] = useState<ReportPeriod>('DAILY');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const filterByPeriod = (itemDate: string) => {
    const now = new Date();
    const time = new Date(itemDate).getTime();
    if (period === 'DAILY') return time >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (period === 'BIWEEKLY') return time >= now.getTime() - (14 * 24 * 60 * 60 * 1000);
    return time >= now.getTime() - (30 * 24 * 60 * 60 * 1000);
  };

  const transactionStats = useMemo(() => {
    const filtered = records.filter(r => filterByPeriod(r.registrationDate));
    const collected = filtered.reduce((sum, r) => sum + (r.feesPaid ? r.totalAmount : (r.totalAmount - r.debtAmount)), 0);
    const debt = filtered.reduce((sum, r) => sum + r.debtAmount, 0);
    return { total: filtered.length, collected, debt, items: filtered };
  }, [records, period]);

  const financeStats = useMemo(() => {
    const filtered = financeItems.filter(f => filterByPeriod(f.date));
    const totalReceived = filtered.reduce((sum, i) => sum + i.receivedAmount, 0);
    const totalExpenses = filtered.reduce((sum, i) => sum + (i.committeeExpenses + i.personalExpenses + i.officialFees + i.otherExpenses), 0);
    const totalRemaining = totalReceived - totalExpenses;
    return { total: filtered.length, totalReceived, totalExpenses, totalRemaining, items: filtered };
  }, [financeItems, period]);

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(reportRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `Admin_Report_${category}_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      onNotify?.("تم تصدير التقرير بنجاح", "success");
    } catch (err) { onNotify?.("فشل التصدير", "error"); }
    finally { setIsExporting(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-['Cairo'] pb-24 text-right" dir="rtl">
      
      {isExporting && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[500] flex flex-col items-center justify-center text-white">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
           <h3 className="text-xl font-black">جاري إنشاء التقرير الرسمي...</h3>
        </div>
      )}

      {/* Control Center */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 print:hidden">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <h2 className="text-3xl font-black dark:text-white">مركز التقارير المعلوماتية</h2>
          <div className="flex gap-4">
            <button onClick={handleExportImage} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl transition-all">حفظ كصورة 📸</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl transition-all">طباعة PDF 🖨️</button>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl gap-2">
           <CategoryBtn active={category === 'TRANSACTIONS'} onClick={() => setCategory('TRANSACTIONS')} label="المعاملات" icon="📂" />
           <CategoryBtn active={category === 'FINANCIAL'} onClick={() => setCategory('FINANCIAL')} label="التقرير المالي" icon="💰" />
           <CategoryBtn active={category === 'OFFICIAL'} onClick={() => setCategory('OFFICIAL')} label="الأرشفة الميدانية" icon="📜" />
           <CategoryBtn active={category === 'CUSTOMS'} onClick={() => setCategory('CUSTOMS')} label="الجمارك" icon="📦" />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t dark:border-slate-800">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">النطاق الزمني:</span>
           <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl gap-1">
              <PeriodBtn active={period === 'DAILY'} onClick={() => setPeriod('DAILY')} label="يومي" />
              <PeriodBtn active={period === 'BIWEEKLY'} onClick={() => setPeriod('BIWEEKLY')} label="14 يوم" />
              <PeriodBtn active={period === 'MONTHLY'} onClick={() => setPeriod('MONTHLY')} label="شهري" />
           </div>
        </div>
      </div>

      {/* A4 Document */}
      <div className="flex justify-center items-start overflow-x-auto custom-scrollbar pb-20 print:overflow-visible">
        <div ref={reportRef} id="report-area" className="bg-white text-slate-900 relative shadow-2xl print:shadow-none flex flex-col p-[15mm] border-[1px] border-slate-200" style={{ width: '210mm', height: '297mm', minWidth: '210mm' }}>
          <div className="absolute inset-[8mm] border-[4px] border-slate-900 pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0"><YemenLogo className="w-[120mm]" /></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 border-b-2 border-slate-900 pb-8">
               <div className="text-right space-y-1">
                  <h3 className="text-[14px] font-black">الجمهورية اليمنية</h3>
                  <h3 className="text-[14px] font-black">وزارة الداخلية</h3>
                  <p className="text-[11px] font-bold text-blue-700">الإدارة العامة للمرور</p>
               </div>
               <div className="text-center">
                  <YemenLogo className="w-16 h-16 mx-auto mb-2" />
                  <h2 className="text-[20px] font-black underline underline-offset-8 decoration-4">تقرير {category === 'FINANCIAL' ? 'الخزينة والمالية' : 'النشاط العام'}</h2>
               </div>
               <div className="text-left text-[11px] font-black space-y-1">
                  <p>تاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                  <p>الرقم: REP-{Math.floor(Math.random() * 9999)}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
               {category === 'FINANCIAL' ? (
                 <>
                   <StatBox label="إجمالي المقبوضات" value={`${financeStats.totalReceived.toLocaleString()} ${currency}`} sub="إيرادات الفترة" />
                   <StatBox label="إجمالي المنصرفات" value={`${financeStats.totalExpenses.toLocaleString()} ${currency}`} sub="صرفيات إدارية" />
                   <StatBox label="الصافي المورد" value={`${financeStats.totalRemaining.toLocaleString()} ${currency}`} sub="صافي الخزينة" />
                 </>
               ) : (
                 <>
                   <StatBox label="إجمالي الحالات" value={transactionStats.total} sub="معاملة مسجلة" />
                   <StatBox label="الإيراد المحصل" value={`${transactionStats.collected.toLocaleString()} ${currency}`} sub="تم تحصيلها" />
                   <StatBox label="المديونية" value={`${transactionStats.debt.toLocaleString()} ${currency}`} sub="قيد المراجعة" />
                 </>
               )}
            </div>

            <div className="flex-1 overflow-hidden border-2 border-slate-900 rounded-2xl bg-white mb-10">
               <table className="w-full text-right text-[10px] font-black border-collapse">
                  <thead className="bg-slate-900 text-white">
                     <tr>
                        {category === 'FINANCIAL' ? (
                          <>
                            <th className="p-4 border-l border-white/20">اسم المالك / الجهة</th>
                            <th className="p-4 border-l border-white/20">المقبوض</th>
                            <th className="p-4 border-l border-white/20">المصاريف</th>
                            <th className="p-4">الصافي</th>
                          </>
                        ) : (
                          <>
                            <th className="p-4 border-l border-white/20">اسم المالك</th>
                            <th className="p-4 border-l border-white/20">الرقم المرجعي</th>
                            <th className="p-4 border-l border-white/20">الحالة</th>
                            <th className="p-4 border-l border-white/20">المديونية</th>
                            <th className="p-4">القيمة الكلية</th>
                          </>
                        )}
                     </tr>
                  </thead>
                  <tbody>
                     {category === 'FINANCIAL' ? financeStats.items.slice(0, 22).map(item => (
                        <tr key={item.id} className="border-b border-slate-200 h-10 even:bg-slate-50">
                           <td className="px-4 font-bold">{item.ownerName}</td>
                           <td className="px-4 font-black text-emerald-600">{item.receivedAmount.toLocaleString()}</td>
                           <td className="px-4 font-black text-rose-500">{(item.committeeExpenses + item.personalExpenses + item.officialFees + item.otherExpenses).toLocaleString()}</td>
                           <td className="px-4 font-black text-blue-700">{item.remainingAmount.toLocaleString()}</td>
                        </tr>
                     )) : transactionStats.items.slice(0, 22).map(r => (
                        <tr key={r.id} className="border-b border-slate-200 h-10 even:bg-slate-50">
                           <td className="px-4 font-bold">{r.ownerName}</td>
                           <td className="px-4 font-black text-blue-600">{r.plateNumber}</td>
                           <td className="px-4 font-bold">{STATUS_CONFIG[r.status].label}</td>
                           <td className={`px-4 font-black ${r.debtAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                             {r.debtAmount > 0 ? r.debtAmount.toLocaleString() : '-'}
                           </td>
                           <td className="px-4 font-black">{r.totalAmount.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="mt-auto pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-20">
               <div className="text-center space-y-12">
                  <p className="text-[14px] font-black">مراجعة وتدقيق الإدارة المالية</p>
                  <div className="w-48 h-0.5 bg-slate-400 mx-auto"></div>
               </div>
               <div className="text-center space-y-4">
                  <p className="text-[14px] font-black">يعتمد / المدير العام</p>
                  <div className="w-20 h-20 border-4 border-dashed border-slate-200 rounded-full flex items-center justify-center mx-auto text-[8px] text-slate-300 font-black">الختم الرسمي</div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@page { size: A4 portrait; margin: 0; } @media print { .print\\:hidden { display: none !important; } }`}</style>
    </div>
  );
};

const CategoryBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black transition-all ${active ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl' : 'text-slate-500'}`}>
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const PeriodBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
    {label}
  </button>
);

const StatBox = ({ label, value, sub }: any) => (
  <div className="border-2 border-slate-900 p-6 rounded-3xl text-center space-y-1 bg-slate-50">
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
     <p className="text-xl font-black text-slate-900">{value}</p>
     <p className="text-[9px] font-bold text-blue-600 opacity-60 uppercase">{sub}</p>
  </div>
);

export default AdminReports;
