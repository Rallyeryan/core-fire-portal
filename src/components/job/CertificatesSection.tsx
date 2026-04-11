import { useState } from 'react';
import { useJob } from '@/context/JobContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { CERTIFICATE_LABELS, CERTIFICATE_SHORT_LABELS, type DocumentStatus, type CertificateRecord } from '@/types/jobData';
import { exportCertificateAsPDF, exportCertificateAsHTML, exportAllCertificatesAsPDF } from '@/lib/certificateExport';
import { syncAllCertificatesToCloud } from '@/lib/certificateCloud';
import { Download, FileText, Plus, Trash2, CheckCircle2, Circle, Clock, MinusCircle, Cloud, CloudOff, FileStack, Sparkles, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function isPopulated(value: string | undefined): boolean {
  return !!value && value !== '' && value !== 'None' && value !== '—';
}

function FieldTag({ populated }: { populated: boolean }) {
  if (populated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-2.5 h-2.5" /> Auto
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">Auto-populated from specification</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border">
          <PenLine className="w-2.5 h-2.5" /> Manual
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">Requires manual entry</TooltipContent>
    </Tooltip>
  );
}

function getPopulationStats(cert: CertificateRecord): { auto: number; manual: number } {
  const fields = [
    cert.contractNo, cert.specReference, cert.extentOfWork, cert.variations,
    cert.systemCategory, cert.systemType, cert.notes,
  ];
  if (cert.type === 'bs7273_4') {
    fields.push(cert.bs7273_4CategoryOfActuation, cert.bs7273_4ReleaseDescription);
  }
  if (cert.type === 'bs7273_6') {
    fields.push((cert.bs7273_6Systems?.length ?? 0) > 0 ? 'yes' : '');
  }
  if (cert.type === 'bs5839Acceptance') {
    fields.push(cert.acceptanceOnBehalfOf);
  }
  if (cert.type === 'bs5839Verification') {
    fields.push(cert.verificationScope);
  }
  if (cert.type === 'variationsSchedule') {
    fields.push((cert.variationItems?.length ?? 0) > 0 ? 'yes' : '');
  }
  const auto = fields.filter(f => isPopulated(f)).length;
  return { auto, manual: fields.length - auto };
}

const statusOptions: { value: DocumentStatus; label: string }[] = [
  { value: 'notStarted', label: 'Not Started' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'notApplicable', label: 'N/A' },
];

const statusIcons: Record<DocumentStatus, React.ElementType> = {
  notStarted: Circle,
  inProgress: Clock,
  complete: CheckCircle2,
  notApplicable: MinusCircle,
};

const statusColors: Record<DocumentStatus, string> = {
  notStarted: 'bg-muted text-muted-foreground',
  inProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  complete: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  notApplicable: 'bg-muted/50 text-muted-foreground',
};

const DESIGN_CHECKS = [
  'Design carried out in accordance with BS 5839-1:2017',
  'Wiring specification complies with Clause 26',
  'All documentation has been provided',
];

const INSTALLATION_CHECKS = [
  'Wiring tested per Clause 38 of BS 5839-1:2017',
  'As-fitted drawings supplied to commissioning person',
];

const COMMISSIONING_CHECKS = [
  'All equipment operates correctly',
  'Installation work is of an acceptable standard',
  'Entire system inspected and tested per Clause 39.2c)',
  'System performs as required by specification',
  'Cause & effect of FD&FA operates per fire strategy',
  'No obvious potential for unacceptable false alarms (Section 3)',
  'Documentation per Clause 40 provided to user',
];

const BS7273_4_CHECKS = [
  'All door release mechanisms operate correctly',
  'Actuation category confirmed and tested per Clause 20',
  'Interface design operates per fire strategy',
  'Documentation per Clause 20.6 provided',
];

const BS7273_6_CHECKS = [
  'All ASE interfaces operate correctly per Clause 19',
  'Interface design verified',
  'Cause & effect operates per fire strategy',
  'Documentation provided per Clause 20',
];

const ACCEPTANCE_STATUS_CHECKS = [
  'All installation work appears satisfactory',
  'System capable of giving a fire alarm signal',
  'Remote transmission operates correctly',
  'Zone plan provided on/adjacent to CIE',
];

const ACCEPTANCE_DOC_CHECKS = [
  'As-fitted drawings',
  'Operating and maintenance instructions',
  'Certificates of design, installation, and commissioning',
  'A logbook',
  'Electrical installation certificate (BS 7671)',
  'User representatives properly instructed',
  'All relevant tests witnessed',
];

const BS7273_4_DEVICE_TYPES = [
  'Electrically powered hold-open device(s)',
  'Electronic locks',
  'Electric door magnet(s)',
  'Powered sliding doors',
];

const BS7273_6_SYSTEMS = [
  'Smoke control systems',
  'Electrical supplies',
  'Lifts and other lifting appliances',
  'Ventilation systems',
  'Gas valves',
  'Lighting, intelligent signage and wayfinding',
  'Fire-resisting shutters and active fire curtain barriers',
  'Paging systems',
];

const BAFE_COMPLIANCE_CHECKS = [
  'Design module completed per BAFE SP203-1',
  'Installation module completed per BAFE SP203-1',
  'Commissioning module completed per BAFE SP203-1',
  'Maintenance arrangements in place',
  'All documentation provided to client',
  'Full BAFE SP203-1 compliance confirmed',
];

const BAFE_MODULAR_CHECKS = [
  'Work complies with BAFE SP203-1 requirements',
  'All testing completed satisfactorily',
  'Documentation provided',
];

const BS7671_COMPLIANCE_CHECKS = [
  'Installation complies with BS 7671',
  'All testing completed satisfactorily',
  'Installation is in a safe condition for continued use',
];

export function CertificatesSection() {
  const { data, updateData, projectId } = useJob();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const updateCert = (id: string, updates: Partial<CertificateRecord>) => {
    updateData({
      certificates: data.certificates.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const handleExportPDF = (cert: CertificateRecord) => {
    exportCertificateAsPDF(cert, data);
    toast.success(`Exporting ${CERTIFICATE_SHORT_LABELS[cert.type]} as PDF`);
  };

  const handleExportHTML = (cert: CertificateRecord) => {
    exportCertificateAsHTML(cert, data);
    toast.success(`Downloaded ${CERTIFICATE_SHORT_LABELS[cert.type]} as HTML`);
  };

  const handleBatchExport = () => {
    const completed = data.certificates.filter(c => c.status === 'complete');
    if (completed.length === 0) {
      toast.error('No completed certificates to export');
      return;
    }
    exportAllCertificatesAsPDF(data.certificates, data);
    toast.success(`Exporting ${completed.length} certificate(s) as combined PDF`);
  };

  const handleCloudSync = async () => {
    if (!user) {
      toast.error('Sign in to backup certificates to the cloud');
      return;
    }
    setSyncing(true);
    try {
      const result = await syncAllCertificatesToCloud(projectId, data.certificates, data);
      if (result.saved > 0) toast.success(`${result.saved} certificate(s) backed up to cloud`);
      if (result.errors > 0) toast.error(`${result.errors} certificate(s) failed to save`);
      if (result.saved === 0 && result.errors === 0) toast.info('No certificates to sync (complete or in-progress ones only)');
    } catch {
      toast.error('Cloud sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const completedCount = data.certificates.filter(c => c.status === 'complete').length;
  const applicableCount = data.certificates.filter(c => c.status !== 'notApplicable').length;
  const naCount = data.certificates.length - applicableCount;
  const progressPercent = applicableCount > 0 ? Math.round((completedCount / applicableCount) * 100) : 0;
  const displayedCerts = showAll ? data.certificates : data.certificates.filter(c => c.status !== 'notApplicable');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="spec-section-title text-xl mb-1">Certificates</h2>
          <p className="text-sm text-muted-foreground">
            Showing certificates selected as Core Fire responsibility from the specification. Export as PDF or HTML when complete.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleBatchExport} disabled={completedCount === 0}>
            <FileStack className="w-3.5 h-3.5" /> Export All ({completedCount})
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCloudSync} disabled={syncing}>
            {user ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
            {syncing ? 'Syncing...' : 'Backup to Cloud'}
          </Button>
        </div>
      </div>

      <div className="spec-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Certificate Completion</span>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{completedCount} of {applicableCount} applicable certificates complete</p>
          {naCount > 0 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-primary hover:underline"
            >
              {showAll ? 'Hide N/A certificates' : `Show all (${naCount} N/A hidden)`}
            </button>
          )}
        </div>
      </div>

      {displayedCerts.length === 0 && (
        <div className="spec-card text-center py-8">
          <MinusCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No certificates selected as Core Fire responsibility in the specification.</p>
          <button onClick={() => setShowAll(true)} className="text-xs text-primary hover:underline mt-2">Show all certificates</button>
        </div>
      )}

      <Accordion type="single" collapsible className="space-y-2">
        {displayedCerts.map(cert => {
          const StatusIcon = statusIcons[cert.status];
          const stats = getPopulationStats(cert);
          return (
            <AccordionItem key={cert.id} value={cert.id} className="spec-card border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <StatusIcon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{CERTIFICATE_SHORT_LABELS[cert.type]}</span>
                  {cert.status !== 'notApplicable' && stats.auto > 0 && (
                    <span className="text-[9px] text-primary/70 flex items-center gap-0.5 mr-2">
                      <Sparkles className="w-2.5 h-2.5" /> {stats.auto} auto
                    </span>
                  )}
                  <Badge variant="secondary" className={`${statusColors[cert.status]} text-[10px]`}>
                    {statusOptions.find(o => o.value === cert.status)?.label}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <CertificateForm
                  cert={cert}
                  jobData={data}
                  onUpdate={(updates) => updateCert(cert.id, updates)}
                  onExportPDF={() => handleExportPDF(cert)}
                  onExportHTML={() => handleExportHTML(cert)}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

interface CertFormProps {
  cert: CertificateRecord;
  jobData: import('@/types/jobData').JobData;
  onUpdate: (updates: Partial<CertificateRecord>) => void;
  onExportPDF: () => void;
  onExportHTML: () => void;
}

function CertificateForm({ cert, jobData, onUpdate, onExportPDF, onExportHTML }: CertFormProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* Status & Export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <Label className="text-xs">Status</Label>
          <Select value={cert.status} onValueChange={(v: DocumentStatus) => onUpdate({ status: v })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onExportPDF}>
            <Download className="w-3.5 h-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onExportHTML}>
            <FileText className="w-3.5 h-3.5" /> HTML
          </Button>
        </div>
      </div>

      {cert.status !== 'notApplicable' && (
        <>
          <Separator />

          {/* Site Details — common to all certificates */}
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Site Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs inline-flex items-center">Contract No <FieldTag populated={isPopulated(cert.contractNo)} /></Label>
              <Input className="h-8" value={cert.contractNo} onChange={e => onUpdate({ contractNo: e.target.value })} placeholder={jobData.jobReference || 'Contract reference'} />
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Client Name <FieldTag populated={isPopulated(cert.clientName)} /></Label>
              <Input className="h-8" value={cert.clientName} onChange={e => onUpdate({ clientName: e.target.value })} placeholder={jobData.customerName} />
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Site Name <FieldTag populated={isPopulated(cert.siteName)} /></Label>
              <Input className="h-8" value={cert.siteName} onChange={e => onUpdate({ siteName: e.target.value })} placeholder={jobData.siteName} />
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Client Address</Label>
              <Input className="h-8" value={cert.clientAddress || ''} onChange={e => onUpdate({ clientAddress: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs inline-flex items-center">Site Address <FieldTag populated={isPopulated(cert.siteAddress)} /></Label>
              <Input className="h-8" value={cert.siteAddress || ''} onChange={e => onUpdate({ siteAddress: e.target.value })} placeholder={jobData.siteAddress} />
            </div>
          </div>

          {/* Certificate-type-specific fields */}
          <CertificateSpecificFields cert={cert} onUpdate={onUpdate} />

          <Separator />

          {/* Extent & Variations */}
          <div>
            <Label className="text-xs inline-flex items-center">Extent of Work Covered <FieldTag populated={isPopulated(cert.extentOfWork)} /></Label>
            <Textarea rows={2} value={cert.extentOfWork} onChange={e => onUpdate({ extentOfWork: e.target.value })} placeholder="Describe the extent of work covered by this certificate..." />
          </div>
          <div>
            <Label className="text-xs inline-flex items-center">Variations from Standard <FieldTag populated={isPopulated(cert.variations)} /></Label>
            <Textarea rows={2} value={cert.variations} onChange={e => onUpdate({ variations: e.target.value })} placeholder="Variations from the specification and/or standard..." />
          </div>

          {/* Works required (commissioning types) */}
          {['bs5839Commissioning', 'bs7273_4', 'bs7273_6'].includes(cert.type) && (
            <>
              <div>
                <Label className="text-xs">Works Required Before/After Operational</Label>
                <Textarea rows={2} value={cert.worksRequired} onChange={e => onUpdate({ worksRequired: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Potential False Alarm Causes</Label>
                <Textarea rows={2} value={cert.falseAlarmNotes} onChange={e => onUpdate({ falseAlarmNotes: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Soak Test Period (weeks)</Label>
                <Input className="h-8 w-24" value={cert.soakTestWeeks} onChange={e => onUpdate({ soakTestWeeks: e.target.value })} placeholder="e.g. 2" />
              </div>
            </>
          )}

          <Separator />

          {/* Signatures */}
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signatures</h4>
          <p className="text-[10px] text-muted-foreground">I declare that I am a Competent Person and the works have been completed in accordance with the certifying statement above.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs inline-flex items-center">Name <FieldTag populated={isPopulated(cert.technicianName)} /></Label>
              <Input className="h-8" value={cert.technicianName} onChange={e => onUpdate({ technicianName: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Position <FieldTag populated={isPopulated(cert.technicianPosition)} /></Label>
              <Input className="h-8" value={cert.technicianPosition} onChange={e => onUpdate({ technicianPosition: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Signature (type name)</Label>
              <Input className="h-8" value={cert.technicianSignature || ''} onChange={e => onUpdate({ technicianSignature: e.target.value })} placeholder="Type name as signature" />
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Date <FieldTag populated={isPopulated(cert.signatureDate)} /></Label>
              <Input type="date" className="h-8" value={cert.signatureDate} onChange={e => onUpdate({ signatureDate: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">For and on behalf of (Company)</Label>
              <Input className="h-8" value={cert.companyName || ''} onChange={e => onUpdate({ companyName: e.target.value })} placeholder="Core Fire Protection" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs inline-flex items-center">Additional Notes <FieldTag populated={isPopulated(cert.notes)} /></Label>
            <Textarea rows={2} value={cert.notes} onChange={e => onUpdate({ notes: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}

function CertificateSpecificFields({ cert, onUpdate }: { cert: CertificateRecord; onUpdate: (u: Partial<CertificateRecord>) => void }) {
  const toggleCheck = (key: string) => {
    onUpdate({ operationalChecks: { ...cert.operationalChecks, [key]: !cert.operationalChecks[key] } });
  };
  const toggleAcceptanceCheck = (key: string) => {
    onUpdate({ acceptanceChecks: { ...cert.acceptanceChecks, [key]: !cert.acceptanceChecks[key] } });
  };
  const toggleBafeCheck = (key: string) => {
    onUpdate({ bafeComplianceChecks: { ...(cert.bafeComplianceChecks || {}), [key]: !(cert.bafeComplianceChecks || {})[key] } });
  };
  const toggleBs7671Check = (key: string) => {
    onUpdate({ bs7671ComplianceChecks: { ...(cert.bs7671ComplianceChecks || {}), [key]: !(cert.bs7671ComplianceChecks || {})[key] } });
  };

  switch (cert.type) {
    case 'bs5839Design':
      return (
        <div className="space-y-4">
          {/* System Details */}
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs inline-flex items-center">System Category <FieldTag populated={isPopulated(cert.systemCategory)} /></Label>
              <Select value={cert.systemCategory} onValueChange={v => onUpdate({ systemCategory: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {['M', 'L1', 'L2', 'L3', 'L4', 'L5', 'P1', 'P2'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">F&RS Signalling</Label>
              <Select value={cert.frsSignalling || ''} onValueChange={v => onUpdate({ frsSignalling: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">System Type <FieldTag populated={isPopulated(cert.systemType)} /></Label>
              <Select value={cert.systemType} onValueChange={v => onUpdate({ systemType: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Addressable">Addressable</SelectItem>
                  <SelectItem value="Conventional">Conventional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Specification Reference <FieldTag populated={isPopulated(cert.specReference)} /></Label>
              <Input className="h-8" value={cert.specReference} onChange={e => onUpdate({ specReference: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={cert.specProvided} onCheckedChange={v => onUpdate({ specProvided: !!v })} />
              <Label className="text-xs">Spec Provided</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={cert.drawingsProvided} onCheckedChange={v => onUpdate({ drawingsProvided: !!v })} />
              <Label className="text-xs">Drawings Provided</Label>
            </div>
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Design Specification</h4>
          <div>
            <Label className="text-xs">Design specification</Label>
            <Textarea rows={2} value={cert.designSpecification || ''} onChange={e => onUpdate({ designSpecification: e.target.value })} placeholder="Design specification details..." />
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Checks</h4>
          {DESIGN_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bs5839Installation':
      return (
        <div className="space-y-4">
          <Separator />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            I/we being the competent person(s) responsible for the installation of the fire detection and fire alarm system, CERTIFY that the said installation complies with the specification described below and with the recommendations of Section 4 of BS 5839-1:2017.
          </p>
          <div>
            <Label className="text-xs">Specification against which system was installed</Label>
            <Textarea rows={2} value={cert.installationSpec || ''} onChange={e => onUpdate({ installationSpec: e.target.value })} />
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Checks</h4>
          {INSTALLATION_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
          <div>
            <Label className="text-xs">Test results provided to</Label>
            <Input className="h-8" value={cert.testResultsProvidedTo || ''} onChange={e => onUpdate({ testResultsProvidedTo: e.target.value })} />
          </div>
        </div>
      );

    case 'bs5839Commissioning':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs inline-flex items-center">System Category <FieldTag populated={isPopulated(cert.systemCategory)} /></Label>
              <Select value={cert.systemCategory} onValueChange={v => onUpdate({ systemCategory: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {['M', 'L1', 'L2', 'L3', 'L4', 'L5', 'P1', 'P2'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">F&RS Signalling</Label>
              <Select value={cert.frsSignalling || ''} onValueChange={v => onUpdate({ frsSignalling: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">System Type <FieldTag populated={isPopulated(cert.systemType)} /></Label>
              <Select value={cert.systemType} onValueChange={v => onUpdate({ systemType: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Addressable">Addressable</SelectItem>
                  <SelectItem value="Conventional">Conventional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs inline-flex items-center">Specification Reference <FieldTag populated={isPopulated(cert.specReference)} /></Label>
              <Input className="h-8" value={cert.specReference} onChange={e => onUpdate({ specReference: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={cert.specProvided} onCheckedChange={v => onUpdate({ specProvided: !!v })} />
              <Label className="text-xs">Spec Provided</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={cert.drawingsProvided} onCheckedChange={v => onUpdate({ drawingsProvided: !!v })} />
              <Label className="text-xs">Drawings Provided</Label>
            </div>
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Checks</h4>
          {COMMISSIONING_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bs5839Acceptance':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Status</h4>
          {ACCEPTANCE_STATUS_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.acceptanceChecks[check]} onCheckedChange={() => toggleAcceptanceCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentation Provided</h4>
          {ACCEPTANCE_DOC_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.acceptanceChecks[check]} onCheckedChange={() => toggleAcceptanceCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
          <div>
            <Label className="text-xs">Works required before acceptance</Label>
            <Textarea rows={2} value={cert.worksRequired || ''} onChange={e => onUpdate({ worksRequired: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs inline-flex items-center">Accepted on behalf of <FieldTag populated={isPopulated(cert.acceptanceOnBehalfOf)} /></Label>
            <Input className="h-8" value={cert.acceptanceOnBehalfOf} onChange={e => onUpdate({ acceptanceOnBehalfOf: e.target.value })} placeholder="Organisation name" />
          </div>
        </div>
      );

    case 'bs5839Verification':
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs inline-flex items-center">Scope of Verification Work <FieldTag populated={isPopulated(cert.verificationScope)} /></Label>
            <Textarea rows={2} value={cert.verificationScope} onChange={e => onUpdate({ verificationScope: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs inline-flex items-center">Non-Compliances Identified <FieldTag populated={isPopulated(cert.verificationNonCompliances)} /></Label>
            <Textarea rows={2} value={cert.verificationNonCompliances} onChange={e => onUpdate({ verificationNonCompliances: e.target.value })} placeholder="Other than those recorded as variations..." />
          </div>
        </div>
      );

    case 'bs7273_4':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Door Actuation Details</h4>
          <div>
            <Label className="text-xs inline-flex items-center">Category of Actuation <FieldTag populated={isPopulated(cert.bs7273_4CategoryOfActuation)} /></Label>
            <Select value={cert.bs7273_4CategoryOfActuation} onValueChange={v => onUpdate({ bs7273_4CategoryOfActuation: v })}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical (A)">Critical (A)</SelectItem>
                <SelectItem value="Standard (B)">Standard (B)</SelectItem>
                <SelectItem value="Indirect (C)">Indirect (C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs inline-flex items-center">Description of release mechanisms, methods, and interface design (Clause 7 & 9) <FieldTag populated={isPopulated(cert.bs7273_4ReleaseDescription)} /></Label>
            <Textarea rows={3} value={cert.bs7273_4ReleaseDescription} onChange={e => onUpdate({ bs7273_4ReleaseDescription: e.target.value })} />
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Checks</h4>
          {BS7273_4_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bs7273_6':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ancillary Systems & Equipment (ASE)</h4>
          <p className="text-[10px] text-muted-foreground">Select all applicable systems:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {BS7273_6_SYSTEMS.map(system => (
              <div key={system} className="flex items-center gap-2">
                <Checkbox
                  checked={(cert.bs7273_6Systems || []).includes(system)}
                  onCheckedChange={checked => {
                    const systems = checked
                      ? [...(cert.bs7273_6Systems || []), system]
                      : (cert.bs7273_6Systems || []).filter(s => s !== system);
                    onUpdate({ bs7273_6Systems: systems });
                  }}
                />
                <Label className="text-xs">{system}</Label>
              </div>
            ))}
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Checks</h4>
          {BS7273_6_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bafeSP203Modular':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Module Details</h4>
          <div>
            <Label className="text-xs">Module Type</Label>
            <Select value={cert.bafeModuleType || ''} onValueChange={v => onUpdate({ bafeModuleType: v })}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Installation">Installation</SelectItem>
                <SelectItem value="Commissioning">Commissioning</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Module description and scope</Label>
            <Textarea rows={2} value={cert.bafeModuleDescription || ''} onChange={e => onUpdate({ bafeModuleDescription: e.target.value })} />
          </div>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checks</h4>
          {BAFE_MODULAR_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!cert.operationalChecks[check]} onCheckedChange={() => toggleCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bafeSP203Compliance':
      return (
        <div className="space-y-4">
          <Separator />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            This certificate confirms that the fire detection and fire alarm system has been designed, installed, commissioned, and where applicable maintained in full compliance with the BAFE SP203-1 scheme requirements.
          </p>
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance Checks</h4>
          {BAFE_COMPLIANCE_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!(cert.bafeComplianceChecks || {})[check]} onCheckedChange={() => toggleBafeCheck(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'bs7671Electrical':
      return (
        <div className="space-y-4">
          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Circuit Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Circuit Description</Label>
              <Input className="h-8" value={cert.bs7671CircuitDescription || ''} onChange={e => onUpdate({ bs7671CircuitDescription: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Cable Type (S/E)</Label>
              <Input className="h-8" value={cert.bs7671CableType || ''} onChange={e => onUpdate({ bs7671CableType: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Cable Size (mm²)</Label>
              <Input className="h-8" value={cert.bs7671CableSize || ''} onChange={e => onUpdate({ bs7671CableSize: e.target.value })} />
            </div>
          </div>

          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Insulation Resistance (MΩ)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Pos–Neg (MΩ)</Label>
              <Input className="h-8" value={cert.bs7671IrPosNeg || ''} onChange={e => onUpdate({ bs7671IrPosNeg: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Pos–Screen (MΩ)</Label>
              <Input className="h-8" value={cert.bs7671IrPosScreen || ''} onChange={e => onUpdate({ bs7671IrPosScreen: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Neg–Screen (MΩ)</Label>
              <Input className="h-8" value={cert.bs7671IrNegScreen || ''} onChange={e => onUpdate({ bs7671IrNegScreen: e.target.value })} />
            </div>
          </div>

          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Circuit Continuity (Ω)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Pos + Neg (Ω)</Label>
              <Input className="h-8" value={cert.bs7671ContinuityPosNeg || ''} onChange={e => onUpdate({ bs7671ContinuityPosNeg: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Pos + Pos (Ω)</Label>
              <Input className="h-8" value={cert.bs7671ContinuityPosPos || ''} onChange={e => onUpdate({ bs7671ContinuityPosPos: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Neg + Neg (Ω)</Label>
              <Input className="h-8" value={cert.bs7671ContinuityNegNeg || ''} onChange={e => onUpdate({ bs7671ContinuityNegNeg: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Screen + Screen (Ω)</Label>
              <Input className="h-8" value={cert.bs7671ContinuityScreenScreen || ''} onChange={e => onUpdate({ bs7671ContinuityScreenScreen: e.target.value })} />
            </div>
          </div>

          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Additional Tests</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Zs Value (Ω)</Label>
              <Input className="h-8" value={cert.bs7671ZsValue || ''} onChange={e => onUpdate({ bs7671ZsValue: e.target.value })} />
            </div>
            <div className="flex items-center gap-4 pt-5">
              <div className="flex items-center gap-2">
                <Checkbox checked={cert.bs7671PolarityCorrect || false} onCheckedChange={v => onUpdate({ bs7671PolarityCorrect: !!v })} />
                <Label className="text-xs">Polarity Correct</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={cert.bs7671RcdSatisfactory || false} onCheckedChange={v => onUpdate({ bs7671RcdSatisfactory: !!v })} />
                <Label className="text-xs">RCD test satisfactory</Label>
              </div>
            </div>
          </div>

          <Separator />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance Checks</h4>
          {BS7671_COMPLIANCE_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2">
              <Checkbox checked={!!(cert.bs7671ComplianceChecks || {})[check]} onCheckedChange={() => toggleBs7671Check(check)} />
              <Label className="text-xs">{check}</Label>
            </div>
          ))}
        </div>
      );

    case 'variationsSchedule':
      return (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule of Variations</h4>
          {(cert.variationItems || []).map((item, i) => (
            <div key={item.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-start">
              <Textarea
                rows={1}
                className="text-xs"
                value={item.description}
                placeholder="Description of variation"
                onChange={e => {
                  const items = [...cert.variationItems];
                  items[i] = { ...items[i], description: e.target.value };
                  onUpdate({ variationItems: items });
                }}
              />
              <Input
                className="h-8 text-xs"
                value={item.clauseRef}
                placeholder="Clause ref"
                onChange={e => {
                  const items = [...cert.variationItems];
                  items[i] = { ...items[i], clauseRef: e.target.value };
                  onUpdate({ variationItems: items });
                }}
              />
              <button
                onClick={() => onUpdate({ variationItems: cert.variationItems.filter(v => v.id !== item.id) })}
                className="text-muted-foreground hover:text-destructive mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onUpdate({
              variationItems: [...(cert.variationItems || []), { id: crypto.randomUUID(), description: '', clauseRef: '' }],
            })}
          >
            <Plus className="w-3 h-3" /> Add Variation
          </Button>
        </div>
      );

    default:
      return null;
  }
}
