
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { OfficialFormRecord, PlateType, User, Plate, PlateStatus, SystemSettings, CustomsArchiveRecord, VehicleRecord } from '../types';
import { analyzeNationalIdCard, analyzeWitnessIdCard, analyzeCustomsStatement } from '../services/geminiService';

const YEMEN_ATLAS: Record<string, string[]> = {
  'صنعاء (الأمانة)': ['السبعين', 'التحرير', 'الوحدة', 'الثورة', 'بني الحارث', 'معين', 'شعوب', 'أزال', 'صنعاء القديمة', 'الصافية'],
  'عدن': ['المنصورة', 'الشيخ عثمان', 'خورمكسر', 'كريتر', 'المعلا', 'التواهي', 'البريقة', 'دار سعد'],
  'تعز': ['القاهرة', 'المظفر', 'صالة', 'المخاء', 'التربة', 'الشمايتين', 'ذوباب', 'الوازعية', 'شرعب الرونة', 'شرعب السلام', 'ماوية', 'المسراخ', 'صبر الموادم', 'جبل حبشي'],
  'حضرموت': ['المكلا', 'الشحر', 'غيل باوزير', 'سيئون', 'تريم', 'القطن', 'شبام', 'ساه', 'حريضة', 'عمد'],
  'إب': ['الظهار', 'المشنة', 'جبلة', 'إب', 'العدين', 'ذي السفال', 'السياني', 'بعدان', 'يريم', 'القفر'],
  'الحديدة': ['الحالي', 'الحوك', 'الميناء', 'باجل', 'الزيدية', 'الضحى', 'الخوخة', 'بيت الفقيه'],
  'مأرب': ['مأرب المدينة', 'مأرب الوادي', 'حريب', 'الجوبة', 'صرواح'],
  'ذمار': ['ذمار المدينة', 'عنس', 'جهران', 'ضوران آنس', 'عتمة']
};

const SUGGESTIONS = {
  brands: ['TOYOTA', 'HYUNDAI', 'ISUZU', 'MERCEDES-BENZ', 'NISSAN', 'KIA', 'HONDA', 'MITSUBISHI', 'LEXUS', 'MAZDA', 'JEEP'],
  colors: ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'ذهبي', 'بني', 'أخضر', 'لؤلؤي'],
  fuelTypes: ['بنزين', 'ديزل', 'غاز', 'هايبرد (هجين)', 'كهرباء'],
  purchaseSources: ['معرض النخبة', 'معرض السعيد', 'معرض المجد', 'شراء مباشر من المالك', 'استيراد شخصي'],
  nationalities: ['يمني', 'سعودي', 'مصري', 'سوداني', 'إماراتي', 'عماني', 'أردني']
};

