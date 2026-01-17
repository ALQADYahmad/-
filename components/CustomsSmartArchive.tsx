
import React, { useState, useMemo, useRef } from 'react';
import { CustomsArchiveRecord, VehicleRecord } from '../types';
import { analyzeCustomsStatement } from '../services/geminiService';

declare var html2canvas: any;

const YemenLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
    <path fill="#B28C3C" d="M300 80c-25 0-45 20-45 45s20 45 45 45 45-20 45-45-20-45-45-45zM200 180c-40 0-70 30-70 70v100h20V250c0-30 20-50 50-50h200c30 0 50 20 50 50v100h20V250c0-40-30-70-70-70H200z"/>
    <path fill="#CE1126" d="M260 210h80v60h-80z"/>
    <path fill="#000" d="M260 270h80v60h-80z"/>
    <path fill="#B28C3C" d="M150 150c20 50 40 100 150 100s130-50 150-100c-50 20-100 30-150 30s-100-10-150-30z"/>
  </svg>
);

interface Props {
  records: CustomsArchiveRecord[];
  vehicleRecords: VehicleRecord[];
  onAddRecord: (record: CustomsArchiveRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewRecord: (id: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const CustomsSmartArchive: React.FC<Props> = ({ records, vehicleRecords, onAddRecord, onDeleteRecord, onViewRecord, onNotify }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CustomsArchiveRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const result = await analyzeCustomsStatement([base64]);
        onAddRecord({
          id: `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          images: [base64],
          isDigitized: true,
          documentType: 'CUSTOMS_STATEMENT',
          data: { ...result }
        });
        successCount++;
      } catch (err) { onNotify(`خطأ في معالجة الملف رقم ${i+1}`, "error"); }
    }
    setIsProcessing(false);
    if (successCount > 0) onNotify(`تم أرشفة ${successCount} بيان جمركي بنجاح`, "success");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(captureRef.current, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `Customs_Report_${selectedRecord?.data.statementNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onNotify("تم استخراج التقرير كصورة بنجاح", "success");
    } catch (err) {
      onNotify("فشل في استخراج الصورة السريعة", "error");
    } finally { setIsExporting(false); }
  };
  // ... rest of component logic ...
  return (
    // Component JSX...
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 font-['Cairo'] text-right" dir="rtl">
       {/* ... UI structure ... */}
       <button onClick={() => { if(confirm("هل أنت متأكد من حذف هذا البيان من الأرشيف؟")) { onDeleteRecord(selectedRecord?.id || ''); onNotify("تم حذف البيان الجمركي", "warning"); setSelectedRecord(null); } }} className="text-rose-500 text-xs font-black">حذف البيان</button>
    </div>
  );
};
export default CustomsSmartArchive;
