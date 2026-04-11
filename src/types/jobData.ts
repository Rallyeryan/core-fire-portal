// Job Management Types — tracks completion documentation for accepted projects

export type DocumentStatus = 'notStarted' | 'inProgress' | 'complete' | 'notApplicable';

export interface DocumentItem {
  id: string;
  label: string;
  status: DocumentStatus;
  notes: string;
  completedBy: string;
  completedDate: string;
  signedOff: boolean;
}

// Expanded certificate types covering all 9 certificates
export type CertificateType =
  | 'bs5839Design'
  | 'bs5839Installation'
  | 'bs5839Commissioning'
  | 'bs5839Acceptance'
  | 'bs5839Verification'
  | 'bs7273_4'
  | 'bs7273_6'
  | 'bafeSP203Modular'
  | 'bafeSP203Compliance'
  | 'bs7671Electrical'
  | 'variationsSchedule';

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  bs5839Design: 'BS 5839-1 Design Certificate (Annex G.1)',
  bs5839Installation: 'BS 5839-1 Installation Certificate (Annex G.2)',
  bs5839Commissioning: 'BS 5839-1 Commissioning Certificate (Annex G.3)',
  bs5839Acceptance: 'BS 5839-1 Acceptance Certificate (Annex G.4)',
  bs5839Verification: 'BS 5839-1 Verification Certificate (Annex G.5)',
  bs7273_4: 'BS 7273-4 Commissioning Certificate',
  bs7273_6: 'BS 7273-6 Commissioning Certificate',
  bafeSP203Modular: 'BAFE SP203-1 Modular Certificate(s)',
  bafeSP203Compliance: 'BAFE SP203-1 Certificate of Compliance',
  bs7671Electrical: 'BS 7671 Electrical Test Certificate',
  variationsSchedule: 'Schedule of Variations (BS 5839-1 Clause 7)',
};

export const CERTIFICATE_SHORT_LABELS: Record<CertificateType, string> = {
  bs5839Design: 'Design Certificate',
  bs5839Installation: 'Installation Certificate',
  bs5839Commissioning: 'Commissioning Certificate',
  bs5839Acceptance: 'Acceptance Certificate',
  bs5839Verification: 'Verification Certificate',
  bs7273_4: 'BS 7273-4 Certificate',
  bs7273_6: 'BS 7273-6 Certificate',
  bafeSP203Modular: 'BAFE Modular Certificate',
  bafeSP203Compliance: 'BAFE Compliance Certificate',
  bs7671Electrical: 'Electrical Test Certificate',
  variationsSchedule: 'Schedule of Variations',
};

export interface CertificateRecord {
  id: string;
  type: CertificateType;
  status: DocumentStatus;
  // Common fields
  contractNo: string;
  clientName: string;
  clientAddress: string;
  siteName: string;
  siteAddress: string;
  technicianName: string;
  technicianPosition: string;
  technicianSignature: string;
  signatureDate: string;
  signed: boolean;
  companyName: string;
  variations: string;
  extentOfWork: string;
  notes: string;
  // System details
  systemCategory: string; // M, L1-L5, P1-P2
  systemType: string; // Addressable / Conventional
  frsSignalling: string; // Automatic / Manual
  specReference: string;
  specProvided: boolean;
  drawingsProvided: boolean;
  // Operational checks
  operationalChecks: Record<string, boolean>;
  // Design specific
  designSpecification: string;
  // Installation specific
  installationSpec: string;
  testResultsProvidedTo: string;
  // BS 7273-4 specific
  bs7273_4DeviceTypes: string[];
  bs7273_4CategoryOfActuation: string;
  bs7273_4ReleaseDescription: string;
  // BS 7273-6 specific
  bs7273_6Systems: string[];
  // Acceptance specific
  acceptanceChecks: Record<string, boolean>;
  acceptanceOnBehalfOf: string;
  // Verification specific
  verificationScope: string;
  verificationCompliances: string;
  verificationNonCompliances: string;
  // Variations schedule
  variationItems: Array<{ id: string; description: string; clauseRef: string }>;
  // Works required
  worksRequired: string;
  // False alarms
  falseAlarmNotes: string;
  // Soak test
  soakTestWeeks: string;
  // BAFE SP203-1 Modular
  bafeModuleType: string; // design, installation, commissioning, maintenance
  bafeModuleDescription: string;
  // BAFE SP203-1 Compliance
  bafeComplianceChecks: Record<string, boolean>;
  // BS 7671 Electrical Test
  bs7671CircuitDescription: string;
  bs7671CableType: string;
  bs7671CableSize: string;
  bs7671IrPosNeg: string;
  bs7671IrPosScreen: string;
  bs7671IrNegScreen: string;
  bs7671ContinuityPosNeg: string;
  bs7671ContinuityPosPos: string;
  bs7671ContinuityNegNeg: string;
  bs7671ContinuityScreenScreen: string;
  bs7671ZsValue: string;
  bs7671PolarityCorrect: boolean;
  bs7671RcdSatisfactory: boolean;
  bs7671ComplianceChecks: Record<string, boolean>;
}

