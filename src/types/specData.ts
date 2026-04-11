export interface SpecData {
  // Project Info
  customerName: string;
  siteName: string;
  siteAddress: string;
  specReference: string;
  specDate: string;
  producedBy: string;
  email: string;
  mobileNo: string;
  telNo: string;

  // Modules
  modules: {
    design: boolean;
    installation: boolean;
    commissioning: boolean;
    supply: boolean;
    maintenance: boolean;
    monitoring: boolean;
  };

  // Design info
  designedBy: 'coreFire' | 'customer' | 'noRiskAssessment';

  // Standard
  standard: 'bs5839_2025' | 'bs5839_2017';
  propertyType: 'nonDomestic' | 'domestic';

  // Categories (non-domestic)
  categories: {
    M: boolean;
    P1: boolean;
    P2: boolean;
    L1: boolean;
    L2: boolean;
    L3: boolean;
    L4: boolean;
    L5: boolean;
    mixed: boolean;
    other: boolean;
  };
  categoryP2Areas: string;
  categoryL2Areas: string;
  categoryL5Details: string;
  categoryMixedDetails: string;
  categoryOtherDetails: string;

  // Domestic categories
  domesticGrade: string;
  domesticCategory: string;

  // Door release
  doorRelease: {
    enabled: boolean;
    categoryA: boolean;
    categoryB: boolean;
    categoryC: boolean;
    categoryALocations: string;
    categoryBLocations: string;
    categoryCLocations: string;
  };

  // Ancillary interfaces
  ancillaryInterfaces: {
    enabled: boolean;
    smokeControl: boolean;
    lifts: boolean;
    gasValves: boolean;
    fireShutters: boolean;
    electricalSupplies: boolean;
    ventilation: boolean;
    lighting: boolean;
    signage: boolean;
    paging: boolean;
  };

  // Design variations
  variations: Array<{
    id: string;
    number: string;
    detail: string;
    clauseRef: string;
  }>;

  // Certification
  certificates: {
    bs5839Design: { coreFire: boolean; client: boolean; others: boolean };
    bs5839Installation: { coreFire: boolean; client: boolean; others: boolean };
    bs5839Commissioning: { coreFire: boolean; client: boolean; others: boolean };
    bs5839Acceptance: { coreFire: boolean; client: boolean; others: boolean };
    bs7273_4: { coreFire: boolean; client: boolean; others: boolean };
    bs7273_6: { coreFire: boolean; client: boolean; others: boolean };
    bafeSP203Modular: { coreFire: boolean; client: boolean; others: boolean };
    bafeSP203Compliance: { coreFire: boolean; client: boolean; others: boolean };
    bs7671Electrical: { coreFire: boolean; client: boolean; others: boolean };
  };

  // Power Supply
  standbyHours: '24' | '48' | '72';
  alarmMinutes: '15' | '30' | '60';

  // Cabling
  cabling: {
    softSkinStandard: boolean;
    softSkinEnhanced: boolean;
    mineralInsulated: boolean;
    swa: boolean;
    other: boolean;
    otherDetail: string;
  };

  // Evacuation
  evacuation: {
    type: 'simultaneous' | 'causeEffect' | 'other';
    otherDetail: string;
  };

  // Interface operation
  interfaceOperation: {
    type: 'allZones' | 'causeEffect' | 'other';
    otherDetail: string;
  };

  // Interface schedule
  interfaces: Array<{
    id: string;
    qty: number;
    use: string;
  }>;

  // Visual devices
  visualDevices: {
    vad: boolean;
    vadLocations: string;
    vid: boolean;
    vidLocations: string;
    none: boolean;
  };

  // Communications
  communications: {
    type: 'audibleOnly' | 'auto';
    gprs: { single: boolean; dualPrimary: boolean; dualSecondary: boolean };
    ip: { single: boolean; dualPrimary: boolean; dualSecondary: boolean };
    transmitterLocation: string;
    signals: 'fire' | 'fireFault';
  };

  // Equipment schedule (with pricing)
  equipment: Array<{
    id: string;
    category: string;
    description: string;
    qty: number;
    unitPrice: number;
  }>;

  // Design Drawings
  designDrawings: Array<{
    id: string;
    name: string;
    status: 'forApproval' | 'clientProvided' | 'asFitted' | 'draft' | 'approved';
    notes: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
  }>;

  // Quotation / Pricing
  quotation: {
    reference: string;
    revisionLetter: string;
    vatRate: number;
    installationLabour: number;
    installationDescription: string;
    installationScopeDetail: string;
    containmentDetail: string;
    cablingDetail: string;
    commissioningItems: Array<{
      id: string;
      description: string;
      qty: number;
      unitPrice: number;
    }>;
    discount: number;
    discountType: 'fixed' | 'percentage';
    paymentTerms: string;
    validityDays: number;
  };

  // Project Scope & Assumptions
  projectScope: {
    workingHours: string;
    sounderAudibility: string;
    workingAtHeight: string;
    clientResponsibilities: string[];
    exclusions: string[];
  };

  // Warranty
  warrantyMonths: number;
  warrantyConditions: string[];

  // Optional Maintenance pricing
  maintenance: {
    enabled: boolean;
    inspectionPerVisit: number;
    visitsPerYear: number;
    calloutCharge: number;
    normalHourlyRate: number;
    outsideHoursRate: number;
    remoteSupportRate: number;
    remoteSupportIncrement: string;
    annualContractValue: number;
    contractTermYears: number;
    additionalItems: Array<{
      id: string;
      description: string;
      qty: number;
      unitPrice: number;
    }>;
  };

  // Points of clarification
  clarifications: Array<{
    id: string;
    text: string;
  }>;

  // Basis of proposal
  proposalBasis: Array<{
    id: string;
    text: string;
  }>;

  // Enquiry references
  enquirySpecRef: string;
  tenderDrawingsRef: string;
  otherRef: string;
  siteSurveyDetails: string;
}

