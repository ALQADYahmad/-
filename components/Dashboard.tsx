
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VehicleRecord, TransactionStatus, Committee, OfficialFormRecord, PlateType } from '../types';
import { STATUS_CONFIG } from '../constants';

interface DashboardProps {
  records: VehicleRecord[];
  committees: Committee[];
  officialRecords: OfficialFormRecord[];
  onQuickLink: (tab: string) => void;
  onStartWizard: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, committees, officialRecords, onQuickLink, onStartWizard }) => {
  const [showLatest, setShowLatest] = useState(true);

  const stats = useMemo(() => {
    const total = records.length;
    const revenue = records.reduce((sum, r) => sum + (r.feesPaid ? r.totalAmount : (r.totalAmount - r.debtAmount)), 0);
    const pendingFinance = records.reduce((sum, r) => sum + r.debtAmount + (!r.feesPaid && !r.hasDebt ? r.totalAmount : 0), 0);
    const inProcess = records.filter(r => r.status !== TransactionStatus.COMPLETED).length;
    return { total, revenue, pendingFinance, inProcess };
  }, [records]);

  const statusData = useMemo(() => {
    const counts = records.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(STATUS_CONFIG).map(([key, value]) => ({
      name: (value as { label: string }).label,
      value: counts[key] || 0
    }));
  }, [records]);

  // أحدث 3 سجلات من الأرشفة الموحدة
  const latestOfficial = useMemo(() => officialRecords.slice(0, 3), [officialRecords]);

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* قسم الترحيب والرصد السريع - الواجهة الأولى */}
      <div className="bg-slate-900 dark:bg-blue-600 p-8 lg:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="relative z-10">
            <h1 className="text-3xl lg:text-5xl font-black mb-3 text-right">مرحباً بك في نظام الأرشفة</h1>
            <p className="text-blue-300 dark:text-blue-100 font-bold text-sm lg:text-lg text-right">يمكنك البدء فوراً برصد نموذج ميداني جديد أو مراجعة الأرشيف الموحد</p>
         </div>
         <button 
           onClick={onStartWizard}
           className="relative z-10 bg-white text-slate-900 px-10 py-5 lg:px-14 lg:py-7 rounded-[2.5rem] font-black text-lg lg:text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
         >
           <span className="bg-blue-600 text-white w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-2xl">＋</span>
           <span>رصد ميداني جديد</span>
         </button>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      {/* عرض أحدث سجلات الأرشفة الموحدة مباشرة في البداية مع خاصية الإخفاء */}
      <section className="space-y-6 transition-all duration-500 overflow-hidden">
        <div className="flex justify-between items-end px-4">
           <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white">الأرشفة الموحدة (أحدث الرصد)</h3>
                <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">المستندات الميدانية التي تم رصدها مؤخراً</p>
              </div>
              <button 
                onClick={() => setShowLatest(!showLatest)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showLatest ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}
                title={showLatest ? "إخفاء القسم" : "إظهار القسم"}
              >
                {showLatest ? '👁️' : '👁️‍🗨️'}
              </button>
           </div>
           {showLatest && (
             <button onClick={() => onQuickLink('official_archive')} className="text-blue-600 font-black text-xs lg:text-sm underline underline-offset-8">عرض الأرشيف الكامل ➔</button>
           )}
        </div>
        
        {showLatest ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
             {latestOfficial.map(rec => (
               <div key={rec.id} onClick={() => onQuickLink('official_archive')} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${rec.plateType === PlateType.PRIVATE ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
                     {rec.plateType === PlateType.PRIVATE ? '🚘' : '🚚'}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="font-black text-slate-900 dark:text-white truncate">{rec.owner.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1">{rec.vehicle.brand} • <span className="text-blue-500">{rec.vehicle.plateNumber}</span></p>
                  </div>
               </div>
             ))}
             {latestOfficial.length === 0 && (
               <div className="col-span-3 py-10 text-center border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem]">
                  <p className="text-slate-300 font-black text-sm uppercase tracking-widest">لا توجد سجلات مؤرشفة حالياً</p>
               </div>
             )}
          </div>
        ) : (
          <div className="px-4">
             <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full w-24 opacity-50"></div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard title="إجمالي المعاملات" value={stats.total} icon="📊" color="blue" onClick={() => onQuickLink('records')} />
        <KpiCard title="الإيرادات المحصلة" value={`${stats.revenue.toLocaleString()} ر.س`} icon="💰" color="emerald" onClick={() => onQuickLink('records')} />
        <KpiCard title="مستحقات مديونية" value={`${stats.pendingFinance.toLocaleString()} ر.س`} icon="⏳" color="rose" onClick={() => onQuickLink('records')} />
        <KpiCard title="قيد الإجراء" value={stats.inProcess} icon="⚙️" color="indigo" onClick={() => onQuickLink('records')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 min-h-[450px] flex flex-col transition-colors">
          <div className="mb-8 flex justify-between items-center">
            <div className="text-right">
              <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">تحليل مراحل العمل</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">توزيع الحالة اللحظية للطلبات</p>
            </div>
            <button onClick={() => onQuickLink('records')} className="text-blue-600 dark:text-blue-400 text-[10px] font-black underline underline-offset-4">عرض كافة السجلات</button>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" aspect={2}>
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', opacity: 0.1}} 
                  contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', textAlign: 'right'}}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={45} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
          <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white mb-8 text-right">نشاط اللجان الميدانية</h3>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {committees.map((c, i) => {
               const count = records.filter(r => r.committeeId === c.id).length;
               const percentage = (count / (stats.total || 1)) * 100;
               return (
                <div key={i} className="space-y-2 group cursor-pointer" onClick={() => onQuickLink('records')}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{c.name}</span>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">{count} معاملة</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, onClick }: any) => {
  const bgColors: any = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    indigo: 'bg-indigo-600'
  };
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 lg:gap-6 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group active:scale-95"
    >
      <div className={`w-12 h-12 lg:w-14 lg:h-14 ${bgColors[color]} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
        <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
