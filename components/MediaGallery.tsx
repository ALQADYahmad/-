
import React, { useState, useMemo } from 'react';
import { VehicleRecord, OfficialFormRecord, CustomsArchiveRecord } from '../types';

interface MediaItem {
  id: string;
  url: string;
  source: 'CUSTOMS' | 'OFFICIAL' | 'TRANSACTION';
  sourceLabel: string;
  ownerName: string;
  plateNumber: string;
  extractedText: string;
  date: string;
  originalId: string;
}

interface MediaGalleryProps {
  records: VehicleRecord[];
  officialRecords: OfficialFormRecord[];
  customsRecords: CustomsArchiveRecord[];
  onNavigate: (tab: string, id: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ records, officialRecords, customsRecords, onNavigate, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const allMedia = useMemo(() => {
    const items: MediaItem[] = [];

    // 1. صور من أرشيف الجمارك
    customsRecords.forEach(c => {
      c.images.forEach((img, idx) => {
        items.push({
          id: `media-cust-${c.id}-${idx}`,
          url: img,
          source: 'CUSTOMS',
          sourceLabel: 'البيانات الجمركية',
          ownerName: c.data.ownerName || c.data.importerName || 'بدون اسم',
          plateNumber: c.data.plateNumber || 'بدون لوحة',
          extractedText: c.data.fullText || '',
          date: c.timestamp,
          originalId: c.id
        });
      });
    });

    // 2. صور من الأرشفة الموحدة (الميدانية)
    officialRecords.forEach(o => {
      // صورة المالك
      if (o.owner.ownerPhoto) {
        items.push({
          id: `media-off-owner-${o.id}`,
          url: o.owner.ownerPhoto,
          source: 'OFFICIAL',
          sourceLabel: 'الأرشفة الميدانية (صورة مالك)',
          ownerName: o.owner.name,
          plateNumber: o.vehicle.plateNumber,
          extractedText: '',
          date: o.registrationDate,
          originalId: o.id
        });
      }
      // الصور الإضافية
      o.additionalPhotos?.forEach((img, idx) => {
        items.push({
          id: `media-off-add-${o.id}-${idx}`,
          url: img,
          source: 'OFFICIAL',
          sourceLabel: 'الأرشفة الميدانية (وثيقة)',
          ownerName: o.owner.name,
          plateNumber: o.vehicle.plateNumber,
          extractedText: '',
          date: o.registrationDate,
          originalId: o.id
        });
      });
    });

    // 3. صور من أرشيف المعاملات
    records.forEach(r => {
      r.documents.forEach((doc, idx) => {
        if (doc.imageData) {
          items.push({
            id: `media-trx-doc-${r.id}-${idx}`,
            url: doc.imageData,
            source: 'TRANSACTION',
            sourceLabel: 'أرشيف المعاملات',
            ownerName: r.ownerName,
            plateNumber: r.plateNumber,
            extractedText: '',
            date: r.registrationDate,
            originalId: r.id
          });
        }
      });
    });

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, officialRecords, customsRecords]);

  const filteredMedia = useMemo(() => {
    if (!searchQuery) return allMedia;
    const q = searchQuery.toLowerCase();
    return allMedia.filter(m => 
      m.ownerName.toLowerCase().includes(q) ||
      m.plateNumber.toLowerCase().includes(q) ||
      m.extractedText.toLowerCase().includes(q) ||
      m.sourceLabel.toLowerCase().includes(q)
    );
  }, [allMedia, searchQuery]);

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.download = `IMG_${item.ownerName}_${item.plateNumber}.png`;
    link.href = item.url;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 font-['Cairo'] text-right" dir="rtl">
      
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-14 rounded-[3.5rem] border dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2">أرشيف الوسائط الذكي</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">مستودع الصور والوثائق الموحد لجميع الأقسام</p>
        
        <div className="mt-10 relative w-full max-w-2xl">
           <input 
             type="text" 
             placeholder="بحث ذكي في الصور (الاسم، اللوحة، النصوص المستخرجة، المصدر)..." 
             className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-6 rounded-[2.5rem] outline-none font-bold text-lg dark:text-white focus:border-blue-500 transition-all shadow-inner pr-14"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
           <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔍</span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredMedia.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedMedia(item)}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all cursor-pointer group relative aspect-[3/4]"
          >
             <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="archived" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
             
             <div className="absolute bottom-6 right-6 left-6 text-white space-y-1">
                <span className="text-[8px] font-black uppercase bg-blue-600 px-2 py-0.5 rounded-md inline-block mb-2">{item.sourceLabel}</span>
                <h4 className="font-black text-sm truncate">{item.ownerName}</h4>
                <p className="text-[10px] font-bold opacity-60">{item.plateNumber}</p>
             </div>

             <button 
               onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
               className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600"
             >
               📥
             </button>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20">
             <span className="text-8xl block mb-6">🖼️</span>
             <h3 className="text-2xl font-black">لا توجد صور مطابقة لبحثك</h3>
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-4 lg:p-10 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 relative">
              
              <button onClick={() => setSelectedMedia(null)} className="absolute top-8 left-8 w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-2xl z-50">✕</button>

              <div className="flex flex-col lg:flex-row h-full">
                 <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
                    <img src={selectedMedia.url} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl" alt="Preview" />
                 </div>
                 
                 <div className="w-full lg:w-[400px] border-r dark:border-slate-800 p-10 flex flex-col bg-white dark:bg-slate-900">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-xl uppercase self-start mb-6">{selectedMedia.sourceLabel}</span>
                    
                    <div className="space-y-8 flex-1">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">المالك المعتمد</label>
                          <h3 className="text-2xl font-black dark:text-white leading-tight">{selectedMedia.ownerName}</h3>
                       </div>

                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">رقم اللوحة</label>
                          <p className="text-xl font-black text-blue-600">{selectedMedia.plateNumber}</p>
                       </div>

                       {selectedMedia.extractedText && (
                         <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border dark:border-white/5 max-h-[250px] overflow-y-auto custom-scrollbar">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b pb-2">النصوص المستخرجة (AI OCR)</label>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedMedia.extractedText}</p>
                         </div>
                       )}

                       <div className="flex flex-col gap-4 mt-auto">
                          <button 
                            onClick={() => handleDownload(selectedMedia)}
                            className="w-full bg-emerald-600 text-white py-5 rounded-[1.8rem] font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                          >
                            <span>تنزيل الصورة بدقة كاملة (PNG)</span>
                            <span className="text-xl">📥</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              const tab = selectedMedia.source === 'CUSTOMS' ? 'customs_archive' : selectedMedia.source === 'OFFICIAL' ? 'official_archive' : 'records';
                              onNavigate(tab, selectedMedia.originalId);
                              setSelectedMedia(null);
                            }}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-[1.8rem] font-black hover:bg-slate-200 transition-all"
                          >انتقال لمكان الصورة الأصلي ➔</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MediaGallery;
