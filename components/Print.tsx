
import React, { useRef, useState } from 'react';
import { OfficialFormRecord, PlateType, SystemSettings } from '../types';

declare var html2canvas: any;

const RepublicEagle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

const TrafficLogo = ({ className, color = "#e11d48" }: { className?: string, color?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <div className="w-full h-full rounded-full border-2 p-1 flex items-center justify-center relative bg-white" style={{ borderColor: color }}>
      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] mb-0.5" style={{ borderBottomColor: color }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-3"></div>
      </div>
    </div>
  </div>
);

const VehiclePlateDisplay = ({ number, type, mini = false }: { number: string, type: PlateType, mini?: boolean }) => {
  const isPrivate = type === PlateType.PRIVATE;
  const colorHex = isPrivate ? '#0f172a' : '#991b1b';

  return (
    <div className={`flex flex-col items-center justify-center ${mini ? 'my-2 scale-90' : 'my-4'}`}>
      <div className={`relative ${mini ? 'w-[110mm] h-[38mm]' : 'w-[140mm] h-[48mm]'} border-[6px] rounded-[2.5rem] flex flex-col overflow-hidden bg-white shadow-2xl border-slate-900`} style={{ borderColor: colorHex }}>
        <div className={`h-1/3 w-full flex items-center justify-between ${mini ? 'px-8' : 'px-14'} text-white`} style={{ backgroundColor: colorHex }}>
          <div className="text-center leading-none">
            <span className={`${mini ? 'text-[12px]' : 'text-[18px]'} font-black`}>اليمن</span>
            <p className="text-[8px] font-bold opacity-60">YEMEN</p>
          </div>
          <div className="text-center leading-none">
            <span className={`${mini ? 'text-[16px]' : 'text-[24px]'} font-black`}>{isPrivate ? 'خصوصي' : 'نقل عام'}</span>
          </div>
          <TrafficLogo className={`${mini ? 'w-6 h-6' : 'w-10 h-10'}`} color="#ffffff" />
        </div>
        <div className="flex-1 flex items-center justify-center bg-white relative">
           <span className={`${mini ? 'text-[52px]' : 'text-[84px]'} font-black tracking-[15px] text-slate-900 pr-[15px] leading-none`}>{number || '00000'}</span>
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
              <RepublicEagle className="w-56 h-56" />
           </div>
        </div>
      </div>
    </div>
  );
};

interface PrintProps {
  record: OfficialFormRecord;
  onBack: () => void;
  settings: SystemSettings;
}

