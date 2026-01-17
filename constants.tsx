
import { Committee, VehicleRecord, TransactionStatus, PlateType, PlateStatus, Plate, OfficialFormRecord } from './types';

export const COMMITTEES: Committee[] = [
  { id: 'C-101', name: 'لجنة الأمانة المركزية', region: 'منطقة الرياض' },
  { id: 'C-102', name: 'لجنة الضواحي الشرقية', region: 'المنطقة الشرقية' },
  { id: 'C-103', name: 'لجنة العاصمة الإدارية', region: 'جدة' },
  { id: 'C-104', name: 'لجنة المناطق الشمالية', region: 'تبوك' }
];

export const PLATE_TYPE_CONFIG = {
  [PlateType.PRIVATE]: { label: 'خصوصي', color: 'bg-blue-600', textColor: 'text-white' },
  [PlateType.TAXI]: { label: 'أجرة', color: 'bg-yellow-400', textColor: 'text-slate-900' },
  [PlateType.TRANSPORT]: { label: 'نقل', color: 'bg-red-600', textColor: 'text-white' },
};

// توليد بيانات تجريبية للوحات وتوزيعها على اللجان (لوحتين لكل نوع لكل لجنة)
const generateMockPlates = (): Plate[] => {
  const plates: Plate[] = [];
  let currentNum = 66000;
  
  const committeeIds = ['C-101', 'C-102', 'C-103', 'C-104'];

  committeeIds.forEach(cId => {
    // 2 لوحات خصوصي
    for (let i = 0; i < 2; i++) {
      plates.push({ id: `p-priv-${cId}-${i}`, number: (currentNum++).toString(), type: PlateType.PRIVATE, status: PlateStatus.ASSIGNED, committeeId: cId });
    }
    // 2 لوحات نقل
    for (let i = 0; i < 2; i++) {
      plates.push({ id: `p-trans-${cId}-${i}`, number: (currentNum++).toString(), type: PlateType.TRANSPORT, status: PlateStatus.ASSIGNED, committeeId: cId });
    }
    // 2 لوحات أجرة
    for (let i = 0; i < 2; i++) {
      plates.push({ id: `p-taxi-${cId}-${i}`, number: (currentNum++).toString(), type: PlateType.TAXI, status: PlateStatus.ASSIGNED, committeeId: cId });
    }
  });

  return plates;
};

export const INITIAL_PLATES: Plate[] = generateMockPlates();

