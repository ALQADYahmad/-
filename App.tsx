
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RecordForm from './components/RecordForm';
import RecordDetails from './components/RecordDetails';
import PlateInventory from './components/PlateInventory';
import Settings from './components/Settings';
import Security from './components/Security';
import Docs from './components/Docs';
import Login from './components/Login';
import WrittenArchive from './components/WrittenArchive';
import AdminReports from './components/AdminReports';
import OfficialArchive from './components/OfficialArchive';
import CustomsSmartArchive from './components/CustomsSmartArchive';
import UniversalSearch from './components/UniversalSearch';
import FinancialManagement from './components/FinancialManagement';
import PhoneArchive from './components/PhoneArchive';
import OfficialFormWizard from './components/OfficialFormWizard';
import MediaGallery from './components/MediaGallery';
import { VehicleRecord, TransactionStatus, User, UserRole, Plate, PlateStatus, SystemSettings, Committee, OfficialFormRecord, CustomsArchiveRecord, FinancialRecord } from './types';
import { INITIAL_RECORDS, INITIAL_PLATES, STATUS_LABELS, COMMITTEES as INITIAL_COMMITTEES, INITIAL_OFFICIAL_RECORDS } from './constants';

interface AppAlert {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallCenter, setShowInstallCenter] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  
  const [user, setUser] = useState<User | 'WRITTEN_ARCHIVE' | null>(() => {
    const saved = localStorage.getItem('app_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return saved as 'WRITTEN_ARCHIVE'; }
    }
    return null;
  });

  const [userPasswords, setUserPasswords] = useState<Record<string, { password: string; enabled: boolean }>>(() => {
    const saved = localStorage.getItem('app_user_passwords');
    return saved ? JSON.parse(saved) : {
      'admin-1': { password: '1234', enabled: true },
      'written-archive': { password: '1234', enabled: true }
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [records, setRecords] = useState<VehicleRecord[]>(() => {
    const saved = localStorage.getItem('app_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [officialRecords, setOfficialRecords] = useState<OfficialFormRecord[]>(() => {
    const saved = localStorage.getItem('app_official_records');
    return saved ? JSON.parse(saved) : INITIAL_OFFICIAL_RECORDS;
  });

  const [customsRecords, setCustomsRecords] = useState<CustomsArchiveRecord[]>(() => {
    const saved = localStorage.getItem('app_customs_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [financeItems, setFinanceItems] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('app_finance_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [plates, setPlates] = useState<Plate[]>(() => {
    const saved = localStorage.getItem('app_plates');
    return saved ? JSON.parse(saved) : INITIAL_PLATES;
  });

  const [committees, setCommittees] = useState<Committee[]>(() => {
    const saved = localStorage.getItem('app_committees');
    return saved ? JSON.parse(saved) : INITIAL_COMMITTEES;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) return JSON.parse(saved);
    return {
      systemName: 'نظام الأرشفة الذكي لبيانات المرور',
      departmentName: 'الإدارة العامة للمرور',
      baseFee: 50000,
      privatePlateFee: 50000,
      transportPlateFee: 65000,
      taxiPlateFee: 45000,
      currency: 'ر.س',
      taxEnabled: true,
      taxRate: 5,
      autoArchiveDelay: 365,
      notificationsEnabled: true,
      debtThreshold: 5000,
      backupInterval: 'DAILY',
      enforcePhotoRequirement: true,
      securityLevel: 'MEDIUM',
      formLabels: {
        ownerName: 'الاسم الكامل للمالك',
        ownerDob: 'تاريخ الميلاد',
        ownerIdNumber: 'رقم الهوية / الجواز',
        vehicleBrand: 'ماركة المركبة',
        vehicleModel: 'موديل المركبة',
        vehicleChassis: 'رقم القعادة (CHASSIS)',
        vehicleEngine: 'رقم المحرك',
        vehicleColor: 'اللون الرئيسي',
        customsStatement: 'رقم البيان الجمركي',
        customsEntity: 'جهة الإصدار'
      }
    };
  });

  const [activeAlert, setActiveAlert] = useState<AppAlert | null>(null);

  const showAlert = (message: string, type: AppAlert['type'] = 'info') => {
    const id = Date.now();
    setActiveAlert({ message, type, id });
    setTimeout(() => { setActiveAlert(current => current?.id === id ? null : current); }, 4500);
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      showAlert("تم تثبيت النظام كتطبيق بنجاح.", "success");
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallCenter(true);
    }
  };

  useEffect(() => localStorage.setItem('app_records', JSON.stringify(records)), [records]);
  useEffect(() => localStorage.setItem('app_official_records', JSON.stringify(officialRecords)), [officialRecords]);
  useEffect(() => localStorage.setItem('app_customs_records', JSON.stringify(customsRecords)), [customsRecords]);
  useEffect(() => localStorage.setItem('app_finance_records', JSON.stringify(financeItems)), [financeItems]);
  useEffect(() => localStorage.setItem('app_plates', JSON.stringify(plates)), [plates]);
  useEffect(() => localStorage.setItem('app_committees', JSON.stringify(committees)), [committees]);
  useEffect(() => localStorage.setItem('app_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('app_user_passwords', JSON.stringify(userPasswords)), [userPasswords]);
  
  useEffect(() => {
    if (user) localStorage.setItem('app_user', JSON.stringify(user));
    else localStorage.removeItem('app_user');
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<VehicleRecord | null>(null);
  const [isQuickWizardOpen, setIsQuickWizardOpen] = useState(false);

  const markPlateAs = (plateNumber: string, status: PlateStatus) => {
    setPlates(prev => prev.map(p => p.number === plateNumber ? { ...p, status } : p));
  };

  const handleUpdateRecord = (id: string, updates: Partial<VehicleRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    showAlert("تم تحديث البيانات", "success");
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setSelectedRecordForDetails(null);
    showAlert("تم الحذف", "warning");
  };

  const handleAddOfficialRecord = (record: OfficialFormRecord) => {
    setOfficialRecords(prev => [record, ...prev]);
    markPlateAs(record.vehicle.plateNumber, PlateStatus.ISSUED);
    showAlert("تم الحفظ بنجاح", "success");
  };

  const handleAddRecord = (newRecord: Partial<VehicleRecord>) => {
    setRecords(prev => [newRecord as VehicleRecord, ...prev]);
    showAlert("تم إنشاء المعاملة", "success");
  };

  const handleSearchResultClick = (targetTab: string, recordId: string) => {
    setActiveTab(targetTab);
    setIsSearchActive(false);
    setSearchQuery('');
    if (targetTab === 'records') {
        const rec = records.find(r => r.id === recordId);
        if (rec) setSelectedRecordForDetails(rec);
    }
  };

  const handleUpdateUserPassword = (newPassword: string, enabled: boolean) => {
    if (!user) return;
    const userId = user === 'WRITTEN_ARCHIVE' ? 'written-archive' : user.id;
    setUserPasswords(prev => ({
      ...prev,
      [userId]: { password: newPassword, enabled }
    }));
  };

  if (!user) return <Login onLogin={setUser as any} committees={committees} userPasswords={userPasswords} />;
  if (user === 'WRITTEN_ARCHIVE') return <WrittenArchive onBack={() => setUser(null)} onNotify={showAlert} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Cairo'] overflow-hidden text-right transition-colors" dir="rtl">
      
      {activeAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-6 animate-in slide-in-from-top-10 duration-500">
           <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-2xl flex items-center gap-5 border-2 ${activeAlert.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'} backdrop-blur-xl`}>
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg ${activeAlert.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
               {activeAlert.type === 'error' ? '❌' : '✅'}
             </div>
             <div className="flex-1">
                <p className="text-xs font-bold leading-relaxed">{activeAlert.message}</p>
             </div>
           </div>
        </div>
      )}

      {showInstallCenter && (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-2xl z-[1000] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-[#0f172a] w-full max-w-xl rounded-[4rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 relative animate-in zoom-in-95 duration-500">
              <button onClick={() => setShowInstallCenter(false)} className="absolute top-10 left-10 w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
              <div className="text-center mb-10">
                 <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/40 relative">📱</div>
                 <h3 className="text-3xl font-black dark:text-white mb-3">تثبيت النظام كبرنامج كامل</h3>
                 <p className="text-slate-400 text-sm font-bold leading-relaxed px-6">هذا الإجراء سيقوم بوضع أيقونة النظام في شاشة هاتفك الرئيسية وسيعمل كـ تطبيق أندرويد حقيقي APK بدون شريط المتصفح.</p>
              </div>
              <button onClick={() => setShowInstallCenter(false)} className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-95">بدء التثبيت الآن</button>
           </div>
        </div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user as User} 
        onLogout={() => setUser(null)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onInstall={handleInstallClick}
        isInstallable={!isAppInstalled} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 lg:h-24 px-4 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 lg:gap-4 flex-1 overflow-hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl">☰</button>
            <div className="relative flex-1 max-w-xl">
               <input type="text" placeholder="بحث شامل..." className="w-full bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 pr-10 pl-4 py-2 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-blue-500 transition-all" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setIsSearchActive(e.target.value.length > 0); }} />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 transition-all active:scale-95">
               {theme === 'light' ? '🌙' : '☀️'}
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar px-3 lg:px-10 py-6 relative">
          {isSearchActive && (
            <UniversalSearch query={searchQuery} records={records} officialRecords={officialRecords} customsRecords={customsRecords} onResultClick={handleSearchResultClick} onClose={() => { setIsSearchActive(false); setSearchQuery(''); }} />
          )}

          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'dashboard' && <Dashboard records={records} committees={committees} officialRecords={officialRecords} onQuickLink={setActiveTab} onStartWizard={() => setIsQuickWizardOpen(true)} />}
            {activeTab === 'records' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {records.length > 0 ? records.map(r => (
                  <div key={r.id} onClick={() => setSelectedRecordForDetails(r)} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black text-sm tracking-widest">{r.plateNumber}</span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${r.feesPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{r.feesPaid ? 'خالص' : 'مديونية'}</span>
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white truncate mb-1">{r.ownerName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{r.vehicleName} {r.vehicleModel}</p>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center opacity-30 font-black">لا توجد سجلات</div>
                )}
              </div>
            )}
            {activeTab === 'official_archive' && <OfficialArchive user={user as User} records={officialRecords} customsRecords={customsRecords} allTransactions={records} onAddRecord={handleAddOfficialRecord} plates={plates} settings={settings} onAddTransaction={handleAddRecord} onNotify={showAlert} />}
            {activeTab === 'customs_archive' && <CustomsSmartArchive records={customsRecords} vehicleRecords={records} onAddRecord={(rec) => setCustomsRecords(prev => [rec, ...prev])} onDeleteRecord={(id) => setCustomsRecords(prev => prev.filter(r => r.id !== id))} onViewRecord={(id) => handleSearchResultClick('records', id)} onNotify={showAlert} />}
            {activeTab === 'media_gallery' && <MediaGallery records={records} officialRecords={officialRecords} customsRecords={customsRecords} onNavigate={handleSearchResultClick} onNotify={showAlert} />}
            {activeTab === 'finance_admin' && <FinancialManagement records={records} currency={settings.currency} financeItems={financeItems} onAddFinance={item => setFinanceItems(prev => [item, ...prev])} onNotify={showAlert} />}
            {activeTab === 'phone_archive' && <PhoneArchive records={records} officialRecords={officialRecords} onNavigateToRecord={handleSearchResultClick} onNotify={showAlert} />}
            {activeTab === 'inventory' && <PlateInventory plates={plates} onAddPlates={p => setPlates([...plates, ...p])} onAssignPlates={(ids, cId) => setPlates(prev => prev.map(p => ids.includes(p.id) ? {...p, status: PlateStatus.ASSIGNED, committeeId: cId} : p))} committees={committees} onNotify={showAlert} />}
            {activeTab === 'reports' && <AdminReports records={records} officialRecords={officialRecords} customsRecords={customsRecords} financeItems={financeItems} committees={committees} currency={settings.currency} onNotify={showAlert} />}
            {activeTab === 'security' && <Security user={user as User} currentPasswordData={userPasswords[user === 'WRITTEN_ARCHIVE' ? 'written-archive' : (user as User).id] || {password: '1234', enabled: true}} onUpdatePassword={handleUpdateUserPassword} onNotify={showAlert} />}
            {activeTab === 'docs' && <Docs />}
            {activeTab === 'settings' && <Settings settings={settings} onUpdateSettings={setSettings as any} committees={committees} onAddCommittee={(n, r) => setCommittees(prev => [...prev, {id: `C-${Date.now()}`, name: n, region: r}])} onUpdateCommittee={(id, n, r) => setCommittees(prev => prev.map(c => c.id === id ? {...c, name: n, region: r} : c))} onDeleteCommittee={(id) => setCommittees(prev => prev.filter(c => c.id !== id))} onNotify={showAlert} />}
          </div>
        </main>
      </div>

      {isQuickWizardOpen && (
        <OfficialFormWizard user={user as User} settings={settings} allOfficialRecords={officialRecords} customsRecords={customsRecords} allTransactions={records} availablePlates={plates} onSave={(rec) => { handleAddOfficialRecord(rec); setIsQuickWizardOpen(false); }} onCancel={() => setIsQuickWizardOpen(false)} onNotify={showAlert} />
      )}

      {selectedRecordForDetails && (
        <RecordDetails record={selectedRecordForDetails} onClose={() => setSelectedRecordForDetails(null)} user={user as User} onUpdate={handleUpdateRecord} onDelete={handleDeleteRecord} currency={settings.currency} />
      )}
    </div>
  );
};

export default App;
