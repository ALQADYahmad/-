
import React, { useState, useMemo, useEffect } from 'react';
import { VehicleRecord, TransactionStatus, Plate, User, PlateStatus, Document, MubaiyaaDetails } from '../types';
import { STATUS_CONFIG } from '../constants';

const SUGGESTIONS = {
  brands: ['TOYOTA', 'HYUNDAI', 'ISUZU', 'MERCEDES-BENZ', 'NISSAN', 'KIA', 'HONDA', 'MITSUBISHI', 'LEXUS', 'MAZDA', 'JEEP'],
  colors: ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'ذهبي', 'بني', 'أخضر', 'لؤلؤي'],
  vehicleTypes: ['خصوصي', 'أجرة', 'نقل', 'معدات ثقيلة', 'دراجة نارية']
};

interface RecordFormProps {
  onAdd: (record: Partial<VehicleRecord>) => void;
  onCancel: () => void;
  user: User;
  assignedPlates: Plate[];
  defaultFee: number;
  initialData?: Partial<VehicleRecord>; 
}

const RecordForm: React.FC<RecordFormProps> = ({ onAdd, onCancel, user, assignedPlates, defaultFee, initialData }) => {
  const [step, setStep] = useState(1);
  const availablePlates = useMemo(() => assignedPlates.filter(p => p.status === PlateStatus.ASSIGNED || p.id === initialData?.plateId), [assignedPlates, initialData]);

  const [formData, setFormData] = useState({
    ownerName: initialData?.ownerName || '',
    ownerPhone: initialData?.ownerPhone || '',
    vehicleName: initialData?.vehicleName || '',
    vehicleType: initialData?.vehicleType || '',
    vehicleModel: initialData?.vehicleModel || '',
    plateId: initialData?.plateId || '',
    totalAmount: initialData?.totalAmount || defaultFee,
    status: TransactionStatus.WAITING_REVIEW,
    feesPaid: false,
    hasDebt: false,
    debtAmount: 0,
    hasMubaiyaa: !!initialData?.mubaiyaaDetails,
    mubaiyaaDetails: {
      saleNumber: initialData?.mubaiyaaDetails?.saleNumber || '',
      saleDate: initialData?.mubaiyaaDetails?.saleDate || '',
      color: initialData?.mubaiyaaDetails?.color || '',
      chassisNumber: initialData?.mubaiyaaDetails?.chassisNumber || '',
      engineNumber: initialData?.mubaiyaaDetails?.engineNumber || '',
      sellerName: initialData?.mubaiyaaDetails?.sellerName || '',
      sellerPhone: ''
    } as MubaiyaaDetails,
    documents: (initialData?.documents || []) as Document[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ownerName: initialData.ownerName || prev.ownerName,
        ownerPhone: initialData.ownerPhone || prev.ownerPhone,
        vehicleName: initialData.vehicleName || prev.vehicleName,
        vehicleModel: initialData.vehicleModel || prev.vehicleModel,
        vehicleType: initialData.vehicleType || prev.vehicleType,
        plateId: initialData.plateId || prev.plateId,
        documents: initialData.documents ? [...(initialData.documents as any)] : prev.documents,
        mubaiyaaDetails: initialData.mubaiyaaDetails ? { ...prev.mubaiyaaDetails, ...initialData.mubaiyaaDetails } : prev.mubaiyaaDetails,
        hasMubaiyaa: !!initialData.mubaiyaaDetails
      }));
    }
  }, [initialData]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2 && !formData.hasMubaiyaa) setStep(4);
    else if (step < 4) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step === 4 && !formData.hasMubaiyaa) setStep(2);
    else if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlate = availablePlates.find(p => p.id === formData.plateId);
    if (!selectedPlate) return alert('يرجى اختيار رقم اللوحة المخصصة للمركبة');
    
    onAdd({
      ...formData,
      plateNumber: selectedPlate?.number || '',
      registrationDate: new Date().toISOString(),
      sequenceNumber: `TRX-${Date.now().toString().slice(-6)}`,
      committeeId: user.committeeId || '',
      isCompleted: formData.status === TransactionStatus.COMPLETED,
      isReceivedByAdmin: true,
      history: [{
        id: `h-init-${Date.now()}`,
        status: 'تحويل مع تخصيص الحالة',
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        note: `تم سحب البيانات وتحديد حالة المعاملة كـ (${STATUS_CONFIG[formData.status].label})`
      }]
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[250] flex items-center justify-center p-0 sm:p-4 lg:p-10 overflow-hidden font-['Cairo'] text-right" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden border dark:border-slate-800 animate-in zoom-in-95">
        
        <div className="lg:w-72 bg-[#0f172a] p-6 lg:p-10 text-white flex flex-row lg:flex-col items-center lg:items-start shrink-0 overflow-x-auto lg:overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-l border-white/5">
          <div className="hidden lg:block mb-10">
            <h2 className="text-xl font-black mb-1 leading-normal">اعتماد المعاملة</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">تخصيص المسار المالي</p>
          </div>
          <div className="flex lg:flex-col gap-4 lg:gap-6 flex-1 items-center lg:items-stretch">
            <StepIndicator n={1} t="المالك" a={step === 1} c={step > 1} />
            <StepIndicator n={2} t="اللوحة" a={step === 2} c={step > 2} />
            {formData.hasMubaiyaa && <StepIndicator n={3} t="المركبة" a={step === 3} c={step > 3} />}
            <StepIndicator n={4} t="الحالة" a={step === 4} c={step > 4} />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
          <div className="flex-1 p-6 lg:p-14 overflow-y-auto custom-scrollbar">
            <form onSubmit={step === 4 ? handleSubmit : handleNext} className="space-y-8 max-w-3xl mx-auto">
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <SectionTitle t="مراجعة بيانات المالك" s="تحقق من دقة الاسم المستورد من الأرشيف الميداني" />
                  <InputGroup label="اسم المالك المعتمد" value={formData.ownerName} onChange={(v: string) => setFormData({...formData, ownerName: v})} />
                  <InputGroup label="رقم الجوال" value={formData.ownerPhone} onChange={(v: string) => setFormData({...formData, ownerPhone: v})} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <SectionTitle t="تخصيص رقم اللوحة" s="اختر اللوحة من العهدة المخصصة للجنة" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="الماركة" value={formData.vehicleName} onChange={(v: string) => setFormData({...formData, vehicleName: v})} suggestions={SUGGESTIONS.brands} />
                    <InputGroup label="الموديل" value={formData.vehicleModel} onChange={(v: string) => setFormData({...formData, vehicleModel: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 pr-2 block">رقم اللوحة من العهدة</label>
                    <select required className="w-full bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 p-4 rounded-2xl font-black text-2xl text-blue-600 outline-none focus:border-blue-500 transition-all shadow-inner" value={formData.plateId} onChange={e => setFormData({...formData, plateId: e.target.value})}>
                      <option value="">-- اختر رقم اللوحة --</option>
                      {availablePlates.map(p => <option key={p.id} value={p.id}>{p.number} ({p.type === 'PRIVATE' ? 'خصوصي' : 'نقل'})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <SectionTitle t="تفاصيل المركبة" s="الأرقام التسلسلية للمحرك والهيكل" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="رقم الهيكل (Chassis)" value={formData.mubaiyaaDetails.chassisNumber} onChange={(v: string) => setFormData({...formData, mubaiyaaDetails: {...formData.mubaiyaaDetails, chassisNumber: v}})} />
                    <InputGroup label="رقم المحرك" value={formData.mubaiyaaDetails.engineNumber} onChange={(v: string) => setFormData({...formData, mubaiyaaDetails: {...formData.mubaiyaaDetails, engineNumber: v}})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="لون المركبة" value={formData.mubaiyaaDetails.color} onChange={(v: string) => setFormData({...formData, mubaiyaaDetails: {...formData.mubaiyaaDetails, color: v}})} suggestions={SUGGESTIONS.colors} />
                    <SegmentedDateInput 
                      label="تاريخ المبايعة" 
                      value={formData.mubaiyaaDetails.saleDate} 
                      onChange={(v: string) => setFormData({...formData, mubaiyaaDetails: {...formData.mubaiyaaDetails, saleDate: v}})} 
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                  <SectionTitle t="تخصيص الحالة المالية والإدارية" s="تحديد وضع المعاملة النهائي والمديونيات" />
                  
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-500 pr-2">الحالة الإدارية الأولية</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(TransactionStatus).map(([key, val]) => (
                          <button 
                            key={val} 
                            type="button"
                            onClick={() => setFormData({...formData, status: val})}
                            className={`p-4 rounded-2xl text-[12px] font-black border-2 transition-all leading-none ${formData.status === val ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                          >
                            {STATUS_CONFIG[val].label}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <ToggleButton label="تم تسديد الرسوم" checked={formData.feesPaid} onChange={(v:any) => setFormData({...formData, feesPaid: v})} />
                    <ToggleButton label="تثبيت مديونية" checked={formData.hasDebt} color="rose" onChange={(v:any) => setFormData({...formData, hasDebt: v})} />
                  </div>

                  {formData.hasDebt && (
                    <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 animate-in zoom-in-95">
                      <label className="text-[11px] font-black text-rose-500 block mb-3 uppercase">قيمة المديونية المستحقة</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl outline-none font-black text-3xl text-rose-600 border-2 border-rose-100 dark:border-rose-900/30"
                          value={formData.debtAmount}
                          onChange={e => setFormData({...formData, debtAmount: Number(e.target.value)})}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-rose-400">ر.س</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <footer className="p-6 lg:px-14 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
             <button type="button" onClick={onCancel} className="w-full sm:w-auto text-slate-400 font-black hover:text-rose-500 py-3 text-sm transition-colors px-6 uppercase">إلغاء المعاملة ✖</button>
             <div className="flex gap-3 w-full sm:w-auto">
                {step > 1 && (
                  <button type="button" onClick={handlePrev} className="flex-1 sm:flex-none px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs transition-all">رجوع للخلف</button>
                )}
                <button 
                  type="button"
                  onClick={step === 4 ? handleSubmit : handleNext} 
                  className="flex-1 sm:flex-none px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 text-sm hover:scale-105 transition-all"
                >
                  {step < 4 ? 'الخطوة التالية ➔' : 'تأكيد واعتماد المعاملة'}
                </button>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ t, s }: any) => (
  <div>
    <h3 className="text-xl lg:text-3xl font-black text-slate-800 dark:text-white leading-normal">{t}</h3>
    <p className="text-slate-400 text-[10px] lg:text-xs font-bold mt-1 uppercase tracking-wide">{s}</p>
  </div>
);

const InputGroup = ({ label, value, onChange, type = 'text', suggestions = [] }: any) => {
  const listId = `list-trx-${label.replace(/\s+/g, '-')}`;
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-500 pr-2 uppercase">{label}</label>
      <div className="relative">
        <input 
          list={suggestions.length > 0 ? listId : undefined}
          required 
          type={type} 
          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-white shadow-sm text-sm transition-all" 
          value={value} 
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

const SegmentedDateInput = ({ label, value, onChange }: any) => {
  const d = value ? new Date(value) : null;
  const [day, setDay] = useState(d && !isNaN(d.getTime()) ? d.getDate().toString() : "");
  const [month, setMonth] = useState(d && !isNaN(d.getTime()) ? (d.getMonth() + 1).toString() : "");
  const [year, setYear] = useState(d && !isNaN(d.getTime()) ? d.getFullYear().toString() : "");

  useEffect(() => {
    if (day && month && year) {
      const formattedMonth = month.padStart(2, '0');
      const formattedDay = day.padStart(2, '0');
      onChange(`${year}-${formattedMonth}-${formattedDay}`);
    }
  }, [day, month, year]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() + 2 - i).toString());

  return (
    <div className="space-y-2 flex-1">
      <label className="text-[11px] font-black text-slate-500 pr-2 uppercase">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <select value={day} onChange={e => setDay(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-3 rounded-xl outline-none font-bold text-xs dark:text-white appearance-none text-center">
          <option value="">يوم</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-3 rounded-xl outline-none font-bold text-xs dark:text-white appearance-none text-center">
          <option value="">شهر</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-3 rounded-xl outline-none font-bold text-xs dark:text-white appearance-none text-center">
          <option value="">سنة</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
};

const StepIndicator = ({ n, t, a, c }: any) => (
  <div className={`flex items-center gap-3 transition-all duration-300 shrink-0 ${a ? 'opacity-100 scale-105' : 'opacity-30'}`}>
    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center font-black text-[11px] lg:text-sm ${a ? 'bg-blue-600 text-white shadow-lg' : c ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'}`}>
      {c ? '✓' : n}
    </div>
    <span className="font-black text-[12px] lg:text-sm hidden sm:block whitespace-nowrap">{t}</span>
  </div>
);

const ToggleButton = ({ label, checked, onChange, color = 'blue' }: any) => {
  const activeClass = color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-rose-600 text-white shadow-rose-500/30';
  return (
    <button 
      type="button"
      onClick={() => onChange(!checked)}
      className={`p-5 rounded-2xl border-2 font-black text-[13px] transition-all flex items-center justify-between leading-none ${checked ? activeClass : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
    >
       <span>{label}</span>
       <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${checked ? 'bg-white border-white' : 'border-slate-200'}`}>
          {checked && <div className={`w-2 h-2 rounded-full ${color === 'blue' ? 'bg-blue-600' : 'bg-rose-600'}`}></div>}
       </div>
    </button>
  );
};

export default RecordForm;
