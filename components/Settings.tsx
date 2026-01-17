
import React, { useState } from 'react';
import { SystemSettings, Committee, OfficialFormLabels } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (updates: Partial<SystemSettings>) => void;
  committees: Committee[];
  onAddCommittee: (name: string, region: string) => void;
  onUpdateCommittee: (id: string, name: string, region: string) => void;
  onDeleteCommittee: (id: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, committees, onAddCommittee, onUpdateCommittee, onDeleteCommittee, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'LABELS' | 'FINANCE' | 'COMMITTEES'>('IDENTITY');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [committeeName, setCommitteeName] = useState('');
  const [committeeRegion, setCommitteeRegion] = useState('');

  const handleUpdateLabel = (key: keyof OfficialFormLabels, value: string) => {
    onUpdateSettings({
      formLabels: { ...settings.formLabels, [key]: value }
    });
  };

  const handleSaveCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCommittee) {
      onUpdateCommittee(editingCommittee.id, committeeName, committeeRegion);
      onNotify?.("تم تحديث بيانات اللجنة بنجاح", "success");
    } else {
      onAddCommittee(committeeName, committeeRegion);
      onNotify?.("تم إضافة اللجنة الجديدة بنجاح", "success");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 font-['Cairo']">
      
      {/* Navigation Tabs */}
      <div className="lg:w-72 shrink-0 space-y-2">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-4">
            <h2 className="text-xl font-black text-slate-800">الإعدادات</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">لوحة التحكم المتقدمة</p>
         </div>
         <TabButton active={activeTab === 'IDENTITY'} onClick={() => setActiveTab('IDENTITY')} icon="🆔" label="هوية النظام" />
         <TabButton active={activeTab === 'LABELS'} onClick={() => setActiveTab('LABELS')} icon="🖋️" label="نصوص الاستمارة" />
         <TabButton active={activeTab === 'FINANCE'} onClick={() => setActiveTab('FINANCE')} icon="💰" label="الضوابط المالية" />
         <TabButton active={activeTab === 'COMMITTEES'} onClick={() => setActiveTab('COMMITTEES')} icon="🏢" label="إدارة اللجان" />
         
         <div className="pt-6">
            <button 
                onClick={() => onNotify?.('تم حفظ كافة التغييرات بنجاح', "success")}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
            >حفظ الكل</button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-8">
        
        {/* IDENTITY TAB */}
        {activeTab === 'IDENTITY' && (
          <section className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in zoom-in-95">
             <SectionHeader title="تخصيص الهوية" subtitle="تغيير المسميات العامة للمنظومة" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="اسم النظام البرمجي" value={settings.systemName} onChange={v => onUpdateSettings({systemName: v})} />
                <InputGroup label="اسم الإدارة/الجهة" value={settings.departmentName} onChange={v => onUpdateSettings({departmentName: v})} />
                <div className="md:col-span-2 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase pr-2 mb-2 block">مستوى حماية البيانات</label>
                    <div className="flex gap-2">
                       {['LOW', 'MEDIUM', 'HIGH'].map(lvl => (
                         <button key={lvl} onClick={() => onUpdateSettings({securityLevel: lvl as any})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${settings.securityLevel === lvl ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                           {lvl === 'LOW' ? 'أساسي' : lvl === 'MEDIUM' ? 'متقدم' : 'عسكري'}
                         </button>
                       ))}
                    </div>
                </div>
             </div>
          </section>
        )}

        {/* LABELS TAB */}
        {activeTab === 'LABELS' && (
          <section className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in zoom-in-95">
             <SectionHeader title="تخصيص نصوص الاستمارة" subtitle="تغيير مسميات الحقول في الاستمارة الرسمية والطباعة" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LabelInput label="حقل اسم المالك" value={settings.formLabels.ownerName} onChange={v => handleUpdateLabel('ownerName', v)} />
                <LabelInput label="حقل تاريخ الميلاد" value={settings.formLabels.ownerDob} onChange={v => handleUpdateLabel('ownerDob', v)} />
                <LabelInput label="حقل رقم الهوية" value={settings.formLabels.ownerIdNumber} onChange={v => handleUpdateLabel('ownerIdNumber', v)} />
                <LabelInput label="حقل ماركة المركبة" value={settings.formLabels.vehicleBrand} onChange={v => handleUpdateLabel('vehicleBrand', v)} />
                <LabelInput label="حقل الموديل" value={settings.formLabels.vehicleModel} onChange={v => handleUpdateLabel('vehicleModel', v)} />
                <LabelInput label="حقل رقم القعادة" value={settings.formLabels.vehicleChassis} onChange={v => handleUpdateLabel('vehicleChassis', v)} />
                <LabelInput label="حقل رقم المكينة" value={settings.formLabels.vehicleEngine} onChange={v => handleUpdateLabel('vehicleEngine', v)} />
                <LabelInput label="حقل اللون" value={settings.formLabels.vehicleColor} onChange={v => handleUpdateLabel('vehicleColor', v)} />
                <LabelInput label="حقل رقم البيان" value={settings.formLabels.customsStatement} onChange={v => handleUpdateLabel('customsStatement', v)} />
             </div>
             <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase leading-relaxed">💡 ملاحظة: التغييرات هنا ستظهر فوراً في واجهة إدخال النموذج المرصود وفي ملف الطباعة النهائي لضمان مرونة النظام مع المتغيرات الإدارية.</p>
             </div>
          </section>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'FINANCE' && (
          <section className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in zoom-in-95">
             <SectionHeader title="الإدارة المالية المتقدمة" subtitle="تحديد الرسوم والعملات والضرائب" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b pb-2">رسوم اللوحات (حسب الفئة)</h4>
                    <InputGroup label="رسوم اللوحة الخصوصي" type="number" value={settings.privatePlateFee} onChange={v => onUpdateSettings({privatePlateFee: Number(v)})} />
                    <InputGroup label="رسوم اللوحة النقل" type="number" value={settings.transportPlateFee} onChange={v => onUpdateSettings({transportPlateFee: Number(v)})} />
                    <InputGroup label="رسوم لوحة الأجرة" type="number" value={settings.taxiPlateFee} onChange={v => onUpdateSettings({taxiPlateFee: Number(v)})} />
                </div>
                <div className="space-y-4">
                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest border-b pb-2">العملة والضرائب</h4>
                    <InputGroup label="عملة النظام" value={settings.currency} onChange={v => onUpdateSettings({currency: v})} />
                    <InputGroup label="سقف المديونية الحرجة" type="number" value={settings.debtThreshold} onChange={v => onUpdateSettings({debtThreshold: Number(v)})} />
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                        <span className="text-xs font-black text-slate-700">تفعيل الضريبة الحكومية (%)</span>
                        <input type="checkbox" checked={settings.taxEnabled} onChange={e => onUpdateSettings({taxEnabled: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                    </div>
                </div>
             </div>
          </section>
        )}

        {/* COMMITTEES TAB */}
        {activeTab === 'COMMITTEES' && (
          <section className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in zoom-in-95">
             <div className="flex justify-between items-center">
                <SectionHeader title="إدارة اللجان" subtitle="إضافة وتعديل بيانات لجان الترقيم الميدانية" />
                <button onClick={() => { setEditingCommittee(null); setCommitteeName(''); setCommitteeRegion(''); setIsModalOpen(true); }} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black">+ إضافة لجنة</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {committees.map(c => (
                  <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                     <div>
                        <h5 className="font-black text-slate-800 text-sm">{c.name}</h5>
                        <p className="text-[10px] text-slate-400 font-bold">{c.region}</p>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCommittee(c); setCommitteeName(c.name); setCommitteeRegion(c.region); setIsModalOpen(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-lg text-[10px]">تعديل</button>
                        <button onClick={() => { onDeleteCommittee(c.id); onNotify?.("تم حذف اللجنة", "warning"); }} className="p-2 bg-rose-100 text-rose-600 rounded-lg text-[10px]">حذف</button>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}
      </div>

      {/* Committee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <h3 className="text-xl font-black text-slate-800">{editingCommittee ? 'تعديل لجنة' : 'إضافة لجنة جديدة'}</h3>
              <InputGroup label="اسم اللجنة" value={committeeName} onChange={setCommitteeName} />
              <InputGroup label="المنطقة الجغرافية" value={committeeRegion} onChange={setCommitteeRegion} />
              <div className="flex gap-3 pt-4">
                 <button onClick={handleSaveCommittee} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs">حفظ</button>
                 <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white shadow-md text-blue-600 border border-blue-50' : 'text-slate-400 hover:bg-white/50'}`}>
     <span className="text-xl">{icon}</span>
     <span className="font-black text-sm">{label}</span>
  </button>
);

const SectionHeader = ({ title, subtitle }: any) => (
  <div>
    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{subtitle}</p>
  </div>
);

const InputGroup = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase pr-2">{label}</label>
    <input type={type} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const LabelInput = ({ label, value, onChange }: any) => (
  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group focus-within:border-blue-500/50 transition-all">
    <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">{label}</label>
    <input className="w-full bg-transparent outline-none font-black text-slate-800 text-xs" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

export default Settings;