interface WizardProps {
  user: User;
  onSave: (record: OfficialFormRecord) => void;
  onCancel: () => void;
  availablePlates: Plate[];
  settings: SystemSettings;
  allOfficialRecords?: OfficialFormRecord[];
  customsRecords?: CustomsArchiveRecord[];
  allTransactions?: VehicleRecord[];
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const SectionTitle = ({ t, s }: any) => (
  <div className="border-r-4 border-blue-600 pr-6">
    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-normal">{t}</h3>
    <p className="text-slate-400 text-[10px] lg:text-xs font-bold mt-1">{s}</p>
  </div>
);

const SmartHybridInput = ({ label, value, onChange, icon, color, isHighlighted, type = 'text', placeholder, suggestions = [] }: any) => {
  const colorClass = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-rose-500';
  const listId = `list-${label.replace(/\s+/g, '-')}`;
  
  return (
    <div className={`space-y-2 transition-all duration-700 ${isHighlighted ? 'scale-[1.02] ring-4 ring-yellow-400/20' : ''}`}>
      <label className="text-[11px] font-black text-slate-500 pr-2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          list={suggestions.length > 0 ? listId : undefined}
          type={type}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-100 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-slate-900 dark:text-white transition-all ${colorClass}`}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((s: string) => <option key={s} value={s} />)}
          </datalist>
        )}
      </div>
    </div>
  );
};

const SmartFilteredSelect = ({ label, value, onChange, options, color, icon, isHighlighted }: any) => {
  const colorClass = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-rose-500';
  return (
    <div className={`space-y-2 transition-all duration-700 ${isHighlighted ? 'scale-[1.02] ring-4 ring-yellow-400/20' : ''}`}>
      <label className="text-[11px] font-black text-slate-500 pr-2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <select
        className={`w-full bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-100 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-slate-900 dark:text-white appearance-none transition-all ${colorClass}`}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">-- اختر --</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

const SmartSegmentedDate = ({ label, value, onChange, color }: any) => {
  const colorClass = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-rose-500';
  const d = value ? new Date(value) : null;
  const initialDay = d && !isNaN(d.getTime()) ? d.getDate().toString() : "";
  const initialMonth = d && !isNaN(d.getTime()) ? (d.getMonth() + 1).toString() : "";
  const initialYear = d && !isNaN(d.getTime()) ? d.getFullYear().toString() : "";

  const [day, setDay] = useState(initialDay);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    if (day && month && year) {
      const formattedMonth = month.padStart(2, '0');
      const formattedDay = day.padStart(2, '0');
      onChange(`${year}-${formattedMonth}-${formattedDay}`);
    }
  }, [day, month, year, onChange]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 60 }, (_, i) => (new Date().getFullYear() + 5 - i).toString());

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-500 pr-2 block">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        <select value={day} onChange={e => setDay(e.target.value)} className={`bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-100 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-xs dark:text-white appearance-none text-center ${colorClass}`}>
          <option value="">يوم</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} className={`bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-100 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-xs dark:text-white appearance-none text-center ${colorClass}`}>
          <option value="">شهر</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className={`bg-slate-50 dark:bg-[#1e293b] border-2 border-slate-100 dark:border-white/5 p-4 rounded-2xl outline-none font-bold text-xs dark:text-white appearance-none text-center ${colorClass}`}>
          <option value="">سنة</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
};

const WitnessPremiumCard = ({ label, witness, onScan, onChange, color }: any) => {
  const accentColor = color === 'blue' ? 'blue' : 'rose';
  return (
    <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-xl font-black dark:text-white">{label}</h5>
        <button onClick={onScan} className={`bg-${accentColor}-600/10 text-${accentColor}-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-${accentColor}-600 hover:text-white transition-all`}>مسح الهوية ذكياً</button>
      </div>
      <div className="space-y-4">
        <SmartHybridInput label="الاسم الرباعي" value={witness?.name} onChange={(v: string) => onChange({ name: v })} color={color} icon="👤" />
        <div className="grid grid-cols-2 gap-4">
          <SmartHybridInput label="رقم الهوية" value={witness?.nationalId} onChange={(v: string) => onChange({ nationalId: v })} color={color} icon="🆔" />
          <SmartHybridInput label="صلة القرابة" value={witness?.relation} onChange={(v: string) => onChange({ relation: v })} color={color} icon="🔗" placeholder="أب، أخ، عم..." />
        </div>
        <SmartHybridInput label="رقم الهاتف" value={witness?.phone} onChange={(v: string) => onChange({ phone: v })} color={color} icon="📱" />
      </div>
    </div>
  );
};

const OfficialFormWizard: React.FC<WizardProps> = ({ user, onSave, onCancel, availablePlates, settings, allOfficialRecords = [], customsRecords = [], allTransactions = [], onNotify }) => {
  const [step, setStep] = useState(1);
  const [pType, setPType] = useState<PlateType>(PlateType.PRIVATE);
  const [isScanningId, setIsScanningId] = useState(false);
  const [isScanningCustoms, setIsScanningCustoms] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [plateSearchQuery, setPlateSearchQuery] = useState('');
  
  const labels = settings.formLabels;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<OfficialFormRecord>>({
    id: `OFF-${Date.now()}`, 
    plateType: PlateType.PRIVATE,
    registrationDate: new Date().toISOString(),
    committeeId: user.committeeId || '',
    owner: { name: '', dob: '', dobHijri: '', birthPlace: '', province: '', directorate: '', village: '', subDistrict: '', nationality: 'يمني', religion: '', gender: '', bloodType: '', socialStatus: '', education: '', nationalId: '', idType: '', idNumber: '', idIssuePlace: '', idIssueDate: '', idExpiryDate: '', residenceNumber: '', residenceIssueDate: '', residenceExpiryDate: '', ownerPhoto: '' },
    work: { profession: '', workEntity: '', province: '', directorate: '', city: '', street: '' },
    address: { province: '', directorate: '', city: '', street: '', phone1: '', phone2: '', fullAddress: '', neighbor: '', nearestSchool: '', nearestMosque: '' },
    witnesses: { w1: { name: '', nationalId: '', phone: '', relation: '', address: '' }, w2: { name: '', nationalId: '', phone: '', relation: '', address: '' } },
    vehicle: { plateNumber: '', plateType: '', model: '', chassisNumber: '', engineNumber: '', brand: '', style: '', originCountry: '', manufactureYear: '', fuelType: '', axlesCount: '', primaryColor: '', secondaryColor: '', seatsCount: '', doorsCount: '', cylindersCount: '', weight: '', steeringSide: '', purchaseSource: '' },
    customs: { statementNumber: '', date: '', issuePlace: '', entity: '' },
    signatures: { technicalSpecialist: '', technicalHead: '', issueManager: '' },
    additionalPhotos: [],
    printAdditionalPhotos: true
  });

  const autoAttachPhoto = (photoData: string) => {
    if (!photoData) return;
    setFormData(prev => {
      const currentPhotos = prev.additionalPhotos || [];
      if (currentPhotos.includes(photoData)) return prev;
      return { ...prev, additionalPhotos: [photoData, ...currentPhotos] };
    });
  };

  const updateSection = (section: keyof OfficialFormRecord, updates: any) => {
    setFormData(prev => ({ ...prev, [section]: { ...(prev[section] as any), ...updates } }));
  };

  const triggerFieldHighlight = (fieldKeys: string[]) => {
    setHighlightedFields(fieldKeys);
    setTimeout(() => setHighlightedFields([]), 3500);
  };

  const filteredPlatesForCurrentType = useMemo(() => {
    return availablePlates.filter(p => {
      const typeMatch = p.type === pType;
      const statusMatch = p.status === PlateStatus.ASSIGNED;
      const searchMatch = p.number.includes(plateSearchQuery);
      return typeMatch && statusMatch && searchMatch;
    });
  }, [availablePlates, pType, plateSearchQuery]);

  const currentTheme = pType === PlateType.PRIVATE ? 'blue' : 'rose';
  const themeClass = pType === PlateType.PRIVATE ? 'bg-blue-600 shadow-blue-500/30' : 'bg-rose-600 shadow-rose-500/30';
  const plateBgClass = pType === PlateType.PRIVATE ? 'bg-blue-900 text-white border-blue-950' : 'bg-rose-800 text-white border-rose-950';

  useEffect(() => {
    if (scrollRef.current) {
        const activeElement = scrollRef.current.children[step - 1] as HTMLElement;
        if (activeElement) {
            const containerWidth = scrollRef.current.offsetWidth;
            const elementWidth = activeElement.offsetWidth;
            const elementOffset = activeElement.offsetLeft;
            scrollRef.current.scrollTo({ left: elementOffset - (containerWidth / 2) + (elementWidth / 2), behavior: 'smooth' });
        }
    }
  }, [step]);

  const handleFinalSave = () => {
    if (!formData.vehicle?.plateNumber) {
        onNotify("يرجى اختيار رقم لوحة للمركبة قبل الحفظ", "warning");
        return;
    }
    onSave({ ...formData, id: formData.id || `OFF-${Date.now()}`, registrationDate: new Date().toISOString() } as OfficialFormRecord);
    onNotify("تم حفظ نموذج الرصد الميداني بنجاح", "success");
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleNextStep = () => {
    if (step < 7) setStep(s => s + 1);
  };

  const handleExitProcess = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const hasData = formData.owner?.name || formData.vehicle?.chassisNumber || formData.additionalPhotos?.length;
    if (hasData) {
      const confirmExit = window.confirm("⚠️ تنبيه: هل ترغب حقاً في إلغاء عملية الرصد؟ \n\nسيتم فقدان كافة البيانات والصور التي قمت بإدخالها حالياً.");
      if (confirmExit) onCancel();
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/98 backdrop-blur-2xl z-[300] flex flex-col items-center justify-center p-0 lg:p-6 overflow-hidden font-['Cairo'] text-right" dir="rtl">
      
      {/* زر الخروج الاحترافي */}
      <div className="fixed top-4 left-4 lg:top-8 lg:left-8 z-[350] print:hidden">
         <button 
           type="button" 
           onClick={handleExitProcess}
           className="group flex items-center gap-3 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 p-2 pr-6 pl-2 rounded-full transition-all duration-300 shadow-2xl backdrop-blur-md"
         >
           <span className="text-[11px] font-black text-slate-400 group-hover:text-rose-400 uppercase tracking-widest transition-colors">إلغاء وخروج</span>
           <div className="w-10 h-10 bg-white/10 group-hover:bg-rose-600 rounded-full flex items-center justify-center text-white transition-all group-active:scale-90">
             <span className="text-xl">✕</span>
           </div>
         </button>
      </div>

      <div className="w-full max-w-[1450px] h-full lg:h-[95vh] bg-white dark:bg-[#0f172a] lg:rounded-[4rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-500 relative">
        
        {/* الشريط الجانبي */}
        <div className="bg-[#0f172a] p-3 lg:p-10 text-white flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto shrink-0 gap-2 lg:gap-5 border-b lg:border-l border-white/5 no-scrollbar stepper-container" ref={scrollRef}>
          {[
            { n: 1, label: 'المالك', icon: '👤' },
            { n: 2, label: 'الهوية', icon: '🆔' },
            { n: 3, label: 'العنوان', icon: '🏠' },
            { n: 4, label: 'الشهود', icon: '👥' },
            { n: 5, label: 'المركبة', icon: '🚘' },
            { n: 6, label: 'الجمرك', icon: '📄' },
            { n: 7, label: 'الصور', icon: '✨' }
          ].map(s => (
            <button key={s.n} type="button" onClick={() => step > s.n && setStep(s.n)} className={`flex items-center gap-3 py-3 lg:py-4 px-5 lg:px-6 rounded-[1.5rem] lg:rounded-[2rem] transition-all shrink-0 step-item ${step === s.n ? themeClass + ' scale-105 shadow-xl ring-2 ring-white/10' : 'opacity-30 bg-white/5'}`}>
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center font-black text-xs lg:text-sm ${step === s.n ? 'bg-white text-slate-900' : 'bg-white/10 text-white'}`}>
                {step > s.n ? '✓' : s.icon}
              </div>
              <span className="text-[13px] lg:text-[14px] font-black whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>

        {/* المحتوى الرئيسي */}
        <div className={`flex-1 flex flex-col overflow-y-auto no-scrollbar relative transition-colors duration-500 pb-32 ${pType === PlateType.PRIVATE ? 'bg-blue-50/5' : 'bg-rose-50/5'}`}>
          <header className="p-5 lg:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-[100]">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-[1.8rem] flex items-center justify-center text-xl lg:text-3xl shadow-inner ${pType === PlateType.PRIVATE ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                   {['👤', '🆔', '🏠', '👥', '🚘', '📄', '✨'][step-1]}
                </div>
                <div>
                   <h4 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white">{['المالك', 'الهوية', 'العنوان', 'الشهود', 'المركبة', 'الجمرك', 'الصور'][step-1]}</h4>
                   <p className="text-[10px] lg:text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">رصد بيانات النموذج الميداني</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 dark:bg-[#1e293b] p-1.5 rounded-[2rem] shadow-inner gap-1 border dark:border-white/5">
                   <button type="button" onClick={() => setPType(PlateType.PRIVATE)} className={`px-8 py-3 lg:px-12 lg:py-4 rounded-[1.6rem] text-[12px] font-black transition-all ${pType === PlateType.PRIVATE ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}>خصوصي</button>
                   <button type="button" onClick={() => setPType(PlateType.TRANSPORT)} className={`px-8 py-3 lg:px-12 lg:py-4 rounded-[1.6rem] text-[12px] font-black transition-all ${pType === PlateType.TRANSPORT ? 'bg-rose-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}>نقل عام</button>
                </div>
             </div>
          </header>

          <div key={step} className="p-5 lg:p-16 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
            {step === 1 && (
               <div className="space-y-12">
               <div className="bg-white dark:bg-[#0f172a]/40 p-8 lg:p-14 rounded-[4rem] space-y-10 border dark:border-white/5 shadow-sm relative">
                  <div className="relative group">
                     <SmartHybridInput label={labels.ownerName} value={formData.owner?.name} isHighlighted={highlightedFields.includes('ownerName')} onChange={(v:string) => updateSection('owner', {name: v})} color={currentTheme} icon="✨" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <SmartSegmentedDate label={labels.ownerDob} value={formData.owner?.dob} onChange={(v:string) => updateSection('owner', {dob: v})} color={currentTheme} />
                     <SmartHybridInput label={labels.ownerIdNumber} value={formData.owner?.idNumber} isHighlighted={highlightedFields.includes('idNumber')} onChange={(v:string) => updateSection('owner', {idNumber: v})} color={currentTheme} />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className={`p-8 rounded-[3.5rem] border-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden shadow-sm ${isScanningId ? 'bg-slate-900 border-blue-500 shadow-blue-500/20' : 'bg-white dark:bg-[#1e293b] border-slate-100 dark:border-white/5 hover:border-blue-500/50'}`} onClick={() => {
                       const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=async(e:any)=>{
                         const file = e.target.files?.[0]; if (!file) return; setIsScanningId(true);
                         const reader = new FileReader(); reader.onloadend = async () => {
                           try { 
                             const imgData = reader.result as string;
                             const result = await analyzeNationalIdCard(imgData); 
                             autoAttachPhoto(imgData);
                             
                             // منطق ذكي: محل الميلاد هو المحافظة والمديرية معاً
                             const smartBirthPlace = `${result.province || ''} - ${result.directorate || ''}`.trim().replace(/^- |-$/, '');

                             setFormData(prev => ({
                               ...prev,
                               owner: { 
                                 ...prev.owner, 
                                 name: result.name || prev.owner?.name, 
                                 idNumber: result.idNumber || prev.owner?.idNumber, 
                                 idType: result.idType || 'بطاقة شخصية',
                                 dob: result.dob || prev.owner?.dob, 
                                 bloodType: result.bloodType || prev.owner?.bloodType, 
                                 province: result.province || prev.owner?.province, 
                                 directorate: result.directorate || prev.owner?.directorate, 
                                 idIssuePlace: result.idIssuePlace || prev.owner?.idIssuePlace,
                                 birthPlace: smartBirthPlace || prev.owner?.birthPlace,
                                 nationality: 'يمني' // الجنسية للكل يمني
                               },
                               address: { 
                                 ...prev.address, 
                                 province: result.province || prev.address?.province, 
                                 directorate: result.directorate || prev.address?.directorate 
                               }
                             }));
                             
                             triggerFieldHighlight(['ownerName', 'idNumber', 'idType', 'dob', 'province', 'directorate', 'idIssuePlace', 'birthPlace']); 
                             onNotify("تم سحب بيانات الهوية بنجاح", "success");
                           } catch (err) { onNotify("فشل في مسح الهوية، يرجى المحاولة بصورة أوضح", "error"); } finally { setIsScanningId(false); }
                         }; reader.readAsDataURL(file);
                       }; i.click();
                     }}>
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-8 shadow-inner ${isScanningId ? 'bg-blue-600 animate-pulse text-white' : 'bg-blue-50/10 text-blue-600'}`}>{isScanningId ? '⏳' : '🆔'}</div>
                     <h5 className="text-2xl font-black mb-2 dark:text-white leading-normal">مسح الهوية رقمياً</h5>
                     <p className="text-slate-400 text-[11px] font-bold">AI OCR EXTRACTION (YEMEN)</p>
                  </div>
                  <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[3.5rem] border border-slate-100 dark:border-white/5 flex flex-col items-center shadow-sm">
                     <h5 className="font-black text-slate-400 mb-8 text-[12px] uppercase">صورة المالك الشخصية</h5>
                     <div onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:any)=>{
                       const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => { const imgData = r.result as string; updateSection('owner', { ownerPhoto: imgData }); autoAttachPhoto(imgData); onNotify("تم إرفاق صورة المالك", "info"); }; r.readAsDataURL(f); }
                     }; i.click(); }} className="w-40 h-52 lg:w-56 lg:h-72 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-blue-500 group relative shadow-inner">
                       {formData.owner?.ownerPhoto ? <img src={formData.owner.ownerPhoto} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">📸</span><p className="text-[11px] font-black">انقر للالتقاط</p></div>}
                     </div>
                  </div>
               </div>
             </div>
            )}

            {step === 2 && (
              <div className="space-y-12">
                <SectionTitle t="تفاصيل الهوية الرسمية" s="توثيق بيانات الإصدار والنوع" />
                <div className="bg-white dark:bg-[#0f172a]/40 p-8 lg:p-14 rounded-[4rem] border border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
                   <SmartFilteredSelect label="نوع وثيقة الإثبات" value={formData.owner?.idType} isHighlighted={highlightedFields.includes('idType')} onChange={(v:string) => updateSection('owner', {idType: v})} options={['بطاقة شخصية', 'جواز سفر', 'سجل تجاري', 'رقم عسكري']} color={currentTheme} />
                   <SmartHybridInput label="مكان إصدار الوثيقة" value={formData.owner?.idIssuePlace} isHighlighted={highlightedFields.includes('idIssuePlace')} onChange={(v:string) => updateSection('owner', {idIssuePlace: v})} color={currentTheme} suggestions={Object.keys(YEMEN_ATLAS)} icon="🏛️" />
                   <div className="md:col-span-2">
                     <SmartHybridInput label="محل الميلاد (المحافظة والمديرية)" value={formData.owner?.birthPlace} isHighlighted={highlightedFields.includes('birthPlace')} onChange={(v:string) => updateSection('owner', {birthPlace: v})} color={currentTheme} icon="👶" placeholder="يتم ملؤه آلياً عند المسح" />
                   </div>
                   <SmartHybridInput label="الجنسية" value={formData.owner?.nationality} onChange={(v:string) => updateSection('owner', {nationality: v})} color={currentTheme} suggestions={SUGGESTIONS.nationalities} icon="🇾🇪" />
                   <SmartFilteredSelect label="فصيلة الدم" value={formData.owner?.bloodType} onChange={(v:string) => updateSection('owner', {bloodType: v})} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} color={currentTheme} icon="🩸" isHighlighted={highlightedFields.includes('bloodType')} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12">
                <SectionTitle t="تحديد الموقع الجغرافي" s="ربط المالك بالعنوان الفعلي لسهولة الوصول" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <SmartFilteredSelect label="المحافظة" value={formData.address?.province} onChange={(v:string) => updateSection('address', {province: v})} options={Object.keys(YEMEN_ATLAS)} color={currentTheme} isHighlighted={highlightedFields.includes('province')} />
                   <SmartFilteredSelect label="المديرية" value={formData.address?.directorate} onChange={(v:string) => updateSection('address', {directorate: v})} options={YEMEN_ATLAS[formData.address?.province || ''] || []} color={currentTheme} isHighlighted={highlightedFields.includes('directorate')} />
                   <SmartHybridInput label="الحي / القرية" value={formData.address?.city} onChange={(v:string) => updateSection('address', {city: v})} color={currentTheme} />
                   <div className="md:col-span-2 lg:col-span-3">
                     <SmartHybridInput label="العنوان السكني بالكامل" value={formData.address?.fullAddress} onChange={(v:string) => updateSection('address', {fullAddress: v})} color={currentTheme} />
                   </div>
                   <SmartHybridInput label="رقم الجوال الأساسي" value={formData.address?.phone1} isHighlighted={highlightedFields.includes('phone1')} onChange={(v:string) => updateSection('address', {phone1: v})} color={currentTheme} />
                   <SmartHybridInput label="رقم تواصل بديل" value={formData.address?.phone2} onChange={(v:string) => updateSection('address', {phone2: v})} color={currentTheme} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12">
                <SectionTitle t="الشهود والمعرفين الميدانيين" s="توثيق بيانات المعرفين مع استنتاج صلة القرابة ذكياً" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <WitnessPremiumCard label="المعرف الميداني الأول" witness={formData.witnesses?.w1} onScan={() => { 
                     const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=async(e:any)=>{ 
                       const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onloadend=async()=>{ 
                         const imgData = r.result as string; 
                         const result = await analyzeWitnessIdCard(imgData, formData.owner?.name); 
                         autoAttachPhoto(imgData); 
                         updateSection('witnesses', { w1: { ...formData.witnesses?.w1, name: result.name, nationalId: result.idNumber, relation: result.relation } }); 
                         onNotify(`تم التعرف على الشاهد: ${result.name} (${result.relation})`, "success"); 
                       }; r.readAsDataURL(f); 
                     }; i.click(); 
                   }} onChange={(v:any) => updateSection('witnesses', { w1: { ...formData.witnesses?.w1, ...v } })} color={currentTheme} />
                   
                   <WitnessPremiumCard label="المعرف الميداني الثاني" witness={formData.witnesses?.w2} onScan={() => { 
                     const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=async(e:any)=>{ 
                       const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onloadend=async()=>{ 
                         const imgData = r.result as string; 
                         const result = await analyzeWitnessIdCard(imgData, formData.owner?.name); 
                         autoAttachPhoto(imgData); 
                         updateSection('witnesses', { w2: { ...formData.witnesses?.w2, name: result.name, nationalId: result.idNumber, relation: result.relation } }); 
                         onNotify(`تم التعرف على الشاهد: ${result.name} (${result.relation})`, "success"); 
                       }; r.readAsDataURL(f); 
                     }; i.click(); 
                   }} onChange={(v:any) => updateSection('witnesses', { w2: { ...formData.witnesses?.w2, ...v } })} color="slate" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <SectionTitle t="اختيار رقم اللوحة والبيانات الفنية" s="تخصيص الهوية الرقمية للمركبة من المخزون المتاح" />
                <div className="flex flex-col items-center mb-16 relative">
                   <div className={`relative w-full max-w-[580px] h-52 lg:h-64 border-[12px] rounded-[3.5rem] lg:rounded-[4rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-700 ${plateBgClass}`}>
                      <div className="h-1/3 w-full flex items-center justify-between px-10 lg:px-14 border-b border-white/10">
                        <div className="flex flex-col items-center leading-none"><span className="font-black text-sm lg:text-lg">اليمن</span><span className="text-[8px] lg:text-[10px] font-black opacity-60 uppercase">YEMEN</span></div>
                        <div className="flex flex-col items-center leading-none"><span className="font-black text-2xl lg:text-4xl">{pType === PlateType.PRIVATE ? 'خصوصي' : 'نقل عام'}</span><span className="text-[8px] lg:text-[10px] font-bold opacity-40 uppercase tracking-[0.1em]">{pType === PlateType.PRIVATE ? 'PRIVATE' : 'TRANSPORT'}</span></div>
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center text-xl lg:text-3xl shadow-inner border border-white/10">🚔</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-white relative">
                        <span className={`text-7xl lg:text-[130px] font-black text-slate-900 pr-4 drop-shadow-md transition-all ${!formData.vehicle?.plateNumber ? 'opacity-10 animate-pulse' : 'opacity-100'}`}>
                          {formData.vehicle?.plateNumber || '00000'}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a]/40 p-8 lg:p-14 rounded-[4rem] border dark:border-white/5 shadow-sm space-y-12">
                   <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b dark:border-white/5 pb-10">
                      <div>
                        <h4 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white mb-2 leading-normal">منتقي الأرقام المتوفرة</h4>
                        <p className="text-xs text-rose-500 font-bold">ملاحظة: اللوحات المصروفة مسبقاً لملاك آخرين لن تظهر هنا.</p>
                      </div>
                      <div className="relative w-full xl:w-[450px]">
                        <input type="text" placeholder="ابحث عن رقم محدد..." className={`w-full bg-slate-50 dark:bg-[#1e293b] border-2 p-5 pr-14 rounded-[2.2rem] outline-none transition-all font-black text-xl dark:text-white focus:ring-8 focus:ring-${currentTheme}-500/5 ${formData.vehicle?.plateNumber ? 'border-emerald-500/50' : 'border-slate-100 dark:border-white/10'}`} value={plateSearchQuery} onChange={e => setPlateSearchQuery(e.target.value)} />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 text-2xl">🔍</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5 max-h-[450px] overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-[3rem] border border-slate-100/50 dark:border-white/5">
                      {filteredPlatesForCurrentType.length > 0 ? filteredPlatesForCurrentType.map(plate => (
                        <div key={plate.id} onClick={() => { updateSection('vehicle', { plateNumber: plate.number }); onNotify(`تم اختيار اللوحة: ${plate.number}`, "info"); }} className={`cursor-pointer group relative rounded-[2.2rem] border-2 transition-all p-4 flex flex-col items-center justify-center h-32 gap-1 overflow-hidden ${formData.vehicle?.plateNumber === plate.number ? `bg-${currentTheme}-600 border-${currentTheme}-600 shadow-xl scale-105 z-10` : 'bg-white dark:bg-[#0f172a] border-slate-100 dark:border-white/5 hover:border-blue-500/50'}`}>
                           <span className={`text-3xl font-black transition-colors ${formData.vehicle?.plateNumber === plate.number ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plate.number}</span>
                           {formData.vehicle?.plateNumber === plate.number && <div className="absolute top-2 right-2 bg-white/20 w-8 h-8 rounded-full flex items-center justify-center animate-in zoom-in"><span className="text-white text-sm font-black">✓</span></div>}
                        </div>
                      )) : <div className="col-span-full py-20 text-center"><p className="text-slate-400 font-black text-sm uppercase">لا توجد أرقام متاحة حالياً</p></div>}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t dark:border-white/5 pt-12">
                      <SmartHybridInput label="ماركة المركبة" value={formData.vehicle?.brand} isHighlighted={highlightedFields.includes('brand')} onChange={(v:string) => updateSection('vehicle', {brand: v})} color={currentTheme} suggestions={SUGGESTIONS.brands} />
                      <SmartHybridInput label="موديل المركبة" value={formData.vehicle?.model} isHighlighted={highlightedFields.includes('model')} onChange={(v:string) => updateSection('vehicle', {model: v})} color={currentTheme} />
                      <SmartHybridInput label="رقم القعادة" value={formData.vehicle?.chassisNumber} isHighlighted={highlightedFields.includes('chassisNumber')} onChange={(v:string) => updateSection('vehicle', {chassisNumber: v})} color={currentTheme} />
                      <SmartHybridInput label="سنة الصنع" value={formData.vehicle?.manufactureYear} isHighlighted={highlightedFields.includes('manufactureYear')} onChange={(v:string) => updateSection('vehicle', {manufactureYear: v})} color={currentTheme} />
                   </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-12">
                <SectionTitle t="أرشفة البيانات الجمركية والاعتمادات" s="توثيق بيانات المنفذ وتعيين أسماء المسؤولين" />
                <div className={`p-10 lg:p-14 rounded-[4rem] border-4 border-dashed transition-all flex flex-col items-center justify-center text-center group cursor-pointer shadow-sm mb-10 ${isScanningCustoms ? 'bg-slate-900 border-blue-500 shadow-xl' : 'bg-white dark:bg-[#1e293b] border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#1e293b]/80'}`} onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=async(e:any)=>{ const f=e.target.files[0]; if(!f) return; setIsScanningCustoms(true); const r=new FileReader(); r.onloadend=async()=>{ const imgData = r.result as string; try { const result=await analyzeCustomsStatement([imgData]); autoAttachPhoto(imgData); updateSection('customs', { statementNumber: result.statementNumber, date: result.date, entity: result.entity }); updateSection('vehicle', { brand: result.brand, model: result.model, chassisNumber: result.chassisNumber, engineNumber: result.engineNumber, manufactureYear: result.manufactureYear, primaryColor: result.color }); triggerFieldHighlight(['statementNumber', 'chassisNumber', 'brand', 'model']); onNotify("تم استخراج بيانات البيان الجمركي بنجاح", "success"); } catch(e) { onNotify("فشل في معالجة الوثيقة الجمركية", "error"); } finally { setIsScanningCustoms(false); } }; r.readAsDataURL(f); }; i.click(); }}>
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-2xl transition-all ${isScanningCustoms ? 'bg-blue-600 text-white animate-pulse scale-110' : 'bg-blue-50 dark:bg-slate-900 text-blue-500'}`}>{isScanningCustoms ? '⏳' : '📦'}</div>
                   <h5 className="text-2xl font-black dark:text-white leading-normal">مسح البيان الجمركي آلياً</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b dark:border-white/5 pb-12">
                   <SmartHybridInput label="رقم البيان الجمركي" value={formData.customs?.statementNumber} isHighlighted={highlightedFields.includes('statementNumber')} onChange={(v:string) => updateSection('customs', {statementNumber: v})} color={currentTheme} />
                   <SmartSegmentedDate label="تاريخ البيان" value={formData.customs?.date} onChange={(v:string) => updateSection('customs', {date: v})} color={currentTheme} />
                   <SmartHybridInput label="جهة إصدار البيان" value={formData.customs?.entity} isHighlighted={highlightedFields.includes('entity')} onChange={(v:string) => updateSection('customs', {entity: v})} color={currentTheme} suggestions={['جمارك عدن', 'جمارك الحديدة', 'منفذ شحن', 'منفذ الوديعة']} />
                </div>

                <div className="space-y-8 bg-slate-50 dark:bg-slate-950/20 p-10 rounded-[4rem] border dark:border-white/5">
                   <h4 className="text-xl font-black text-slate-800 dark:text-white leading-normal">الاعتمادات الإدارية (توقيع الاستمارة)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <SmartHybridInput label="اسم المختص الفني" value={formData.signatures?.technicalSpecialist} onChange={(v:string) => updateSection('signatures', {technicalSpecialist: v})} color={currentTheme} placeholder="مثال: م. خالد سعيد" />
                      <SmartHybridInput label="رئيس القسم الفني" value={formData.signatures?.technicalHead} onChange={(v:string) => updateSection('signatures', {technicalHead: v})} color={currentTheme} placeholder="مثال: عقيد/ محمد علي" />
                      <SmartHybridInput label="مدير الإصدار الآلي" value={formData.signatures?.issueManager} onChange={(v:string) => updateSection('signatures', {issueManager: v})} color={currentTheme} placeholder="مثال: عميد/ قاسم محمد" />
                   </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-12">
                <SectionTitle t="المرفقات والمراجعة النهائية" s="التحقق من اكتمال الرصد وإضافة صور المركبة" />
                <div className="bg-white dark:bg-[#0f172a]/40 p-10 lg:p-16 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-sm">
                   <div className="flex flex-col sm:flex-row justify-between items-center mb-14 gap-8">
                      <h5 className="font-black text-2xl dark:text-white leading-normal">أرشيف الصور التلقائي</h5>
                      <button type="button" onClick={() => { const i = document.createElement('input'); i.type='file'; i.multiple=true; i.accept='image/*'; i.onchange=(e:any)=>{
                        const files = e.target.files; if(!files) return;
                        Array.from(files).forEach((f: any) => { const r = new FileReader(); r.onloadend = () => autoAttachPhoto(r.result as string); r.readAsDataURL(f); });
                        onNotify(`تم إرفاق ${files.length} صور إضافية`, "success");
                      }; i.click(); }} className={`w-full sm:w-auto px-12 py-6 rounded-[2rem] text-white font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${pType === PlateType.PRIVATE ? 'bg-blue-600 shadow-blue-500/30' : 'bg-rose-600 shadow-rose-500/30'}`}>
                        <span>إضافة صور إضافية</span>
                        <span className="text-xl">➕</span>
                      </button>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
                      {formData.additionalPhotos?.map((p, i) => (
                        <div key={i} className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl group relative hover:border-blue-500 transition-all">
                           <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                           <button type="button" onClick={() => { setFormData(prev => ({...prev, additionalPhotos: prev.additionalPhotos?.filter((_, idx) => idx !== i)})); onNotify("تم حذف المرفق", "warning"); }} className="absolute inset-0 bg-rose-600/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white font-black transition-opacity">
                             <span className="text-3xl mb-2">🗑️</span><span className="text-[10px] uppercase">حذف المرفق</span>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>

          <footer className="p-5 lg:p-12 border-t border-slate-100 dark:border-white/5 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-3xl flex items-center justify-between gap-4 fixed bottom-0 left-0 right-0 lg:absolute z-[200]">
             <button 
               type="button"
               onClick={handleExitProcess} 
               className="text-slate-400 dark:text-slate-500 font-black px-6 py-4 lg:px-10 lg:py-5 text-[13px] lg:text-sm hover:text-rose-500 transition-colors shrink-0 flex items-center gap-2 group"
             >
                <span className="text-lg group-hover:rotate-90 transition-transform">✕</span>
                <span>إلغاء وخروج نهائي</span>
             </button>
             
             <div className="flex gap-4 flex-1 justify-end items-center">
                {step > 1 && (
                  <button type="button" onClick={handlePrevStep} className="px-8 py-5 lg:px-16 lg:py-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[12px] lg:text-sm transition-all active:scale-95 border dark:border-white/5">رجوع للخلف</button>
                )}
                <button type="button" onClick={() => step === 7 ? handleFinalSave() : handleNextStep()} className={`min-h-[60px] lg:min-h-[72px] px-12 py-5 lg:px-32 lg:py-6 rounded-full text-white font-black text-sm lg:text-xl shadow-2xl transition-all active:scale-95 flex items-center gap-6 ${themeClass}`}>
                  <span>{step === 7 ? 'حفظ الأرشفة الميدانية' : 'المتابعة ➔'}</span>
                </button>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default OfficialFormWizard;
