
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
    totalAmount: record.totalAmount
  });

  useEffect(() => {
    setEditedData({
      ownerName: record.ownerName,
      ownerPhone: record.ownerPhone,
      vehicleName: record.vehicleName,
      vehicleModel: record.vehicleModel,
      vehicleType: record.vehicleType,
      totalAmount: record.totalAmount
    });
  }, [record]);

  const toggleCheck = (field: keyof VehicleRecord) => {
    if (!isAdmin) return;
    onUpdate(record.id, { [field]: !record[field] });
  };

  const handleSaveEdits = () => {
    onUpdate(record.id, { 
      ...editedData,
      history: [
        ...record.history,
        {
          id: `h-edit-${Date.now()}`,
          status: 'تعديل بيانات',
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          note: 'قام المسؤول بتعديل البيانات الأساسية للمعاملة'
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
    if (onDelete && window.confirm('هل أنت متأكد من حذف هذه المعاملة نهائياً؟ سيتم تحرير رقم اللوحة أيضاً ليعود متاحاً في المخزون.')) {
      onDelete(record.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full sm:h-[95vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-10 border dark:border-slate-800">
        
        {/* Header */}
        <header className="bg-slate-900 dark:bg-[#020617] text-white p-5 lg:px-8 flex justify-between items-center shrink-0 z-10 border-b dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">🚔</div>
            <div>
              <h2 className="text-sm lg:text-lg font-black truncate max-w-[200px]">{record.ownerName}</h2>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{record.sequenceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-[10px] font-black transition-all border border-white/5">تعديل 📝</button>
            )}
            {isEditing && (
              <button onClick={handleSaveEdits} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[10px] font-black transition-all">حفظ التغييرات ✅</button>
            )}
            <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center">✕</button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-4 lg:p-8 custom-scrollbar pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Core Data (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <h3 className="text-[10px] font-black mb-6 text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">البيانات الأساسية</h3>
                <div className="space-y-5">
                  {isEditing ? (
                    <>
                      <EditInput label="اسم المالك" value={editedData.ownerName} onChange={(v: string) => setEditedData({...editedData, ownerName: v})} />
                      <EditInput label="رقم الهاتف" value={editedData.ownerPhone} onChange={(v: string) => setEditedData({...editedData, ownerPhone: v})} />
                      <EditInput label="اسم المركبة" value={editedData.vehicleName} onChange={(v: string) => setEditedData({...editedData, vehicleName: v})} />
                      <EditInput label="الموديل" value={editedData.vehicleModel} onChange={(v: string) => setEditedData({...editedData, vehicleModel: v})} />
                      <EditInput label="الرسوم" type="number" value={editedData.totalAmount} onChange={(v: string) => setEditedData({...editedData, totalAmount: Number(v)})} />
                    </>
                  ) : (
                    <>
                      <Detail label="اسم المالك" value={record.ownerName} />
                      <Detail label="الهاتف" value={record.ownerPhone} />
                      <Detail label="المركبة" value={record.vehicleName} />
                      <Detail label="الموديل" value={record.vehicleModel} />
                      <Detail label="الرسوم" value={`${record.totalAmount.toLocaleString()} ${currency}`} highlight />
                    </>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">رقم اللوحة</p>
                    <div className="bg-slate-900 dark:bg-black text-white py-4 rounded-2xl text-center text-3xl font-black tracking-widest shadow-xl border-4 border-slate-800 dark:border-slate-900">
                      {record.plateNumber}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <h3 className="text-[10px] font-black mb-4 text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">الحالة المالية</h3>
                <div className="space-y-3">
                  {isAdmin && (
                    <div className="space-y-2">
                       <CheckToggle label="تم دفع الرسوم" checked={record.feesPaid} onChange={() => onUpdate(record.id, { feesPaid: !record.feesPaid })} />
                       <CheckToggle label="يوجد مديونية" checked={record.hasDebt} color="rose" onChange={() => onUpdate(record.id, { hasDebt: !record.hasDebt })} />
                       {record.hasDebt && (
                         <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 animate-in slide-in-from-top-2">
                            <label className="text-[9px] font-black text-rose-500 block mb-1">المبلغ المتبقي</label>
                            <input type="number" className="w-full bg-white dark:bg-slate-800 p-2.5 rounded-xl outline-none font-black text-sm border border-rose-200 dark:border-rose-900/30 dark:text-white" value={record.debtAmount} onChange={e => onUpdate(record.id, { debtAmount: Number(e.target.value) })} />
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </section>

              {isAdmin && (
                <button 
                  onClick={handleDelete} 
                  className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] font-black border border-rose-200 dark:border-rose-900/30 transition-all shadow-sm active:scale-95"
                >حذف المعاملة نهائياً 🗑️</button>
              )}
            </div>

            {/* Right Column: Timeline & Checks (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <section className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تحديث الحالة والاعتمادات</h3>
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black border ${STATUS_CONFIG[record.status].color}`}>{STATUS_CONFIG[record.status].label}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  <CheckItem label="استلام من اللجنة" checked={record.isReceivedByAdmin} disabled={!isAdmin} onClick={() => toggleCheck('isReceivedByAdmin')} />
                  <CheckItem label="استلام الكرت" checked={record.isCardReceivedFromAdmin} disabled={!isAdmin} onClick={() => toggleCheck('isCardReceivedFromAdmin')} />
                  <CheckItem label="تسليم للمواطن" checked={record.isCardDeliveredToOwner} disabled={!isAdmin} onClick={() => toggleCheck('isCardDeliveredToOwner')} />
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
                    {Object.entries(TransactionStatus).map(([key, val]) => (
                      <button 
                        key={val} 
                        onClick={() => onUpdate(record.id, { status: val as TransactionStatus })}
                        className={`flex-1 min-w-[120px] p-3 rounded-xl text-[10px] font-black border-2 transition-all ${record.status === val ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-50 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {STATUS_CONFIG[val as TransactionStatus].label}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes & History */}
                <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
                  <h3 className="text-[10px] font-black mb-6 text-slate-400 uppercase tracking-widest">سجل الملاحظات والتاريخ</h3>
                  
                  <div className="flex-1 space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {record.history.length === 0 && <p className="text-center text-slate-300 dark:text-slate-600 text-[10px] font-black py-10 uppercase">لا توجد ملاحظات سابقة</p>}
                    {record.history.map((log) => (
                      <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{log.status}</span>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">{new Date(log.timestamp).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{log.note}</p>
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 mt-2">بواسطة: {log.userName}</p>
                      </div>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <textarea 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition-all resize-none h-24 dark:text-white"
                        placeholder="إضافة ملاحظة إدارية جديدة..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <button 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all disabled:opacity-50"
                      >إضافة ملاحظة</button>
                    </div>
                  )}
                </section>

                {/* Digital Archive */}
                <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <h3 className="text-[10px] font-black mb-6 text-slate-400 uppercase tracking-widest">الأرشيف الرقمي</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {record.documents.map(doc => (
                      <div key={doc.id} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group relative cursor-pointer active:scale-95 transition-transform">
                        {doc.imageData ? (
                          <img src={doc.imageData} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">📄</div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                           <span className="text-[8px] text-white font-black leading-tight">{doc.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {record.documents.length === 0 && <div className="h-40 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700"><span className="text-3xl mb-2">📸</span><p className="text-[9px] font-black uppercase">لا توجد مرفقات</p></div>}
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
  <div className="flex flex-col gap-1">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{label}</p>
    <p className={`text-xs font-black ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{value || '---'}</p>
  </div>
);

const EditInput = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase pr-1">{label}</label>
    <input 
      type={type} 
      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-black outline-none focus:border-blue-500/50 dark:text-white" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const CheckToggle = ({ label, checked, onChange, color = 'blue' }: any) => (
  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{label}</span>
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors relative ${checked ? (color === 'rose' ? 'bg-rose-500' : 'bg-blue-600') : 'bg-slate-300 dark:bg-slate-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-6' : 'right-1'}`} />
    </button>
  </div>
);

const CheckItem = ({ label, checked, disabled, onClick }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-right ${checked ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600'} ${!disabled && 'hover:border-blue-100 dark:hover:border-blue-900 active:scale-95'}`}
  >
    <span className="text-[10px] font-black leading-tight flex-1">{label}</span>
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-3 transition-colors ${checked ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}>
      {checked ? '✓' : ''}
    </div>
  </button>
);

export default RecordDetails;