// أرشيف الأرشفة الموحدة (النماذج الميدانية) - تشمل كافة الفئات
export const INITIAL_OFFICIAL_RECORDS: OfficialFormRecord[] = [
  {
    id: 'OFF-1',
    plateType: PlateType.PRIVATE,
    registrationDate: new Date().toISOString(),
    committeeId: 'C-101',
    owner: {
      name: 'عبدالله محمد منصور اليافعي',
      dob: '1985/05/12',
      dobHijri: '1405/08/22',
      birthPlace: 'عدن',
      province: 'عدن',
      directorate: 'المنصورة',
      village: 'حي ريمي',
      nationality: 'يمني',
      religion: 'مسلم',
      gender: 'ذكر',
      bloodType: 'O+',
      socialStatus: 'متزوج',
      education: 'جامعي',
      nationalId: '101202304',
      idType: 'بطاقة شخصية',
      idNumber: '2021005544',
      idIssuePlace: 'عدن',
      idIssueDate: '2020/01/01',
      idExpiryDate: '2030/01/01',
      residenceNumber: '',
      residenceIssueDate: '',
      residenceExpiryDate: ''
    },
    work: { profession: 'مهندس مدني', workEntity: 'شركة المقاولات الوطنية', province: 'عدن', directorate: 'خورمكسر', city: 'عدن', street: 'شارع التسعين' },
    entity: { type: '', name: '', subType: '', code: '' },
    address: { province: 'عدن', directorate: 'المنصورة', city: 'عدن', street: 'بلوك 24', phone1: '777112233', phone2: '02345678', fullAddress: 'المنصورة - خلف مستشفى الوالي', neighbor: 'عادل سعيد' },
    witnesses: {
      w1: { name: 'صالح علي حيدره', nationalId: '201998877', phone: '733445566', relation: 'جار', address: 'المنصورة' },
      w2: { name: 'فهد قاسم المشجري', nationalId: '202334455', phone: '711223344', relation: 'صديق', address: 'الشيخ عثمان' }
    },
    vehicle: {
      plateNumber: '66000',
      plateType: 'خصوصي',
      model: 'Land Cruiser',
      chassisNumber: 'VZN21500987654321',
      engineNumber: '1GR-FE998877',
      brand: 'TOYOTA',
      style: 'صالون',
      originCountry: 'اليابان',
      manufactureYear: '2022',
      fuelType: 'بنزين',
      axlesCount: '2',
      primaryColor: 'أبيض لؤلؤي',
      secondaryColor: '',
      seatsCount: '7',
      doorsCount: '5',
      cylindersCount: '6',
      weight: '2850 KG',
      steeringSide: 'يمين أصل',
      purchaseSource: 'معرض النخبة'
    },
    customs: { statementNumber: 'J-2024-9980', date: '2024/02/15', issuePlace: 'ميناء المنطقة الحرة', entity: 'جمارك عدن' },
    signatures: { technicalSpecialist: 'م. خالد سعيد', technicalHead: 'عقيد/ محمد بن محمد', issueManager: 'عميد/ علي قاسم' }
  },
  {
    id: 'OFF-2',
    plateType: PlateType.TRANSPORT,
    registrationDate: new Date().toISOString(),
    committeeId: 'C-102',
    owner: {
      name: 'شركة الصقر للخدمات اللوجستية',
      dob: '1990/01/01',
      dobHijri: '1410/01/01',
      birthPlace: 'الرياض',
      province: 'المنطقة الشرقية',
      directorate: 'الدمام',
      village: 'المنطقة الصناعية',
      nationality: 'سعودي',
      religion: 'مسلم',
      gender: 'مؤسسة',
      bloodType: '--',
      socialStatus: '--',
      education: '--',
      nationalId: '7001002003',
      idType: 'سجل تجاري',
      idNumber: '1010203040',
      idIssuePlace: 'الدمام',
      idIssueDate: '2018/05/15',
      idExpiryDate: '2028/05/15',
      residenceNumber: '',
      residenceIssueDate: '',
      residenceExpiryDate: ''
    },
    work: { profession: 'نقل ثقيل', workEntity: 'إدارة العمليات', province: 'الدمام', directorate: 'الميناء', city: 'الدمام', street: 'شارع الملك فهد' },
    entity: { type: 'تجاري', name: 'الصقر', subType: 'لوجستيك', code: 'LOG-99' },
    address: { province: 'الشرقية', directorate: 'الدمام', city: 'الدمام', street: 'طريق الميناء', phone1: '0501122334', phone2: '013887766', fullAddress: 'الدمام - المنطقة الصناعية الثانية - مجمع الصقر', neighbor: '' },
    witnesses: {
      w1: { name: 'عمر ناصر القحطاني', nationalId: '1022334455', phone: '0554433221', relation: 'وكيل', address: 'الدمام' },
      w2: { name: 'سامي فؤاد الحربي', nationalId: '1099887766', phone: '0566778899', relation: 'مدير مالي', address: 'الخبر' }
    },
    vehicle: {
      plateNumber: '66002',
      plateType: 'نقل',
      model: 'Actros 2040',
      chassisNumber: 'WDB9634031L123456',
      engineNumber: 'OM501LA.V/1',
      brand: 'Mercedes-Benz',
      style: 'قاطرة ومقطورة',
      originCountry: 'ألمانيا',
      manufactureYear: '2021',
      fuelType: 'ديزل',
      axlesCount: '3',
      primaryColor: 'أصفر',
      secondaryColor: 'أسود',
      seatsCount: '2',
      doorsCount: '2',
      cylindersCount: '6',
      weight: '40000 KG',
      steeringSide: 'يسار',
      purchaseSource: 'الجفالي للمعدات'
    },
    customs: { statementNumber: 'CUST-DXB-998', date: '2023/11/10', issuePlace: 'منفذ البطحاء', entity: 'جمارك السعودية' },
    signatures: { technicalSpecialist: 'م. سامر العلي', technicalHead: 'مقدم/ فهد الدوسري', issueManager: 'لواء/ صالح الحمد' }
  },
  {
    id: 'OFF-3',
    plateType: PlateType.TAXI,
    registrationDate: new Date().toISOString(),
    committeeId: 'C-103',
    owner: {
      name: 'حسين علي باوزير',
      dob: '1978/09/30',
      dobHijri: '1398/10/28',
      birthPlace: 'حضرموت',
      province: 'حضرموت',
      directorate: 'المكلا',
      village: 'حي السلام',
      nationality: 'يمني',
      religion: 'مسلم',
      gender: 'ذكر',
      bloodType: 'B+',
      socialStatus: 'متزوج',
      education: 'ثانوي',
      nationalId: '104455667',
      idType: 'بطاقة شخصية',
      idNumber: '2022887766',
      idIssuePlace: 'المكلا',
      idIssueDate: '2021/03/12',
      idExpiryDate: '2031/03/12',
      residenceNumber: '',
      residenceIssueDate: '',
      residenceExpiryDate: ''
    },
    work: { profession: 'سائق أجرة', workEntity: 'عمل حر', province: 'حضرموت', directorate: 'المكلا', city: 'المكلا', street: 'الشارع العام' },
    entity: { type: '', name: '', subType: '', code: '' },
    address: { province: 'حضرموت', directorate: 'المكلا', city: 'المكلا', street: 'حي السلام م/2', phone1: '700123456', phone2: '05334455', fullAddress: 'المكلا - حي السلام - بجانب عمارة باوزير', neighbor: 'سالم الكندي' },
    witnesses: {
      w1: { name: 'عوض محمد السقطري', nationalId: '203344556', phone: '700998877', relation: 'ابن عم', address: 'المكلا' },
      w2: { name: 'جمال حسن العمودي', nationalId: '201122334', phone: '711223344', relation: 'جار', address: 'فوه' }
    },
    vehicle: {
      plateNumber: '66004',
      plateType: 'أجرة',
      model: 'Elantra',
      chassisNumber: 'KMH-H01982736451',
      engineNumber: 'G4FC-900881',
      brand: 'HYUNDAI',
      style: 'سيدان',
      originCountry: 'كوريا الجنوبية',
      manufactureYear: '2020',
      fuelType: 'بنزين',
      axlesCount: '2',
      primaryColor: 'أصفر',
      secondaryColor: 'أسود',
      seatsCount: '5',
      doorsCount: '4',
      cylindersCount: '4',
      weight: '1650 KG',
      steeringSide: 'يسار',
      purchaseSource: 'شركة الوعلان'
    },
    customs: { statementNumber: 'G- حضرموت-445', date: '2020/06/05', issuePlace: 'ميناء المكلا', entity: 'جمارك حضرموت' },
    signatures: { technicalSpecialist: 'م. نادر سعيد', technicalHead: 'رائد/ فوزي بن بريك', issueManager: 'عقيد/ حسن المحمدي' }
  }
];

