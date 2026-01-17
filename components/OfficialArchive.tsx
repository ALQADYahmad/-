
import React, { useState } from 'react';
import { OfficialFormRecord, PlateType, User, Plate, SystemSettings, VehicleRecord, TransactionStatus, PlateStatus, CustomsArchiveRecord } from '../types';
import OfficialFormWizard from './OfficialFormWizard';
import Print from './Print';
import RecordForm from './RecordForm';

interface OfficialArchiveProps {
  user: User;
  records: OfficialFormRecord[];
  onAddRecord: (record: OfficialFormRecord) => void;
  plates: Plate[];
  settings: SystemSettings;
  onAddTransaction: (record: Partial<VehicleRecord>) => void;
  customsRecords?: CustomsArchiveRecord[];
  allTransactions?: VehicleRecord[];
  onNotify: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const OfficialArchive: React.FC<OfficialArchiveProps> = ({ user, records, onAddRecord, plates, settings, onAddTransaction, customsRecords = [], allTransactions = [], onNotify }) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OfficialFormRecord | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<VehicleRecord> | undefined>(undefined);

  const handlePrint = (record: OfficialFormRecord) => {
    setSelectedRecord(record);
    setIsPrintView(true);
  };

  const startTransactionFromArchive = (record: OfficialFormRecord) => {
    const targetPlate = plates.find(p => p.number === record.vehicle.plateNumber);
    setPrefillData({
      ownerName: record.owner.name,
      ownerPhone: record.address.phone1,
      vehicleName: record.vehicle.brand,
      vehicleModel: record.vehicle.model,
      vehicleType: record.plateType === PlateType.PRIVATE ? 'خصوصي' : 'نقل',
      plateNumber: record.vehicle.plateNumber,
      plateId: targetPlate?.id || '',
      mubaiyaaDetails: {
        chassisNumber: record.vehicle.chassisNumber,
        engineNumber: record.vehicle.engineNumber,
        saleNumber: record.customs.statementNumber,
        saleDate: record.customs.date,
        color: record.vehicle.primaryColor,
        sellerName: record.vehicle.purchaseSource || '',
        sellerPhone: ''
      }
    });
    setIsTransactionFormOpen(true);
  };

  if (isPrintView && selectedRecord) {
    return <Print record={selectedRecord} settings={settings} onBack={() => setIsPrintView(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 font-['Cairo'] text-right" dir="rtl">
      <div className="bg-white dark:bg-slate-900 p-8 lg:p-14 rounded-[3rem] border shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2">الأرشفة الموحدة</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">UNIFIED OFFICIAL ARCHIVE</p>
        </div>
        <button onClick={() => setIsWizardOpen(true)} className="relative z-10 bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl flex items-center gap-4 transition-all active:scale-95">
          <span className="text-2xl font-bold">＋</span>
          <span>رصد نموذج ميداني</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {records.map(record => (
          <div key={record.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3.2rem] border shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-3 h-full ${record.plateType === PlateType.PRIVATE ? 'bg-blue-600' : 'bg-rose-600'}`}></div>
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-black text-slate-400">{new Date(record.registrationDate).toLocaleDateString('ar-EG')}</span>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
                {record.plateType === PlateType.PRIVATE ? '🚘' : '🚚'}
              </div>
            </div>
            <h4 className="font-black text-xl text-slate-900 dark:text-white truncate mb-2">{record.owner.name}</h4>
            <div className="flex items-center justify-between mt-6 pt-6 border-t dark:border-slate-800">
               <button onClick={() => handlePrint(record)} className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-xs">طباعة 🖨️</button>
               <button onClick={() => startTransactionFromArchive(record)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs">فتح معاملة ➔</button>
            </div>
          </div>
        ))}
      </div>

      {isWizardOpen && (
        <OfficialFormWizard 
          user={user} 
          settings={settings}
          allOfficialRecords={records}
          customsRecords={customsRecords}
          allTransactions={allTransactions}
          availablePlates={plates}
          onSave={(rec) => { onAddRecord(rec); setIsWizardOpen(false); }} 
          onCancel={() => setIsWizardOpen(false)} 
          onNotify={onNotify}
        />
      )}

      {isTransactionFormOpen && prefillData && (
        <RecordForm 
          onAdd={(data) => { onAddTransaction(data); setIsTransactionFormOpen(false); }}
          onCancel={() => setIsTransactionFormOpen(false)}
          user={user}
          assignedPlates={plates}
          defaultFee={settings.baseFee}
          initialData={prefillData}
        />
      )}
    </div>
  );
};

export default OfficialArchive;