const Print: React.FC<PrintProps> = ({ record, onBack, settings }) => {
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 4>(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const pageRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];

  const photos = record?.additionalPhotos || [];
  const hasPage4 = record?.printAdditionalPhotos && photos.length > 0;

  const exportPage = async (pageNumber: number) => {
    const targetRef = pageRefs[pageNumber - 1].current;
    if (!targetRef) return;
    
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(targetRef, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = `Traffic_Form_P${pageNumber}_${record.id}.png`;
      link.href = image;
      link.click();
    } catch (err) { 
      alert("فشل تصدير الصورة");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-[250] overflow-y-auto font-['Cairo'] print:static print:bg-white text-slate-900 text-right" dir="rtl">
      
      {/* شريط التحكم العلوي */}
      <div className="sticky top-0 left-0 right-0 flex flex-wrap items-center justify-center gap-4 bg-[#0f172a] p-4 border-b border-white/5 print:hidden z-[300] shadow-2xl">
         <button onClick={onBack} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-rose-600 transition-colors">إغلاق المعاينة</button>
         <div className="flex bg-white/5 p-1 rounded-2xl gap-1 shrink-0">
            {[1, 2, 3].map(p => (
              <button 
                key={p} 
                onClick={() => setActivePage(p as any)} 
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activePage === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ص {p}
              </button>
            ))}
            {hasPage4 && (
              <button 
                onClick={() => setActivePage(4)} 
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activePage === 4 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                المرفقات
              </button>
            )}
         </div>
         <div className="flex gap-2">
            <button disabled={isExporting} onClick={() => exportPage(activePage)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-all">حفظ ص{activePage} كصورة</button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-all">طباعة PDF 🖨️</button>
         </div>
      </div>

      <div className="flex flex-col items-center p-4 lg:p-10 print:p-0 gap-12">
        
        {/* صفحة 1: استمارة الفحص والترقيم */}
        <div id="page-1" ref={pageRefs[0]} className={`bg-white relative flex flex-col print:shadow-none shadow-2xl overflow-hidden ${activePage === 1 ? 'block' : 'hidden print:block'}`} style={{ width: '210mm', height: '297mm', minWidth: '210mm', minHeight: '297mm', padding: '10mm' }}>
           <Watermark />
           <div className="relative z-10 border-[4px] border-double border-slate-900 h-full flex flex-col p-1">
              <div className="border border-slate-900 h-full flex flex-col">
                <Header record={record} title="استمارة فحص وترقيم مركبة" settings={settings} />
                <div className="flex-1 p-8 space-y-6">
                   <SectionBox title="بيانات مالك المركبة">
                      <div className="p-4 bg-slate-50/50 border-b border-slate-300">
                         <span className="text-[10px] font-black text-slate-500 mb-1">الاسم الكامل:</span>
                         <span className="text-2xl font-black text-slate-900 block">{record?.owner?.name || '---'}</span>
                      </div>
                      <div className="grid grid-cols-4 divide-x divide-x-reverse">
                         <Cell label="محل الميلاد" value={record?.owner?.birthPlace} />
                         <Cell label="الجنسية" value={record?.owner?.nationality} />
                         <Cell label="نوع الهوية" value={record?.owner?.idType} />
                         <Cell label="رقم الهوية" value={record?.owner?.idNumber} />
                      </div>
                   </SectionBox>

                   <SectionBox title="بيانات المركبة الفنية">
                      <div className="grid grid-cols-2 divide-x divide-x-reverse border-b border-slate-300">
                         <Cell label="الماركة" value={record?.vehicle?.brand} />
                         <Cell label="الموديل" value={record?.vehicle?.model} />
                      </div>
                      <div className="p-5 flex flex-col items-center bg-slate-50/20">
                         <p className="text-[10px] font-black text-slate-400 mb-2">رقم القعادة (CHASSIS NUMBER)</p>
                         <div className="flex justify-center gap-1.5" dir="ltr">
                            {(record?.vehicle?.chassisNumber || '').padEnd(17, ' ').substring(0, 17).split('').map((char, idx) => (
                               <div key={idx} className="w-8 h-10 border-2 border-slate-900 bg-white flex items-center justify-center font-black text-lg rounded-lg shadow-sm">{char}</div>
                            ))}
                         </div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-x-reverse border-t border-slate-300">
                         <Cell label="سنة الصنع" value={record?.vehicle?.manufactureYear} />
                         <Cell label="اللون" value={record?.vehicle?.primaryColor} />
                         <Cell label="الوقود" value={record?.vehicle?.fuelType} />
                      </div>
                   </SectionBox>

                   <VehiclePlateDisplay number={record?.vehicle?.plateNumber} type={record?.plateType} />

                   <div className="grid grid-cols-3 gap-6 pt-10">
                      <SignatureBox label="المختص الفني" name={record?.signatures?.technicalSpecialist} />
                      <SignatureBox label="رئيس القسم الفني" name={record?.signatures?.technicalHead} />
                      <SignatureBox label="مدير الإصدار الآلي" name={record?.signatures?.issueManager} />
                   </div>
                </div>
                <Footer record={record} />
              </div>
           </div>
        </div>

        {/* صفحة 2: البيانات التكميلية والعنوان والشهود */}
        <div id="page-2" ref={pageRefs[1]} className={`bg-white relative flex flex-col print:shadow-none shadow-2xl overflow-hidden ${activePage === 2 ? 'block' : 'hidden print:block'}`} style={{ width: '210mm', height: '297mm', minWidth: '210mm', minHeight: '297mm', padding: '10mm' }}>
           <Watermark />
           <div className="relative z-10 border-[4px] border-double border-slate-900 h-full flex flex-col p-1">
              <div className="border border-slate-900 h-full flex flex-col">
                <Header record={record} title="استمارة البيانات التكميلية والأرشفة" settings={settings} />
                <div className="flex-1 p-10 space-y-10">
                   <div className="flex gap-10 items-start">
                      <div className="w-40 h-52 border-[3px] border-slate-900 bg-white shadow-2xl flex items-center justify-center relative overflow-hidden shrink-0 rounded-2xl">
                         {record?.owner?.ownerPhoto ? <img src={record.owner.ownerPhoto} className="w-full h-full object-cover" /> : <span className="text-6xl opacity-10">👤</span>}
                      </div>
                      <div className="flex-1 space-y-6 self-center">
                         <SectionBox title="معلومات الهوية الشخصية">
                            <div className="grid grid-cols-2 divide-x divide-x-reverse border-b border-slate-300">
                               <Cell label="الرقم الوطني" value={record?.owner?.idNumber} />
                               <Cell label="مكان الإصدار" value={record?.owner?.idIssuePlace} />
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-x-reverse">
                               <Cell label="تاريخ الميلاد" value={record?.owner?.dob} />
                               <Cell label="فصيلة الدم" value={record?.owner?.bloodType} />
                            </div>
                         </SectionBox>
                      </div>
                   </div>

                   <SectionBox title="العنوان المعتمد">
                      <div className="grid grid-cols-3 divide-x divide-x-reverse border-b border-slate-300">
                         <Cell label="المحافظة" value={record?.address?.province} />
                         <Cell label="المديرية" value={record?.address?.directorate} />
                         <Cell label="رقم الهاتف" value={record?.address?.phone1} />
                      </div>
                      <div className="p-4 bg-slate-50/30">
                         <Cell label="العنوان التفصيلي" value={record?.address?.fullAddress} />
                      </div>
                   </SectionBox>

                   <div className="grid grid-cols-2 gap-8">
                      <WitnessCard title="بيانات المعرف الأول" witness={record?.witnesses?.w1} color="blue" />
                      <WitnessCard title="بيانات المعرف الثاني" witness={record?.witnesses?.w2} color="slate" />
                   </div>

                   <div className="mt-auto p-10 border-[3px] border-dashed border-slate-300 rounded-[3rem] flex flex-col items-center bg-slate-50/20">
                      <p className="text-sm font-black mb-8 text-slate-600">بصمة إبهام وتوقيع مالك المركبة</p>
                      <div className="flex justify-between w-full px-20">
                         <div className="w-24 h-32 border-2 border-slate-400 bg-white rounded-2xl shadow-inner"></div>
                         <div className="w-64 h-0.5 bg-slate-900 mt-auto mb-6"></div>
                      </div>
                   </div>
                </div>
                <Footer record={record} />
              </div>
           </div>
        </div>

        {/* صفحة 3: شهادة ملكية مركبة مؤقتة */}
        <div id="page-3" ref={pageRefs[2]} className={`bg-white relative flex flex-col print:shadow-none shadow-2xl overflow-hidden ${activePage === 3 ? 'block' : 'hidden print:block'}`} style={{ width: '210mm', height: '297mm', minWidth: '210mm', minHeight: '297mm', padding: '10mm' }}>
           <Watermark />
           <div className="relative z-10 border-[4px] border-double border-slate-900 h-full flex flex-col items-center p-12">
              <Header record={record} title="شهادة ملكية مؤقتة" settings={settings} />
              
              <div className="w-full mt-10 p-12 border-[10px] border-double border-slate-900 rounded-[4rem] bg-slate-50/50 relative overflow-hidden shadow-2xl flex-1 flex flex-col">
                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] -rotate-12 pointer-events-none">
                    <RepublicEagle className="w-[150mm]" />
                 </div>
                 
                 <div className="flex gap-14 relative z-10">
                    <div className="w-52 h-64 border-[5px] border-white bg-white rounded-[2.5rem] shadow-2xl overflow-hidden shrink-0">
                       {record?.owner?.ownerPhoto && <img src={record.owner.ownerPhoto} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 space-y-8">
                       <div className="bg-white/80 p-8 rounded-[2rem] border border-white shadow-sm">
                          <p className="text-[11px] font-black text-slate-400 mb-2">المالك المرخص له:</p>
                          <p className="text-4xl font-black text-slate-900 leading-tight">{record?.owner?.name || '---'}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/40 p-4 rounded-xl border border-white/50">
                             <span className="text-[9px] font-black text-slate-400">نوع المركبة:</span>
                             <p className="text-lg font-black text-slate-900">{record?.vehicle?.brand}</p>
                          </div>
                          <div className="bg-white/40 p-4 rounded-xl border border-white/50">
                             <span className="text-[9px] font-black text-slate-400">سنة الصنع:</span>
                             <p className="text-lg font-black text-slate-900">{record?.vehicle?.manufactureYear}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-auto mb-10 pt-12 border-t-4 border-double border-slate-300">
                    <VehiclePlateDisplay number={record?.vehicle?.plateNumber} type={record?.plateType} mini />
                 </div>
                 
                 <div className="mt-8 flex justify-between items-center opacity-60 border-t pt-8">
                    <div className="text-right">
                       <p className="text-[10px] font-black">تاريخ الإصدار: {new Date(record.registrationDate).toLocaleDateString('ar-EG')}</p>
                       <p className="text-[10px] font-black">صالحة لمدة ٣٠ يوماً من تاريخه</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black tracking-widest uppercase">ID: {record.id.split('-')[1]}</p>
                    </div>
                 </div>
              </div>
              <Footer record={record} />
           </div>
        </div>

        {/* صفحة 4: ملحق المرفقات */}
        {hasPage4 && (
          <div id="page-4" ref={pageRefs[3]} className={`bg-white relative flex flex-col print:shadow-none shadow-2xl overflow-hidden ${activePage === 4 ? 'block' : 'hidden print:block'}`} style={{ width: '210mm', height: '297mm', minWidth: '210mm', minHeight: '297mm', padding: '10mm' }}>
             <Watermark />
             <div className="relative z-10 border-[4px] border-double border-slate-900 h-full flex flex-col p-1">
                <div className="border border-slate-900 h-full flex flex-col">
                  <Header record={record} title="ملحق أرشفة المرفقات والوثائق" settings={settings} />
                  <div className="flex-1 p-8 flex flex-col h-full max-h-[220mm] overflow-hidden">
                     <div className={`grid gap-4 flex-1 items-center justify-center h-full ${
                       photos.length === 1 ? 'grid-cols-1 grid-rows-1' : 
                       photos.length === 2 ? 'grid-cols-1 grid-rows-2' :
                       photos.length <= 4 ? 'grid-cols-2 grid-rows-2' : 
                       'grid-cols-2 grid-rows-3'
                     }`}>
                        {photos.slice(0, 6).map((photo, index) => (
                          <div key={index} className="w-full h-full relative overflow-hidden bg-slate-50 border border-slate-200 rounded-[1.5rem] flex items-center justify-center p-2">
                             <img src={photo} className="max-w-full max-h-full object-contain" alt={`Doc ${index}`} />
                             <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black">وثيقة {index + 1}</div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <Footer record={record} />
                </div>
             </div>
          </div>
        )}
      </div>

      <style>{`
        @page { size: A4 portrait; margin: 0 !important; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          #page-1, #page-2, #page-3, #page-4 { 
            display: block !important; 
            page-break-after: always; 
            max-width: 210mm !important; 
            max-height: 297mm !important; 
            min-width: 210mm !important; 
            min-height: 297mm !important; 
          }
        }
        /* تصحيح اتصال الحروف العربية */
        * {
            letter-spacing: 0 !important;
            font-feature-settings: "kern" 0;
            text-rendering: optimizeLegibility;
            text-transform: none !important;
        }
      `}</style>
    </div>
  );
};

const Header = ({ record, title, settings }: any) => (
  <div className="p-8 border-b-2 border-slate-900 bg-white flex justify-between items-center text-center">
     <div className="w-1/3 text-right">
        <p className="text-[11px] font-black text-slate-400">ملف رقم: {record?.id?.split('-')[1] || '---'}</p>
        <p className="text-[14px] font-black">مصلحة الجمارك اليمنية</p>
     </div>
     <div className="w-1/3">
        <RepublicEagle className="w-14 h-14 mx-auto mb-2" />
        <h1 className="text-xl font-black text-slate-900 mb-1">{title}</h1>
        <span className="inline-block bg-slate-900 text-white px-6 py-1 rounded-full text-[9px] font-black">
           {record?.plateType === PlateType.PRIVATE ? 'خصوصي' : 'نقل عام'}
        </span>
     </div>
     <div className="w-1/3 text-left">
        <TrafficLogo className="w-12 h-12 ml-0 mr-auto mb-1" />
        <h2 className="text-[13px] font-black">وزارة الداخلية</h2>
        <p className="text-[10px] font-black text-blue-700 truncate">{settings.departmentName}</p>
     </div>
  </div>
);

const SectionBox = ({ title, children }: any) => (
  <div className="border-2 border-slate-900 rounded-2xl overflow-hidden bg-white shadow-sm">
     <div className="bg-slate-900 text-white py-1.5 px-4 text-[11px] font-black text-center">{title}</div>
     {children}
  </div>
);

const Cell = ({ label, value }: any) => (
  <div className="p-3 flex flex-col overflow-hidden">
     <span className="text-[8px] font-black text-slate-400 mb-0.5">{label}:</span>
     <span className="font-black text-xs text-slate-900 truncate">{value || '---'}</span>
  </div>
);

const WitnessCard = ({ title, witness, color }: any) => (
  <div className="border-2 border-slate-900 rounded-[2.5rem] overflow-hidden bg-white flex-1 flex flex-col shadow-sm">
     <div className={`p-2 text-center text-white text-[10px] font-black ${color === 'blue' ? 'bg-blue-900' : 'bg-slate-800'}`}>{title}</div>
     <div className="p-6 space-y-2">
        <p className="text-[13px] font-black truncate">{witness?.name || '---'}</p>
        <p className="text-[10px] font-black text-slate-500">صلة القرابة: {witness?.relation || '---'}</p>
        <p className="text-[10px] font-black text-slate-500">هوية: {witness?.nationalId || '---'}</p>
        <p className="text-[10px] font-black text-slate-500">جوال: {witness?.phone || '---'}</p>
     </div>
  </div>
);

const SignatureBox = ({ label, name }: any) => (
  <div className="text-center border-2 border-slate-900 p-5 rounded-[2rem] bg-white flex-1 shadow-sm">
     <p className="text-[10px] font-black underline mb-8">{label}</p>
     <p className="text-xs font-black">{name || '...................'}</p>
  </div>
);

const Watermark = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none z-0">
     <RepublicEagle className="w-[170mm]" />
  </div>
);

const Footer = ({ record }: any) => (
  <div className="mt-auto border-t-2 border-slate-900 p-4 flex justify-between items-center text-[10px] font-black bg-slate-50">
     <p>نظام الأرشفة الموحد v4.5</p>
     <div className="w-16 h-16 border border-dashed border-slate-300 rounded-full flex items-center justify-center opacity-20 text-[7px]">الختم الرسمي</div>
     <p>ID-{record?.id?.split('-')[1] || '000'}</p>
  </div>
);

export default Print;
