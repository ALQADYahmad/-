
import React, { useMemo } from 'react';
import { VehicleRecord, OfficialFormRecord, CustomsArchiveRecord } from '../types';

interface UniversalSearchProps {
  query: string;
  records: VehicleRecord[];
  officialRecords: OfficialFormRecord[];
  customsRecords: CustomsArchiveRecord[];
  onResultClick: (tab: string, recordId: string) => void;
  onClose: () => void;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({ query, records, officialRecords, customsRecords, onResultClick, onClose }) => {
  const q = query.toLowerCase();

  const results = useMemo(() => {
    if (!q) return { transactions: [], official: [], customs: [] };

    return {
      transactions: records.filter(r => 
        r.ownerName.toLowerCase().includes(q) || 
        r.plateNumber.includes(q) || 
        r.sequenceNumber.toLowerCase().includes(q)
      ).slice(0, 5),
      
      official: officialRecords.filter(r => 
        r.owner.name.toLowerCase().includes(q) || 
        r.vehicle.plateNumber.includes(q) || 
        r.vehicle.chassisNumber.toLowerCase().includes(q) ||
        r.owner.idNumber.includes(q)
      ).slice(0, 5),

      customs: customsRecords.filter(r => 
        r.data.ownerName.toLowerCase().includes(q) || 
        r.data.importerName.toLowerCase().includes(q) || 
        r.data.statementNumber.toLowerCase().includes(q) ||
        r.data.plateNumber.includes(q) ||
        r.data.chassisNumber.toLowerCase().includes(q) ||
        r.data.fullText.toLowerCase().includes(q)
      ).slice(0, 5)
    };
  }, [q, records, officialRecords, customsRecords]);

  const totalCount = results.transactions.length + results.official.length + results.customs.length;

  if (!query) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl p-6 lg:p-12 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="flex justify-between items-center border-b dark:border-slate-800 pb-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">نتائج البحث الشامل</h2>
              <p className="text-sm font-bold text-blue-500 mt-1 uppercase tracking-widest">البحث عن: "{query}" • تم العثور على {totalCount} نتيجة</p>
           </div>
           <button onClick={onClose} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-xl">✕</button>
        </div>

        {totalCount === 0 && (
          <div className="py-20 text-center">
             <span className="text-6xl block mb-6">🔍</span>
             <h3 className="text-xl font-black text-slate-400">لا توجد نتائج مطابقة في كافة أقسام البرنامج</h3>
          </div>
        )}

        {/* نتائج أرشيف المعاملات */}
        {results.transactions.length > 0 && (
          <section className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 flex items-center gap-3">
               <span>📂 أرشيف المعاملات المالية</span>
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.transactions.map(r => (
                  <ResultCard 
                    key={r.id}
                    title={r.ownerName}
                    sub={`${r.vehicleName} ${r.vehicleModel}`}
                    tag={r.plateNumber}
                    type="معاملة مالية"
                    color="blue"
                    onClick={() => onResultClick('records', r.id)}
                  />
                ))}
             </div>
          </section>
        )}

        {/* نتائج الأرشفة الموحدة */}
        {results.official.length > 0 && (
          <section className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 flex items-center gap-3">
               <span>📜 الأرشفة الموحدة (الميدانية)</span>
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.official.map(r => (
                  <ResultCard 
                    key={r.id}
                    title={r.owner.name}
                    sub={`شاصيه: ${r.vehicle.chassisNumber}`}
                    tag={r.vehicle.plateNumber}
                    type="أرشفة ميدانية"
                    color="indigo"
                    onClick={() => onResultClick('official_archive', r.id)}
                  />
                ))}
             </div>
          </section>
        )}

        {/* نتائج البيانات الجمركية */}
        {results.customs.length > 0 && (
          <section className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 flex items-center gap-3">
               <span>📦 البيانات الجمركية الذكية</span>
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.customs.map(r => (
                  <ResultCard 
                    key={r.id}
                    title={r.data.ownerName || r.data.importerName}
                    sub={`بيان رقم: ${r.data.statementNumber}`}
                    tag={r.data.plateNumber || 'بدون لوحة'}
                    type="بيان جمركي"
                    color="emerald"
                    onClick={() => onResultClick('customs_archive', r.id)}
                  />
                ))}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

const ResultCard = ({ title, sub, tag, type, color, onClick }: any) => {
  const colors: any = {
    blue: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600',
    indigo: 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex items-center justify-between dark:bg-slate-900/40 ${colors[color]}`}
    >
       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border dark:border-slate-700">{type}</span>
          </div>
          <h5 className="text-lg font-black dark:text-white truncate">{title}</h5>
          <p className="text-xs font-bold text-slate-400 truncate mt-1">{sub}</p>
       </div>
       <div className="bg-white dark:bg-slate-800 px-5 py-2 rounded-xl border-2 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
          <span className="text-lg font-black text-slate-900 dark:text-white">{tag}</span>
       </div>
    </div>
  );
};

export default UniversalSearch;
