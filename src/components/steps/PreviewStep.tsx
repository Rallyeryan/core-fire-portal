import React from 'react';
import { useSpec } from '@/context/SpecContext';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSpecForImport } from '@/lib/specToJob';
import { toast } from 'sonner';

// Shared inline style helpers
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Space Grotesk, sans-serif', fontSize: '12pt', fontWeight: 700,
  color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '2px solid #c0392b', paddingBottom: '4px', marginBottom: '10px',
};
const subTitle: React.CSSProperties = { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '10pt', marginBottom: '4px', marginTop: '12px' };
const th: React.CSSProperties = { border: '1px solid #e8e4dd', padding: '5px 8px', background: '#f5f3ee', fontWeight: 600 };
const td: React.CSSProperties = { border: '1px solid #e8e4dd', padding: '4px 8px' };
const tdLabel: React.CSSProperties = { ...td, fontWeight: 600, width: '200px' };
const tdRight: React.CSSProperties = { ...td, textAlign: 'right' };
const catRow: React.CSSProperties = { ...td, fontWeight: 700, background: '#faf8f5' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', margin: '8px 0' };
const badge: React.CSSProperties = { background: 'rgba(192,57,43,0.1)', color: '#c0392b', padding: '2px 10px', borderRadius: '10px', fontSize: '9pt', fontWeight: 600 };

export function PreviewStep() {
  const { projectId, data } = useSpec();
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSendToJob = () => {
    saveSpecForImport(data);
    toast.success('Specification saved — redirecting to Job Management');
    setTimeout(() => navigate(`/job/${projectId}`), 600);
  };

  const selectedCategories = Object.entries(data.categories).filter(([, v]) => v).map(([k]) => k);
  const selectedModules = Object.entries(data.modules).filter(([, v]) => v).map(([k]) => {
    const labels: Record<string, string> = {
      design: 'Design', supply: 'Supply', installation: 'Installation',
      commissioning: 'Commissioning & Handover', maintenance: 'Maintenance', monitoring: 'Monitoring',
    };
    return labels[k] || k;
  });

  const standardLabel = data.standard === 'bs5839_2025' ? 'BS 5839-1: 2025' : 'BS 5839-1: 2017';

  const handlePrint = () => {
    const content = previewRef.current;
    if (!content) return;
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>FD&A System Specification - ${data.customerName || 'Draft'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @page { size: landscape; margin: 15mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; font-size: 10pt; color: #0d0d0d; line-height: 1.5; }
        h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
        th, td { border: 1px solid #e8e4dd; padding: 5px 8px; text-align: left; }
        th { background: #f5f3ee; font-weight: 600; }
        ul, ol { padding-left: 16px; }
        li { margin-bottom: 2px; }
        .page-break { break-before: page; }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  const equipmentByCategory = data.equipment
    .filter(e => e.qty > 0)
    .reduce((acc, e) => { if (!acc[e.category]) acc[e.category] = []; acc[e.category].push(e); return acc; }, {} as Record<string, typeof data.equipment>);

  const fmt = (v: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  const equipmentSubtotal = data.equipment.reduce((s, e) => s + e.qty * e.unitPrice, 0);
  const installationSubtotal = data.quotation.installationLabour;
  const commissioningSubtotal = data.quotation.commissioningItems.reduce((s, c) => s + c.qty * c.unitPrice, 0);
  const grossSubtotal = equipmentSubtotal + installationSubtotal + commissioningSubtotal;
  const discountAmount = data.quotation.discountType === 'percentage' ? grossSubtotal * (data.quotation.discount / 100) : data.quotation.discount;
  const netSubtotal = grossSubtotal - discountAmount;
  const vatAmount = netSubtotal * (data.quotation.vatRate / 100);
  const grandTotal = netSubtotal + vatAmount;
  const hasPricing = grossSubtotal > 0;

  const maintenanceInspTotal = data.maintenance.inspectionPerVisit * data.maintenance.visitsPerYear;
  const maintenanceAddTotal = data.maintenance.additionalItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const maintenanceSubtotal = maintenanceInspTotal + maintenanceAddTotal;

  // Category explanation helper
  const categoryExplanations: Record<string, string> = {
    M: 'Category M — Manual system incorporating only manual call points (break glass units). No automatic fire detection is provided. Suitable where the primary objective is to allow occupants to raise the alarm manually upon discovering a fire.',
    P1: 'Category P1 — Automatic fire detection installed throughout all areas of the building to provide the earliest possible warning of fire and thus minimise the time between ignition and the attendance of the fire brigade, minimising damage to property.',
    P2: 'Category P2 — Automatic fire detection installed in defined parts of the building only, typically the areas of highest risk or value as determined by the fire risk assessment.',
    L1: 'Category L1 — Automatic fire detection installed throughout all areas of the building to provide the earliest possible warning of fire to occupants, ensuring maximum time for escape. L1 provides the highest level of automatic fire detection for the protection of life.',
    L2: 'Category L2 — Automatic fire detection installed in defined rooms and areas of the building, as identified by a fire risk assessment. L2 includes all the requirements of Category L3.',
    L3: 'Category L3 — Automatic fire detection installed in escape routes, all rooms or areas that open onto escape routes, and in all circulation areas that form part of the escape routes.',
    L4: 'Category L4 — Automatic fire detection installed only within escape routes comprising circulation areas (corridors, stairways, landings) and rooms that open directly onto them.',
    L5: 'Category L5 — A system in which the category of protection and the location of detectors are determined by a specific fire safety risk, as identified by a fire risk assessment.',
  };

  // Cabling selections
  const cablingTypes: string[] = [];
  if (data.cabling.softSkinStandard) cablingTypes.push("Soft skin fire resistant cables meeting the 'standard' requirements of BS5839-1");
  if (data.cabling.softSkinEnhanced) cablingTypes.push("Soft skin fire resistant cables meeting the 'enhanced' requirements of BS5839-1");
  if (data.cabling.mineralInsulated) cablingTypes.push("Mineral insulated fire resistant cables meeting the 'enhanced' requirements of BS5839-1");
  if (data.cabling.swa) cablingTypes.push("SWA fire resistant cables meeting the 'enhanced' requirements of BS5839-1");
  if (data.cabling.other && data.cabling.otherDetail) cablingTypes.push(data.cabling.otherDetail);

  // Certification mapping
  const certLabels: Record<string, string> = {
    bs5839Design: 'BS 5839-1 Design Certificate',
    bs5839Installation: 'BS 5839-1 Installation Certificate',
    bs5839Commissioning: 'BS 5839-1 Commissioning Certificate',
    bs5839Acceptance: 'BS 5839-1 Acceptance Certificate',
    bs7273_4: 'BS 7273-4 Certificate',
    bs7273_6: 'BS 7273-6 Certificate',
    bafeSP203Modular: 'BAFE SP203 Modular Certificate',
    bafeSP203Compliance: 'BAFE SP203 Certificate of Compliance',
    bs7671Electrical: 'BS 7671 Electrical Installation Certificate',
  };

  const hasDoorRelease = data.doorRelease.enabled;
  const hasAncillary = data.ancillaryInterfaces.enabled;
  const hasInterfaces = data.interfaces.length > 0;
  const hasVisualDevices = data.visualDevices.vad || data.visualDevices.vid;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="spec-section-title text-xl mb-1">Preview & Export</h2>
          <p className="text-sm text-muted-foreground">Review the full specification document. Only selected items are included. Export as PDF (landscape).</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2"><Download className="w-4 h-4" />Export PDF</Button>
          <Button variant="outline" onClick={handleSendToJob} className="gap-2"><ArrowRight className="w-4 h-4" />Send to Job Management</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background shadow-lg">
        <div ref={previewRef}>
          {/* ======= COVER PAGE ======= */}
          <div style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '60px 40px', background: '#0d0d0d', color: '#f5f3ee' }}>
            <p style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, marginBottom: '16px' }}>System Specification for a</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Fire Detection and Fire Alarm System
            </h1>
            <div style={{ width: '60px', height: '3px', background: '#c0392b', margin: '16px auto' }} />
            <div style={{ fontSize: '11pt', opacity: 0.8, lineHeight: 2, marginTop: '16px' }}>
              {data.customerName && <p><strong>Customer:</strong> {data.customerName}</p>}
              {data.siteName && <p><strong>Site:</strong> {data.siteName}</p>}
              {data.siteAddress && <p style={{ whiteSpace: 'pre-line' }}>{data.siteAddress}</p>}
            </div>
            <div style={{ fontSize: '9pt', opacity: 0.6, marginTop: '32px', lineHeight: 1.8 }}>
              {data.specDate && <p><strong>Date:</strong> {data.specDate}</p>}
              {data.specReference && <p><strong>Reference:</strong> {data.specReference}</p>}
              {data.producedBy && <p><strong>Produced by:</strong> {data.producedBy}</p>}
              {data.email && <p>{data.email}</p>}
              {data.mobileNo && <p>{data.mobileNo}</p>}
            </div>
          </div>

          {/* ======= BODY ======= */}
          <div style={{ padding: '24px', fontFamily: 'DM Sans, sans-serif', fontSize: '10pt', lineHeight: 1.6, color: '#0d0d0d' }}>

            {/* ---- SYSTEM OVERVIEW ---- */}
            {selectedModules.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>System Overview</h2>
                <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
                  <table style={tbl}>
                    <thead>
                      <tr>
                        {selectedModules.map(m => <th key={m} style={{ ...th, textAlign: 'center', textTransform: 'uppercase', fontSize: '8pt' }}>{m}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {selectedModules.map(m => <td key={m} style={{ ...td, textAlign: 'center', fontWeight: 700 }}>✓</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Enquiry references */}
                {(data.enquirySpecRef || data.tenderDrawingsRef || data.siteSurveyDetails) && (
                  <>
                    <p style={{ marginTop: '12px', fontSize: '9pt' }}>Our costs and proposals have been based on the following information only:</p>
                    <table style={{ ...tbl, width: '60%' }}>
                      <tbody>
                        {data.enquirySpecRef && <tr><td style={tdLabel}>Enquiry Reference</td><td style={td}>{data.enquirySpecRef}</td></tr>}
                        {data.tenderDrawingsRef && <tr><td style={tdLabel}>Tender Drawing Number/s</td><td style={td}>{data.tenderDrawingsRef || 'N/A'}</td></tr>}
                        {data.otherRef && <tr><td style={tdLabel}>Other</td><td style={td}>{data.otherRef}</td></tr>}
                        {data.siteSurveyDetails && <tr><td style={tdLabel}>Site Survey</td><td style={td}>{data.siteSurveyDetails}</td></tr>}
                        {data.producedBy && <tr><td style={tdLabel}>Completed By</td><td style={td}>{data.producedBy}</td></tr>}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* ---- DESIGN ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>Design</h2>
              {data.designedBy === 'coreFire' && (
                <p>The system proposed within this specification has been designed by <strong>Core Fire Protection</strong> to comply with <strong>{standardLabel}</strong> Fire Detection and Alarm Systems for Buildings to the following category:</p>
              )}
              {data.designedBy === 'customer' && (
                <p>The system proposed within this specification has been designed by the <strong>Customer / Other</strong> to comply with <strong>{standardLabel}</strong> Fire Detection and Alarm Systems for Buildings to the following category:</p>
              )}
              {data.designedBy === 'noRiskAssessment' && (
                <p>The system proposed within this specification has been specified to comply with <strong>{standardLabel}</strong> Fire Detection and Alarm Systems for Buildings. No risk assessment has been undertaken.</p>
              )}

              {selectedCategories.length > 0 && (
                <table style={{ ...tbl, marginTop: '12px' }}>
                  <thead>
                    <tr><th style={th}>Category</th><th style={th}>Explanation</th></tr>
                  </thead>
                  <tbody>
                    {selectedCategories.map(cat => (
                      <tr key={cat}>
                        <td style={{ ...td, fontWeight: 700, width: '80px' }}>{cat}</td>
                        <td style={td}>{categoryExplanations[cat] || cat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {data.categoryP2Areas && <p style={{ marginTop: '6px', fontSize: '9pt' }}><strong>P2 Areas:</strong> {data.categoryP2Areas}</p>}
              {data.categoryL2Areas && <p style={{ marginTop: '4px', fontSize: '9pt' }}><strong>L2 Areas:</strong> {data.categoryL2Areas}</p>}
              {data.categoryL5Details && <p style={{ marginTop: '4px', fontSize: '9pt' }}><strong>L5 Details:</strong> {data.categoryL5Details}</p>}

              <p style={{ marginTop: '12px', fontSize: '9pt' }}>Refer to the relevant standard indicated for more detailed explanation of the category coverage.</p>
              <p style={{ marginTop: '8px', fontSize: '9pt' }}>In order for the required certification to be issued as indicated, a number of variations may need to be agreed following discussion with the appropriate interested parties, as recommended by the particular standard.</p>

              {/* Variations */}
              <h3 style={subTitle}>Schedule of Design Variations</h3>
              {data.variations.length > 0 ? (
                <table style={tbl}>
                  <thead><tr><th style={{ ...th, width: '80px' }}>Variation No</th><th style={th}>Detail</th><th style={{ ...th, width: '100px' }}>Clause Ref</th></tr></thead>
                  <tbody>
                    {data.variations.map(v => (
                      <tr key={v.id}><td style={td}>{v.number}</td><td style={td}>{v.detail}</td><td style={td}>{v.clauseRef}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table style={tbl}>
                  <thead><tr><th style={{ ...th, width: '80px' }}>Variation No</th><th style={th}>Detail</th></tr></thead>
                  <tbody><tr><td style={td}></td><td style={td}>None noted at this time</td></tr></tbody>
                </table>
              )}
            </div>

            {/* ---- CERTIFICATION ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>Certification</h2>
              <p>On completion of the works, the following certificates will be provided for the modules instructed and indicated within the System Overview.</p>
              <p style={{ marginTop: '6px', fontSize: '9pt' }}>The customer should seek certification for modules undertaken by others from the appropriate module provider.</p>
              <table style={tbl}>
                <thead>
                  <tr>
                    <th style={th}>Certificate</th>
                    <th style={{ ...th, textAlign: 'center', width: '100px' }}>Core Fire</th>
                    <th style={{ ...th, textAlign: 'center', width: '100px' }}>Client</th>
                    <th style={{ ...th, textAlign: 'center', width: '100px' }}>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.certificates).map(([key, val]) => {
                    if (!val.coreFire && !val.client && !val.others) return null;
                    return (
                      <tr key={key}>
                        <td style={td}>{certLabels[key] || key}</td>
                        <td style={{ ...td, textAlign: 'center' }}>{val.coreFire ? '✓' : ''}</td>
                        <td style={{ ...td, textAlign: 'center' }}>{val.client ? '✓' : ''}</td>
                        <td style={{ ...td, textAlign: 'center' }}>{val.others ? '✓' : ''}</td>
                      </tr>
                    );
                  })}
                  {/* Show row if nothing selected */}
                  {Object.values(data.certificates).every(v => !v.coreFire && !v.client && !v.others) && (
                    <tr><td colSpan={4} style={{ ...td, textAlign: 'center', fontStyle: 'italic', color: '#999' }}>No certificates selected</td></tr>
                  )}
                </tbody>
              </table>
              <p style={{ marginTop: '8px', fontSize: '9pt' }}>
                For systems where <strong>Core Fire Protection</strong> has been instructed to provide all modules i.e. design, installation, commissioning / handover, the system will be verified upon completion of works and a BAFE Certificate of Compliance will then be provided.
              </p>
            </div>

            {/* ---- SYSTEM DESIGN PARTICULARS ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>System Design Particulars</h2>

              {/* Power Supply */}
              <h3 style={subTitle}>Power Supply Units</h3>
              <p>To ensure that the system will still function during a mains failure, automatic standby power is provided. This will enable the system to remain fully operational for <strong>{data.standbyHours}</strong> hours and still allow the audible alarms to sound for <strong>{data.alarmMinutes}</strong> minutes thereafter, with all zones in alarm.</p>

              {/* Cabling */}
              {cablingTypes.length > 0 && (
                <>
                  <h3 style={subTitle}>Cabling</h3>
                  <p>The system will utilise the following cable type:</p>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    {cablingTypes.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <p style={{ marginTop: '8px', fontSize: '9pt', fontStyle: 'italic' }}>Note: The installer of the above system should take care to ensure wiring routes / installation paths do not compromise the above specified cable. If in doubt, the installer should confirm final cable selection prior to installation. Reference <strong>{standardLabel} clause 26.2</strong>.</p>
                </>
              )}

              {/* Evacuation */}
              <h3 style={subTitle}>Evacuation / Cause & Effect</h3>
              <p>Sounders will be programmed to operate in the following manner:</p>
              <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                {data.evacuation.type === 'simultaneous' && <li>Simultaneous evacuation.</li>}
                {data.evacuation.type === 'causeEffect' && <li>Programmed per customer's cause & effect matrix.</li>}
                {data.evacuation.type === 'other' && <li>{data.evacuation.otherDetail || 'Other — to be confirmed.'}</li>}
              </ul>

              {/* Interface Operation */}
              <p style={{ marginTop: '8px' }}>Outputs to plant e.g. lift control, door holder control etc provided on this project will be programmed to operate in the following manner:</p>
              <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                {data.interfaceOperation.type === 'allZones' && <li>Any device in any zone will cause operation of output to all plant controls immediately.</li>}
                {data.interfaceOperation.type === 'causeEffect' && <li>Outputs programmed per customer's cause & effect matrix.</li>}
                {data.interfaceOperation.type === 'other' && <li>{data.interfaceOperation.otherDetail || 'Other — to be confirmed.'}</li>}
              </ul>

              {/* Visual Devices */}
              {hasVisualDevices && (
                <>
                  <h3 style={subTitle}>Visual Alarm Devices</h3>
                  <p>Where components and devices have been requested and provided for customers' compliance with the Equalities Act, Core Fire Protection has specified such devices to meet the customer's specific requirements and the requirements of BS5839-1 Sections 17 & 18.</p>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                    {data.visualDevices.vad && <li>Visual Alarm Devices (VADs){data.visualDevices.vadLocations ? ` — ${data.visualDevices.vadLocations}` : ''}</li>}
                    {data.visualDevices.vid && <li>Visual Indicator Devices (VIDs){data.visualDevices.vidLocations ? ` — ${data.visualDevices.vidLocations}` : ''}</li>}
                  </ul>
                </>
              )}

              {/* Communications */}
              {data.communications.type === 'auto' && (
                <>
                  <h3 style={subTitle}>Communications & Signalling</h3>
                  <p>Automatic communication signalling has been included:</p>
                  <table style={{ ...tbl, width: '70%' }}>
                    <thead>
                      <tr><th style={th}>Type</th><th style={{ ...th, textAlign: 'center' }}>Single Path</th><th style={{ ...th, textAlign: 'center' }}>Dual (Primary)</th><th style={{ ...th, textAlign: 'center' }}>Dual (Secondary)</th></tr>
                    </thead>
                    <tbody>
                      {(data.communications.gprs.single || data.communications.gprs.dualPrimary || data.communications.gprs.dualSecondary) && (
                        <tr>
                          <td style={td}>GPRS</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.gprs.single ? '✓' : ''}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.gprs.dualPrimary ? '✓' : ''}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.gprs.dualSecondary ? '✓' : ''}</td>
                        </tr>
                      )}
                      {(data.communications.ip.single || data.communications.ip.dualPrimary || data.communications.ip.dualSecondary) && (
                        <tr>
                          <td style={td}>IP</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.ip.single ? '✓' : ''}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.ip.dualPrimary ? '✓' : ''}</td>
                          <td style={{ ...td, textAlign: 'center' }}>{data.communications.ip.dualSecondary ? '✓' : ''}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {data.communications.transmitterLocation && <p style={{ fontSize: '9pt', marginTop: '4px' }}><strong>Transmitter Location:</strong> {data.communications.transmitterLocation}</p>}
                  <p style={{ fontSize: '9pt', marginTop: '4px' }}><strong>Signals:</strong> {data.communications.signals === 'fire' ? 'Fire only' : 'Fire & Fault'}</p>
                </>
              )}
            </div>

            {/* ---- DOOR RELEASE & INTERFACES ---- */}
            {(hasDoorRelease || hasAncillary || hasInterfaces) && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Interfaces & Door Release</h2>

                {hasDoorRelease && (
                  <>
                    <h3 style={subTitle}>Automatic Door Release (BS 7273-4)</h3>
                    <table style={{ ...tbl, width: '70%' }}>
                      <thead><tr><th style={th}>Category</th><th style={th}>Locations</th></tr></thead>
                      <tbody>
                        {data.doorRelease.categoryA && <tr><td style={{ ...td, fontWeight: 600 }}>Category A</td><td style={td}>{data.doorRelease.categoryALocations || 'All areas'}</td></tr>}
                        {data.doorRelease.categoryB && <tr><td style={{ ...td, fontWeight: 600 }}>Category B</td><td style={td}>{data.doorRelease.categoryBLocations || 'All areas'}</td></tr>}
                        {data.doorRelease.categoryC && <tr><td style={{ ...td, fontWeight: 600 }}>Category C</td><td style={td}>{data.doorRelease.categoryCLocations || 'All areas'}</td></tr>}
                      </tbody>
                    </table>
                  </>
                )}

                {hasAncillary && (
                  <>
                    <h3 style={subTitle}>Ancillary Interface Controls</h3>
                    <p>The following ancillary interfaces have been allowed for:</p>
                    <ul style={{ paddingLeft: '16px', marginTop: '4px', columns: 2 }}>
                      {data.ancillaryInterfaces.smokeControl && <li>Smoke Control Systems</li>}
                      {data.ancillaryInterfaces.lifts && <li>Lift Recall</li>}
                      {data.ancillaryInterfaces.gasValves && <li>Gas Shut-Off Valves</li>}
                      {data.ancillaryInterfaces.fireShutters && <li>Fire Shutters</li>}
                      {data.ancillaryInterfaces.electricalSupplies && <li>Electrical Supply Isolation</li>}
                      {data.ancillaryInterfaces.ventilation && <li>Ventilation / HVAC</li>}
                      {data.ancillaryInterfaces.lighting && <li>Emergency Lighting</li>}
                      {data.ancillaryInterfaces.signage && <li>Signage</li>}
                      {data.ancillaryInterfaces.paging && <li>Public Address / Paging</li>}
                    </ul>
                  </>
                )}

                {hasInterfaces && (
                  <>
                    <h3 style={subTitle}>Interface Schedule</h3>
                    <table style={tbl}>
                      <thead><tr><th style={{ ...th, width: '60px' }}>Qty</th><th style={th}>Use / Description</th></tr></thead>
                      <tbody>
                        {data.interfaces.map(iface => (
                          <tr key={iface.id}><td style={{ ...td, textAlign: 'center' }}>{iface.qty}</td><td style={td}>{iface.use}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* ---- INSTALLATION ---- */}
            {data.modules.installation && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Installation</h2>
                <h3 style={subTitle}>{data.quotation.installationDescription || 'BAFE Approved Electrical & Mechanical Installation'}</h3>
                {data.quotation.installationScopeDetail && (
                  <div style={{ fontSize: '9pt', whiteSpace: 'pre-line', marginBottom: '10px' }}>{data.quotation.installationScopeDetail}</div>
                )}

                {data.quotation.containmentDetail && (
                  <>
                    <h3 style={subTitle}>Containment Installation</h3>
                    <p style={{ fontSize: '9pt', whiteSpace: 'pre-line' }}>{data.quotation.containmentDetail}</p>
                  </>
                )}

                {data.quotation.cablingDetail && (
                  <>
                    <h3 style={subTitle}>Fire-Rated Cabling & Mechanical Protection</h3>
                    <p style={{ fontSize: '9pt', whiteSpace: 'pre-line' }}>{data.quotation.cablingDetail}</p>
                  </>
                )}

                <h3 style={subTitle}>Installation Standards</h3>
                <p style={{ fontSize: '9pt' }}>The installation shall include the laying of cables required for the connection of the detection, alarm indicating and other devices along with connection to power supplies as appropriate to the design.</p>
                <ul style={{ paddingLeft: '16px', marginTop: '8px', fontSize: '9pt' }}>
                  <li>All cable drops below 2.1m shall be mechanically protected.</li>
                  <li>The Contractor shall include for labelling each fire alarm device. All devices shall be marked with its unique device number using indelible type faced characters.</li>
                  <li>For devices with a base tag, the proprietary base tag and numbers shall be used.</li>
                </ul>

                <h3 style={subTitle}>Mains Power Supplies</h3>
                <p style={{ fontSize: '9pt' }}>All mains power supplies shall comply with <strong>{standardLabel}</strong>, <strong>BS 5839-6</strong> and <strong>BS 7671 IEE Wiring Regulations</strong>. Where there is a conflict between {standardLabel} and BS 7671 standards, {standardLabel} / BS 5839-6 shall take precedence.</p>
              </div>
            )}

            {/* ---- TESTING & COMMISSIONING ---- */}
            {data.modules.commissioning && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Testing & Commissioning</h2>
                <p>On completion of the works, fully comprehensive tests shall be carried out to satisfy the requirements of <strong>{standardLabel} Section 4 & 5</strong> and <strong>BS 5839-6</strong>.</p>
                <p style={{ marginTop: '8px' }}>Evidence of all tests carried out shall be issued. Evidence shall include:</p>
                <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '9pt' }}>
                  <li>Cable test sheets</li>
                  <li>Mains supply test certificates</li>
                  <li>Device test schedules</li>
                  <li>Commissioning checklists</li>
                  <li>Audibility test readings</li>
                  <li>Marked up as-fitted drawings</li>
                </ul>
                <p style={{ marginTop: '8px', fontSize: '9pt' }}>For clarity, commissioning includes verification of actual effect e.g. AOV operation.</p>

                <h3 style={subTitle}>Demonstration</h3>
                <p>Demonstration of the system to the Client shall be provided. This demonstration will include at least the following:</p>
                <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '9pt' }}>
                  <li>Description of the system</li>
                  <li>Walk through of the site familiarising Client with the extent of the system and equipment type / locations</li>
                  <li>Demonstration of operation of the system including; reset, isolate, de-isolate etc</li>
                  <li>What to do in the event of a fault (False Alarm Management)</li>
                  <li>What to do in the event of an alarm</li>
                  <li>Review of cause & effect</li>
                  <li>How to test system (Keyswitch overrides / ARC contact)</li>
                  <li>Review of operation and maintenance instructions</li>
                  <li>Review of as-fitted drawings and zone diagram</li>
                </ul>

                <h3 style={subTitle}>Zone Chart</h3>
                <p style={{ fontSize: '9pt' }}>If included with scope of works, a diagrammatic Zone Chart will be created and displayed adjacent to the control and indicating equipment in accordance with <strong>{standardLabel}</strong>.</p>
              </div>
            )}

            {/* ---- OPERATION & MAINTENANCE MANUAL ---- */}
            {data.modules.commissioning && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Operation & Maintenance Manual</h2>
                <p>The following documents shall be produced for inclusion within the operation and maintenance manual:</p>
                <ul style={{ paddingLeft: '16px', marginTop: '8px', fontSize: '9pt' }}>
                  <li>Manufacturers operating and maintenance manual</li>
                  <li>Project specific operation and maintenance instruction including isolation, test, what to do in the event of an alarm / fault, how to contact service organisation etc</li>
                  <li>As Fitted copy of Fire Alarm specification</li>
                  <li>Cable test records</li>
                  <li>A copy of all commissioning records</li>
                  <li>System logbook in accordance with {standardLabel}</li>
                  <li>As Fitted drawings</li>
                  <li>Certification, as detailed in this specification</li>
                </ul>
              </div>
            )}

            {/* ---- BILL OF MATERIALS ---- */}
            {Object.keys(equipmentByCategory).length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Bill of Materials</h2>
                <p style={{ fontSize: '9pt', marginBottom: '8px' }}>Equipment, material and system warranty shall commence at the date of practical completion and run for a minimum of 12 months from this date. Any costs associated with this requirement, including labour, shall be included in the contract price.</p>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: '60px', textAlign: 'center' }}>Qty</th>
                      <th style={th}>Item</th>
                      {hasPricing && <>
                        <th style={{ ...th, width: '90px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ ...th, width: '90px', textAlign: 'right' }}>Total</th>
                      </>}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(equipmentByCategory).map(([cat, items]) => (
                      <React.Fragment key={cat}>
                        <tr><td colSpan={hasPricing ? 4 : 2} style={catRow}>{cat}</td></tr>
                        {items.map(item => (
                          <tr key={item.id}>
                            <td style={{ ...td, textAlign: 'center' }}>{item.qty}</td>
                            <td style={td}>{item.description}</td>
                            {hasPricing && <>
                              <td style={tdRight}>{fmt(item.unitPrice)}</td>
                              <td style={tdRight}>{fmt(item.qty * item.unitPrice)}</td>
                            </>}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}

                    {/* Installation & Commissioning rows */}
                    {installationSubtotal > 0 && (
                      <tr>
                        <td style={{ ...td, textAlign: 'center' }}>1</td>
                        <td style={td}>
                          <strong>{data.quotation.installationDescription} Rev{data.quotation.revisionLetter}</strong>
                          {data.quotation.installationScopeDetail && (
                            <div style={{ fontSize: '8pt', color: '#555', marginTop: '2px' }}>
                              Including attendance, preliminaries, project management, supply/installation/termination of specified fire-rated cabling, mechanical protection, containment, fixings, consumables, and termination accessories in compliance with {standardLabel}
                            </div>
                          )}
                        </td>
                        <td style={tdRight}>{fmt(installationSubtotal)}</td>
                        <td style={tdRight}>{fmt(installationSubtotal)}</td>
                      </tr>
                    )}
                    {data.quotation.commissioningItems.filter(c => c.qty > 0 && c.unitPrice > 0).map(c => (
                      <tr key={c.id}>
                        <td style={{ ...td, textAlign: 'center' }}>{c.qty}</td>
                        <td style={td}>{c.description}</td>
                        <td style={tdRight}>{fmt(c.unitPrice)}</td>
                        <td style={tdRight}>{fmt(c.qty * c.unitPrice)}</td>
                      </tr>
                    ))}

                    {hasPricing && (
                      <>
                        <tr>
                          <td colSpan={3} style={{ ...td, fontWeight: 700, textAlign: 'right' }}>Sub-Total ex VAT</td>
                          <td style={{ ...td, fontWeight: 700, textAlign: 'right' }}>{fmt(grossSubtotal)}</td>
                        </tr>
                        {discountAmount > 0 && (
                          <tr>
                            <td colSpan={3} style={{ ...td, textAlign: 'right', color: '#c0392b' }}>Discount</td>
                            <td style={{ ...td, textAlign: 'right', color: '#c0392b' }}>-{fmt(discountAmount)}</td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={3} style={{ ...td, textAlign: 'right' }}>VAT ({data.quotation.vatRate}%)</td>
                          <td style={tdRight}>{fmt(vatAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ ...td, fontWeight: 700, textAlign: 'right', fontSize: '10pt' }}>Total inc VAT</td>
                          <td style={{ ...td, fontWeight: 700, textAlign: 'right', fontSize: '10pt' }}>{fmt(grandTotal)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                {data.quotation.reference && <p style={{ marginTop: '4px', fontSize: '8pt', color: '#666' }}>Quotation Ref: {data.quotation.reference} Rev{data.quotation.revisionLetter}</p>}
                {data.quotation.paymentTerms && <p style={{ fontSize: '8pt', color: '#666' }}>Payment Terms: {data.quotation.paymentTerms} | Quotation valid for {data.quotation.validityDays} days.</p>}
              </div>
            )}

            {/* ---- OPTIONAL MAINTENANCE ---- */}
            {data.maintenance.enabled && maintenanceSubtotal > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Optional — Maintenance Contract (Annual)</h2>
                <p style={{ marginBottom: '8px' }}>Inspection & Maintenance in accordance with {standardLabel}</p>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={th}>Item</th>
                      <th style={{ ...th, width: '60px', textAlign: 'center' }}>Qty</th>
                      <th style={{ ...th, width: '90px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ ...th, width: '90px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={td}>Inspection Per Visit</td>
                      <td style={{ ...td, textAlign: 'center' }}>{data.maintenance.visitsPerYear}</td>
                      <td style={tdRight}>{fmt(data.maintenance.inspectionPerVisit)}</td>
                      <td style={tdRight}>{fmt(maintenanceInspTotal)}</td>
                    </tr>
                    {data.maintenance.calloutCharge > 0 && (
                      <tr><td style={td}>Reactive 24/7 365 Engineer Callout</td><td style={{ ...td, textAlign: 'center' }}>1</td><td style={tdRight}>{fmt(data.maintenance.calloutCharge)}</td><td style={tdRight}>{fmt(data.maintenance.calloutCharge)}</td></tr>
                    )}
                    {data.maintenance.normalHourlyRate > 0 && (
                      <tr><td style={td}>Normal Working Hours Reactive Labour (per hour)</td><td style={{ ...td, textAlign: 'center' }}>1</td><td style={tdRight}>{fmt(data.maintenance.normalHourlyRate)}</td><td style={tdRight}>{fmt(data.maintenance.normalHourlyRate)}</td></tr>
                    )}
                    {data.maintenance.outsideHoursRate > 0 && (
                      <tr><td style={td}>Outside Hours Reactive Labour (per hour)</td><td style={{ ...td, textAlign: 'center' }}>1</td><td style={tdRight}>{fmt(data.maintenance.outsideHoursRate)}</td><td style={tdRight}>{fmt(data.maintenance.outsideHoursRate)}</td></tr>
                    )}
                    {data.maintenance.remoteSupportRate > 0 && (
                      <tr><td style={td}>Remote Support (per {data.maintenance.remoteSupportIncrement})</td><td style={{ ...td, textAlign: 'center' }}>1</td><td style={tdRight}>{fmt(data.maintenance.remoteSupportRate)}</td><td style={tdRight}>{fmt(data.maintenance.remoteSupportRate)}</td></tr>
                    )}
                    {data.maintenance.additionalItems.filter(i => i.qty > 0).map(i => (
                      <tr key={i.id}><td style={td}>{i.description}</td><td style={{ ...td, textAlign: 'center' }}>{i.qty}</td><td style={tdRight}>{fmt(i.unitPrice)}</td><td style={tdRight}>{fmt(i.qty * i.unitPrice)}</td></tr>
                    ))}
                    <tr>
                      <td colSpan={3} style={{ ...td, fontWeight: 700, textAlign: 'right' }}>Annual Sub-Total ex VAT</td>
                      <td style={{ ...td, fontWeight: 700, textAlign: 'right' }}>{fmt(maintenanceSubtotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ---- PROJECT SCOPE & KEY ASSUMPTIONS ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>Project Scope & Key Assumptions</h2>

              <h3 style={subTitle}>Working Hours</h3>
              <p style={{ fontSize: '9pt', background: '#faf8f5', padding: '8px 12px', borderLeft: '3px solid #c0392b' }}>{data.projectScope?.workingHours || 'All work will be carried out during normal working hours Monday to Friday.'}</p>

              <h3 style={subTitle}>Sounder (Alarm) Audibility</h3>
              <p style={{ fontSize: '9pt' }}>{data.projectScope?.sounderAudibility || 'The proposed sounder layout is based on experience with similar buildings. Official audibility tests will be conducted once the system is operational.'}</p>

              <h3 style={subTitle}>Working at Height</h3>
              <p style={{ fontSize: '9pt' }}>{data.projectScope?.workingAtHeight || 'Working at heights reachable with six-tread podium steps is included.'}</p>

              {(data.projectScope?.clientResponsibilities?.length ?? 0) > 0 && (
                <>
                  <h3 style={subTitle}>Client Responsibilities</h3>
                  <p style={{ fontSize: '9pt', marginBottom: '4px' }}>The Client shall be responsible for providing (Free of Charge):</p>
                  <ul style={{ paddingLeft: '16px', fontSize: '9pt' }}>
                    {data.projectScope.clientResponsibilities.map((r, i) => <li key={i} style={{ marginBottom: '2px' }}>{r}</li>)}
                  </ul>
                </>
              )}

              {(data.projectScope?.exclusions?.length ?? 0) > 0 && (
                <>
                  <h3 style={subTitle}>Exclusions</h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '9pt' }}>
                    {data.projectScope.exclusions.map((e, i) => <li key={i} style={{ marginBottom: '2px' }}>{e}</li>)}
                  </ul>
                </>
              )}
            </div>

            {/* ---- DESIGN DRAWINGS ---- */}
            {data.designDrawings && data.designDrawings.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Design Drawings</h2>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={th}>Drawing Reference</th>
                      <th style={{ ...th, width: '150px' }}>Status</th>
                      <th style={th}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.designDrawings.map(d => (
                      <tr key={d.id}>
                        <td style={{ ...td, fontWeight: 600 }}>{d.name || '—'}</td>
                        <td style={td}>{
                          { draft: 'Draft', forApproval: 'For Approval', approved: 'Approved', clientProvided: 'Client Provided', asFitted: 'As Fitted' }[d.status]
                        }</td>
                        <td style={td}>{d.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ---- WARRANTY ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>Warranty</h2>
              <p><strong>{data.warrantyMonths || 12}-Month Warranty Coverage</strong></p>
              <p style={{ fontSize: '9pt', marginTop: '4px' }}>The system comes with a {data.warrantyMonths || 12}-month warranty for parts and labour, starting from the official date of commissioning.</p>
              {(data.warrantyConditions?.length ?? 0) > 0 && (
                <>
                  <h3 style={subTitle}>Warranty Conditions</h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '9pt' }}>
                    {data.warrantyConditions.map((c, i) => <li key={i} style={{ marginBottom: '2px' }}>{c}</li>)}
                  </ul>
                </>
              )}
            </div>

            {/* ---- POINTS OF CLARIFICATION ---- */}
            {data.clarifications.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Points of Clarification / Compliance</h2>
                <p style={{ marginBottom: '8px' }}>Please take cognisance of the following project specific points:</p>
                <ol style={{ paddingLeft: '20px', fontSize: '9pt' }}>
                  {data.clarifications.map(c => <li key={c.id} style={{ marginBottom: '4px' }}>{c.text}</li>)}
                </ol>
              </div>
            )}

            {/* ---- BASIS OF PROPOSAL ---- */}
            {data.proposalBasis.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={sectionTitle}>Basis of Proposal</h2>
                <p style={{ marginBottom: '8px' }}>The proposal has been based on the following:</p>
                <ol style={{ paddingLeft: '20px', fontSize: '9pt' }}>
                  {data.proposalBasis.map(p => <li key={p.id} style={{ marginBottom: '4px' }}>{p.text}</li>)}
                </ol>
              </div>
            )}

            {/* ---- CLIENT ACCEPTANCE ---- */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={sectionTitle}>Client Acceptance</h2>
              <p style={{ fontSize: '9pt', marginBottom: '12px' }}>I, the Customer accept/s the above Agreement for the provision of the Services at the Sites subject to the following Terms and Conditions.</p>
              <table style={{ ...tbl, width: '80%' }}>
                <thead>
                  <tr>
                    <th style={th}>Customer Approval{data.customerName ? ` (${data.customerName})` : ''}</th>
                    <th style={th}>Core Fire Protection Approval</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ ...td, height: '50px' }}>Signature:</td><td style={{ ...td, height: '50px' }}>Signature:</td></tr>
                  <tr><td style={td}>Full Name:</td><td style={td}>Full Name:</td></tr>
                  <tr><td style={td}>Position:</td><td style={td}>Position:</td></tr>
                  <tr><td style={td}>Date:</td><td style={td}>Date:</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: '8pt', marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                This agreement becomes binding upon signature by authorized representatives of both parties.
                {data.quotation.paymentTerms && ` Payment Terms: ${data.quotation.paymentTerms}.`}
              </p>
            </div>

            {/* ---- FOOTER ---- */}
            <div style={{ borderTop: '2px solid #0d0d0d', paddingTop: '12px', marginTop: '24px', fontSize: '8pt', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
              <span>Core Fire Protection © {new Date().getFullYear()}</span>
              <span>{data.specReference || 'Draft'} {data.quotation.revisionLetter ? `Rev${data.quotation.revisionLetter}` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
