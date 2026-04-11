import React, { useState } from 'react';
import { useJob } from '@/context/JobContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Cloud, CloudOff, BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useRef } from 'react';
import { CERTIFICATE_LABELS, CERTIFICATE_SHORT_LABELS } from '@/types/jobData';
import { exportCertificateAsPDF, exportCertificateAsHTML, generateCertificateHTML } from '@/lib/certificateExport';
import { syncAllCertificatesToCloud } from '@/lib/certificateCloud';
import { toast } from 'sonner';
import { DrawingLibrary } from './DrawingLibrary';
import { useProjectDrawings } from '@/hooks/useProjectDrawings';
import { exportOperatingManual, downloadOperatingManualHTML } from '@/lib/operatingManualExport';

// Shared inline style helpers
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Space Grotesk, sans-serif', fontSize: '14pt', fontWeight: 700,
  color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '2px solid #c0392b', paddingBottom: '4px', marginBottom: '12px',
};
const subTitle: React.CSSProperties = { fontFamily: 'Space Grotesk, sans-serif', fontSize: '11pt', fontWeight: 600, marginBottom: '6px', marginTop: '16px' };
const th: React.CSSProperties = { border: '1px solid #e8e4dd', padding: '5px 8px', background: '#f5f3ee', fontWeight: 600 };
const td: React.CSSProperties = { border: '1px solid #e8e4dd', padding: '4px 8px' };
const tdLabel: React.CSSProperties = { ...td, fontWeight: 600, width: '200px' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', margin: '8px 0' };

export function OperatingManualSection() {
  const { data, projectId } = useJob();
  const { user } = useAuth();
  const manualRef = useRef<HTMLDivElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { drawings } = useProjectDrawings(projectId);

  const handlePrint = () => {
    const content = manualRef.current;
    if (!content) return;
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>Operating Manual - ${data.siteName || 'Draft'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @page { size: A4 portrait; margin: 20mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; font-size: 10pt; color: #0d0d0d; line-height: 1.6; }
        h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
        th, td { border: 1px solid #e8e4dd; padding: 5px 8px; text-align: left; }
        th { background: #f5f3ee; font-weight: 600; }
        ul, ol { padding-left: 16px; }
        li { margin-bottom: 3px; }
        .page-break { break-before: page; }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  const completedCerts = data.certificates.filter(c => c.status === 'complete');
  const cl = data.commissioningChecklist;

  // TOC items
  const tocItems = [
    { num: '1', title: 'Document Control' },
    { num: '2', title: 'Project Overview' },
    { num: '3', title: 'System Overview' },
    { num: '4', title: 'Technical Datasheets' },
    { num: '5', title: 'Equipment O&M Instructions' },
    { num: '6', title: 'Configuration List' },
    { num: '7', title: 'Test & Handover Certification' },
    { num: '8', title: 'Commissioning Report' },
    { num: '9', title: 'System Drawings & Zone Chart' },
    { num: '10', title: 'Maintenance Procedures' },
    { num: '11', title: 'Warranty Information' },
    { num: '12', title: 'Health & Safety' },
    { num: '13', title: 'Fire Safety Log Book' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="spec-section-title text-xl mb-1">Operating Manual</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive web-based operating manual collating all completed project documentation.
          </p>
        </div>
        <Button
          onClick={async () => {
            setDownloading(true);
            try {
              await downloadOperatingManualHTML(projectId, data, drawings);
              toast.success('HTML file downloaded');
            } catch (err) {
              toast.error('Download failed');
              console.error(err);
            } finally {
              setDownloading(false);
            }
          }}
          disabled={downloading}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          {downloading ? 'Preparing...' : 'Download HTML'}
        </Button>
      </div>

      {/* Section Progress Indicator */}
      {(() => {
        const sections = [
          { num: 1, title: 'Document Control', done: !!(data.jobReference && data.projectManager) },
          { num: 2, title: 'Project Overview', done: data.projectOverview.status === 'complete' },
          { num: 3, title: 'System Overview', done: data.systemOverview.status === 'complete' },
          { num: 4, title: 'Technical Datasheets', done: data.userManuals.datasheets.status === 'complete' },
          { num: 5, title: 'O&M Instructions', done: data.userManuals.controlPanelManual.status === 'complete' },
          { num: 6, title: 'Configuration List', done: false }, // manual inclusion
          { num: 7, title: 'Certificates', done: data.certificates.filter(c => c.status !== 'notApplicable').every(c => c.status === 'complete') },
          { num: 8, title: 'Commissioning Report', done: !!(cl.powerSupply.cieChargeVoltage && cl.systemChecks.allDevicesTested) },
          { num: 9, title: 'Drawings & Zone Chart', done: data.drawings.forApproval.status === 'complete' && data.drawings.asFitted.status === 'complete' },
          { num: 10, title: 'Maintenance Procedures', done: data.maintenanceProcedures.status === 'complete' },
          { num: 11, title: 'Warranty Information', done: data.warranty.status === 'complete' },
          { num: 12, title: 'Health & Safety', done: data.healthSafety.status === 'complete' },
          { num: 13, title: 'Fire Safety Log Book', done: data.logBook.status === 'complete' },
        ];
        const doneCount = sections.filter(s => s.done).length;
        const pct = Math.round((doneCount / sections.length) * 100);
        return (
          <div className="spec-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="spec-section-title text-sm">Manual Completeness</h3>
              <span className="text-sm font-bold text-primary">{doneCount}/{sections.length} sections</span>
            </div>
            <Progress value={pct} className="h-2.5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sections.map(s => (
                <div key={s.num} className="flex items-center gap-2 py-1 px-2 rounded text-xs">
                  {s.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  }
                  <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>
                    <span className="font-medium">S{s.num}</span> — {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* All Certificates — Status & Download */}
      <div className="spec-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="spec-section-title text-sm">Certificates — Status & Downloads</h3>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={syncing || !user}
            onClick={async () => {
              if (!user) { toast.error('Sign in to backup certificates'); return; }
              setSyncing(true);
              try {
                const result = await syncAllCertificatesToCloud(projectId, data.certificates, data);
                if (result.saved > 0) toast.success(`${result.saved} certificate(s) backed up`);
                if (result.errors > 0) toast.error(`${result.errors} failed`);
                if (result.saved === 0 && result.errors === 0) toast.info('Nothing to sync');
              } catch { toast.error('Backup failed'); }
              finally { setSyncing(false); }
            }}
          >
            {user ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
            {syncing ? 'Syncing...' : 'Backup All to Cloud'}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {data.certificates.map(cert => {
            const isComplete = cert.status === 'complete';
            const isNA = cert.status === 'notApplicable';
            return (
              <div key={cert.id} className={`flex items-center justify-between p-2.5 rounded-md border ${isComplete ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' : 'border-border bg-muted/20'}`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-medium truncate">{CERTIFICATE_SHORT_LABELS[cert.type]}</span>
                  <Badge variant="secondary" className={`text-[9px] shrink-0 ${
                    isComplete ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    isNA ? 'bg-muted/50 text-muted-foreground' :
                    cert.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? 'Complete' : isNA ? 'N/A' : cert.status === 'inProgress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                {isComplete && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { exportCertificateAsPDF(cert, data); toast.success('Exporting PDF'); }}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { exportCertificateAsHTML(cert, data); toast.success('Downloaded HTML'); }}>
                      <FileText className="w-3 h-3 mr-1" /> HTML
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background shadow-lg">
        <div ref={manualRef}>
          {/* ======= COVER PAGE ======= */}
          <div style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '60px 40px', background: '#0d0d0d', color: '#f5f3ee' }}>
            <p style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, marginBottom: '16px' }}>Operation and Maintenance Manual</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Fire Detection & Alarm System
            </h1>
            <div style={{ width: '60px', height: '3px', background: '#c0392b', margin: '16px auto' }} />
            <div style={{ fontSize: '11pt', opacity: 0.8, lineHeight: 2, marginTop: '16px' }}>
              {data.siteName && <p style={{ fontSize: '14pt', fontWeight: 600 }}>{data.siteName}</p>}
              {data.siteAddress && <p style={{ whiteSpace: 'pre-line', fontSize: '10pt' }}>{data.siteAddress}</p>}
              {data.customerName && <p style={{ marginTop: '16px' }}>Prepared for: <strong>{data.customerName}</strong></p>}
              {data.jobReference && <p>Job Reference: {data.jobReference}</p>}
              {data.specReference && <p>Specification Reference: {data.specReference}</p>}
              <p style={{ marginTop: '16px', opacity: 0.6 }}>In compliance with BS 5839-1: 2025</p>
            </div>
          </div>

          <div style={{ padding: '32px', fontFamily: 'DM Sans, sans-serif', fontSize: '10pt', lineHeight: 1.6, color: '#0d0d0d' }}>

            {/* ---- TABLE OF CONTENTS ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Contents</h2>
              {tocItems.map((item) => (
                <div key={item.num} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #ccc', padding: '5px 0', fontSize: '10pt' }}>
                  <span><strong>Section {item.num}</strong> — {item.title}</span>
                </div>
              ))}
            </div>

            {/* ---- SECTION 1: DOCUMENT CONTROL ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 1 — Document Control</h2>
              <table style={tbl}>
                <tbody>
                  <tr><td style={tdLabel}>Job Reference</td><td style={td}>{data.jobReference || '—'}</td></tr>
                  <tr><td style={tdLabel}>Specification Reference</td><td style={td}>{data.specReference || '—'}</td></tr>
                  <tr><td style={tdLabel}>Project Manager</td><td style={td}>{data.projectManager || '—'}</td></tr>
                  <tr><td style={tdLabel}>Contract Date</td><td style={td}>{data.contractDate || '—'}</td></tr>
                  <tr><td style={tdLabel}>Target Completion</td><td style={td}>{data.targetCompletionDate || '—'}</td></tr>
                  <tr><td style={tdLabel}>Document Status</td><td style={td}>{data.status === 'complete' ? 'Final' : 'Working Draft'}</td></tr>
                </tbody>
              </table>
              <table style={{ ...tbl, marginTop: '12px' }}>
                <thead>
                  <tr><th style={th}>Rev</th><th style={th}>Date</th><th style={th}>Description</th><th style={th}>Author</th></tr>
                </thead>
                <tbody>
                  <tr><td style={td}>A</td><td style={td}>{data.contractDate || '—'}</td><td style={td}>Initial Issue</td><td style={td}>{data.projectManager || '—'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* ---- SECTION 2: PROJECT OVERVIEW ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 2 — Project Overview</h2>
              <table style={tbl}>
                <tbody>
                  <tr><td style={tdLabel}>Client</td><td style={td}>{data.customerName || '—'}</td></tr>
                  <tr><td style={tdLabel}>Site</td><td style={td}>{data.siteName || '—'}</td></tr>
                  <tr><td style={tdLabel}>Address</td><td style={{ ...td, whiteSpace: 'pre-line' }}>{data.siteAddress || '—'}</td></tr>
                  <tr><td style={tdLabel}>Project Manager</td><td style={td}>{data.projectManager || '—'}</td></tr>
                  <tr><td style={tdLabel}>Contract Date</td><td style={td}>{data.contractDate || '—'}</td></tr>
                </tbody>
              </table>
              <h3 style={subTitle}>Scope of Works</h3>
              <p>This operating manual relates to the fire detection and alarm system installed at the above premises. The manual contains all relevant documentation required for the ongoing operation, testing and maintenance of the system.</p>
            </div>

            {/* ---- SECTION 3: SYSTEM OVERVIEW ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 3 — System Overview</h2>
              {data.systemOverview.description ? (
                <p style={{ whiteSpace: 'pre-line' }}>{data.systemOverview.description}</p>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#999' }}>System overview to be completed. Describe the type of system installed, panel make/model, number of zones/loops, and general arrangement.</p>
              )}
              <h3 style={subTitle}>System Components Summary</h3>
              <p style={{ fontSize: '9pt' }}>Refer to the Bill of Materials within the original specification for a complete list of equipment installed.</p>
            </div>

            {/* ---- SECTION 4: TECHNICAL DATASHEETS ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 4 — Technical Datasheets</h2>
              <p>The following technical datasheets are included within this section and should be retained for reference:</p>
              <table style={tbl}>
                <thead><tr><th style={{ ...th, width: '40px' }}>#</th><th style={th}>Document</th><th style={{ ...th, width: '100px', textAlign: 'center' }}>Status</th></tr></thead>
                <tbody>
                  <tr><td style={td}>1</td><td style={td}>Control Panel Technical Datasheet</td><td style={{ ...td, textAlign: 'center' }}>{data.userManuals.controlPanelManual.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                  <tr><td style={td}>2</td><td style={td}>Detector / Device Technical Datasheets</td><td style={{ ...td, textAlign: 'center' }}>{data.userManuals.datasheets.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                  {data.userManuals.additionalDocs.map((doc, i) => (
                    <tr key={doc.id}><td style={td}>{i + 3}</td><td style={td}>{doc.name}</td><td style={{ ...td, textAlign: 'center' }}>{doc.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '9pt', marginTop: '8px', fontStyle: 'italic' }}>Note: Where datasheets are supplied electronically, digital copies should be retained alongside this manual.</p>
            </div>

            {/* ---- SECTION 5: EQUIPMENT O&M INSTRUCTIONS ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 5 — Equipment O&M Instructions</h2>
              <p>Manufacturer's operation and maintenance instructions for the control and indicating equipment are included within this section.</p>
              <table style={tbl}>
                <thead><tr><th style={{ ...th, width: '40px' }}>#</th><th style={th}>Document</th><th style={{ ...th, width: '100px', textAlign: 'center' }}>Status</th></tr></thead>
                <tbody>
                  <tr><td style={td}>1</td><td style={td}>Control Panel Operation Manual</td><td style={{ ...td, textAlign: 'center' }}>{data.userManuals.controlPanelManual.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                </tbody>
              </table>
              <h3 style={subTitle}>Project Specific Operating Instructions</h3>
              <p>The following project specific instructions apply to this installation:</p>
              <ul style={{ paddingLeft: '16px', marginTop: '8px', fontSize: '9pt' }}>
                <li><strong>Isolating a device or zone:</strong> Refer to the control panel user manual for the isolate/de-isolate procedure specific to this panel type.</li>
                <li><strong>Weekly testing:</strong> A different manual call point should be tested each week using the test key. Notify the ARC (if applicable) before testing.</li>
                <li><strong>In the event of an alarm:</strong> Evacuate the building, call the fire service, do not re-enter until authorised. Only reset the panel once the cause has been identified.</li>
                <li><strong>In the event of a fault:</strong> Record the fault in the log book and contact the service organisation promptly.</li>
                <li><strong>Service organisation contact:</strong> Core Fire Protection — Tel: 0141 433 1934 — Email: service@corefire.co.uk</li>
              </ul>
            </div>

            {/* ---- SECTION 6: CONFIGURATION LIST ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 6 — Configuration List</h2>
              <p>A copy of the system configuration / device address list should be included within this section. This document records the addressing and programming of all devices within the system.</p>
              <table style={tbl}>
                <thead><tr><th style={th}>Item</th><th style={{ ...th, width: '100px', textAlign: 'center' }}>Status</th></tr></thead>
                <tbody>
                  <tr><td style={td}>Device Address / Configuration List</td><td style={{ ...td, textAlign: 'center' }}>{data.systemOverview.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                  <tr><td style={td}>Zone / Loop Schedule</td><td style={{ ...td, textAlign: 'center' }}>{data.systemOverview.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
                  <tr><td style={td}>Cause & Effect Matrix</td><td style={{ ...td, textAlign: 'center' }}>☐ Pending</td></tr>
                </tbody>
              </table>
            </div>

            {/* ---- SECTION 7: CERTIFICATES ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 7 — Test & Handover Certification</h2>
              <p style={{ marginBottom: '8px' }}>The following certificates have been issued for this installation:</p>
              {completedCerts.length > 0 ? (
                completedCerts.map(cert => (
                  <div key={cert.id} style={{ marginBottom: '16px', border: '1px solid #e8e4dd', borderRadius: '4px', padding: '12px' }}>
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '11pt', fontWeight: 600, marginBottom: '8px', color: '#c0392b' }}>
                      {CERTIFICATE_LABELS[cert.type]}
                    </h3>
                    <table style={tbl}>
                      <tbody>
                        <tr><td style={tdLabel}>Contract No</td><td style={td}>{cert.contractNo || '—'}</td></tr>
                        <tr><td style={tdLabel}>Technician</td><td style={td}>{cert.technicianName}{cert.technicianPosition ? ` — ${cert.technicianPosition}` : ''}</td></tr>
                        <tr><td style={tdLabel}>Date</td><td style={td}>{cert.signatureDate || '—'}</td></tr>
                        <tr><td style={tdLabel}>Extent of Work</td><td style={td}>{cert.extentOfWork || '—'}</td></tr>
                        {cert.variations && <tr><td style={tdLabel}>Variations</td><td style={td}>{cert.variations}</td></tr>}
                        <tr><td style={tdLabel}>Signed</td><td style={td}>{cert.signed ? '✓ Yes' : '✗ No'}</td></tr>
                        {cert.notes && <tr><td style={tdLabel}>Notes</td><td style={td}>{cert.notes}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <table style={tbl}>
                  <thead><tr><th style={th}>Certificate</th><th style={{ ...th, width: '100px', textAlign: 'center' }}>Status</th></tr></thead>
                  <tbody>
                    {data.certificates.map(cert => (
                      <tr key={cert.id}>
                        <td style={td}>{CERTIFICATE_LABELS[cert.type]}</td>
                        <td style={{ ...td, textAlign: 'center' }}>
                          {cert.status === 'complete' ? '✓ Complete' : cert.status === 'inProgress' ? '◐ In Progress' : '☐ Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ---- SECTION 8: COMMISSIONING REPORT ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 8 — Commissioning Report</h2>

              <h3 style={subTitle}>Power Supply</h3>
              <table style={tbl}>
                <tbody>
                  <tr>
                    <td style={tdLabel}>CIE Charge Voltage</td><td style={td}>{cl.powerSupply.cieChargeVoltage || '—'}</td>
                    <td style={tdLabel}>PSU Output</td><td style={td}>{cl.powerSupply.ciePsuOutput || '—'}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Battery 1</td><td style={td}>{cl.powerSupply.battery1Vdc || '—'} Vdc</td>
                    <td style={tdLabel}>Battery 2</td><td style={td}>{cl.powerSupply.battery2Vdc || '—'} Vdc</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Standby Required</td><td style={td}>{cl.powerSupply.standbyRequired || '—'} AHr</td>
                    <td style={tdLabel}>Standby Fitted</td><td style={td}>{cl.powerSupply.standbyFitted || '—'} AHr</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Batteries Labelled</td><td style={td}>{cl.powerSupply.batteriesLabelled ? '✓' : '✗'}</td>
                    <td style={tdLabel}>Standby Confirmed</td><td style={td}>{cl.powerSupply.standbyConfirmed ? '✓' : '✗'}</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={subTitle}>Cable Test Records</h3>
              <table style={tbl}>
                <tbody>
                  <tr><td style={td}>Insulation Resistance (IR) Tests Completed</td><td style={{ ...td, width: '60px', textAlign: 'center' }}>{cl.cableTests.irTested ? '✓' : '✗'}</td></tr>
                  <tr><td style={td}>Continuity (CCTR) Tests Completed</td><td style={{ ...td, textAlign: 'center' }}>{cl.cableTests.cctrTested ? '✓' : '✗'}</td></tr>
                  <tr><td style={td}>Zs Tests Completed</td><td style={{ ...td, textAlign: 'center' }}>{cl.cableTests.zsTested ? '✓' : '✗'}</td></tr>
                  <tr><td style={td}>Separate Cable Test Sheet Attached</td><td style={{ ...td, textAlign: 'center' }}>{cl.cableTests.separateSheetAttached ? '✓' : '✗'}</td></tr>
                </tbody>
              </table>

              {cl.cableTests.circuits.length > 0 && (
                <>
                  <h3 style={subTitle}>Circuit Test Results</h3>
                  <table style={tbl}>
                    <thead>
                      <tr>
                        <th style={th}>Circuit</th><th style={th}>Cable Type</th><th style={th}>Cable Size</th>
                        <th style={{ ...th, textAlign: 'center' }}>IR Result</th><th style={{ ...th, textAlign: 'center' }}>Polarity OK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cl.cableTests.circuits.map(c => (
                        <tr key={c.id}>
                          <td style={td}>{c.description}</td><td style={td}>{c.cableType}</td><td style={td}>{c.cableSize}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{c.irResult || '—'}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{c.polarityOk ? '✓' : '✗'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h3 style={subTitle}>System Checks</h3>
              <table style={tbl}>
                <tbody>
                  {[
                    ['All equipment operates correctly', cl.systemChecks.allDevicesTested],
                    ['All sounders/beacons verified', cl.systemChecks.soundersVerified],
                    ['Zone chart provided', cl.systemChecks.zoneChartProvided],
                    ['Cause & effect tested', cl.systemChecks.causeEffectTested],
                    ['False alarm risk assessed', cl.systemChecks.falseAlarmRiskAssessed],
                  ].map(([label, val], i) => (
                    <tr key={i}>
                      <td style={td}>{label as string}</td>
                      <td style={{ ...td, width: '60px', textAlign: 'center' }}>{(val as boolean) ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cl.systemChecks.soakTestWeeks && <p style={{ marginTop: '8px', fontSize: '9pt' }}><strong>Soak test period:</strong> {cl.systemChecks.soakTestWeeks} week(s)</p>}
              {cl.systemChecks.notes && <p style={{ marginTop: '4px', fontSize: '9pt' }}><strong>Notes:</strong> {cl.systemChecks.notes}</p>}
            </div>

            {/* ---- SECTION 9: DRAWINGS ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 9 — System Drawings & Zone Chart</h2>
              <p>The following drawings are included within this section:</p>
              <table style={tbl}>
                <thead><tr><th style={th}>Drawing</th><th style={{ ...th, width: '100px', textAlign: 'center' }}>Status</th><th style={{ ...th, width: '120px' }}>Completed By</th><th style={{ ...th, width: '100px' }}>Date</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={td}>For Approval Drawings</td>
                    <td style={{ ...td, textAlign: 'center' }}>{data.drawings.forApproval.status === 'complete' ? '✓ Complete' : '☐ Pending'}</td>
                    <td style={td}>{data.drawings.forApproval.completedBy || '—'}</td>
                    <td style={td}>{data.drawings.forApproval.completedDate || '—'}</td>
                  </tr>
                  <tr>
                    <td style={td}>As Fitted Drawings</td>
                    <td style={{ ...td, textAlign: 'center' }}>{data.drawings.asFitted.status === 'complete' ? '✓ Complete' : '☐ Pending'}</td>
                    <td style={td}>{data.drawings.asFitted.completedBy || '—'}</td>
                    <td style={td}>{data.drawings.asFitted.completedDate || '—'}</td>
                  </tr>
                  <tr>
                    <td style={td}>Zone Chart / Diagram</td>
                    <td style={{ ...td, textAlign: 'center' }}>{data.drawings.zoneChart.status === 'complete' ? '✓ Complete' : '☐ Pending'}</td>
                    <td style={td}>{data.drawings.zoneChart.completedBy || '—'}</td>
                    <td style={td}>{data.drawings.zoneChart.completedDate || '—'}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '9pt', marginTop: '8px' }}>A diagrammatic zone chart should be displayed adjacent to the control and indicating equipment in accordance with BS 5839-1:2025.</p>
            </div>

            {/* Drawing Library (non-printable interactive section) */}
            <div className="no-print" style={{ marginBottom: '24px', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ ...subTitle, marginTop: 0 }}>📁 Drawing Library</h3>
              <p className="text-xs text-muted-foreground mb-3">All project drawings with revision history. These are stored in the cloud.</p>
              <DrawingLibrary projectId={projectId} readOnly compact />
            </div>

            {/* ---- SECTION 10: MAINTENANCE ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 10 — Maintenance Procedures</h2>
              <p>The fire detection and alarm system should be maintained in accordance with <strong>BS 5839-1:2025 Section 6</strong>. Routine inspections should be carried out at intervals not exceeding six months.</p>

              <h3 style={subTitle}>Responsible Person Duties</h3>
              <p>The responsible person should ensure:</p>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '9pt' }}>
                <li><strong>Daily:</strong> Visual check that the panel indicates normal operation (no fault or isolate indicators illuminated)</li>
                <li><strong>Weekly:</strong> Testing of the system using a different manual call point each week, rotating through all call points over a 13-week or 52-week cycle</li>
                <li><strong>Monthly:</strong> Check that all system documentation is up to date and the log book is being maintained</li>
                <li>All faults are reported and attended to promptly by the service organisation</li>
                <li>Records of all tests, faults and maintenance visits are kept in the Fire Log Book</li>
                <li>The ARC (if applicable) is notified before and after each test</li>
              </ul>

              <h3 style={subTitle}>Periodic Inspection & Service Schedule</h3>
              <table style={tbl}>
                <thead><tr><th style={th}>Activity</th><th style={{ ...th, width: '120px' }}>Frequency</th><th style={th}>By Whom</th></tr></thead>
                <tbody>
                  <tr><td style={td}>Visual panel check</td><td style={td}>Daily</td><td style={td}>Responsible Person</td></tr>
                  <tr><td style={td}>Call point test (rotating)</td><td style={td}>Weekly</td><td style={td}>Responsible Person</td></tr>
                  <tr><td style={td}>Quarterly inspection</td><td style={td}>Every 3 months</td><td style={td}>Service Provider</td></tr>
                  <tr><td style={td}>Full periodic inspection & test</td><td style={td}>Every 6 months</td><td style={td}>Service Provider</td></tr>
                  <tr><td style={td}>Annual review of system</td><td style={td}>Annually</td><td style={td}>Service Provider</td></tr>
                </tbody>
              </table>
            </div>

            {/* ---- SECTION 11: WARRANTY ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 11 — Warranty Information</h2>
              <table style={tbl}>
                <tbody>
                  <tr><td style={tdLabel}>Warranty Start Date</td><td style={td}>{data.warranty.startDate || '—'}</td></tr>
                  <tr><td style={tdLabel}>Warranty End Date</td><td style={td}>{data.warranty.endDate || '—'}</td></tr>
                  <tr><td style={tdLabel}>Warranty Period</td><td style={td}>12 months from date of commissioning</td></tr>
                </tbody>
              </table>
              {data.warranty.notes && <p style={{ marginTop: '8px', fontSize: '9pt' }}><strong>Notes:</strong> {data.warranty.notes}</p>}
              <p style={{ marginTop: '8px', fontSize: '9pt' }}>The system carries a warranty of twelve months from the date of commissioning, on the basis that the system will be maintained in accordance with the manufacturer's recommended standards and frequencies. The system must have been commissioned by Core Fire Protection for both parts and labour to be warranted.</p>
            </div>

            {/* ---- SECTION 12: HEALTH & SAFETY ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 12 — Health & Safety Information</h2>
              <p>All works are carried out in accordance with current health and safety legislation including:</p>
              <ul style={{ paddingLeft: '16px', marginTop: '8px', fontSize: '9pt' }}>
                <li>Health and Safety at Work Act 1974</li>
                <li>Regulatory Reform (Fire Safety) Order 2005</li>
                <li>Fire (Scotland) Act 2005</li>
                <li>Fire Safety (Scotland) Regulations 2006</li>
                <li>CDM Regulations 2015</li>
                <li>Electricity at Work Regulations 1989</li>
              </ul>
              <p style={{ marginTop: '8px' }}>Risk assessments and method statements are available upon request.</p>
              <h3 style={subTitle}>Safety Notices</h3>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '9pt' }}>
                <li>Do not attempt to repair or modify any part of the fire alarm system</li>
                <li>Do not paint over any detection devices</li>
                <li>Do not hang items from or obstruct any detection or alarm devices</li>
                <li>Ensure all fire alarm devices remain accessible at all times</li>
                <li>Report any damage to devices or cable routes immediately</li>
              </ul>
            </div>

            {/* ---- SECTION 13: FIRE LOG BOOK ---- */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitle}>Section 13 — Fire Safety Log Book</h2>
              <p style={{ marginBottom: '12px' }}>A fire safety log book should be maintained in accordance with BS 5839-1:2025. The log book should be kept adjacent to the main control panel and should record:</p>
              <ul style={{ paddingLeft: '16px', fontSize: '9pt', marginBottom: '16px' }}>
                <li>All routine testing carried out by the responsible person</li>
                <li>All faults and the action taken to rectify them</li>
                <li>All false alarms and the identified cause</li>
                <li>All service visits and findings</li>
                <li>Any modifications or additions to the system</li>
                <li>Changes in the responsible person or competent persons</li>
              </ul>

              {data.logBook.competentPersons.length > 0 && (
                <>
                  <h3 style={subTitle}>Competent Persons</h3>
                  <table style={tbl}>
                    <thead>
                      <tr><th style={th}>Name</th><th style={th}>Department</th><th style={th}>Telephone</th></tr>
                    </thead>
                    <tbody>
                      {data.logBook.competentPersons.map(p => (
                        <tr key={p.id}><td style={td}>{p.name}</td><td style={td}>{p.dept}</td><td style={td}>{p.tel}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h3 style={subTitle}>Emergency Contacts</h3>
              <table style={tbl}>
                <tbody>
                  <tr><td style={tdLabel}>Fire Alarm Maintenance</td><td style={td}>{data.logBook.emergencyContacts.fireAlarmMaintenance || 'Core Fire Protection — 0141 433 1934'}</td></tr>
                  <tr><td style={tdLabel}>Emergency Lighting</td><td style={td}>{data.logBook.emergencyContacts.emergencyLighting || '—'}</td></tr>
                  <tr><td style={tdLabel}>Building Maintenance</td><td style={td}>{data.logBook.emergencyContacts.buildingMaintenance || '—'}</td></tr>
                </tbody>
              </table>

              <h3 style={subTitle}>Weekly Test Record Template</h3>
              <table style={tbl}>
                <thead>
                  <tr>
                    <th style={th}>Date</th><th style={th}>Device Tested</th><th style={th}>Zone</th>
                    <th style={{ ...th, textAlign: 'center' }}>Pass</th><th style={th}>Tested By</th><th style={th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5].map(i => (
                    <tr key={i}><td style={{ ...td, height: '24px' }}></td><td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td><td style={td}></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---- FOOTER ---- */}
            <div style={{ borderTop: '2px solid #0d0d0d', paddingTop: '12px', marginTop: '24px', fontSize: '8pt', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
              <span>Core Fire Protection © {new Date().getFullYear()}</span>
              <span>{data.jobReference || 'Draft'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
