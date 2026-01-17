
import React, { useState, useMemo } from 'react';
import { Plate, PlateType, PlateStatus, Committee } from '../types';
import { PLATE_TYPE_CONFIG } from '../constants';

interface PlateInventoryProps {
  plates: Plate[];
  onAddPlates: (newPlates: Plate[]) => void;
  onAssignPlates: (plateIds: string[], committeeId: string) => void;
  committees: Committee[];
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// Implement missing helper components
const TabBtn = ({ active, onClick, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${active ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
  >
    {label}
  </button>
);

const InputCol = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase pr-2">{label}</label>
    <input
      type={type}
      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-bold text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const SelectCol = ({ label, value, onChange, options }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase pr-2">{label}</label>
    <select
      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-bold text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {Object.entries(options).map(([key, val]) => (
        <option key={key} value={key}>{val as string}</option>
      ))}
    </select>
  </div>
);

const PlateInventory: React.FC<PlateInventoryProps> = ({ plates, onAddPlates, onAssignPlates, committees, onNotify }) => {
  const [entryMode, setEntryMode] = useState<'bulk' | 'manual' | 'assign' | 'manual_select'>('bulk');
  const [filterStatus, setFilterStatus] = useState<PlateStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<PlateType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkData, setBulkData] = useState({ start: '', end: '', type: PlateType.PRIVATE });
  const [manualData, setManualData] = useState({ number: '', type: PlateType.PRIVATE });
  const [assignData, setAssignData] = useState({ committeeId: '', count: 10, type: PlateType.PRIVATE });
  const [selectedPlateIds, setSelectedPlateIds] = useState<string[]>([]);
  const [manualCommitteeId, setManualCommitteeId] = useState('');

  const filteredPlates = useMemo(() => {
    return plates.filter(p => {
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
      const matchType = filterType === 'ALL' || p.type === filterType;
      const matchSearch = p.number.includes(searchQuery);
      return matchStatus && matchType && matchSearch;
    });
  }, [plates, filterStatus, filterType, searchQuery]);

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = parseInt(bulkData.start);
    const endNum = parseInt(bulkData.end);
    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
        onNotify("خطأ في النطاق الرقمي للوحات", "error");
        return;
    }

    const newPlates: Plate[] = [];
    const duplicates: string[] = [];

    for (let i = startNum; i <= endNum; i++) {
      const numStr = i.toString();
      if (plates.some(p => p.number === numStr)) {
        duplicates.push(numStr);
        continue;
      }
      newPlates.push({ id: `PLT-${Date.now()}-${i}`, number: numStr, type: bulkData.type, status: PlateStatus.UNASSIGNED });
    }

    if (newPlates.length > 0) {
      onAddPlates(newPlates);
      if (duplicates.length > 0) {
          onNotify(`تم إضافة ${newPlates.length} لوحة بنجاح. تم تخطي ${duplicates.length} رقم مكرر.`, "warning");
      } else {
          onNotify(`تمت إضافة النطاق التسلسلي بنجاح (${newPlates.length} لوحة)`, "success");
      }
    } else {
      onNotify("كافة الأرقام المدخلة موجودة مسبقاً في النظام!", "error");
    }
    setBulkData({ ...bulkData, start: '', end: '' });
  };

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.committeeId) {
        onNotify("يرجى اختيار لجنة قبل توزيع العهدة", "warning");
        return;
    }
    const available = plates.filter(p => p.status === PlateStatus.UNASSIGNED && p.type === assignData.type);
    if (available.length < assignData.count) {
        onNotify(`الكمية المتوفرة من هذا النوع غير كافية (${available.length} فقط)`, "error");
        return;
    }
    const toAssign = available.slice(0, assignData.count).map(p => p.id);
    onAssignPlates(toAssign, assignData.committeeId);
    onNotify(`تم توزيع ${toAssign.length} لوحة بنجاح على اللجنة المختارة`, "success");
  };

  const handleManualAssignSubmit = () => {
    if (!manualCommitteeId) {
        onNotify("يرجى تحديد اللجنة المستلمة للوحات", "warning");
        return;
    }
    if (selectedPlateIds.length === 0) {
        onNotify("لم يتم اختيار أي لوحة للتوزيع", "warning");
        return;
    }
    onAssignPlates(selectedPlateIds, manualCommitteeId);
    onNotify(`تم توزيع ${selectedPlateIds.length} لوحة مختارة يدوياً بنجاح`, "success");
    setSelectedPlateIds([]);
    setEntryMode('bulk');
  };

  const togglePlateSelection = (id: string) => {
    const plate = plates.find(p => p.id === id);
    if (plate?.status !== PlateStatus.UNASSIGNED) {
        onNotify("هذه اللوحة موزعة بالفعل ولا يمكن اختيارها", "warning");
        return;
    }
    setSelectedPlateIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">إدارة الأرقام والعهد</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">التحكم المركزي وتزويد اللجان باللوحات</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar gap-1">
            <TabBtn active={entryMode === 'bulk'} onClick={() => setEntryMode('bulk')} label="إضافة تسلسلي" />
            <TabBtn active={entryMode === 'manual'} onClick={() => setEntryMode('manual')} label="إضافة يدوي" />
            <TabBtn active={entryMode === 'assign'} onClick={() => setEntryMode('assign')} label="توزيع تلقائي" />
            <TabBtn active={entryMode === 'manual_select'} onClick={() => setEntryMode('manual_select')} label="توزيع باختيار يدوي" />
          </div>
        </div>
        
        {entryMode === 'bulk' && (
          <form onSubmit={handleBulkAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top-2">
            <InputCol label="من رقم" value={bulkData.start} onChange={(v:string) => setBulkData({...bulkData, start: v})} type="number" />
            <InputCol label="إلى رقم" value={bulkData.end} onChange={(v:string) => setBulkData({...bulkData, end: v})} type="number" />
            <SelectCol label="نوع اللوحة" value={bulkData.type} onChange={(v:string) => setBulkData({...bulkData, type: v as PlateType})} options={PlateType} />
            <button type="submit" className="bg-blue-600 text-white p-4 rounded-2xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">توليد وحفظ</button>
          </form>
        )}

        {entryMode === 'manual' && (
           <form onSubmit={(e) => {
             e.preventDefault();
             if (plates.some(p => p.number === manualData.number)) return onNotify("الرقم موجود مسبقاً", "error");
             onAddPlates([{ id: `PLT-M-${Date.now()}`, number: manualData.number, type: manualData.type, status: PlateStatus.UNASSIGNED }]);
             onNotify("تمت إضافة اللوحة يدوياً", "success");
             setManualData({...manualData, number: ''});
           }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in slide-in-from-top-2">
             <InputCol label="رقم اللوحة" value={manualData.number} onChange={(v:string) => setManualData({...manualData, number: v})} />
             <SelectCol label="نوع اللوحة" value={manualData.type} onChange={(v:string) => setManualData({...manualData, type: v as PlateType})} options={PlateType} />
             <button type="submit" className="bg-emerald-600 text-white p-4 rounded-2xl font-black text-xs">حفظ اللوحة</button>
           </form>
        )}

        {entryMode === 'assign' && (
           <form onSubmit={handleQuickAssign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in slide-in-from-top-2">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase pr-2">اللجنة المستلمة</label>
               <select className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-bold text-sm" value={assignData.committeeId} onChange={e => setAssignData({...assignData, committeeId: e.target.value})}>
                 <option value="">-- اختر اللجنة --</option>
                 {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <InputCol label="الكمية المطلوبة" value={assignData.count} onChange={(v:any) => setAssignData({...assignData, count: Number(v)})} type="number" />
             <SelectCol label="نوع اللوحة" value={assignData.type} onChange={(v:string) => setAssignData({...assignData, type: v as PlateType})} options={PlateType} />
             <button type="submit" className="bg-blue-600 text-white p-4 rounded-2xl font-black text-xs">توزيع الكمية</button>
           </form>
        )}

        {entryMode === 'manual_select' && (
           <div className="space-y-6 animate-in slide-in-from-top-2">
              <div className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase pr-2">اللجنة المستلمة</label>
                  <select className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 p-3 rounded-xl outline-none font-bold text-xs" value={manualCommitteeId} onChange={e => setManualCommitteeId(e.target.value)}>
                    <option value="">-- اختر اللجنة --</option>
                    {committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button onClick={handleManualAssignSubmit} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs">توزيع المختار ({selectedPlateIds.length})</button>
              </div>
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <h3 className="text-xl font-black dark:text-white">قائمة الجرد التفصيلية</h3>
            <div className="flex gap-4">
               <input type="text" placeholder="بحث برقم اللوحة..." className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-2.5 rounded-xl text-xs font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
               <select className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                  <option value="ALL">كل الحالات</option>
                  <option value={PlateStatus.UNASSIGNED}>غير موزع</option>
                  <option value={PlateStatus.ASSIGNED}>موزع للجنة</option>
                  <option value={PlateStatus.ISSUED}>مصروف لمركبة</option>
               </select>
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredPlates.map(plate => (
              <div 
                key={plate.id} 
                onClick={() => entryMode === 'manual_select' && togglePlateSelection(plate.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${selectedPlateIds.includes(plate.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700'} ${plate.status === PlateStatus.ISSUED ? 'opacity-40 grayscale' : ''}`}
              >
                 <span className="text-[9px] font-black text-slate-400 mb-1">{plate.type === PlateType.PRIVATE ? 'خصوصي' : plate.type === PlateType.TAXI ? 'أجرة' : 'نقل'}</span>
                 <span className="text-2xl font-black dark:text-white">{plate.number}</span>
                 <div className={`mt-2 w-2 h-2 rounded-full ${plate.status === PlateStatus.ISSUED ? 'bg-rose-500' : plate.status === PlateStatus.ASSIGNED ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                 {plate.committeeId && (
                   <span className="mt-1 text-[7px] font-black text-blue-600 truncate max-w-full">{committees.find(c => c.id === plate.committeeId)?.name}</span>
                 )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default PlateInventory;