export interface CommissioningChecklist {
  powerSupply: {
    cieChargeVoltage: string;
    ciePsuOutput: string;
    battery1Vdc: string;
    battery2Vdc: string;
    standbyRequired: string;
    standbyFitted: string;
    batteriesLabelled: boolean;
    standbyConfirmed: boolean;
  };
  cableTests: {
    irTested: boolean;
    cctrTested: boolean;
    zsTested: boolean;
    separateSheetAttached: boolean;
    circuits: Array<{
      id: string;
      description: string;
      cableType: string;
      cableSize: string;
      irResult: string;
      polarityOk: boolean;
    }>;
  };
  systemChecks: {
    allDevicesTested: boolean;
    soundersVerified: boolean;
    zoneChartProvided: boolean;
    causeEffectTested: boolean;
    falseAlarmRiskAssessed: boolean;
    soakTestWeeks: string;
    notes: string;
  };
}

export interface JobData {
  // Job identification
  jobReference: string;
  specReference: string;
  customerName: string;
  siteName: string;
  siteAddress: string;
  contractDate: string;
  targetCompletionDate: string;
  projectManager: string;
  status: 'active' | 'onHold' | 'complete' | 'archived';

  // Section 2: Project Overview
  projectOverview: DocumentItem;

  // Section 3: System Overview
  systemOverview: {
    description: string;
    equipmentScheduleIncluded: boolean;
    status: DocumentStatus;
  };

  // Section 4: Certificates & Test Documentation
  certificates: CertificateRecord[];
  commissioningChecklist: CommissioningChecklist;

  // Section 5: Maintenance Procedures
  maintenanceProcedures: {
    included: boolean;
    status: DocumentStatus;
  };

  // Section 6: Warranty Information
  warranty: {
    startDate: string;
    endDate: string;
    jobReference: string;
    status: DocumentStatus;
    notes: string;
  };

  // Section 7: Health & Safety
  healthSafety: {
    included: boolean;
    status: DocumentStatus;
  };

  // Section 8: User Manuals & Data Sheets
  userManuals: {
    controlPanelManual: DocumentItem;
    datasheets: DocumentItem;
    additionalDocs: Array<{ id: string; name: string; status: DocumentStatus }>;
  };

  // Section 9: System Drawings
  drawings: {
    forApproval: DocumentItem;
    asFitted: DocumentItem;
    zoneChart: DocumentItem;
  };

  // Fire Log Book
  logBook: {
    competentPersons: Array<{ id: string; name: string; dept: string; tel: string }>;
    emergencyContacts: {
      fireAlarmMaintenance: string;
      emergencyLighting: string;
      buildingMaintenance: string;
    };
    status: DocumentStatus;
  };
}

export const JOB_SECTIONS = [
  { id: 'overview', label: 'Job Overview', icon: 'ClipboardList' },
  { id: 'documents', label: 'Document Tracker', icon: 'FileCheck' },
  { id: 'certificates', label: 'Certificates', icon: 'Award' },
  { id: 'commissioning', label: 'Commissioning Checks', icon: 'CheckCircle' },
  { id: 'drawings', label: 'Drawings & Manuals', icon: 'FileImage' },
  { id: 'logbook', label: 'Fire Log Book', icon: 'BookOpen' },
  { id: 'manual', label: 'Operating Manual', icon: 'Book' },
] as const;

export type JobSectionId = typeof JOB_SECTIONS[number]['id'];

function makeDocItem(label: string): DocumentItem {
  return { id: crypto.randomUUID(), label, status: 'notStarted', notes: '', completedBy: '', completedDate: '', signedOff: false };
}

