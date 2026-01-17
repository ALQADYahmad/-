
import React, { useState } from 'react';
import { User, UserRole, Committee } from '../types';

interface LoginProps {
  onLogin: (user: User | 'WRITTEN_ARCHIVE') => void;
  committees: Committee[];
  userPasswords: Record<string, { password: string; enabled: boolean }>;
}

const RepublicEagle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

const MOCK_ADMIN: User = { 
  id: 'admin-1', 
  username: 'admin', 
  name: 'الإدارة العامة للمرور', 
  role: UserRole.ADMIN, 
  rank: 'مسؤول النظام الأعلى' 
};

const Login: React.FC<LoginProps> = ({ onLogin, committees, userPasswords }) => {
  const [showCommittees, setShowCommittees] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | 'WRITTEN_ARCHIVE' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  const handleSelectUser = (user: User | 'WRITTEN_ARCHIVE') => {
    const userId = user === 'WRITTEN_ARCHIVE' ? 'written-archive' : user.id;
    const config = userPasswords[userId] || { password: '1234', enabled: true };
    
    if (!config.enabled) {
      onLogin(user);
    } else {
      setPendingUser(user);
      setPasswordInput('');
      setError(false);
    }
  };

  const handleVerify = () => {
    const userId = pendingUser === 'WRITTEN_ARCHIVE' ? 'written-archive' : (pendingUser as User).id;
    const config = userPasswords[userId] || { password: '1234', enabled: true };
    
    if (passwordInput === config.password) {
      onLogin(pendingUser!);
    } else {
      setError(true);
      setPasswordInput('');
      setTimeout(() => setError(false), 1000);
    }
  };

  if (pendingUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-['Cairo'] text-right" dir="rtl">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500 text-center">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20">🔒</div>
           <h3 className="text-2xl font-black text-white mb-2">قفل الحماية</h3>
           <p className="text-slate-400 text-xs font-bold mb-10">يرجى إدخال رمز الدخول لـ {pendingUser === 'WRITTEN_ARCHIVE' ? 'الأرشفة الكتابية' : (pendingUser as User).name}</p>
           
           <div className="mb-10 flex justify-center gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${passwordInput.length >= i ? 'bg-blue-500 scale-125 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}></div>
              ))}
           </div>

           <div className="grid grid-cols-3 gap-4 mb-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map(n => (
                <button 
                  key={n}
                  onClick={() => {
                    if (n === 'C') setPasswordInput('');
                    else if (n === '✓') handleVerify();
                    else if (passwordInput.length < 4) setPasswordInput(prev => prev + n);
                  }}
                  className={`h-16 rounded-2xl font-black text-xl transition-all ${n === '✓' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95'}`}
                >
                  {n}
                </button>
              ))}
           </div>
           
           <button onClick={() => setPendingUser(null)} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">← العودة لاختيار الحساب</button>
           {error && <p className="mt-4 text-rose-500 text-[10px] font-black animate-bounce">⚠️ رمز الدخول غير صحيح!</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-['Cairo']" dir="rtl">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[180px]"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-8 mb-10">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl">🚔</div>
             <RepublicEagle className="w-32 h-32" />
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl">📦</div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">منظومة الأرشفة الذكية الموحدة</h1>
          <p className="text-blue-400 text-sm font-bold tracking-[0.3em]">الجمهورية اليمنية • وزارة الداخلية</p>
        </div>

        {!showCommittees ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoginCard onClick={() => handleSelectUser(MOCK_ADMIN)} icon="🛡️" title="الإدارة العامة" color="blue" />
            <LoginCard onClick={() => setShowCommittees(true)} icon="🚩" title="اللجان الميدانية" color="emerald" />
            <LoginCard onClick={() => handleSelectUser('WRITTEN_ARCHIVE')} icon="🖋️" title="الأرشفة الكتابية" color="amber" />
          </div>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 max-w-2xl mx-auto text-right">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-white">اللجان الميدانية المتاحة</h3>
               <button onClick={() => setShowCommittees(false)} className="text-slate-400 hover:text-white text-sm font-bold">← عودة</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto no-scrollbar">
              {committees.map(committee => (
                <button 
                  key={committee.id}
                  onClick={() => handleSelectUser({ id: `u-${committee.id}`, username: `c-${committee.id}`, name: committee.name, role: UserRole.COMMITTEE, committeeId: committee.id, rank: 'رئيس لجنة' })}
                  className="bg-white/5 border border-white/5 hover:border-blue-500/50 p-6 rounded-[1.8rem] text-right transition-all group"
                >
                  <p className="font-black text-white text-lg group-hover:text-blue-400">{committee.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{committee.region}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginCard = ({ title, icon, color, onClick }: any) => {
  const colors: any = {
    blue: 'hover:border-blue-500/50 hover:bg-blue-500/5',
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    amber: 'hover:border-amber-500/50 hover:bg-amber-500/5'
  };
  return (
    <button onClick={onClick} className={`bg-slate-900/40 p-10 rounded-[3.5rem] border border-white/10 transition-all text-center flex flex-col items-center gap-5 ${colors[color]} group`}>
      <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-black text-white">{title}</h3>
    </button>
  );
};

export default Login;
