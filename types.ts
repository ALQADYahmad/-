
export enum TransactionStatus {
  INCOMPLETE = 'INCOMPLETE',
  WAITING_REVIEW = 'WAITING_REVIEW',
  READY_CARD = 'READY_CARD',
  RETURNED_TO_COMMITTEE = 'RETURNED_TO_COMMITTEE',
  COMPLETED = 'COMPLETED'
}

export enum PlateType {
  PRIVATE = 'PRIVATE',
  TAXI = 'TAXI',
  TRANSPORT = 'TRANSPORT'
}

export enum PlateStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  ISSUED = 'ISSUED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COMMITTEE = 'COMMITTEE'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  committeeId?: string;
  rank?: string;
}

export interface Plate {
  id: string;
  number: string;
  type: PlateType;
  status: PlateStatus;
  committeeId?: string;
}

export interface Document {
  id: string;
  name: string;
  status: 'PENDING' | 'RECEIVED';
  imageData?: string;
}

export interface StatusLog {
  id: string;
  status: string;
  timestamp: string;
  userId: string;
  userName: string;
  note: string;
}

export interface MubaiyaaDetails {
  saleNumber: string;
  saleDate: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  sellerName: string;
  sellerPhone: string;
}

export interface OfficialFormLabels {
  ownerName: string;
  ownerDob: string;
  ownerIdNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleChassis: string;
  vehicleEngine: string;
  vehicleColor: string;
  customsStatement: string;
  customsEntity: string;
}

export interface FinancialRecord {
  id: string;
  transactionId?: string;
  ownerName: string;
  vehicleInfo: string;
  receivedAmount: number;
  committeeExpenses: number;
  personalExpenses: number;
  officialFees: number;
  otherExpenses: number;
  remainingAmount: number;
  note: string;
  date: string;
  isManual: boolean;
}

export interface CustomsArchiveRecord {
  id: string;
  timestamp: string;
  images: string[];
  isDigitized: boolean;
  documentType: 'CUSTOMS_STATEMENT' | 'VEHICLE_LICENSE' | 'MIXED_DOCS' | 'UNKNOWN';
  data: {
    statementNumber: string;
    date: string;
    entity: string;
    importerName: string;
    ownerName: string; 
    plateNumber: string; 
    brand: string;
    model: string;
    chassisNumber: string;
    engineNumber: string;
    manufactureYear: string;
    color: string;
    weight: string;
    fuelType: string;
    fullText: string;
  };
}

export interface OfficialFormRecord {
  id: string;
  plateType: PlateType;
  registrationDate: string;
  committeeId: string;
  owner: {
    name: string;
    dob: string;
    dobHijri: string;
    birthPlace: string;
    province: string;
    directorate: string;
    village: string;
    subDistrict?: string;
    nationality: string;
    religion: string;
    gender: string;
    bloodType: string;
    socialStatus: string;
    education: string;
    nationalId: string;
    idType: string;
    idNumber: string;
    idIssuePlace: string;
    idIssueDate: string;
    idExpiryDate: string;
    residenceNumber: string;
    residenceIssueDate: string;
    residenceExpiryDate: string;
    ownerPhoto?: string;
  };
  work: {
    profession: string;
    workEntity: string;
    province: string;
    directorate: string;
    city: string;
    street: string;
  };
  entity: {
    type: string;
    name: string;
    subType: string;
    code: string;
  };
  address: {
    province: string;
    directorate: string;
    city: string;
    street: string;
    phone1: string;
    phone2: string;
    fullAddress: string;
    neighbor: string;
    nearestSchool?: string;
    nearestMosque?: string;
  };
  witnesses: {
    w1: { name: string; nationalId: string; phone: string; relation: string; address: string; };
    w2: { name: string; nationalId: string; phone: string; relation: string; address: string; };
  };
  vehicle: {
    plateNumber: string;
    plateType: string;
    model: string;
    chassisNumber: string;
    engineNumber: string;
    brand: string;
    style: string;
    originCountry: string;
    manufactureYear: string;
    fuelType: string;
    axlesCount: string;
    primaryColor: string;
    secondaryColor: string;
    seatsCount: string;
    doorsCount: string;
    cylindersCount: string;
    weight: string;
    steeringSide: string;
    purchaseSource: string;
  };
  customs: {
    statementNumber: string;
    date: string;
    issuePlace: string;
    entity: string;
  };
  signatures: {
    technicalSpecialist: string;
    technicalHead: string;
    issueManager: string;
  };
  additionalPhotos?: string[]; 
  categorizedAttachments?: {
    idCard?: string;
    customsStatement?: string;
    relativeDocs?: string[];
    vehiclePhotos?: string[];
  };
  printAdditionalPhotos?: boolean;
}

export interface VehicleRecord {
  id: string;
  sequenceNumber: string;
  registrationDate: string;
  ownerName: string;
  ownerPhone: string;
  vehicleName: string;
  vehicleType: string;
  vehicleModel: string;
  plateId: string;
  plateNumber: string;
  committeeId: string;
  status: TransactionStatus;
  hasMubaiyaa: boolean;
  mubaiyaaDetails?: MubaiyaaDetails;
  totalAmount: number;
  feesPaid: boolean;
  hasDebt: boolean;
  debtAmount: number;
  isCompleted: boolean;
  isReceivedByAdmin: boolean;
  isCardReceivedFromAdmin: boolean;
  isCardDeliveredToOwner: boolean;
  isDocumentsReturned: boolean;
  documents: Document[];
  history: StatusLog[];
}

export interface Committee {
  id: string;
  name: string;
  region: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'DEBT_NEW' | 'DEBT_CRITICAL' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  recordId?: string;
}

export interface SystemSettings {
  systemName: string;
  departmentName: string;
  baseFee: number;
  privatePlateFee: number;
  transportPlateFee: number;
  taxiPlateFee: number;
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  autoArchiveDelay: number;
  notificationsEnabled: boolean;
  debtThreshold: number;
  backupInterval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  enforcePhotoRequirement: boolean;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  formLabels: OfficialFormLabels;
}
