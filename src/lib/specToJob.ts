import type { SpecData } from '@/types/specData';
import type { JobData, CertificateType, CertificateRecord } from '@/types/jobData';
import { makeCertRecord, ALL_CERTIFICATE_TYPES } from '@/types/jobData';

const SPEC_STORAGE_KEY = 'fda_completed_spec';

export function saveSpecForImport(spec: SpecData) {
  localStorage.setItem(SPEC_STORAGE_KEY, JSON.stringify(spec));
}

export function getSavedSpec(): SpecData | null {
  const raw = localStorage.getItem(SPEC_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpecData;
  } catch {
    return null;
  }
}

export function clearSavedSpec() {
  localStorage.removeItem(SPEC_STORAGE_KEY);
}

// --- Helpers to derive data from spec ---

function deriveSystemCategory(spec: SpecData): string {
  const cats = Object.entries(spec.categories)
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (cats.length === 0) {
    if (spec.propertyType === 'domestic' && spec.domesticCategory) return spec.domesticCategory;
    return '';
  }
  return cats.join(', ');
}

function deriveSystemType(spec: SpecData): string {
  const controlItems = spec.equipment.filter(e => e.category === 'Control Equipment');
  const hasAddressable = controlItems.some(e => e.description.toLowerCase().includes('addressable'));
  const hasConventional = controlItems.some(e => e.description.toLowerCase().includes('conventional'));
  if (hasAddressable && hasConventional) return 'Mixed (Addressable & Conventional)';
  if (hasAddressable) return 'Addressable';
  if (hasConventional) return 'Conventional';
  return '';
}

function deriveExtentOfWork(spec: SpecData): string {
  const modules = Object.entries(spec.modules)
    .filter(([, v]) => v)
    .map(([k]) => {
      const labels: Record<string, string> = {
        design: 'Design', supply: 'Supply', installation: 'Installation',
        commissioning: 'Commissioning', maintenance: 'Maintenance', monitoring: 'Monitoring',
      };
      return labels[k] || k;
    });
  const parts: string[] = [];
  parts.push(`${modules.join(', ')} of fire detection and fire alarm system`);
  if (spec.siteName) parts.push(`at ${spec.siteName}`);
  if (spec.siteAddress) parts.push(`(${spec.siteAddress})`);
  return parts.join(' ');
}

function deriveVariationsText(spec: SpecData): string {
  if (spec.variations.length === 0) return 'None';
  return spec.variations.map(v => `${v.number}: ${v.detail} (${v.clauseRef})`).join('\n');
}

function deriveDoorReleaseDeviceTypes(spec: SpecData): string[] {
  const types: string[] = [];
  if (spec.doorRelease.enabled) {
    // Map all door-holding devices from equipment
    const hasDoorHolders = spec.equipment.some(e => e.description.toLowerCase().includes('door holder'));
    const hasMagnets = spec.equipment.some(e => e.description.toLowerCase().includes('magnet'));
    if (hasDoorHolders || spec.doorRelease.categoryA || spec.doorRelease.categoryB) {
      types.push('Electrically powered hold-open device(s)');
    }
    if (hasMagnets) types.push('Electric door magnet(s)');
  }
  return types;
}

function deriveDoorReleaseCategory(spec: SpecData): string {
  const cats: string[] = [];
  if (spec.doorRelease.categoryA) cats.push('A');
  if (spec.doorRelease.categoryB) cats.push('B');
  if (spec.doorRelease.categoryC) cats.push('C');
  return cats.length > 0 ? `Category ${cats.join(', ')}` : '';
}

function deriveAncillarySystems(spec: SpecData): string[] {
  if (!spec.ancillaryInterfaces.enabled) return [];
  const map: Record<string, string> = {
    smokeControl: 'Smoke control systems',
    electricalSupplies: 'Electrical supplies',
    lifts: 'Lifts and other lifting appliances',
    ventilation: 'Ventilation systems',
    gasValves: 'Gas valves',
    lighting: 'Lighting, intelligent signage and wayfinding',
    signage: 'Lighting, intelligent signage and wayfinding',
    fireShutters: 'Fire-resisting shutters and active fire curtain barrier assemblies',
    paging: 'Paging systems',
  };
  const systems = new Set<string>();
  for (const [key, label] of Object.entries(map)) {
    if ((spec.ancillaryInterfaces as any)[key]) systems.add(label);
  }
  return Array.from(systems);
}

function deriveStandard(spec: SpecData): string {
  return spec.standard === 'bs5839_2025' ? 'BS 5839-1:2025' : 'BS 5839-1:2017';
}

// --- Build pre-populated certificate ---

