
import React, { useState } from 'react';
import { User } from '../types';

interface SecurityProps {
  user: User;
  onUpdatePassword: (newPassword: string, enabled: boolean) => void;
  currentPasswordData: { password: string; enabled: boolean };
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const Security: React.FC<SecurityProps> = ({ user, onUpdatePassword, currentPasswordData, onNotify }) => {
  const [isEnabled, setIsEnabled] = useState(currentPasswordData.enabled);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const handleSave = () => {
    if (isEnabled && passwords.next) {
      if (passwords.next !== passwords.confirm) {
        onNotify("كلمتا المرور الجديدتان غير متطابقتين", "error");
        return;
      }
      if (passwords.current !== currentPasswordData.password) {
        onNotify("كلمة المرور الحالية غير صحيحة", "error");
        return;
      }
      onUpdatePassword(passwords.next, true);
      onNotify("تم تحديث إعدادات الأمان وكلمة المرور بنجاح", "success");
    } else {
      onUpdatePassword(currentPasswordData.password, isEnabled);
      onNotify("تم تحديث حالة قفل النظام بنجاح", "success");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 font-['Cairo'] text-right pb-24" dir="rtl">
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black dark:text-white">مركز الأمان والخصوصية</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">تأمين الوصول للحساب وتغيير كلمات المرور</p>
          </div>
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20">🛡️</div>
        </div>

        <div className="space-y-10 relative z-10">
          {/* خيار تفعيل/تعطيل كلمة المرور */}
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h4 className="text-xl font-black dark:text-white mb-2">تفعيل قفل الدخول</h4>
              <p className="text-slate-400 text-xs font-bold leading-relaxed">عند التفعيل، سيطلب النظام كلمة المرور في كل مرة تحاول فيها الدخول إلى حساب ({user.name}).</p>
            </div>
            <button 
              onClick={() => setIsEnabled(!isEnabled)}
              className={`w-20 h-10 rounded-full p-1 transition-all duration-500 relative ${isEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-8 h-8 bg-white rounded-full shadow-lg transition-all transform ${isEnabled ? '-translate-x-10' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* نموذج تغيير كلمة المرور */}
          {isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
              <div className="space-y-6">
                <SecurityInput label="كلمة المرور الحالية" value={passwords.current} onChange={(v:string) => setPasswords({...passwords, current: v})} type="password" placeholder="••••" />
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-[10px] font-black text-blue-600 leading-relaxed uppercase">💡 ملاحظة: كلمة المرور الافتراضية للنظام هي (1234). يرجى تغييرها لضمان سرية البيانات.</p>
                </div>
              </div>
              <div className="space-y-6">
                <SecurityInput label="كلمة المرور الجديدة" value={passwords.next} onChange={(v:string) => setPasswords({...passwords, next: v})} type="password" placeholder="الرمز الجديد" />
                <SecurityInput label="تأكيد الكلمة الجديدة" value={passwords.confirm} onChange={(v:string) => setPasswords({...passwords, confirm: v})} type="password" placeholder="أعد إدخال الرمز" />
              </div>
            </div>
          )}

          <div className="pt-8 border-t dark:border-white/5">
             <button 
               onClick={handleSave}
               className="w-full md:w-auto px-16 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/30 hover:scale-[1.03] active:scale-95 transition-all text-lg"
             >حفظ إعدادات الأمان</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityInput = ({ label, value, onChange, type = 'text', placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 uppercase pr-2 tracking-widest">{label}</label>
    <input 
      type={type} 
      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 font-black text-xl text-center dark:text-white transition-all shadow-inner" 
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default Security;