export const defaultSpecData: SpecData = {
  customerName: '',
  siteName: '',
  siteAddress: '',
  specReference: '',
  specDate: new Date().toISOString().split('T')[0],
  producedBy: '',
  email: '',
  mobileNo: '',
  telNo: '',

  modules: {
    design: false,
    installation: false,
    commissioning: false,
    supply: false,
    maintenance: false,
    monitoring: false,
  },

  designedBy: 'coreFire',
  standard: 'bs5839_2025',
  propertyType: 'nonDomestic',

  categories: {
    M: false, P1: false, P2: false,
    L1: false, L2: false, L3: false, L4: false, L5: false,
    mixed: false, other: false,
  },
  categoryP2Areas: '',
  categoryL2Areas: '',
  categoryL5Details: '',
  categoryMixedDetails: '',
  categoryOtherDetails: '',

  domesticGrade: '',
  domesticCategory: '',

  doorRelease: {
    enabled: false,
    categoryA: false, categoryB: false, categoryC: false,
    categoryALocations: '', categoryBLocations: '', categoryCLocations: '',
  },

  ancillaryInterfaces: {
    enabled: false,
    smokeControl: false, lifts: false, gasValves: false,
    fireShutters: false, electricalSupplies: false, ventilation: false,
    lighting: false, signage: false, paging: false,
  },

  variations: [],

  certificates: {
    bs5839Design: { coreFire: false, client: false, others: false },
    bs5839Installation: { coreFire: false, client: false, others: false },
    bs5839Commissioning: { coreFire: false, client: false, others: false },
    bs5839Acceptance: { coreFire: false, client: false, others: false },
    bs7273_4: { coreFire: false, client: false, others: false },
    bs7273_6: { coreFire: false, client: false, others: false },
    bafeSP203Modular: { coreFire: false, client: false, others: false },
    bafeSP203Compliance: { coreFire: false, client: false, others: false },
    bs7671Electrical: { coreFire: false, client: false, others: false },
  },

  standbyHours: '24',
  alarmMinutes: '30',

  cabling: {
    softSkinStandard: false, softSkinEnhanced: false,
    mineralInsulated: false, swa: false, other: false, otherDetail: '',
  },

  evacuation: { type: 'simultaneous', otherDetail: '' },
  interfaceOperation: { type: 'allZones', otherDetail: '' },
  interfaces: [],

  visualDevices: {
    vad: false, vadLocations: '',
    vid: false, vidLocations: '',
    none: true,
  },

  communications: {
    type: 'audibleOnly',
    gprs: { single: false, dualPrimary: false, dualSecondary: false },
    ip: { single: false, dualPrimary: false, dualSecondary: false },
    transmitterLocation: '',
    signals: 'fire',
  },

  equipment: [],

  designDrawings: [],

  quotation: {
    reference: '',
    revisionLetter: 'A',
    vatRate: 20,
    installationLabour: 0,
    installationDescription: 'BAFE Approved Electrical & Mechanical Installation',
    installationScopeDetail: 'The installation includes attendance, preliminaries, and project management, with BAFE-approved electrical and mechanical installation labour.\n\nThe scope covers the supply, installation, and termination of specified fire-rated cabling, mechanical protection, containment, fixings, consumables, and termination accessories in compliance with BS5839-1.',
    containmentDetail: 'Appropriate containment (catenary wire, steel and PVC conduit, and cable trays) will support and protect system cabling, fitted with fire-rated fixings per manufacturer specifications, including glanding, termination, and fire-rated securing methods.',
    cablingDetail: 'Standard fire-rated cables below 2.1m must be mechanically protected.\n\nWiring routes must avoid compromising specified cabling per BS5839-1, clause 26.2.\n\nSystem Wiring Types:\n• Enhanced Armoured Fire-Rated SWA Cable: For harsh or external environments.\n• Standard Fire-Rated FP200 Cable: For internal/light-duty areas.\n• Draka FT120 Fire Alarm Cable, 4 Core 4E 1.5mm² Red LSHF: For network control panel connections.',
    commissioningItems: [
      { id: '1', description: 'Fire Detection & Alarm Commissioning Services', qty: 0, unitPrice: 0 },
      { id: '2', description: 'Create A3 Diagrammatic Fire Detection & Alarm Zone Chart', qty: 1, unitPrice: 0 },
      { id: '3', description: 'Operating Manual', qty: 1, unitPrice: 0 },
    ],
    discount: 0,
    discountType: 'fixed',
    paymentTerms: '30 days from date of invoice',
    validityDays: 30,
  },

  projectScope: {
    workingHours: 'All work detailed in this proposal will be carried out during week days during normal working hours (e.g., 8:00 AM to 5:00 PM, Monday to Friday).',
    sounderAudibility: 'The proposed sounder layout is based on our experience with similar buildings. Final audibility levels can be affected by building materials, furnishings, and ambient noise. Official audibility tests will be conducted once the system is operational. If additional sounders are necessary to meet compliance, this will be treated as additional work.',
    workingAtHeight: 'Working at heights that can be safely reached with six-tread podium steps is included. If any work requires access above this height, the client is responsible for providing appropriate access equipment.',
    clientResponsibilities: [
      'Asbestos Register: Up-to-date register confirming all installation points are safe',
      'Mains Power Supply: Compliant power outlets (BS 5839-1 & BS 7671 compliant) at agreed locations before installation',
      'Unimpeded Access: Clear access to premises with all services available',
      'Builders Work: Including making good',
      'Scaffolding & Access: Any required above 6-tread podiums',
      'Electrical Power & Lighting: For conducting the works',
      'Welfare, Storage & Admin Facilities: As required',
    ],
    exclusions: [
      'Surge Protection Devices (SPDs) unless explicitly listed',
      'Detection within unaccessed ceiling voids, floor voids, or concealed spaces',
      'Mains power installations (unless a separate optional cost is provided and accepted)',
      'Existing circuit repairs or upgrades',
      'Decorative reinstatement',
      'Asbestos works or removal',
    ],
  },

  warrantyMonths: 12,
  warrantyConditions: [
    'The system must be commissioned by Core Fire Protection',
    'The system must be maintained exclusively by Core Fire Protection for the warranty period',
    'All manufacturer-recommended service schedules must be followed',
  ],

  maintenance: {
    enabled: false,
    inspectionPerVisit: 0,
    visitsPerYear: 2,
    calloutCharge: 0,
    normalHourlyRate: 0,
    outsideHoursRate: 0,
    remoteSupportRate: 0,
    remoteSupportIncrement: '15 minutes',
    annualContractValue: 0,
    contractTermYears: 1,
    additionalItems: [],
  },

  clarifications: [],
  proposalBasis: [
    { id: '1', text: 'All works to be carried out during normal working hours Monday to Friday.' },
    { id: '2', text: 'Working at height from 6 tread podium steps is included. Any high-level access equipment to work above this height will be provided by others.' },
    { id: '3', text: 'The system carries a warranty of twelve months from the date of commissioning.' },
  ],

  enquirySpecRef: '',
  tenderDrawingsRef: '',
  otherRef: '',
  siteSurveyDetails: '',
};

