
import React, { useState, useEffect } from 'react';
import { VehicleRecord, TransactionStatus, User, UserRole, StatusLog } from '../types';
import { STATUS_CONFIG } from '../constants';

interface RecordDetailsProps {
  record: VehicleRecord;
  onClose: () => void;
  user: User;
  onUpdate: (id: string, updates: Partial<VehicleRecord>) => void;
  onDelete?: (id: string) => void;
  currency?: string;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, onClose, user, onUpdate, onDelete, currency = 'ر.س' }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const [editedData, setEditedData] = useState({
    ownerName: record.ownerName,
    ownerPhone: record.ownerPhone,
    vehicleName: record.vehicleName,
    vehicleModel: record.vehicleModel,
    vehicleType: record.vehicleType,
    plateNumber: record.plateNumber,
    totalAmount: record.totalAmount
  });

  useEffect(() => {
    setEditedData({
      ownerName: record.ownerName,
      ownerPhone: record.ownerPhone,
      vehicleName: record.vehicleName,
      vehicleModel: record.vehicleModel,
      vehicleType: record.vehicleType,
      plateNumber: record.plateNumber,
      totalAmount: record.totalAmount
    });
  }, [record]);

  const toggleCheck = (field: keyof VehicleRecord) => {
    if (!isAdmin) return;
    onUpdate(record.id, { [field]: !record[field] });
  };

  const handleSaveEdits = () => {
    const changes = [];
    if (editedData.ownerName !== record.ownerName) changes.push(`الاسم: ${record.ownerName} -> ${editedData.ownerName}`);
    if (editedData.plateNumber !== record.plateNumber) changes.push(`اللوحة: ${record.plateNumber} -> ${editedData.plateNumber}`);
    
    onUpdate(record.id, { 
      ...editedData,
      history: [
        ...record.history,
        {
          id: `h-edit-${Date.now()}`,
          status: 'تعديل بيانات فنية',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          note: `قام المسؤول بتعديل الحقول التالية: ${changes.join(' | ')}`
        }
      ]
    });
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const log: StatusLog = {
      id: `h-note-${Date.now()}`,
      status: 'ملاحظة إدارية',
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      note: newNote
    };
    onUpdate(record.id, { history: [...record.history, log] });
    setNewNote('');
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('تحذير: هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      onDelete(record.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-4 overflow-hidden font-['Cairo']" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full sm:h-[95vh] sm:rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-10 border dark:border-slate-800">
        
        {/* Header */}
        <header className="bg-slate-900 dark:bg-[#020617] text-white p-5 lg:px-10 flex justify-between items-center shrink-0 z-10 border-b dark:border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🚔</div>
            <div>
              <h2 className="text-sm lg:text-xl font-black truncate max-w-[250px]">{record.ownerName}</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{record.sequenceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all border border-white/5">تعديل الملف 📝</button>
            )}
            {isEditing && (
              <button onClick={handleSaveEdits} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20">حفظ التغييرات ✅</button>
            )}
            <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center">✕</button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/50 p-6 lg:p-10 custom-scrollbar pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-[11px] font-black mb-8 text-slate-400 uppercase tracking-widest border-b pb-3">البيانات الفنية والمالية</h3>
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-5">
                      <EditInput label="الاسم الكامل" value={editedData.ownerName} onChange={(v: string) => setEditedData({...editedData, ownerName: v})} />
                      <div className="grid grid-cols-2 gap-4">
                         <EditInput label="رقم الهاتف" value={editedData.ownerPhone} onChange={(v: string) => setEditedData({...editedData, ownerPhone: v})} />
                         <EditInput label="الرسوم المقررة" type="number" value={editedData.totalAmount} onChange={(v: string) => setEditedData({...editedData, totalAmount: Number(v)})} />
                      </div>
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                         <h4 className="text-[10px] font-black text-blue-600 uppercase">تعديل بيانات المركبة واللوحة</h4>
                         <EditInput label="رقم اللوحة" value={editedData.plateNumber} onChange={(v: string) => setEditedData({...editedData, plateNumber: v})} />
                         <div className="grid grid-cols-2 gap-4">
                            <EditInput label="ماركة المركبة" value={editedData.vehicleName} onChange={(v: string) => setEditedData({...editedData, vehicleName: v})} />
                            <EditInput label="موديل المركبة" value={editedData.vehicleModel} onChange={(v: string) => setEditedData({...editedData, vehicleModel: v})} />
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Detail label="اسم المالك المعتمد" value={record.ownerName} />
                      <div className="grid grid-cols-2 gap-4">
                         <Detail label="الجوال" value={record.ownerPhone} />
                         <Detail label="الرسوم" value={`${record.totalAmount.toLocaleString()} ${currency}`} highlight />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <Detail label="الماركة" value={record.vehicleName} />
                         <Detail label="الموديل" value={record.vehicleModel} />
                      </div>
                      <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest text-center">رقم اللوحة المصروفة</p>
                        <div className="bg-slate-900 dark:bg-black text-white py-6 rounded-[2rem] text-center text-4xl font-black tracking-[0.3em] shadow-2xl border-4 border-slate-800 dark:border-slate-900 transition-transform hover:scale-[1.02]">
                          {record.plateNumber}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {isAdmin && (
                <div className="p-1">
                   <button onClick={handleDelete} className="w-full py-5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl text-[11px] font-black border border-rose-100 dark:border-rose-900/30 transition-all hover:bg-rose-600 hover:text-white shadow-sm">حذف السجل نهائياً 🗑️</button>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-8">
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-10 border-b pb-5">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">المسار الإجرائي</h3>
                  <span className={`px-6 py-2.5 rounded-full text-[10px] font-black border-2 ${STATUS_CONFIG[record.status].color}`}>{STATUS_CONFIG[record.status].label}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CheckItem label="استلام من اللجنة" checked={record.isReceivedByAdmin} disabled={!isAdmin} onClick={() => toggleCheck('isReceivedByAdmin')} />
                  <CheckItem label="استلام الكرت" checked={record.isCardReceivedFromAdmin} disabled={!isAdmin} onClick={() => toggleCheck('isCardReceivedFromAdmin')} />
                  <CheckItem label="تسليم للمواطن" checked={record.isCardDeliveredToOwner} disabled={!isAdmin} onClick={() => toggleCheck('isCardDeliveredToOwner')} />
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[400px]">
                  <h3 className="text-[11px] font-black mb-8 text-slate-400 uppercase tracking-widest">سجل النشاط والملاحظات</h3>
                  <div className="flex-1 space-y-4 mb-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-3">
                    {record.history.length === 0 && <p className="text-center text-slate-300 dark:text-slate-700 py-10 text-sm">لا توجد ملاحظات</p>}
                    {record.history.map((log) => (
                      <div key={log.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-white/5 relative group transition-all hover:bg-white dark:hover:bg-slate-800">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg uppercase">{log.status}</span>
                          <span className="text-[8px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{log.note}</p>
                        <p className="text-[9px] font-black text-slate-400 mt-3 border-t pt-2 border-slate-100 dark:border-white/5">المحرر: {log.userName}</p>
                      </div>
                    ))}
                  </div>
                  {isAdmin && (
                    <div className="pt-6 border-t dark:border-slate-800">
                      <div className="relative">
                        <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] p-5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none h-28 dark:text-white"
                          placeholder="اكتب ملاحظة إدارية جديدة..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        <button 
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="absolute bottom-4 left-4 bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl"
                        >إضافة ملاحظة</button>
                      </div>
                    </div>
                  )}
                </section>

                <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-[11px] font-black mb-8 text-slate-400 uppercase tracking-widest">الأرشيف الرقمي (المرفقات)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {record.documents.map(doc => (
                      <div key={doc.id} className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden group relative border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                        {doc.imageData ? (
                          <img src={doc.imageData} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📄</div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 text-center transition-opacity">
                           <span className="text-[9px] text-white font-black leading-tight mb-2">{doc.name}</span>
                           <span className="text-[7px] text-blue-300 uppercase font-bold tracking-widest">عرض الوثيقة</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {record.documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                       <span className="text-6xl mb-4">📸</span>
                       <p className="text-[10px] font-black uppercase">لا توجد وثائق مؤرشفة</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, highlight = false }: any) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter pr-1">{label}</p>
    <p className={`text-sm font-black ${highlight ? 'text-blue-600 dark:text-blue-400 text-lg' : 'text-slate-800 dark:text-white'}`}>{value || '---'}</p>
  </div>
);

const EditInput = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-tighter">{label}</label>
    <input 
      type={type} 
      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-[1.2rem] text-sm font-black outline-none focus:border-blue-500/50 dark:text-white transition-all shadow-inner" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const CheckItem = ({ label, checked, disabled, onClick }: any) => (
  <button 
    disabled={disabled} 
    onClick={onClick} 
    className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all text-right group ${checked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 shadow-md shadow-emerald-500/5' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 hover:border-blue-500/30'} ${!disabled && 'active:scale-95'}`}
  >
    <span className="text-[11px] font-black leading-tight flex-1">{label}</span>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${checked ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 border-2 dark:border-slate-700'}`}>
      {checked ? '✓' : ''}
    </div>
  </button>
);

export default RecordDetails;