export function makeCertRecord(type: CertificateType): CertificateRecord {
  return {
    id: crypto.randomUUID(),
    type,
    status: 'notStarted',
    contractNo: '',
    clientName: '',
    clientAddress: '',
    siteName: '',
    siteAddress: '',
    technicianName: '',
    technicianPosition: '',
    technicianSignature: '',
    signatureDate: '',
    signed: false,
    companyName: '',
    variations: '',
    extentOfWork: '',
    notes: '',
    systemCategory: '',
    systemType: '',
    frsSignalling: '',
    specReference: '',
    specProvided: false,
    drawingsProvided: false,
    operationalChecks: {},
    designSpecification: '',
    installationSpec: '',
    testResultsProvidedTo: '',
    bs7273_4DeviceTypes: [],
    bs7273_4CategoryOfActuation: '',
    bs7273_4ReleaseDescription: '',
    bs7273_6Systems: [],
    acceptanceChecks: {},
    acceptanceOnBehalfOf: '',
    verificationScope: '',
    verificationCompliances: '',
    verificationNonCompliances: '',
    variationItems: [],
    worksRequired: '',
    falseAlarmNotes: '',
    soakTestWeeks: '',
    bafeModuleType: '',
    bafeModuleDescription: '',
    bafeComplianceChecks: {},
    bs7671CircuitDescription: '',
    bs7671CableType: '',
    bs7671CableSize: '',
    bs7671IrPosNeg: '',
    bs7671IrPosScreen: '',
    bs7671IrNegScreen: '',
    bs7671ContinuityPosNeg: '',
    bs7671ContinuityPosPos: '',
    bs7671ContinuityNegNeg: '',
    bs7671ContinuityScreenScreen: '',
    bs7671ZsValue: '',
    bs7671PolarityCorrect: false,
    bs7671RcdSatisfactory: false,
    bs7671ComplianceChecks: {},
  };
}

export const ALL_CERTIFICATE_TYPES: CertificateType[] = [
  'bs5839Design',
  'bs5839Installation',
  'bs5839Commissioning',
  'bs5839Acceptance',
  'bs5839Verification',
  'bs7273_4',
  'bs7273_6',
  'bafeSP203Modular',
  'bafeSP203Compliance',
  'bs7671Electrical',
  'variationsSchedule',
];

export const defaultJobData: JobData = {
  jobReference: '',
  specReference: '',
  customerName: '',
  siteName: '',
  siteAddress: '',
  contractDate: new Date().toISOString().split('T')[0],
  targetCompletionDate: '',
  projectManager: '',
  status: 'active',

  projectOverview: makeDocItem('Project Overview'),

  systemOverview: { description: '', equipmentScheduleIncluded: false, status: 'notStarted' },

  certificates: ALL_CERTIFICATE_TYPES.map(t => makeCertRecord(t)),

  commissioningChecklist: {
    powerSupply: {
      cieChargeVoltage: '', ciePsuOutput: '', battery1Vdc: '', battery2Vdc: '',
      standbyRequired: '', standbyFitted: '', batteriesLabelled: false, standbyConfirmed: false,
    },
    cableTests: {
      irTested: false, cctrTested: false, zsTested: false, separateSheetAttached: false, circuits: [],
    },
    systemChecks: {
      allDevicesTested: false, soundersVerified: false, zoneChartProvided: false,
      causeEffectTested: false, falseAlarmRiskAssessed: false, soakTestWeeks: '', notes: '',
    },
  },

  maintenanceProcedures: { included: false, status: 'notStarted' },

  warranty: { startDate: '', endDate: '', jobReference: '', status: 'notStarted', notes: '' },

  healthSafety: { included: false, status: 'notStarted' },

  userManuals: {
    controlPanelManual: makeDocItem('Control Panel User Manual'),
    datasheets: makeDocItem('Equipment Data Sheets'),
    additionalDocs: [],
  },

  drawings: {
    forApproval: makeDocItem('For Approval Drawings'),
    asFitted: makeDocItem('As Fitted Drawings'),
    zoneChart: makeDocItem('Zone Chart / Diagram'),
  },

  logBook: {
    competentPersons: [],
    emergencyContacts: { fireAlarmMaintenance: '', emergencyLighting: '', buildingMaintenance: '' },
    status: 'notStarted',
  },
};