export const SPEC_STEPS = [
  { id: 'project', label: 'Project Details', icon: 'Building2' },
  { id: 'modules', label: 'Service Modules', icon: 'CheckSquare' },
  { id: 'design', label: 'Design & Standard', icon: 'Ruler' },
  { id: 'categories', label: 'System Categories', icon: 'Layers' },
  { id: 'interfaces', label: 'Interfaces & Doors', icon: 'Cable' },
  { id: 'system', label: 'System Design', icon: 'Settings' },
  { id: 'drawings', label: 'Design Drawings', icon: 'PenTool' },
  { id: 'equipment', label: 'Equipment Schedule', icon: 'Package' },
  { id: 'quotation', label: 'Quotation & Pricing', icon: 'PoundSterling' },
  { id: 'certification', label: 'Certification', icon: 'Award' },
  { id: 'clarifications', label: 'Clarifications', icon: 'FileText' },
  { id: 'preview', label: 'Preview & Export', icon: 'Eye' },
] as const;

export type StepId = typeof SPEC_STEPS[number]['id'];

export const EQUIPMENT_CATEGORIES = [
  {
    name: 'Control Equipment',
    items: [
      'Conventional Control Panel (2/4/8 Zone)',
      '1 Loop Addressable Control Panel',
      '2 Loop Addressable Control Panel',
      '4 Loop Addressable Control Panel',
    ]
  },
  {
    name: 'Repeater / Network Equipment',
    items: [
      'Conventional Repeater Panel',
      'Addressable Repeater Panel',
      'Addressable Repeater Panel (Fully Functional)',
    ]
  },
  {
    name: 'Field Devices',
    items: [
      'Manual Break Glass Call Point',
      'Optical Smoke Detector',
      'Optical Smoke / Heat Detector',
      'Heat Detector',
      'Heat Detector (A1R 57°C RoR)',
      'Heat Detector (BR 75°C RoR / CR 90°C RoR)',
      'Heat Detector (BS 75°C FT / CS 90°C FT)',
      'Combined Optical Smoke Detector / Sounder',
      'Combined Heat Detector / Sounder',
      'Combined Optical Smoke / Heat Detector / Sounder',
      'Remote Detector Indicator',
      'Addressable Input Module',
      'Addressable Output Module',
      'Line Isolator Module',
      'Electronic Sounder',
      '150mm Underdome Bell Sounder',
      'Combined Electronic Sounder / Xenon Beacon',
      'Xenon Beacon',
    ]
  },
  {
    name: 'Devices for Disabled Assistance',
    items: [
      'Vibrating Pillow',
      'Radio Strobe Alert',
      'Vibrating Component',
    ]
  },
  {
    name: 'Ancillary Equipment',
    items: [
      '24Vdc Power Supply Unit c/w Standby Battery',
      '24Vdc Heavy Duty Relay',
      '230Vac Heavy Duty Relay',
      'Transformer / Rectifier Unit',
      '24Vdc Door Holder',
      '230Vac Door Holder',
    ]
  },
  {
    name: 'Communications Equipment',
    items: [
      'Automatic Communications Signalling Device (SP)',
      'Automatic Communications Signalling Device (DP)',
    ]
  },
  {
    name: 'Other',
    items: [
      'Framed Zone Diagram',
      'Operation and Maintenance Instructions',
      'Fire Alarm Log Book',
    ]
  },
];