// أرشيف المعاملات (نظام الكروت والمالية)
export const INITIAL_RECORDS: VehicleRecord[] = [
  {
    id: 'TRX-101',
    sequenceNumber: 'ARC-2024-001',
    registrationDate: new Date().toISOString(),
    ownerName: 'سالم أحمد عبدالله المشجري',
    ownerPhone: '770889900',
    vehicleName: 'HYUNDAI',
    vehicleType: 'خصوصي',
    vehicleModel: 'Tucson 2023',
    plateId: 'p-priv-C-101-1',
    plateNumber: '66001',
    committeeId: 'C-101',
    status: TransactionStatus.WAITING_REVIEW,
    hasMubaiyaa: true,
    mubaiyaaDetails: { saleNumber: 'S-44321', saleDate: '2024/05/10', color: 'رمادي', chassisNumber: 'KMH-JN81BDPU000123', engineNumber: 'G4FD-123456', sellerName: 'معرض السعيد', sellerPhone: '733009988' },
    totalAmount: 55000,
    feesPaid: true,
    hasDebt: false,
    debtAmount: 0,
    isCompleted: false,
    isReceivedByAdmin: true,
    isCardReceivedFromAdmin: false,
    isCardDeliveredToOwner: false,
    isDocumentsReturned: false,
    documents: [],
    history: [{ id: 'h1', status: 'إنشاء', timestamp: new Date().toISOString(), userId: 'admin', userName: 'النظام', note: 'تم إنشاء المعاملة' }]
  },
  {
    id: 'TRX-102',
    sequenceNumber: 'ARC-2024-002',
    registrationDate: new Date().toISOString(),
    ownerName: 'مؤسسة الوفاء للتجارة',
    ownerPhone: '711556677',
    vehicleName: 'ISUZU',
    vehicleType: 'نقل',
    vehicleModel: 'FSR 2021',
    plateId: 'p-trans-C-102-0',
    plateNumber: '66002',
    committeeId: 'C-102',
    status: TransactionStatus.INCOMPLETE,
    hasMubaiyaa: false,
    totalAmount: 65000,
    feesPaid: false,
    hasDebt: true,
    debtAmount: 15000,
    isCompleted: false,
    isReceivedByAdmin: false,
    isCardReceivedFromAdmin: false,
    isCardDeliveredToOwner: false,
    isDocumentsReturned: false,
    documents: [],
    history: [{ id: 'h2', status: 'نواقص', timestamp: new Date().toISOString(), userId: 'admin', userName: 'النظام', note: 'يرجى إرفاق صور الفحص' }]
  },
  {
    id: 'TRX-103',
    sequenceNumber: 'ARC-2024-003',
    registrationDate: new Date().toISOString(),
    ownerName: 'فؤاد ناصر القطيبي',
    ownerPhone: '733554422',
    vehicleName: 'TOYOTA',
    vehicleType: 'أجرة',
    vehicleModel: 'Camry Hybrid 2022',
    plateId: 'p-taxi-C-103-0',
    plateNumber: '66004',
    committeeId: 'C-103',
    status: TransactionStatus.COMPLETED,
    hasMubaiyaa: true,
    totalAmount: 48000,
    feesPaid: true,
    hasDebt: false,
    debtAmount: 0,
    isCompleted: true,
    isReceivedByAdmin: true,
    isCardReceivedFromAdmin: true,
    isCardDeliveredToOwner: true,
    isDocumentsReturned: true,
    documents: [],
    history: [{ id: 'h3', status: 'مكتمل', timestamp: new Date().toISOString(), userId: 'admin', userName: 'النظام', note: 'تم تسليم الكرت وإغلاق الملف' }]
  }
];

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  [TransactionStatus.INCOMPLETE]: { label: 'نواقص', color: 'bg-rose-100 text-rose-700' },
  [TransactionStatus.WAITING_REVIEW]: { label: 'بانتظار المراجعة', color: 'bg-amber-100 text-amber-700' },
  [TransactionStatus.READY_CARD]: { label: 'الكرت جاهز', color: 'bg-emerald-100 text-emerald-700' },
  [TransactionStatus.RETURNED_TO_COMMITTEE]: { label: 'أعيد للجنة', color: 'bg-indigo-100 text-indigo-700' },
  [TransactionStatus.COMPLETED]: { label: 'مكتمل نهائياً', color: 'bg-slate-100 text-slate-700' },
};

export const STATUS_LABELS = STATUS_CONFIG;

export const FINANCE_CONFIG = {
  BASE_FEE: 50000,
  CURRENCY: 'ر.س'
};
