
import React, { useState, useMemo, useEffect } from 'react';
import { VehicleRecord, OfficialFormRecord } from '../types';

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: 'OWNER' | 'WITNESS' | 'SELLER';
  roleLabel: string;
  source: 'FIELD' | 'FINANCE';
  sourceLabel: string;
  sourceId: string;
  date: string;
  hasDebt: boolean;
  debtAmount: number;
  vehicleInfo?: string;
}

interface PhoneArchiveProps {
  records: VehicleRecord[];
  officialRecords: OfficialFormRecord[];
  onNavigateToRecord: (tab: string, recordId: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const PhoneArchive: React.FC<PhoneArchiveProps> = ({ records, officialRecords, onNavigateToRecord, onNotify }) => {
  const [exportedIds, setExportedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('exported_contact_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRange, setFilterRange] = useState<'ALL' | 'NEW_TODAY'>('ALL');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'OWNERS' | 'WITNESSES'>('ALL');
  const [namePrefix, setNamePrefix] = useState('MR_ ');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    localStorage.setItem('exported_contact_ids', JSON.stringify(exportedIds));
  }, [exportedIds]);

  const allContacts = useMemo(() => {
    const contactMap = new Map<string, Contact>();

    officialRecords.forEach(rec => {
      const p = rec.address.phone1.trim();
      if (p.length > 5) {
        contactMap.set(`${p}-OWNER`, {
          id: `${p}-OWNER`,
          name: rec.owner.name,
          phone: p,
          role: 'OWNER',
          roleLabel: 'مالك',
          source: 'FIELD',
          sourceLabel: 'الأرشفة الميدانية',
          sourceId: rec.id,
          date: rec.registrationDate,
          hasDebt: false,
          debtAmount: 0,
          vehicleInfo: `${rec.vehicle.brand} ${rec.vehicle.plateNumber}`
        });
      }

      [rec.witnesses.w1, rec.witnesses.w2].forEach((w, idx) => {
        if (w.phone && w.phone.length > 5) {
          contactMap.set(`${w.phone}-WITNESS`, {
            id: `${w.phone}-WITNESS`,
            name: w.name,
            phone: w.phone,
            role: 'WITNESS',
            roleLabel: 'شاهد',
            source: 'FIELD',
            sourceLabel: 'الأرشفة الميدانية',
            sourceId: rec.id,
            date: rec.registrationDate,
            hasDebt: false,
            debtAmount: 0,
            vehicleInfo: `شاهد لمركبة ${rec.vehicle.plateNumber}`
          });
        }
      });
    });

    records.forEach(rec => {
      const p = rec.ownerPhone.trim();
      if (p.length > 5) {
        const key = `${p}-OWNER`;
        const existing = contactMap.get(key);
        contactMap.set(key, {
          id: existing?.id || key,
          name: rec.ownerName,
          phone: p,
          role: 'OWNER',
          roleLabel: 'مالك',
          source: 'FINANCE',
          sourceLabel: 'مالي',
          sourceId: rec.id,
          date: rec.registrationDate > (existing?.date || '') ? rec.registrationDate : (existing?.date || ''),
          hasDebt: rec.hasDebt,
          debtAmount: rec.debtAmount,
          vehicleInfo: `${rec.vehicleName} ${rec.plateNumber}`
        });
      }
    });

    return Array.from(contactMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [records, officialRecords]);

  const filteredContacts = useMemo(() => {
    return allContacts.filter(c => {
      const matchesSearch = c.name.includes(searchQuery) || c.phone.includes(searchQuery);
      const todayStr = new Date().toISOString().split('T')[0];
      const matchesRange = filterRange === 'NEW_TODAY' ? c.date.startsWith(todayStr) : true;
      let matchesCat = true;
      if (filterCategory === 'OWNERS') matchesCat = c.role === 'OWNER';
      if (filterCategory === 'WITNESSES') matchesCat = c.role === 'WITNESS';
      return matchesSearch && matchesRange && matchesCat;
    });
  }, [allContacts, searchQuery, filterRange, filterCategory]);

  const pendingExport = useMemo(() => {
    return filteredContacts.filter(c => !exportedIds.includes(c.id));
  }, [filteredContacts, exportedIds]);

  const handleSmartExport = () => {
    if (pendingExport.length === 0) {
      onNotify?.("لا توجد أرقام جديدة للتصدير حالياً.", "warning");
      return;
    }
    const vcfContent = pendingExport.map(c => {
      const debtTxt = c.hasDebt ? ` (دين: ${c.debtAmount})` : '';
      const fullName = `${namePrefix}${c.name} - ${c.roleLabel}${debtTxt}`;
      return `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
TEL;TYPE=CELL:${c.phone}
NOTE:مركبة: ${c.vehicleInfo || '---'} | مصدر: ${c.sourceLabel}
END:VCARD`;
    }).join('\n');
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Export_${new Date().toISOString().split('T')[0]}.vcf`;
    link.click();
    setExportedIds(prev => [...prev, ...pendingExport.map(c => c.id)]);
    onNotify?.(`تم تصدير ${pendingExport.length} جهة اتصال بنجاح`, "success");
  };

  const handleGoToSource = (contact: Contact) => {
    const tab = contact.source === 'FINANCE' ? 'records' : 'official_archive';
    onNavigateToRecord(tab, contact.sourceId);
    setSelectedContact(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 font-['Cairo'] text-right" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2">سجل الاتصال المنظم</h2>
        <p className="text-slate-400 text-sm font-bold">تحكم كامل في كيفية حفظ الأرقام ومنع تكرارها</p>
        
        <button 
          onClick={handleSmartExport}
          className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-emerald-500/30 flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
        >
          <span>بدء التصدير الذكي ({pendingExport.length})</span>
          <span className="text-2xl">📥</span>
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-10 items-end">
         <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2">البادئة (تميز الأسماء في الهاتف)</label>
            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-black text-blue-600 text-center" value={namePrefix} onChange={e => setNamePrefix(e.target.value)} />
         </div>
         <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2">النطاق الزمني</label>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
               <button onClick={() => setFilterRange('ALL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterRange === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الكل</button>
               <button onClick={() => setFilterRange('NEW_TODAY')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterRange === 'NEW_TODAY' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>الجديد اليوم</button>
            </div>
         </div>
         <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2">تصنيف الأرقام</label>
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
               <button onClick={() => setFilterCategory('ALL')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterCategory === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}>الجميع</button>
               <button onClick={() => setFilterCategory('OWNERS')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterCategory === 'OWNERS' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}>المالكون</button>
               <button onClick={() => setFilterCategory('WITNESSES')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterCategory === 'WITNESSES' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}>الشهود</button>
            </div>
         </div>
         <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2">بحث سريع</label>
            <div className="relative">
               <input type="text" placeholder="بحث..." className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none font-bold text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
               <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                     <th className="p-8">النوع</th>
                     <th className="p-8">الاسم الكامل</th>
                     <th className="p-8 text-center">رقم الهاتف</th>
                     <th className="p-8 text-center">تاريخ الرصد</th>
                     <th className="p-8 text-center">معاينة</th>
                  </tr>
               </thead>
               <tbody className="divide-y dark:divide-slate-800">
                  {filteredContacts.map((contact, i) => (
                    <tr key={i} onClick={() => setSelectedContact(contact)} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer ${exportedIds.includes(contact.id) ? 'opacity-40' : ''}`}>
                       <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black ${contact.role === 'OWNER' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {contact.roleLabel}
                          </span>
                       </td>
                       <td className="p-8">
                          <div className="flex items-center gap-3">
                             <span className="text-blue-500 font-black text-xs">{namePrefix}</span>
                             <span className="font-black text-slate-900 dark:text-white text-sm">{contact.name}</span>
                             {contact.hasDebt && <span className="text-[9px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">({contact.debtAmount})</span>}
                          </div>
                       </td>
                       <td className="p-8 font-mono font-black text-slate-700 dark:text-slate-300 text-center">{contact.phone}</td>
                       <td className="p-8 text-[10px] font-black text-slate-400 text-center">{new Date(contact.date).toLocaleDateString('ar-EG')}</td>
                       <td className="p-8 text-center">
                          <button className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mx-auto">📱</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Contact Card Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[400] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#121212] w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col relative animate-in slide-in-from-bottom-10">
              
              <button onClick={() => setSelectedContact(null)} className="absolute top-8 left-8 text-white text-2xl z-20">✕</button>
              <button onClick={() => setSelectedContact(null)} className="absolute top-8 right-8 text-white text-2xl z-20">〉</button>
              
              <div className="h-64 flex flex-col items-center justify-center pt-10">
                 <div className="w-24 h-24 bg-[#26c6da] rounded-full flex items-center justify-center text-white text-3xl mb-6 shadow-xl relative">
                    📷
                 </div>
                 <h3 className="text-white text-xl font-bold text-center px-8 leading-tight">
                    {namePrefix}{selectedContact.name} - {selectedContact.roleLabel} {selectedContact.hasDebt ? `(دين: ${selectedContact.debtAmount})` : ''}
                 </h3>
                 <p className="text-slate-400 text-sm mt-2">{selectedContact.phone} <span className="text-xs ml-1 opacity-60">الجوال</span></p>
                 
                 <div className="flex gap-16 mt-8">
                    <div className="w-12 h-12 bg-[#26c6da] rounded-full flex items-center justify-center text-white text-xl shadow-lg cursor-pointer">💬</div>
                    <div className="w-12 h-12 bg-[#26c6da] rounded-full flex items-center justify-center text-white text-xl shadow-lg cursor-pointer">📞</div>
                 </div>
              </div>

              <div className="flex-1 bg-black p-6 space-y-4">
                 <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 group">
                    <p className="text-[10px] font-bold text-slate-500 mb-1 text-left">ملاحظات</p>
                    <div className="flex justify-between items-center">
                       <p className="text-white text-sm font-bold">
                          مركبة: {selectedContact.vehicleInfo} | مصدر: <span className="text-[#26c6da]">{selectedContact.sourceLabel}</span>
                       </p>
                       <button 
                        onClick={() => handleGoToSource(selectedContact)}
                        className="text-[9px] bg-white/10 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                       >انتقال للأصل</button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <button className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold text-sm text-center border border-white/5 active:bg-white/10 transition-all">السجل</button>
                    <button className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold text-sm text-center border border-white/5 active:bg-white/10 transition-all">مواقع التخزين</button>
                 </div>
              </div>

              <div className="h-20 border-t border-white/5 flex items-center justify-around px-4">
                 <FooterIcon icon="★" label="المفضلة" />
                 <FooterIcon icon="✎" label="تعديل" />
                 <FooterIcon icon="🔗" label="مشاركة" />
                 <FooterIcon icon="⋯" label="المزيد" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const FooterIcon = ({ icon, label }: any) => (
  <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
     <span className="text-white text-lg">{icon}</span>
     <span className="text-[9px] text-white font-bold">{label}</span>
  </div>
);

export default PhoneArchive;
