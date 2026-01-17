
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onInstall?: () => void;
  isInstallable?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, isOpen, setIsOpen, onInstall, isInstallable }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  
  const menuItems = [
    { id: 'dashboard', label: 'الإحصائيات', icon: '💎', roles: [UserRole.ADMIN] },
    { id: 'finance_admin', label: 'الإدارة المالية', icon: '💳', roles: [UserRole.ADMIN] },
    { id: 'customs_archive', label: 'أرشيف البيانات الجمركية', icon: '📦', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'official_archive', label: 'الأرشفة الموحدة', icon: '📜', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'media_gallery', label: 'أرشيف الصور الذكي', icon: '🖼️', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'phone_archive', label: 'أرشيف الهواتف', icon: '📱', roles: [UserRole.ADMIN] },
    { id: 'inventory', label: 'مخزون اللوحات', icon: '🔢', roles: [UserRole.ADMIN] },
    { id: 'records', label: 'أرشيف المعاملات', icon: '📂', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'reports', label: 'التقارير الإدارية', icon: '📑', roles: [UserRole.ADMIN] },
    { id: 'docs', label: 'دليل النظام', icon: '📖', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'security', label: 'الأمان', icon: '🛡️', roles: [UserRole.ADMIN, UserRole.COMMITTEE] },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', roles: [UserRole.ADMIN] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-[70] w-72 bg-[#0f172a] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:static ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg"><span className="text-2xl">🚔</span></div>
          <div>
            <h1 className="text-lg font-black leading-none mb-1 text-white">إدارة اللوحات</h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">منظومة الأرشفة الميدانية</p>
          </div>
        </div>
        
        <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar pr-1 -mr-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-inner scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-[13px]">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-6 mt-4 border-t border-white/5">
            <button
              onClick={onInstall}
              className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl bg-gradient-to-l from-blue-600/20 to-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg hover:scale-[1.03] transition-all group"
            >
              <span className="text-2xl group-hover:animate-bounce">📱</span>
              <div className="text-right">
                <p className="font-black text-sm">تثبيت على الهاتف</p>
                <p className="text-[8px] opacity-60 font-bold uppercase">INSTALL MOBILE APP</p>
              </div>
            </button>
          </div>
        </nav>

        <div className="mt-6 pt-6 border-t border-white/5 space-y-4 shrink-0 bg-[#0f172a]">
          <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">{user.name.charAt(0)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{user.rank}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all active:scale-95">تسجيل الخروج</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
