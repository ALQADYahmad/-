
import React, { useState, useMemo, useRef } from 'react';
import { VehicleRecord, FinancialRecord } from '../types';

declare var html2canvas: any;

const YemenLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

interface Props {
  records: VehicleRecord[];
  currency: string;
  financeItems: FinancialRecord[];
  onAddFinance: (item: FinancialRecord) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const FinancialManagement: React.FC<Props> = ({ records, currency, financeItems, onAddFinance, onNotify }) => {
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const pendingTransactions = useMemo(() => {
    return records.filter(r => r.feesPaid && !financeItems.some(f => f.transactionId === r.id));
  }, [records, financeItems]);

  const stats = useMemo(() => {
    const totalReceived = financeItems.reduce((s, i) => s + i.receivedAmount, 0);
    const totalExpenses = financeItems.reduce((s, i) => s + (i.committeeExpenses + i.personalExpenses + i.officialFees + i.otherExpenses), 0);
    const totalRemaining = totalReceived - totalExpenses;
    return { totalReceived, totalExpenses, totalRemaining };
  }, [financeItems]);

  const handleStartSettlement = (tr?: VehicleRecord) => {
    const newEntry: FinancialRecord = {
      id: `FIN-${Date.now()}`,
      transactionId: tr?.id,
      ownerName: tr?.ownerName || '',
      vehicleInfo: tr ? `${tr.vehicleName} ${tr.vehicleModel}` : '',
      receivedAmount: tr?.totalAmount || 0,
      committeeExpenses: 0,
      personalExpenses: 0,
      officialFees: 0,
      otherExpenses: 0,
      remainingAmount: tr?.totalAmount || 0,
      note: '',
      date: new Date().toISOString(),
      isManual: !tr
    };
    setSelectedRecord(newEntry);
    setIsModalOpen(true);
  };

  const updateExpenses = (field: keyof FinancialRecord, val: any) => {
    if (!selectedRecord) return;
    const updated = { ...selectedRecord, [field]: val };
    const totalExp = Number(updated.committeeExpenses) + Number(updated.personalExpenses) + Number(updated.officialFees) + Number(updated.otherExpenses);
    updated.remainingAmount = Number(updated.receivedAmount) - totalExp;
    setSelectedRecord(updated);
  };

  const saveFinanceRecord = () => {
    if (selectedRecord) {
      onAddFinance(selectedRecord);
      setIsModalOpen(false);
      setSelectedRecord(null);
      onNotify?.("تم حفظ القيد المالي بنجاح", "success");
    }
  };

  const exportPrint = async () => {
     if (!printRef.current) return;
     const canvas = await html2canvas(printRef.current, { scale: 3 });
     const link = document.createElement('a');
     link.download = `Settlement_${Date.now()}.png`;
     link.href = canvas.toDataURL();
     link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 font-['Cairo'] text-right" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <StatCard title="إجمالي المقبوضات" value={stats.totalReceived} sub="من كافة المعاملات" color="emerald" icon="📥" currency={currency} />
         <StatCard title="إجمالي المصروفات" value={stats.totalExpenses} sub="صرفيات ورسوم" color="rose" icon="📤" currency={currency} />
         <StatCard title="صافي المتبقي" value={stats.totalRemaining} sub="المبلغ الفعلي المتاح" color="blue" icon="💎" currency={currency} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
           <button onClick={() => handleStartSettlement()} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-6 rounded-[2rem] font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between">
              <span>إضافة قيد مالي يدوي</span>
              <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center">✍️</span>
           </button>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black dark:text-white mb-1">المقبوضات المعلقة</h3>
              <div className="space-y-3 mt-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                 {pendingTransactions.map(tr => (
                   <div key={tr.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all">
                      <div className="flex justify-between items-start mb-2 text-[10px] font-black">
                         <span className="text-blue-600">{tr.plateNumber}</span>
                         <span className="text-emerald-600">{tr.totalAmount.toLocaleString()} {currency}</span>
                      </div>
                      <h4 className="text-xs font-black dark:text-white truncate">{tr.ownerName}</h4>
                      <button onClick={() => handleStartSettlement(tr)} className="w-full mt-4 py-2 bg-blue-600/10 text-blue-600 rounded-xl text-[10px] font-black">تسوية المعاملة 🤖</button>
                   </div>
                 ))}
                 {pendingTransactions.length === 0 && <p className="text-center text-xs opacity-20 py-10 font-black">لا توجد مقبوضات جديدة</p>}
              </div>
           </div>
        </div>