function populateCert(type: CertificateType, spec: SpecData): CertificateRecord {
  const cert = makeCertRecord(type);
  const contractNo = spec.quotation.reference || spec.specReference;
  const category = deriveSystemCategory(spec);
  const sysType = deriveSystemType(spec);
  const standard = deriveStandard(spec);
  const extent = deriveExtentOfWork(spec);
  const variationsText = deriveVariationsText(spec);

  // Common fields for all certs
  cert.contractNo = contractNo;
  cert.specReference = spec.specReference;
  cert.clientName = spec.customerName;
  cert.siteName = spec.siteName;
  cert.siteAddress = spec.siteAddress;
  cert.systemCategory = category;
  cert.systemType = sysType;
  cert.specProvided = true;
  cert.drawingsProvided = spec.designDrawings.length > 0;
  cert.extentOfWork = extent;
  cert.variations = variationsText;
  cert.companyName = 'Core Fire Protection';

  // Mark applicability — only show certificates where Core Fire is responsible
  const specCertKey = type as keyof typeof spec.certificates;
  if (spec.certificates[specCertKey]) {
    const entry = spec.certificates[specCertKey];
    if (!entry.coreFire) {
      cert.status = 'notApplicable';
    }
  } else {
    // Cert types not in spec certificates (e.g. verification, variationsSchedule) default to N/A
    cert.status = 'notApplicable';
  }

  switch (type) {
    case 'bs5839Design':
      cert.notes = `System designed to ${standard}, Category ${category || 'TBC'}.\nSystem type: ${sysType || 'TBC'}.`;
      break;

    case 'bs5839Installation':
      cert.notes = `Installation per ${standard}. ${spec.equipment.length} equipment items specified.`;
      break;

    case 'bs5839Commissioning': {
      cert.soakTestWeeks = '2';
      const evacType = spec.evacuation.type === 'simultaneous' ? 'Simultaneous evacuation'
        : spec.evacuation.type === 'causeEffect' ? 'Cause & effect evacuation'
        : spec.evacuation.otherDetail || 'Other';
      cert.notes = `Evacuation strategy: ${evacType}\nStandby: ${spec.standbyHours}h, Alarm duration: ${spec.alarmMinutes}min`;
      break;
    }

    case 'bs5839Acceptance':
      cert.acceptanceOnBehalfOf = spec.customerName;
      break;

    case 'bs5839Verification':
      cert.verificationScope = extent;
      break;

    case 'bs7273_4':
      cert.bs7273_4DeviceTypes = deriveDoorReleaseDeviceTypes(spec);
      cert.bs7273_4CategoryOfActuation = deriveDoorReleaseCategory(spec);
      if (spec.doorRelease.categoryALocations || spec.doorRelease.categoryBLocations || spec.doorRelease.categoryCLocations) {
        const locs = [
          spec.doorRelease.categoryALocations && `Cat A: ${spec.doorRelease.categoryALocations}`,
          spec.doorRelease.categoryBLocations && `Cat B: ${spec.doorRelease.categoryBLocations}`,
          spec.doorRelease.categoryCLocations && `Cat C: ${spec.doorRelease.categoryCLocations}`,
        ].filter(Boolean).join('\n');
        cert.bs7273_4ReleaseDescription = locs;
      }
      // If door release not enabled, mark N/A
      if (!spec.doorRelease.enabled) cert.status = 'notApplicable';
      break;

    case 'bs7273_6':
      cert.bs7273_6Systems = deriveAncillarySystems(spec);
      // If ancillary interfaces not enabled, mark N/A
      if (!spec.ancillaryInterfaces.enabled) cert.status = 'notApplicable';
      break;

    case 'variationsSchedule':
      cert.variationItems = spec.variations.map(v => ({
        id: v.id,
        description: v.detail,
        clauseRef: v.clauseRef,
      }));
      if (spec.variations.length === 0) cert.status = 'notApplicable';
      break;
  }

  return cert;
}

export function mapSpecToJob(spec: SpecData): Partial<JobData> {
  const certificates = ALL_CERTIFICATE_TYPES.map(type => populateCert(type, spec));

  // Build system overview from spec selections
  const selectedModules = Object.entries(spec.modules)
    .filter(([, v]) => v)
    .map(([k]) => {
      const labels: Record<string, string> = {
        design: 'Design', supply: 'Supply', installation: 'Installation',
        commissioning: 'Commissioning', maintenance: 'Maintenance', monitoring: 'Monitoring',
      };
      return labels[k] || k;
    });

  const selectedCategories = Object.entries(spec.categories)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const systemDesc = [
    `System Categories: ${selectedCategories.join(', ') || 'N/A'}`,
    `System Type: ${deriveSystemType(spec) || 'TBC'}`,
    `Modules: ${selectedModules.join(', ')}`,
    `Standard: ${deriveStandard(spec)}`,
    `Standby: ${spec.standbyHours}h | Alarm: ${spec.alarmMinutes}min`,
    spec.equipment.length > 0 ? `Equipment items: ${spec.equipment.length}` : '',
  ].filter(Boolean).join('\n');

  return {
    specReference: spec.specReference,
    customerName: spec.customerName,
    siteName: spec.siteName,
    siteAddress: spec.siteAddress,
    projectManager: spec.producedBy,
    jobReference: spec.quotation.reference || '',
    certificates,
    systemOverview: {
      description: systemDesc,
      equipmentScheduleIncluded: spec.equipment.length > 0,
      status: 'notStarted',
    },
  };
}
