import { type CertificateRecord, type JobData, CERTIFICATE_LABELS } from '@/types/jobData';

// Shared CSS matching the uploaded certificate templates
const CERT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a2332; padding: 24px; }
  .cert { max-width: 900px; margin: 0 auto; background: #fff; overflow: hidden; }
  .cert-header { background: #1a3a5c; color: #fff; padding: 20px 28px; }
  .cert-header h1 { font-size: 22px; margin-bottom: 4px; }
  .cert-header p { font-size: 13px; opacity: 0.75; }
  .section { padding: 20px 28px; border-bottom: 1px solid #e8ecf0; }
  .section:last-child { border-bottom: none; }
  .section h2 { font-size: 16px; color: #1a3a5c; margin-bottom: 14px; font-weight: 600; }
  .note { font-size: 13px; color: #5a6b7d; margin-bottom: 14px; line-height: 1.5; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .field { margin-bottom: 12px; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #2d3e50; margin-bottom: 5px; }
  .field-value { padding: 8px 12px; border: 1px solid #d0d7de; border-radius: 5px; font-size: 14px; min-height: 36px; background: #fafbfc; }
  .field-value.empty { color: #999; font-style: italic; }
  .check-row { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; }
  .check-box { width: 16px; height: 16px; border: 2px solid #1a3a5c; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-top: 2px; flex-shrink: 0; }
  .check-box.checked { background: #1a3a5c; color: #fff; }
  .check-label { font-size: 13px; line-height: 1.5; }
  .full { grid-column: 1 / -1; }
  .footer { padding: 16px 28px; font-size: 11px; color: #999; display: flex; justify-content: space-between; border-top: 2px solid #1a3a5c; }
  @media print { 
    body { padding: 0; }
    .cert { box-shadow: none; }
    .section { break-inside: avoid; }
  }
  @page { size: A4 portrait; margin: 15mm; }
`;

function val(v: string | undefined | null, fallback = '—'): string {
  return v && v.trim() ? v : fallback;
}

function checkBox(checked: boolean): string {
  return `<span class="check-box ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</span>`;
}

function checkRow(label: string, checked: boolean): string {
  return `<div class="check-row">${checkBox(checked)}<span class="check-label">${label}</span></div>`;
}

function fieldBlock(label: string, value: string, full = false): string {
  const isEmpty = !value || value === '—';
  return `<div class="field ${full ? 'full' : ''}"><label>${label}</label><div class="field-value ${isEmpty ? 'empty' : ''}">${val(value)}</div></div>`;
}

function textareaBlock(label: string, value: string): string {
  const isEmpty = !value || value === '—';
  return `<div class="field full"><label>${label}</label><div class="field-value ${isEmpty ? 'empty' : ''}" style="min-height:60px;white-space:pre-line;">${val(value)}</div></div>`;
}

function siteDetailsSection(cert: CertificateRecord, jobData: JobData): string {
  return `
    <div class="section">
      <h2>Site Details</h2>
      <div class="grid">
        ${fieldBlock('Contract No', cert.contractNo || jobData.jobReference)}
        ${fieldBlock('Client Name', cert.clientName || jobData.customerName)}
        ${fieldBlock('Site Name', cert.siteName || jobData.siteName)}
        ${fieldBlock('Client Address', cert.clientAddress || '')}
        ${fieldBlock('Site Address', cert.siteAddress || jobData.siteAddress, true)}
      </div>
    </div>`;
}

function signatureSection(cert: CertificateRecord, roleLabel = "Technician's"): string {
  return `
    <div class="section">
      <h2>Signatures</h2>
      <p class="note">I declare that I am a Competent Person and the works have been completed in accordance with the certifying statement above.</p>
      <div class="grid">
        ${fieldBlock(`${roleLabel} Name`, cert.technicianName)}
        ${fieldBlock(`${roleLabel} Position`, cert.technicianPosition)}
        ${fieldBlock(`${roleLabel} Signature`, cert.technicianSignature || cert.technicianName)}
        ${fieldBlock('Date', cert.signatureDate)}
        ${fieldBlock('For and on behalf of (Company)', cert.companyName || 'Core Fire Protection', true)}
      </div>
    </div>`;
}

function extentVariationsSection(cert: CertificateRecord, extentLabel = 'Extent of work covered'): string {
  return `
    <div class="section">
      <h2>Extent &amp; Variations</h2>
      ${textareaBlock(extentLabel, cert.extentOfWork)}
      ${textareaBlock('Variations', cert.variations)}
    </div>`;
}

// Generate full HTML for a single certificate
export function generateCertificateHTML(cert: CertificateRecord, jobData: JobData): string {
  const title = CERTIFICATE_LABELS[cert.type];
  let subtitle = '';
  let body = '';

  switch (cert.type) {
    case 'bs5839Design':
      subtitle = 'BS 5839-1:2017 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `
        <div class="section">
          <h2>System Details</h2>
          <div class="field"><label>System Category (BS 5839-1)</label>
            <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px;">
              ${['M', 'L1', 'L2', 'L3', 'L4', 'L5', 'P1', 'P2'].map(c =>
                `<span style="font-size:13px;">${checkBox(cert.systemCategory === c)} ${c}</span>`
              ).join('')}
            </div>
          </div>
          <div class="grid">
            <div class="field"><label>F&amp;RS Signalling</label>
              <div style="display:flex;gap:16px;margin-top:6px;">
                <span style="font-size:13px;">${checkBox(cert.frsSignalling === 'Automatic')} Automatic</span>
                <span style="font-size:13px;">${checkBox(cert.frsSignalling === 'Manual')} Manual</span>
              </div>
            </div>
            <div class="field"><label>System Type</label>
              <div style="display:flex;gap:16px;margin-top:6px;">
                <span style="font-size:13px;">${checkBox(cert.systemType === 'Addressable')} Addressable</span>
                <span style="font-size:13px;">${checkBox(cert.systemType === 'Conventional')} Conventional</span>
              </div>
            </div>
          </div>
          <div class="grid">
            ${fieldBlock('Specification Reference', cert.specReference)}
            <div style="display:flex;gap:20px;align-items:center;padding-top:20px;">
              <div class="check-row">${checkBox(cert.specProvided)}<span class="check-label">Spec Provided</span></div>
              <div class="check-row">${checkBox(cert.drawingsProvided)}<span class="check-label">Drawings Provided</span></div>
            </div>
          </div>
        </div>`;
      body += extentVariationsSection(cert, 'Extent of design work covered');
      body += `<div class="section">
        ${textareaBlock('Design specification', cert.designSpecification || '')}
      </div>`;
      body += `<div class="section"><h2>Operational Checks</h2>
        ${checkRow('Design carried out in accordance with BS 5839-1:2017', !!cert.operationalChecks['Design carried out in accordance with BS 5839-1:2017'])}
        ${checkRow('Wiring specification complies with Clause 26', !!cert.operationalChecks['Wiring specification complies with Clause 26'])}
        ${checkRow('All documentation has been provided', !!cert.operationalChecks['All documentation has been provided'])}
      </div>`;
      body += signatureSection(cert, "Designer's");
      break;

    case 'bs5839Installation':
      subtitle = 'BS 5839-1:2017 — Annex G.2 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section">
        <p class="note">I/we being the competent person(s) responsible for the installation of the fire detection and fire alarm system, CERTIFY that the said installation complies with the specification described below and with the recommendations of Section 4 of BS 5839-1:2017.</p>
        ${textareaBlock('Extent of installation work covered', cert.extentOfWork)}
        ${textareaBlock('Specification against which system was installed', cert.installationSpec || '')}
        ${textareaBlock('Variations from specification and/or Section 4 (Clause 7)', cert.variations)}
      </div>`;
      body += `<div class="section"><h2>Operational Checks</h2>
        ${checkRow('Wiring tested per Clause 38 of BS 5839-1:2017', !!cert.operationalChecks['Wiring tested per Clause 38 of BS 5839-1:2017'])}
        ${fieldBlock('Test results provided to', cert.testResultsProvidedTo || '')}
        ${checkRow('As-fitted drawings supplied to commissioning person', !!cert.operationalChecks['As-fitted drawings supplied to commissioning person'])}
      </div>`;
      body += signatureSection(cert, "Installer's");
      break;

    case 'bs5839Commissioning':
      subtitle = 'BS 5839-1:2017 — Annex G.3 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `
        <div class="section">
          <h2>System Details</h2>
          <div class="field"><label>System Category (BS 5839-1)</label>
            <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px;">
              ${['M', 'L1', 'L2', 'L3', 'L4', 'L5', 'P1', 'P2'].map(c =>
                `<span style="font-size:13px;">${checkBox(cert.systemCategory === c)} ${c}</span>`
              ).join('')}
            </div>
          </div>
          <div class="grid">
            <div class="field"><label>F&amp;RS Signalling</label>
              <div style="display:flex;gap:16px;margin-top:6px;">
                <span style="font-size:13px;">${checkBox(cert.frsSignalling === 'Automatic')} Automatic</span>
                <span style="font-size:13px;">${checkBox(cert.frsSignalling === 'Manual')} Manual</span>
              </div>
            </div>
            <div class="field"><label>System Type</label>
              <div style="display:flex;gap:16px;margin-top:6px;">
                <span style="font-size:13px;">${checkBox(cert.systemType === 'Addressable')} Addressable</span>
                <span style="font-size:13px;">${checkBox(cert.systemType === 'Conventional')} Conventional</span>
              </div>
            </div>
          </div>
          <div class="grid">
            ${fieldBlock('Specification Reference', cert.specReference)}
            <div style="display:flex;gap:20px;align-items:center;padding-top:20px;">
              <div class="check-row">${checkBox(cert.specProvided)}<span class="check-label">Spec Provided</span></div>
              <div class="check-row">${checkBox(cert.drawingsProvided)}<span class="check-label">Drawings Provided</span></div>
            </div>
          </div>
        </div>`;
      body += extentVariationsSection(cert, 'Extent of system covered');
      body += `<div class="section"><h2>Operational Checks</h2>
        ${checkRow('All equipment operates correctly', !!cert.operationalChecks['All equipment operates correctly'])}
        ${checkRow('Installation work is of an acceptable standard', !!cert.operationalChecks['Installation work is of an acceptable standard'])}
        ${checkRow('Entire system inspected and tested per Clause 39.2c)', !!cert.operationalChecks['Entire system inspected and tested per Clause 39.2c)'])}
        ${checkRow('System performs as required by specification', !!cert.operationalChecks['System performs as required by specification'])}
        ${checkRow('Cause &amp; effect of FD&amp;FA operates per fire strategy', !!cert.operationalChecks['Cause & effect of FD&FA operates per fire strategy'])}
        ${checkRow('No obvious potential for unacceptable false alarms (Section 3)', !!cert.operationalChecks['No obvious potential for unacceptable false alarms (Section 3)'])}
        ${checkRow('Documentation per Clause 40 provided to user', !!cert.operationalChecks['Documentation per Clause 40 provided to user'])}
      </div>`;
      body += `<div class="section"><h2>Works &amp; False Alarms</h2>
        ${textareaBlock('Works required before/after system becomes operational', cert.worksRequired)}
        ${textareaBlock('Potential false alarm causes', cert.falseAlarmNotes)}
        ${fieldBlock('Soak test period (weeks)', cert.soakTestWeeks)}
      </div>`;
      body += signatureSection(cert, "Commissioner's");
      break;

    case 'bs5839Acceptance':
      subtitle = 'BS 5839-1:2017 — Annex G.4 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section">
        ${textareaBlock('Extent of system covered', cert.extentOfWork)}
      </div>`;
      body += `<div class="section"><h2>System Status</h2>
        ${checkRow('All installation work appears satisfactory', !!cert.acceptanceChecks['All installation work appears satisfactory'])}
        ${checkRow('System capable of giving a fire alarm signal', !!cert.acceptanceChecks['System capable of giving a fire alarm signal'])}
        ${checkRow('Remote transmission operates correctly', !!cert.acceptanceChecks['Remote transmission operates correctly'])}
        ${checkRow('Zone plan provided on/adjacent to CIE', !!cert.acceptanceChecks['Zone plan provided on/adjacent to CIE'])}
      </div>`;
      body += `<div class="section"><h2>Documentation Provided</h2>
        ${checkRow('As-fitted drawings', !!cert.acceptanceChecks['As-fitted drawings'])}
        ${checkRow('Operating and maintenance instructions', !!cert.acceptanceChecks['Operating and maintenance instructions'])}
        ${checkRow('Certificates of design, installation, and commissioning', !!cert.acceptanceChecks['Certificates of design, installation, and commissioning'])}
        ${checkRow('A logbook', !!cert.acceptanceChecks['A logbook'])}
        ${checkRow('Electrical installation certificate (BS 7671)', !!cert.acceptanceChecks['Electrical installation certificate (BS 7671)'])}
        ${checkRow('User representatives properly instructed', !!cert.acceptanceChecks['User representatives properly instructed'])}
        ${checkRow('All relevant tests witnessed', !!cert.acceptanceChecks['All relevant tests witnessed'])}
      </div>`;
      body += `<div class="section">
        ${textareaBlock('Works required before acceptance', cert.worksRequired || '')}
      </div>`;
      body += `<div class="section"><h2>Acceptance Signatures</h2>
        <p class="note">I/we ACCEPT the system on behalf of the client.</p>
        <div class="grid">
          ${fieldBlock('Name', cert.technicianName)}
          ${fieldBlock('Position', cert.technicianPosition)}
          ${fieldBlock('Signature', cert.technicianSignature || cert.technicianName)}
          ${fieldBlock('Date', cert.signatureDate)}
          ${fieldBlock('For and on behalf of', cert.acceptanceOnBehalfOf || cert.companyName, true)}
        </div>
      </div>`;
      break;

    case 'bs5839Verification':
      subtitle = 'BS 5839-1:2017 — Annex G.5 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += extentVariationsSection(cert);
      body += `<div class="section"><h2>Scope of Verification</h2>
        ${textareaBlock('Scope', cert.verificationScope)}
        ${textareaBlock('Non-Compliances', cert.verificationNonCompliances || 'None identified')}
      </div>`;
      body += signatureSection(cert, "Verifier's");
      break;

    case 'bs7273_4':
      subtitle = 'BS 7273-4:2021 — Door Release Actuation | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section"><h2>Door Actuation Details</h2>
        <div class="field"><label>Category of Actuation</label>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px;">
            <span style="font-size:13px;">${checkBox(cert.bs7273_4CategoryOfActuation === 'Critical (A)')} Critical (A)</span>
            <span style="font-size:13px;">${checkBox(cert.bs7273_4CategoryOfActuation === 'Standard (B)')} Standard (B)</span>
            <span style="font-size:13px;">${checkBox(cert.bs7273_4CategoryOfActuation === 'Indirect (C)')} Indirect (C)</span>
          </div>
        </div>
        ${textareaBlock('Description of release mechanisms, methods, and interface design (Clause 7 & 9)', cert.bs7273_4ReleaseDescription)}
      </div>`;
      body += extentVariationsSection(cert, 'Extent of system covered');
      body += `<div class="section"><h2>Operational Checks</h2>
        ${checkRow('All door release mechanisms operate correctly', !!cert.operationalChecks['All door release mechanisms operate correctly'])}
        ${checkRow('Actuation category confirmed and tested per Clause 20', !!cert.operationalChecks['Actuation category confirmed and tested per Clause 20'])}
        ${checkRow('Interface design operates per fire strategy', !!cert.operationalChecks['Interface design operates per fire strategy'])}
        ${checkRow('Documentation per Clause 20.6 provided', !!cert.operationalChecks['Documentation per Clause 20.6 provided'])}
      </div>`;
      body += signatureSection(cert);
      break;

    case 'bs7273_6':
      subtitle = 'BS 7273-6:2019 — ASE Interfacing | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section"><h2>Ancillary Systems &amp; Equipment (ASE)</h2>
        <p class="note">Select all applicable systems:</p>
        <div class="grid">
          ${['Smoke control systems', 'Electrical supplies', 'Lifts and other lifting appliances', 'Ventilation systems',
            'Gas valves', 'Lighting, intelligent signage and wayfinding', 'Fire-resisting shutters and active fire curtain barriers', 'Paging systems'
          ].map(s => checkRow(s, (cert.bs7273_6Systems || []).includes(s))).join('')}
        </div>
      </div>`;
      body += extentVariationsSection(cert, 'Extent of system covered');
      body += `<div class="section"><h2>Operational Checks</h2>
        ${checkRow('All ASE interfaces operate correctly per Clause 19', !!cert.operationalChecks['All ASE interfaces operate correctly per Clause 19'])}
        ${checkRow('Interface design verified', !!cert.operationalChecks['Interface design verified'])}
        ${checkRow('Cause &amp; effect operates per fire strategy', !!cert.operationalChecks['Cause & effect operates per fire strategy'])}
        ${checkRow('Documentation provided per Clause 20', !!cert.operationalChecks['Documentation provided per Clause 20'])}
      </div>`;
      body += signatureSection(cert);
      break;

    case 'bafeSP203Modular':
      subtitle = 'BAFE SP203-1 Scheme | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section"><h2>Module Details</h2>
        <div class="field"><label>Module Type</label>
          <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:6px;">
            ${['Design', 'Installation', 'Commissioning', 'Maintenance'].map(m =>
              `<span style="font-size:13px;">${checkBox(cert.bafeModuleType === m)} ${m}</span>`
            ).join('')}
          </div>
        </div>
        ${textareaBlock('Module description and scope', cert.bafeModuleDescription || '')}
      </div>`;
      body += extentVariationsSection(cert);
      body += `<div class="section"><h2>Checks</h2>
        ${checkRow('Work complies with BAFE SP203-1 requirements', !!cert.operationalChecks['Work complies with BAFE SP203-1 requirements'])}
        ${checkRow('All testing completed satisfactorily', !!cert.operationalChecks['All testing completed satisfactorily'])}
        ${checkRow('Documentation provided', !!cert.operationalChecks['Documentation provided'])}
      </div>`;
      body += signatureSection(cert);
      break;

    case 'bafeSP203Compliance':
      subtitle = 'BAFE SP203-1 — Full Compliance | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section">
        <p class="note">This certificate confirms that the fire detection and fire alarm system has been designed, installed, commissioned, and where applicable maintained in full compliance with the BAFE SP203-1 scheme requirements.</p>
        ${textareaBlock('Extent of work covered', cert.extentOfWork)}
        ${textareaBlock('Variations', cert.variations)}
      </div>`;
      body += `<div class="section"><h2>Compliance Checks</h2>
        ${checkRow('Design module completed per BAFE SP203-1', !!(cert.bafeComplianceChecks || {})['Design module completed per BAFE SP203-1'])}
        ${checkRow('Installation module completed per BAFE SP203-1', !!(cert.bafeComplianceChecks || {})['Installation module completed per BAFE SP203-1'])}
        ${checkRow('Commissioning module completed per BAFE SP203-1', !!(cert.bafeComplianceChecks || {})['Commissioning module completed per BAFE SP203-1'])}
        ${checkRow('Maintenance arrangements in place', !!(cert.bafeComplianceChecks || {})['Maintenance arrangements in place'])}
        ${checkRow('All documentation provided to client', !!(cert.bafeComplianceChecks || {})['All documentation provided to client'])}
        ${checkRow('Full BAFE SP203-1 compliance confirmed', !!(cert.bafeComplianceChecks || {})['Full BAFE SP203-1 compliance confirmed'])}
      </div>`;
      body += signatureSection(cert);
      break;

    case 'bs7671Electrical':
      subtitle = 'BS 7671 — IET Wiring Regulations | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section"><h2>Circuit Details</h2>
        <div class="grid-3">
          ${fieldBlock('Circuit Description', cert.bs7671CircuitDescription || '')}
          ${fieldBlock('Cable Type (S/E)', cert.bs7671CableType || '')}
          ${fieldBlock('Cable Size (mm²)', cert.bs7671CableSize || '')}
        </div>
      </div>`;
      body += `<div class="section"><h2>Insulation Resistance (MΩ)</h2>
        <div class="grid-3">
          ${fieldBlock('Pos–Neg (MΩ)', cert.bs7671IrPosNeg || '')}
          ${fieldBlock('Pos–Screen (MΩ)', cert.bs7671IrPosScreen || '')}
          ${fieldBlock('Neg–Screen (MΩ)', cert.bs7671IrNegScreen || '')}
        </div>
      </div>`;
      body += `<div class="section"><h2>Circuit Continuity (Ω)</h2>
        <div class="grid">
          ${fieldBlock('Pos + Neg (Ω)', cert.bs7671ContinuityPosNeg || '')}
          ${fieldBlock('Pos + Pos (Ω)', cert.bs7671ContinuityPosPos || '')}
          ${fieldBlock('Neg + Neg (Ω)', cert.bs7671ContinuityNegNeg || '')}
          ${fieldBlock('Screen + Screen (Ω)', cert.bs7671ContinuityScreenScreen || '')}
        </div>
      </div>`;
      body += `<div class="section"><h2>Additional Tests</h2>
        <div class="grid">
          ${fieldBlock('Zs Value (Ω)', cert.bs7671ZsValue || '')}
          <div>${checkRow('Polarity Correct', cert.bs7671PolarityCorrect || false)}</div>
        </div>
        ${checkRow('RCD test satisfactory', cert.bs7671RcdSatisfactory || false)}
      </div>`;
      body += extentVariationsSection(cert);
      body += `<div class="section"><h2>Compliance Checks</h2>
        ${checkRow('Installation complies with BS 7671', !!(cert.bs7671ComplianceChecks || {})['Installation complies with BS 7671'])}
        ${checkRow('All testing completed satisfactorily', !!(cert.bs7671ComplianceChecks || {})['All testing completed satisfactorily'])}
        ${checkRow('Installation is in a safe condition for continued use', !!(cert.bs7671ComplianceChecks || {})['Installation is in a safe condition for continued use'])}
      </div>`;
      body += signatureSection(cert, "Electrician's");
      break;

    case 'variationsSchedule':
      subtitle = 'BS 5839-1 Clause 7 | BAFE Reg: 300354';
      body = siteDetailsSection(cert, jobData);
      body += `<div class="section">
        <p class="note">Variations are a record of aspects of a system that are appropriate and intentional, albeit not compliant with one or more recommendations of the standard.</p>`;
      if ((cert.variationItems || []).length > 0) {
        body += `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:14px;">
          <thead><tr>
            <th style="border:1px solid #d0d7de;padding:8px;background:#f0f2f5;text-align:left;width:40px;">No</th>
            <th style="border:1px solid #d0d7de;padding:8px;background:#f0f2f5;text-align:left;">Description</th>
            <th style="border:1px solid #d0d7de;padding:8px;background:#f0f2f5;text-align:left;width:120px;">Clause Ref</th>
          </tr></thead>
          <tbody>${cert.variationItems.map((v, i) =>
            `<tr><td style="border:1px solid #d0d7de;padding:8px;">${i + 1}</td><td style="border:1px solid #d0d7de;padding:8px;">${v.description || '—'}</td><td style="border:1px solid #d0d7de;padding:8px;">${v.clauseRef || '—'}</td></tr>`
          ).join('')}</tbody>
        </table>`;
      } else {
        body += `<p style="font-style:italic;color:#999;margin-top:8px;">No variations recorded.</p>`;
      }
      body += `</div>`;
      body += signatureSection(cert);
      break;
  }

  // Notes
  if (cert.notes) {
    body += `<div class="section"><h2>Additional Notes</h2><p style="font-size:13px;white-space:pre-line;">${cert.notes}</p></div>`;
  }

  // Footer
  body += `<div class="footer"><span>Core Fire Protection © ${new Date().getFullYear()}</span><span>${cert.contractNo || jobData.jobReference || 'Draft'}</span></div>`;

  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${jobData.siteName || 'Draft'}</title>
    <style>${CERT_CSS}</style>
  </head><body>
    <div class="cert">
      <div class="cert-header">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      ${body}
    </div>
  </body></html>`;
}

export function exportCertificateAsPDF(cert: CertificateRecord, jobData: JobData) {
  const html = generateCertificateHTML(cert, jobData);
  const pw = window.open('', '_blank');
  if (!pw) return;
  pw.document.write(html);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}

export function exportCertificateAsHTML(cert: CertificateRecord, jobData: JobData) {
  const html = generateCertificateHTML(cert, jobData);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${CERTIFICATE_LABELS[cert.type].replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_${jobData.jobReference || 'draft'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllCertificatesAsPDF(certs: CertificateRecord[], jobData: JobData) {
  const completed = certs.filter(c => c.status === 'complete');
  if (completed.length === 0) return;

  const pages = completed.map(cert => {
    const html = generateCertificateHTML(cert, jobData);
    // Extract just the body content
    const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
    return bodyMatch ? bodyMatch[1] : '';
  });

  const combined = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8">
    <title>All Certificates - ${jobData.siteName || 'Draft'}</title>
    <style>${CERT_CSS}
      .page-break { break-before: page; margin-top: 24px; }
    </style>
  </head><body>
    ${pages.map((p, i) => i === 0 ? p : `<div class="page-break">${p}</div>`).join('')}
  </body></html>`;

  const pw = window.open('', '_blank');
  if (!pw) return;
  pw.document.write(combined);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}