        <div className="xl:col-span-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                 <h3 className="text-xl font-black dark:text-white">سجل القيود المالية</h3>
                 <button onClick={exportPrint} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">📸</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="p-6">المصدر</th>
                          <th className="p-6">البيان / المالك</th>
                          <th className="p-6">المقبوض</th>
                          <th className="p-6">صافي الباقي</th>
                          <th className="p-6 text-center">الإجراء</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                       {financeItems.map(item => (
                         <tr key={item.id} className="text-xs font-bold dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-6">
                               {item.isManual ? <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-[9px] font-black">يدوي ✍️</span> : <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg text-[9px] font-black">تلقائي 🤖</span>}
                            </td>
                            <td className="p-6">
                               <p className="font-black dark:text-white">{item.ownerName}</p>
                               <p className="text-[9px] opacity-40">{item.vehicleInfo}</p>
                            </td>
                            <td className="p-6 font-black text-emerald-600">{item.receivedAmount.toLocaleString()}</td>
                            <td className="p-6 font-black text-blue-600">{item.remainingAmount.toLocaleString()}</td>
                            <td className="p-6 text-center">
                               <button onClick={() => { setSelectedRecord(item); setIsModalOpen(true); }} className="text-slate-400 hover:text-blue-600 transition-colors">📑</button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5 animate-in zoom-in-95">
              <header className="p-10 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                 <h3 className="text-2xl font-black dark:text-white">إجراء تسوية ({selectedRecord.isManual ? 'يدوي' : 'تلقائي'})</h3>
                 <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">✕</button>
              </header>
              <div className="flex-1 p-10 lg:p-14 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <FinanceInput label="المالك / الجهة" value={selectedRecord.ownerName} onChange={(v:any) => updateExpenses('ownerName', v)} icon="👤" type="text" disabled={!selectedRecord.isManual} />
                       <FinanceInput label="المبلغ المقبوض الكلي" value={selectedRecord.receivedAmount} onChange={(v:any) => updateExpenses('receivedAmount', v)} icon="💰" disabled={!selectedRecord.isManual} />
                    </div>
                    <div className="space-y-4">
                       <FinanceInput label="صرفيات اللجنة" value={selectedRecord.committeeExpenses} onChange={(v:any) => updateExpenses('committeeExpenses', v)} icon="🚩" />
                       <FinanceInput label="صرفيات شخصية" value={selectedRecord.personalExpenses} onChange={(v:any) => updateExpenses('personalExpenses', v)} icon="👤" />
                       <FinanceInput label="الرسوم الرسمية" value={selectedRecord.officialFees} onChange={(v:any) => updateExpenses('officialFees', v)} icon="🏛️" />
                       <FinanceInput label="مصاريف إضافية" value={selectedRecord.otherExpenses} onChange={(v:any) => updateExpenses('otherExpenses', v)} icon="➕" />
                       <div className="bg-slate-900 p-6 rounded-3xl text-center text-white mt-4">
                          <p className="text-[10px] opacity-40 uppercase mb-1">الصافي المتبقي</p>
                          <h2 className="text-3xl font-black">{selectedRecord.remainingAmount.toLocaleString()} {currency}</h2>
                       </div>
                    </div>
                 </div>
                 <div className="mt-10 flex gap-4">
                    <button onClick={saveFinanceRecord} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl">حفظ القيد المالي</button>
                    <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black">إلغاء</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      {/* Print View Hidden */}
      <div className="fixed left-[-9999px] top-0"><div ref={printRef} style={{ width: '210mm', height: '297mm' }}>{/* نفس التصميم السابق للسند */}</div></div>
    </div>
  );
};

const StatCard = ({ title, value, sub, color, icon, currency }: any) => {
  const colors: any = { emerald: 'bg-emerald-600', rose: 'bg-rose-600', blue: 'bg-blue-600' };
  return (
    <div className={`${colors[color]} p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group`}>
       <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{title}</p>
          <span className="text-2xl">{icon}</span>
       </div>
       <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black">{value.toLocaleString()}</h2>
          <span className="text-xs font-black opacity-40">{currency}</span>
       </div>
       <p className="text-[9px] font-bold opacity-30 mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
};

const FinanceInput = ({ label, value, onChange, icon, type = 'number', disabled = false }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-slate-400 uppercase pr-2">{label}</label>
     <div className="relative">
        <input type={type} disabled={disabled} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-black text-slate-800 dark:text-white" value={value} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30">{icon}</span>
     </div>
  </div>
);

export default FinancialManagement;
