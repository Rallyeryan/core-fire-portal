export type FrequencyKey = 'annual' | 'biAnnual' | 'quarterly';

export interface Service {
  id: string;
  name: string;
  std: string;
  annual: number | null;
  biAnnual: number | null;
  quarterly: number | null;
  oneOff?: boolean;
  adHoc?: boolean;
}

export interface ServiceCategory {
  id: string;
  icon: string;
  name: string;
  std: string;
  color: string;
  services: Service[];
}

export interface SelectedService {
  serviceId: string;
  categoryId: string;
  freq: FrequencyKey;
  qty: number;
  unitPrice: number;
}

export const CATALOG: ServiceCategory[] = [
  {
    id: 'fa', icon: '\uD83D\uDD14', name: 'Fire Alarm Systems', std: 'BS 5839-1:2025',
    color: '#E8340A',
    services: [
      { id: 'FA-001', name: 'Fire Alarm System Service & Inspection', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-002', name: 'Fire Alarm Weekly Test (Client Responsibility)', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-003', name: 'Emergency Lighting Service & Inspection', std: 'BS 5266-1', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-004', name: 'Fire Alarm System Design Review', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-005', name: 'Cause & Effect Documentation Review', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-006', name: 'Aspirating Detection System Service', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
      { id: 'FA-007', name: 'Beam Detector Service & Alignment', std: 'BS 5839-1:2025', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'fe', icon: '\uD83E\uDDEF', name: 'Fire Extinguishers', std: 'BS 5306-3',
    color: '#F59E0B',
    services: [
      { id: 'FE-001', name: 'Fire Extinguisher Annual Service', std: 'BS 5306-3', annual: null, biAnnual: null, quarterly: null },
      { id: 'FE-002', name: 'Fire Extinguisher Extended Service (5yr)', std: 'BS 5306-3', annual: null, biAnnual: null, quarterly: null },
      { id: 'FE-003', name: 'Fire Extinguisher Overhaul (10yr)', std: 'BS 5306-3', annual: null, biAnnual: null, quarterly: null },
      { id: 'FE-004', name: 'Fire Extinguisher Commissioning', std: 'BS 5306-3', annual: null, biAnnual: null, quarterly: null, oneOff: true },
      { id: 'FE-005', name: 'Fire Blanket Inspection', std: 'BS EN 1869', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'spr', icon: '\uD83D\uDCA6', name: 'Fire Sprinkler Systems', std: 'BS EN 12845 / NFPA 13',
    color: '#06B6D4',
    services: [
      { id: 'SPR-001', name: 'Sprinkler System Halon Pump Service', std: 'BS EN 12845 / NFPA 13', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-002', name: 'Sprinkler System Motor Pump Service', std: 'BS EN 12845 / NFPA 13', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-003', name: 'Sprinkler System Wet Systems Service', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-004', name: 'Sprinkler System Dry Systems Service', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-005', name: 'Sprinkler System Foam System Service', std: 'BS EN 12845 / NFPA 11', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-006', name: 'Sprinkler System Deluge System Service', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-007', name: 'Sprinkler Head Replacement', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-008', name: 'Sprinkler System Quarterly Inspection', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-009', name: 'Sprinkler System Halon/Inert Test', std: 'BS EN 12845 / NFPA 13', annual: null, biAnnual: null, quarterly: null },
      { id: 'SPR-010', name: 'Sprinkler System 5 Year Inspection', std: 'BS EN 12845', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'fsg', icon: '\u2697\uFE0F', name: 'Fire Suppression Gas', std: 'BS EN 15004 / BS 8489',
    color: '#8B5CF6',
    services: [
      { id: 'FSG-001', name: 'Gas Suppression System Service', std: 'BS EN 15004', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSG-002', name: 'FM200 System Service & Inspection', std: 'BS EN 15004', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSG-003', name: 'Novec 1230 System Service', std: 'BS EN 15004', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSG-004', name: 'Inert Gas (IG-541/IG-55) Service', std: 'BS EN 15004', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSG-005', name: 'Room Integrity Test (Door Fan)', std: 'BS EN 15004', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'fsk', icon: '\uD83D\uDD25', name: 'Fire Suppression Kitchen', std: 'UL 300 / BS 7273-6',
    color: '#EF4444',
    services: [
      { id: 'FSK-001', name: 'Kitchen Suppression System Service', std: 'UL 300', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSK-002', name: 'Kitchen Hood & Duct Inspection', std: 'BS 7273-6', annual: null, biAnnual: null, quarterly: null },
      { id: 'FSK-003', name: 'Ansul R-102 System Service', std: 'UL 300', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'fd', icon: '\uD83D\uDEAA', name: 'Fire Doors', std: 'BS 476-22 / BS EN 1634',
    color: '#D97706',
    services: [
      { id: 'FD-001', name: 'Fire Door Inspection & Report', std: 'BS 476-22', annual: null, biAnnual: null, quarterly: null },
      { id: 'FD-002', name: 'Fire Door Remedial Works', std: 'BS 476-22', annual: null, biAnnual: null, quarterly: null, adHoc: true },
      { id: 'FD-003', name: 'Fire Door Installation', std: 'BS EN 1634', annual: null, biAnnual: null, quarterly: null, oneOff: true },
      { id: 'FD-004', name: 'Fire Door Closer Replacement', std: 'BS EN 1154', annual: null, biAnnual: null, quarterly: null, adHoc: true },
    ],
  },
  {
    id: 'dr', icon: '\uD83D\uDCA8', name: 'Dry Risers', std: 'BS 9990',
    color: '#0EA5E9',
    services: [
      { id: 'DR-001', name: 'Dry Riser Annual Inspection', std: 'BS 9990', annual: null, biAnnual: null, quarterly: null },
      { id: 'DR-002', name: 'Dry Riser Pressure Test (6-Yearly)', std: 'BS 9990', annual: null, biAnnual: null, quarterly: null },
      { id: 'DR-003', name: 'Wet Riser Annual Inspection', std: 'BS 9990', annual: null, biAnnual: null, quarterly: null },
      { id: 'DR-004', name: 'Wet Riser Flow Test', std: 'BS 9990', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'sm', icon: '\uD83D\uDCA8', name: 'Smoke Control / AOV', std: 'BS EN 12101 / BS 7346',
    color: '#64748B',
    services: [
      { id: 'SM-001', name: 'Smoke Control System Service', std: 'BS EN 12101', annual: null, biAnnual: null, quarterly: null },
      { id: 'SM-002', name: 'AOV System Service & Inspection', std: 'BS EN 12101-2', annual: null, biAnnual: null, quarterly: null },
      { id: 'SM-003', name: 'Smoke Damper Inspection', std: 'BS EN 12101-8', annual: null, biAnnual: null, quarterly: null },
      { id: 'SM-004', name: 'Pressurisation System Service', std: 'BS EN 12101-6', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'pa', icon: '\uD83D\uDD0A', name: 'PA / Voice Alarm', std: 'BS 5839-8',
    color: '#EC4899',
    services: [
      { id: 'PA-001', name: 'PA/VA System Service & Inspection', std: 'BS 5839-8', annual: null, biAnnual: null, quarterly: null },
      { id: 'PA-002', name: 'PA/VA Battery Replacement', std: 'BS 5839-8', annual: null, biAnnual: null, quarterly: null },
      { id: 'PA-003', name: 'PA/VA Speaker Circuit Test', std: 'BS 5839-8', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'cctv', icon: '\uD83D\uDCF9', name: 'CCTV & Access Control', std: 'BS EN 62676 / BS EN 60839',
    color: '#10B981',
    services: [
      { id: 'CCTV-001', name: 'CCTV System Service & Inspection', std: 'BS EN 62676', annual: null, biAnnual: null, quarterly: null },
      { id: 'CCTV-002', name: 'Access Control System Service', std: 'BS EN 60839', annual: null, biAnnual: null, quarterly: null },
      { id: 'CCTV-003', name: 'Intercom System Service', std: 'BS EN 50486', annual: null, biAnnual: null, quarterly: null },
      { id: 'CCTV-004', name: 'Intruder Alarm Service', std: 'BS EN 50131', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'em', icon: '\uD83D\uDCA1', name: 'Emergency Lighting', std: 'BS 5266-1',
    color: '#FBBF24',
    services: [
      { id: 'EM-001', name: 'Emergency Lighting Annual Duration Test', std: 'BS 5266-1', annual: null, biAnnual: null, quarterly: null },
      { id: 'EM-002', name: 'Emergency Lighting Monthly Function Test', std: 'BS 5266-1', annual: null, biAnnual: null, quarterly: null },
      { id: 'EM-003', name: 'Emergency Lighting Design Review', std: 'BS 5266-1', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'fra', icon: '\uD83D\uDCCB', name: 'Fire Risk Assessment', std: 'PAS 79-1:2020',
    color: '#F97316',
    services: [
      { id: 'FRA-001', name: 'Type 1 Fire Risk Assessment', std: 'PAS 79-1:2020', annual: null, biAnnual: null, quarterly: null },
      { id: 'FRA-002', name: 'Type 2 Fire Risk Assessment', std: 'PAS 79-1:2020', annual: null, biAnnual: null, quarterly: null },
      { id: 'FRA-003', name: 'Type 3 Fire Risk Assessment', std: 'PAS 79-1:2020', annual: null, biAnnual: null, quarterly: null },
      { id: 'FRA-004', name: 'Type 4 Fire Risk Assessment (Destructive)', std: 'PAS 79-1:2020', annual: null, biAnnual: null, quarterly: null },
      { id: 'FRA-005', name: 'Fire Risk Assessment Review', std: 'PAS 79-1:2020', annual: null, biAnnual: null, quarterly: null },
    ],
  },
  {
    id: 'trn', icon: '\uD83C\uDF93', name: 'Training & Consultancy', std: 'Various',
    color: '#A78BFA',
    services: [
      { id: 'TRN-001', name: 'Fire Warden Training', std: 'RRO 2005', annual: null, biAnnual: null, quarterly: null },
      { id: 'TRN-002', name: 'Fire Extinguisher Training', std: 'BS 5306-3', annual: null, biAnnual: null, quarterly: null },
      { id: 'TRN-003', name: 'Fire Safety Awareness Training', std: 'RRO 2005', annual: null, biAnnual: null, quarterly: null },
      { id: 'TRN-004', name: 'Emergency Evacuation Drill', std: 'RRO 2005', annual: null, biAnnual: null, quarterly: null },
    ],
  },
];

export function getBaseTotal(selections: Record<string, SelectedService>): number {
  return Object.values(selections).reduce((total, sel) => total + sel.unitPrice * sel.qty, 0);
}

export function getDiscount(selections: Record<string, SelectedService>): number {
  const catIds = new Set<string>();
  Object.values(selections).forEach((sel) => catIds.add(sel.categoryId));
  const svcCount = Object.keys(selections).length;
  return svcCount >= 5 && catIds.size >= 3 ? 0.1 : 0;
}

export function calcPricing(selections: Record<string, SelectedService>, escalationRate: number = 3.5) {
  const base = getBaseTotal(selections);
  const discRate = getDiscount(selections);
  const discAmt = base * discRate;
  const net = base - discAmt;
  const vat = net * 0.2;
  const year1 = net + vat;

  const esc = escalationRate / 100;
  const projection: { year: number; exVat: number; vat: number; incVat: number }[] = [];
  let running = net;
  let projTotal = 0;

  for (let y = 1; y <= 5; y++) {
    if (y > 1) running *= 1 + esc;
    const val = y === 1 ? net : running;
    const vatY = val * 0.2;
    const incl = val + vatY;
    projTotal += incl;
    projection.push({ year: y, exVat: val, vat: vatY, incVat: incl });
  }

  return { base, discRate, discAmt, net, vat, year1, projection, projTotal };
}
