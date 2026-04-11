import { type JobData, CERTIFICATE_LABELS } from '@/types/jobData';
import { type SpecData } from '@/types/specData';
import { loadSpec } from '@/lib/projectStorage';
import { generateCertificateHTML } from '@/lib/certificateExport';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectDrawing } from '@/hooks/useProjectDrawings';

// ── Style constants ──

const MANUAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  @page { size: A4 portrait; margin: 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; font-size: 10pt; color: #0d0d0d; line-height: 1.6; }
  h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
  th, td { border: 1px solid #e8e4dd; padding: 5px 8px; text-align: left; }
  th { background: #f5f3ee; font-weight: 600; }
  ul, ol { padding-left: 16px; }
  li { margin-bottom: 3px; }
  .page-break { break-before: page; }
  a { color: #1a3a5c; text-decoration: underline; }
  .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 14pt; font-weight: 700; color: #c0392b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-bottom: 12px; }
  .sub-title { font-family: 'Space Grotesk', sans-serif; font-size: 11pt; font-weight: 600; margin-bottom: 6px; margin-top: 16px; }
  .tbl { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 8px 0; }
  .td-label { border: 1px solid #e8e4dd; padding: 4px 8px; font-weight: 600; width: 200px; }
  .td { border: 1px solid #e8e4dd; padding: 4px 8px; }
  .td-right { border: 1px solid #e8e4dd; padding: 4px 8px; text-align: right; }
  .th { border: 1px solid #e8e4dd; padding: 5px 8px; background: #f5f3ee; font-weight: 600; }
  .cat-row { border: 1px solid #e8e4dd; padding: 4px 8px; font-weight: 700; background: #faf8f5; }
  .cert-page { break-inside: avoid; }
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
`;

// ── Helpers ──

const fmt = (v: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

function statusLabel(s: string): string {
  const map: Record<string, string> = { draft: 'Draft', forApproval: 'For Approval', approved: 'Approved', issued: 'Issued', superseded: 'Superseded' };
  return map[s] || s;
}

function categoryLabel(s: string): string {
  const map: Record<string, string> = { forApproval: 'For Approval', forInstallation: 'For Installation', asFitted: 'As Fitted' };
  return map[s] || s;
}

// ── Generate signed URLs for all drawings ──

async function getDrawingUrls(drawings: ProjectDrawing[]): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const withFiles = drawings.filter(d => d.file_name);
  const results = await Promise.all(
    withFiles.map(async d => {
      const { data } = await supabase.storage
        .from('drawings')
        .createSignedUrl(`${d.project_id}/${d.file_name}`, 7200);
      return { id: d.id, url: data?.signedUrl || null };
    })
  );
  results.forEach(r => { if (r.url) urlMap.set(r.id, r.url); });
  return urlMap;
}

// ── Build full specification HTML section ──

function buildSpecSection(spec: SpecData): string {
  const standardLabel = spec.standard === 'bs5839_2025' ? 'BS 5839-1: 2025' : 'BS 5839-1: 2017';
  const selectedModules = Object.entries(spec.modules).filter(([, v]) => v).map(([k]) => {
    const labels: Record<string, string> = { design: 'Design', supply: 'Supply', installation: 'Installation', commissioning: 'Commissioning & Handover', maintenance: 'Maintenance', monitoring: 'Monitoring' };
    return labels[k] || k;
  });
  const selectedCategories = Object.entries(spec.categories).filter(([, v]) => v).map(([k]) => k);

  const categoryExplanations: Record<string, string> = {
    M: 'Category M — Manual system incorporating only manual call points.',
    P1: 'Category P1 — Automatic detection throughout for property protection.',
    P2: 'Category P2 — Automatic detection in defined areas for property protection.',
    L1: 'Category L1 — Automatic detection throughout for life safety.',
    L2: 'Category L2 — Automatic detection in defined areas for life safety (includes L3).',
    L3: 'Category L3 — Automatic detection in escape routes.',
    L4: 'Category L4 — Automatic detection in circulation areas only.',
    L5: 'Category L5 — Detection locations determined by fire risk assessment.',
  };

  const cablingTypes: string[] = [];
  if (spec.cabling.softSkinStandard) cablingTypes.push("Soft skin fire resistant cables — 'standard' requirements");
  if (spec.cabling.softSkinEnhanced) cablingTypes.push("Soft skin fire resistant cables — 'enhanced' requirements");
  if (spec.cabling.mineralInsulated) cablingTypes.push("Mineral insulated fire resistant cables — 'enhanced' requirements");
  if (spec.cabling.swa) cablingTypes.push("SWA fire resistant cables — 'enhanced' requirements");
  if (spec.cabling.other && spec.cabling.otherDetail) cablingTypes.push(spec.cabling.otherDetail);

  const equipmentByCategory = spec.equipment
    .filter(e => e.qty > 0)
    .reduce((acc, e) => { if (!acc[e.category]) acc[e.category] = []; acc[e.category].push(e); return acc; }, {} as Record<string, typeof spec.equipment>);

  const equipmentSubtotal = spec.equipment.reduce((s, e) => s + e.qty * e.unitPrice, 0);
  const installationSubtotal = spec.quotation.installationLabour;
  const commissioningSubtotal = spec.quotation.commissioningItems.reduce((s, c) => s + c.qty * c.unitPrice, 0);
  const grossSubtotal = equipmentSubtotal + installationSubtotal + commissioningSubtotal;
  const discountAmount = spec.quotation.discountType === 'percentage' ? grossSubtotal * (spec.quotation.discount / 100) : spec.quotation.discount;
  const netSubtotal = grossSubtotal - discountAmount;
  const vatAmount = netSubtotal * (spec.quotation.vatRate / 100);
  const grandTotal = netSubtotal + vatAmount;
  const hasPricing = grossSubtotal > 0;

  const certLabels: Record<string, string> = {
    bs5839Design: 'BS 5839-1 Design Certificate', bs5839Installation: 'BS 5839-1 Installation Certificate',
    bs5839Commissioning: 'BS 5839-1 Commissioning Certificate', bs5839Acceptance: 'BS 5839-1 Acceptance Certificate',
    bs7273_4: 'BS 7273-4 Certificate', bs7273_6: 'BS 7273-6 Certificate',
    bafeSP203Modular: 'BAFE SP203 Modular Certificate', bafeSP203Compliance: 'BAFE SP203 Certificate of Compliance',
    bs7671Electrical: 'BS 7671 Electrical Installation Certificate',
  };

  let html = `<div class="page-break"><h2 class="section-title">Appendix A — Project Specification</h2>`;

  html += `<table class="tbl">
    <tr><td class="td-label">Customer</td><td class="td">${spec.customerName || '—'}</td></tr>
    <tr><td class="td-label">Site</td><td class="td">${spec.siteName || '—'}</td></tr>
    <tr><td class="td-label">Address</td><td class="td" style="white-space:pre-line;">${spec.siteAddress || '—'}</td></tr>
    <tr><td class="td-label">Reference</td><td class="td">${spec.specReference || '—'}</td></tr>
    <tr><td class="td-label">Date</td><td class="td">${spec.specDate || '—'}</td></tr>
    <tr><td class="td-label">Produced By</td><td class="td">${spec.producedBy || '—'}</td></tr>
    <tr><td class="td-label">Standard</td><td class="td">${standardLabel}</td></tr>
  </table>`;

  if (selectedModules.length > 0) {
    html += `<h3 class="sub-title">Service Modules</h3><table class="tbl"><thead><tr>${selectedModules.map(m => `<th class="th" style="text-align:center;text-transform:uppercase;font-size:8pt;">${m}</th>`).join('')}</tr></thead><tbody><tr>${selectedModules.map(() => `<td class="td" style="text-align:center;font-weight:700;">✓</td>`).join('')}</tr></tbody></table>`;
  }

  if (selectedCategories.length > 0) {
    html += `<h3 class="sub-title">System Categories</h3><table class="tbl"><thead><tr><th class="th">Category</th><th class="th">Explanation</th></tr></thead><tbody>`;
    selectedCategories.forEach(cat => {
      html += `<tr><td class="td" style="font-weight:700;width:80px;">${cat}</td><td class="td">${categoryExplanations[cat] || cat}</td></tr>`;
    });
    html += `</tbody></table>`;
    if (spec.categoryP2Areas) html += `<p style="font-size:9pt;"><strong>P2 Areas:</strong> ${spec.categoryP2Areas}</p>`;
    if (spec.categoryL2Areas) html += `<p style="font-size:9pt;"><strong>L2 Areas:</strong> ${spec.categoryL2Areas}</p>`;
  }

  if (spec.variations.length > 0) {
    html += `<h3 class="sub-title">Schedule of Design Variations</h3><table class="tbl"><thead><tr><th class="th" style="width:80px;">Variation</th><th class="th">Detail</th><th class="th" style="width:100px;">Clause Ref</th></tr></thead><tbody>`;
    spec.variations.forEach(v => { html += `<tr><td class="td">${v.number}</td><td class="td">${v.detail}</td><td class="td">${v.clauseRef}</td></tr>`; });
    html += `</tbody></table>`;
  }

  html += `<h3 class="sub-title">Certification</h3><table class="tbl"><thead><tr><th class="th">Certificate</th><th class="th" style="text-align:center;width:80px;">Core Fire</th><th class="th" style="text-align:center;width:80px;">Client</th><th class="th" style="text-align:center;width:80px;">Others</th></tr></thead><tbody>`;
  Object.entries(spec.certificates).forEach(([key, val]) => {
    if (!val.coreFire && !val.client && !val.others) return;
    html += `<tr><td class="td">${certLabels[key] || key}</td><td class="td" style="text-align:center;">${val.coreFire ? '✓' : ''}</td><td class="td" style="text-align:center;">${val.client ? '✓' : ''}</td><td class="td" style="text-align:center;">${val.others ? '✓' : ''}</td></tr>`;
  });
  html += `</tbody></table>`;

  html += `<h3 class="sub-title">System Design Particulars</h3>`;
  html += `<p><strong>Standby:</strong> ${spec.standbyHours} hours | <strong>Alarm duration:</strong> ${spec.alarmMinutes} minutes</p>`;
  if (cablingTypes.length > 0) {
    html += `<h4 style="font-size:10pt;font-weight:600;margin-top:12px;">Cabling</h4><ul>${cablingTypes.map(c => `<li>${c}</li>`).join('')}</ul>`;
  }

  html += `<h4 style="font-size:10pt;font-weight:600;margin-top:12px;">Evacuation</h4><ul>`;
  if (spec.evacuation.type === 'simultaneous') html += `<li>Simultaneous evacuation</li>`;
  else if (spec.evacuation.type === 'causeEffect') html += `<li>Programmed per cause &amp; effect matrix</li>`;
  else html += `<li>${spec.evacuation.otherDetail || 'Other'}</li>`;
  html += `</ul>`;

  if (spec.doorRelease.enabled) {
    html += `<h4 style="font-size:10pt;font-weight:600;margin-top:12px;">Door Release (BS 7273-4)</h4><table class="tbl"><thead><tr><th class="th">Category</th><th class="th">Locations</th></tr></thead><tbody>`;
    if (spec.doorRelease.categoryA) html += `<tr><td class="td" style="font-weight:600;">Category A</td><td class="td">${spec.doorRelease.categoryALocations || 'All areas'}</td></tr>`;
    if (spec.doorRelease.categoryB) html += `<tr><td class="td" style="font-weight:600;">Category B</td><td class="td">${spec.doorRelease.categoryBLocations || 'All areas'}</td></tr>`;
    if (spec.doorRelease.categoryC) html += `<tr><td class="td" style="font-weight:600;">Category C</td><td class="td">${spec.doorRelease.categoryCLocations || 'All areas'}</td></tr>`;
    html += `</tbody></table>`;
  }

  if (spec.ancillaryInterfaces.enabled) {
    const ifs: string[] = [];
    if (spec.ancillaryInterfaces.smokeControl) ifs.push('Smoke Control Systems');
    if (spec.ancillaryInterfaces.lifts) ifs.push('Lift Recall');
    if (spec.ancillaryInterfaces.gasValves) ifs.push('Gas Shut-Off Valves');
    if (spec.ancillaryInterfaces.fireShutters) ifs.push('Fire Shutters');
    if (spec.ancillaryInterfaces.electricalSupplies) ifs.push('Electrical Supply Isolation');
    if (spec.ancillaryInterfaces.ventilation) ifs.push('Ventilation / HVAC');
    if (spec.ancillaryInterfaces.lighting) ifs.push('Emergency Lighting');
    if (spec.ancillaryInterfaces.signage) ifs.push('Signage');
    if (spec.ancillaryInterfaces.paging) ifs.push('PA / Paging');
    if (ifs.length > 0) {
      html += `<h4 style="font-size:10pt;font-weight:600;margin-top:12px;">Ancillary Interfaces (BS 7273-6)</h4><ul>${ifs.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
  }

  if (spec.interfaces.length > 0) {
    html += `<h4 style="font-size:10pt;font-weight:600;margin-top:12px;">Interface Schedule</h4><table class="tbl"><thead><tr><th class="th" style="width:60px;">Qty</th><th class="th">Use / Description</th></tr></thead><tbody>`;
    spec.interfaces.forEach(i => { html += `<tr><td class="td" style="text-align:center;">${i.qty}</td><td class="td">${i.use}</td></tr>`; });
    html += `</tbody></table>`;
  }

  if (Object.keys(equipmentByCategory).length > 0) {
    html += `<div class="page-break"><h3 class="sub-title">Bill of Materials</h3><table class="tbl"><thead><tr><th class="th" style="width:60px;text-align:center;">Qty</th><th class="th">Item</th>${hasPricing ? '<th class="th" style="width:90px;text-align:right;">Unit</th><th class="th" style="width:90px;text-align:right;">Total</th>' : ''}</tr></thead><tbody>`;
    Object.entries(equipmentByCategory).forEach(([cat, items]) => {
      html += `<tr><td colspan="${hasPricing ? 4 : 2}" class="cat-row">${cat}</td></tr>`;
      items.forEach(item => {
        html += `<tr><td class="td" style="text-align:center;">${item.qty}</td><td class="td">${item.description}</td>${hasPricing ? `<td class="td-right">${fmt(item.unitPrice)}</td><td class="td-right">${fmt(item.qty * item.unitPrice)}</td>` : ''}</tr>`;
      });
    });
    if (hasPricing) {
      if (installationSubtotal > 0) html += `<tr><td class="td" style="text-align:center;">1</td><td class="td"><strong>${spec.quotation.installationDescription}</strong></td><td class="td-right">${fmt(installationSubtotal)}</td><td class="td-right">${fmt(installationSubtotal)}</td></tr>`;
      spec.quotation.commissioningItems.filter(c => c.qty > 0 && c.unitPrice > 0).forEach(c => {
        html += `<tr><td class="td" style="text-align:center;">${c.qty}</td><td class="td">${c.description}</td><td class="td-right">${fmt(c.unitPrice)}</td><td class="td-right">${fmt(c.qty * c.unitPrice)}</td></tr>`;
      });
      html += `<tr><td colspan="3" class="td" style="font-weight:700;text-align:right;">Sub-Total ex VAT</td><td class="td" style="font-weight:700;text-align:right;">${fmt(grossSubtotal)}</td></tr>`;
      if (discountAmount > 0) html += `<tr><td colspan="3" class="td" style="text-align:right;color:#c0392b;">Discount</td><td class="td" style="text-align:right;color:#c0392b;">-${fmt(discountAmount)}</td></tr>`;
      html += `<tr><td colspan="3" class="td" style="text-align:right;">VAT (${spec.quotation.vatRate}%)</td><td class="td-right">${fmt(vatAmount)}</td></tr>`;
      html += `<tr><td colspan="3" class="td" style="font-weight:700;text-align:right;font-size:10pt;">Total inc VAT</td><td class="td" style="font-weight:700;text-align:right;font-size:10pt;">${fmt(grandTotal)}</td></tr>`;
    }
    html += `</tbody></table></div>`;
  }

  html += `<h3 class="sub-title">Project Scope & Key Assumptions</h3>`;
  if (spec.projectScope?.workingHours) html += `<p style="font-size:9pt;background:#faf8f5;padding:8px 12px;border-left:3px solid #c0392b;margin-bottom:8px;">${spec.projectScope.workingHours}</p>`;
  if ((spec.projectScope?.clientResponsibilities?.length ?? 0) > 0) {
    html += `<h4 style="font-size:10pt;font-weight:600;margin-top:8px;">Client Responsibilities</h4><ul style="font-size:9pt;">${spec.projectScope.clientResponsibilities.map(r => `<li>${r}</li>`).join('')}</ul>`;
  }
  if ((spec.projectScope?.exclusions?.length ?? 0) > 0) {
    html += `<h4 style="font-size:10pt;font-weight:600;margin-top:8px;">Exclusions</h4><ul style="font-size:9pt;">${spec.projectScope.exclusions.map(e => `<li>${e}</li>`).join('')}</ul>`;
  }

  html += `<h3 class="sub-title">Warranty</h3><p>${spec.warrantyMonths || 12}-month warranty for parts and labour from date of commissioning.</p>`;
  if ((spec.warrantyConditions?.length ?? 0) > 0) {
    html += `<ul style="font-size:9pt;">${spec.warrantyConditions.map(c => `<li>${c}</li>`).join('')}</ul>`;
  }

  if (spec.clarifications.length > 0) {
    html += `<h3 class="sub-title">Points of Clarification</h3><ol style="font-size:9pt;">${spec.clarifications.map(c => `<li>${c.text}</li>`).join('')}</ol>`;
  }

  html += `</div>`;
  return html;
}

// ── Build drawing register with hyperlinks ──

function buildDrawingRegister(drawings: ProjectDrawing[], urlMap: Map<string, string>): string {
  if (drawings.length === 0) return '';

  const active = drawings.filter(d => d.status !== 'superseded');
  const superseded = drawings.filter(d => d.status === 'superseded');

  let html = `<div class="page-break"><h2 class="section-title">Appendix B — Drawing Register</h2>`;
  html += `<p style="margin-bottom:12px;">The following drawings are held within the project drawing library. Click any drawing link to view or download.</p>`;

  html += `<h3 class="sub-title">Current Drawings</h3><table class="tbl">
    <thead><tr>
      <th class="th" style="width:120px;">Drawing No.</th>
      <th class="th">Name</th>
      <th class="th" style="width:100px;">Category</th>
      <th class="th" style="width:60px;">Rev</th>
      <th class="th" style="width:90px;">Rev Date</th>
      <th class="th" style="width:80px;">Status</th>
      <th class="th" style="width:60px;">Sheet</th>
      <th class="th" style="width:60px;">File</th>
    </tr></thead><tbody>`;

  const grouped = ['forApproval', 'forInstallation', 'asFitted'];
  for (const cat of grouped) {
    const catDrawings = active.filter(d => d.category === cat);
    if (catDrawings.length === 0) continue;
    html += `<tr><td colspan="8" class="cat-row">${categoryLabel(cat)}</td></tr>`;
    catDrawings.forEach(d => {
      const url = urlMap.get(d.id);
      const fileCell = url
        ? `<a href="${url}" target="_blank" title="Download ${d.file_name}">📥 View</a>`
        : (d.file_name ? '📄' : '—');
      html += `<tr>
        <td class="td" style="font-weight:600;">${d.drawing_number || '—'}</td>
        <td class="td">${d.name || '—'}</td>
        <td class="td">${categoryLabel(d.category)}</td>
        <td class="td" style="text-align:center;">${d.revision}</td>
        <td class="td">${d.revision_date || '—'}</td>
        <td class="td">${statusLabel(d.status)}</td>
        <td class="td" style="text-align:center;">${d.sheet_number || '—'}</td>
        <td class="td" style="text-align:center;">${fileCell}</td>
      </tr>`;
    });
  }
  html += `</tbody></table>`;

  if (superseded.length > 0) {
    html += `<h3 class="sub-title">Superseded Revisions</h3><table class="tbl">
      <thead><tr><th class="th">Drawing No.</th><th class="th">Name</th><th class="th" style="width:60px;">Rev</th><th class="th" style="width:90px;">Date</th><th class="th" style="width:60px;">File</th></tr></thead><tbody>`;
    superseded.forEach(d => {
      const url = urlMap.get(d.id);
      const fileCell = url ? `<a href="${url}" target="_blank">📥</a>` : '—';
      html += `<tr><td class="td">${d.drawing_number || '—'}</td><td class="td">${d.name || '—'}</td><td class="td" style="text-align:center;">${d.revision}</td><td class="td">${d.revision_date || '—'}</td><td class="td" style="text-align:center;">${fileCell}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  html += `</div>`;
  return html;
}

// ── Build certificates appendix ──

function buildCertificatesAppendix(jobData: JobData): string {
  const completed = jobData.certificates.filter(c => c.status === 'complete');
  if (completed.length === 0) return '';

  let html = `<div class="page-break"><h2 class="section-title">Appendix C — Completed Certificates</h2>`;
  html += `<p style="margin-bottom:12px;">The following ${completed.length} certificate(s) have been completed for this installation:</p>`;
  html += `<table class="tbl"><thead><tr><th class="th" style="width:40px;">#</th><th class="th">Certificate</th><th class="th" style="width:120px;">Date</th><th class="th" style="width:150px;">Signed By</th></tr></thead><tbody>`;
  completed.forEach((cert, i) => {
    html += `<tr><td class="td" style="text-align:center;">${i + 1}</td><td class="td">${CERTIFICATE_LABELS[cert.type]}</td><td class="td">${cert.signatureDate || '—'}</td><td class="td">${cert.technicianName || '—'}</td></tr>`;
  });
  html += `</tbody></table>`;

  completed.forEach(cert => {
    const certHtml = generateCertificateHTML(cert, jobData);
    const bodyMatch = certHtml.match(/<body>([\s\S]*)<\/body>/);
    if (bodyMatch) {
      html += `<div class="page-break cert-page">${bodyMatch[1]}</div>`;
    }
  });

  html += `</div>`;
  return html;
}

// ── Build datasheets appendix ──

function buildDatasheetsAppendix(jobData: JobData): string {
  let html = `<div class="page-break"><h2 class="section-title">Appendix D — Technical Datasheets & User Manuals</h2>`;
  html += `<p style="margin-bottom:12px;">The following technical documentation is included within this manual:</p>`;
  html += `<table class="tbl">
    <thead><tr><th class="th" style="width:40px;">#</th><th class="th">Document</th><th class="th" style="width:100px;text-align:center;">Status</th></tr></thead><tbody>`;
  html += `<tr><td class="td">1</td><td class="td">Control Panel Technical Manual</td><td class="td" style="text-align:center;">${jobData.userManuals.controlPanelManual.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>`;
  html += `<tr><td class="td">2</td><td class="td">Detector / Device Technical Datasheets</td><td class="td" style="text-align:center;">${jobData.userManuals.datasheets.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>`;
  jobData.userManuals.additionalDocs.forEach((doc, i) => {
    html += `<tr><td class="td">${i + 3}</td><td class="td">${doc.name}</td><td class="td" style="text-align:center;">${doc.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>`;
  });
  html += `</tbody></table>`;
  html += `<p style="font-size:9pt;margin-top:8px;font-style:italic;">Note: Where datasheets are supplied electronically, digital copies should be retained alongside this manual.</p>`;
  html += `</div>`;
  return html;
}

// ── Shared: build the full manual body HTML ──

async function buildManualBody(
  projectId: string,
  jobData: JobData,
  drawings: ProjectDrawing[],
  urlMap: Map<string, string>,
  spec: SpecData | null,
): Promise<string> {
  const cl = jobData.commissioningChecklist;

  const tocItems = [
    '1 — Document Control', '2 — Project Overview', '3 — System Overview',
    '4 — Technical Datasheets', '5 — Equipment O&M Instructions', '6 — Configuration List',
    '7 — Test & Handover Certification', '8 — Commissioning Report',
    '9 — System Drawings & Zone Chart', '10 — Maintenance Procedures',
    '11 — Warranty Information', '12 — Health & Safety', '13 — Fire Safety Log Book',
    'Appendix A — Project Specification', 'Appendix B — Drawing Register',
    'Appendix C — Completed Certificates', 'Appendix D — Technical Datasheets & Manuals',
  ];

  let body = '';

  // Cover page
  body += `<div style="min-height:600px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 40px;background:#0d0d0d;color:#f5f3ee;">
    <p style="font-size:10pt;text-transform:uppercase;letter-spacing:0.15em;opacity:0.5;margin-bottom:16px;">Operation and Maintenance Manual</p>
    <h1 style="font-family:'Space Grotesk',sans-serif;font-size:22pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Fire Detection & Alarm System</h1>
    <div style="width:60px;height:3px;background:#c0392b;margin:16px auto;"></div>
    <div style="font-size:11pt;opacity:0.8;line-height:2;margin-top:16px;">
      ${jobData.siteName ? `<p style="font-size:14pt;font-weight:600;">${jobData.siteName}</p>` : ''}
      ${jobData.siteAddress ? `<p style="white-space:pre-line;font-size:10pt;">${jobData.siteAddress}</p>` : ''}
      ${jobData.customerName ? `<p style="margin-top:16px;">Prepared for: <strong>${jobData.customerName}</strong></p>` : ''}
      ${jobData.jobReference ? `<p>Job Reference: ${jobData.jobReference}</p>` : ''}
      ${jobData.specReference ? `<p>Specification Reference: ${jobData.specReference}</p>` : ''}
      <p style="margin-top:16px;opacity:0.6;">In compliance with BS 5839-1: 2025</p>
      <p style="margin-top:24px;opacity:0.4;font-size:9pt;">Document generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>`;

  // TOC
  body += `<div style="padding:32px;font-family:'DM Sans',sans-serif;font-size:10pt;line-height:1.6;color:#0d0d0d;">`;
  body += `<h2 class="section-title">Contents</h2>`;
  tocItems.forEach(item => {
    body += `<div style="display:flex;justify-content:space-between;border-bottom:1px dotted #ccc;padding:5px 0;font-size:10pt;"><span>${item}</span></div>`;
  });

  // Section 1: Document Control
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 1 — Document Control</h2>
    <table class="tbl"><tbody>
      <tr><td class="td-label">Job Reference</td><td class="td">${jobData.jobReference || '—'}</td></tr>
      <tr><td class="td-label">Specification Reference</td><td class="td">${jobData.specReference || '—'}</td></tr>
      <tr><td class="td-label">Project Manager</td><td class="td">${jobData.projectManager || '—'}</td></tr>
      <tr><td class="td-label">Contract Date</td><td class="td">${jobData.contractDate || '—'}</td></tr>
      <tr><td class="td-label">Target Completion</td><td class="td">${jobData.targetCompletionDate || '—'}</td></tr>
      <tr><td class="td-label">Document Status</td><td class="td">${jobData.status === 'complete' ? 'Final' : 'Working Draft'}</td></tr>
    </tbody></table>
    <table class="tbl" style="margin-top:12px;"><thead><tr><th class="th">Rev</th><th class="th">Date</th><th class="th">Description</th><th class="th">Author</th></tr></thead><tbody>
      <tr><td class="td">A</td><td class="td">${jobData.contractDate || '—'}</td><td class="td">Initial Issue</td><td class="td">${jobData.projectManager || '—'}</td></tr>
    </tbody></table>
  </div>`;

  // Section 2: Project Overview
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 2 — Project Overview</h2>
    <table class="tbl"><tbody>
      <tr><td class="td-label">Client</td><td class="td">${jobData.customerName || '—'}</td></tr>
      <tr><td class="td-label">Site</td><td class="td">${jobData.siteName || '—'}</td></tr>
      <tr><td class="td-label">Address</td><td class="td" style="white-space:pre-line;">${jobData.siteAddress || '—'}</td></tr>
    </tbody></table></div>`;

  // Section 3: System Overview
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 3 — System Overview</h2>
    ${jobData.systemOverview.description ? `<p style="white-space:pre-line;">${jobData.systemOverview.description}</p>` : '<p style="font-style:italic;color:#999;">System overview pending.</p>'}
    <h3 class="sub-title">System Components Summary</h3>
    <p style="font-size:9pt;">Refer to the Bill of Materials within the original specification for a complete list of equipment installed.</p>
  </div>`;

  // Section 4: Technical Datasheets
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 4 — Technical Datasheets</h2>
    <p>The following technical datasheets are included within this section and should be retained for reference:</p>
    <table class="tbl"><thead><tr><th class="th" style="width:40px;">#</th><th class="th">Document</th><th class="th" style="width:100px;text-align:center;">Status</th></tr></thead><tbody>
      <tr><td class="td">1</td><td class="td">Control Panel Technical Datasheet</td><td class="td" style="text-align:center;">${jobData.userManuals.controlPanelManual.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
      <tr><td class="td">2</td><td class="td">Detector / Device Technical Datasheets</td><td class="td" style="text-align:center;">${jobData.userManuals.datasheets.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>`;
  jobData.userManuals.additionalDocs.forEach((doc, i) => {
    body += `<tr><td class="td">${i + 3}</td><td class="td">${doc.name}</td><td class="td" style="text-align:center;">${doc.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>`;
  });
  body += `</tbody></table>
    <p style="font-size:9pt;margin-top:8px;font-style:italic;">Note: Where datasheets are supplied electronically, digital copies should be retained alongside this manual.</p>
  </div>`;

  // Section 5: Equipment O&M Instructions
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 5 — Equipment O&M Instructions</h2>
    <p>Manufacturer's operation and maintenance instructions for the control and indicating equipment are included within this section.</p>
    <table class="tbl"><thead><tr><th class="th" style="width:40px;">#</th><th class="th">Document</th><th class="th" style="width:100px;text-align:center;">Status</th></tr></thead><tbody>
      <tr><td class="td">1</td><td class="td">Control Panel Operation Manual</td><td class="td" style="text-align:center;">${jobData.userManuals.controlPanelManual.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
    </tbody></table>
    <h3 class="sub-title">Project Specific Operating Instructions</h3>
    <p>The following project specific instructions apply to this installation:</p>
    <ul style="padding-left:16px;margin-top:8px;font-size:9pt;">
      <li><strong>Isolating a device or zone:</strong> Refer to the control panel user manual for the isolate/de-isolate procedure specific to this panel type.</li>
      <li><strong>Weekly testing:</strong> A different manual call point should be tested each week using the test key. Notify the ARC (if applicable) before testing.</li>
      <li><strong>In the event of an alarm:</strong> Evacuate the building, call the fire service, do not re-enter until authorised. Only reset the panel once the cause has been identified.</li>
      <li><strong>In the event of a fault:</strong> Record the fault in the log book and contact the service organisation promptly.</li>
      <li><strong>Service organisation contact:</strong> Core Fire Protection — Tel: 0141 433 1934 — Email: service@corefire.co.uk</li>
    </ul>
  </div>`;

  // Section 6: Configuration List
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 6 — Configuration List</h2>
    <p>A copy of the system configuration / device address list should be included within this section. This document records the addressing and programming of all devices within the system.</p>
    <table class="tbl"><thead><tr><th class="th">Item</th><th class="th" style="width:100px;text-align:center;">Status</th></tr></thead><tbody>
      <tr><td class="td">Device Address / Configuration List</td><td class="td" style="text-align:center;">${jobData.systemOverview.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
      <tr><td class="td">Zone / Loop Schedule</td><td class="td" style="text-align:center;">${jobData.systemOverview.status === 'complete' ? '✓ Included' : '☐ Pending'}</td></tr>
      <tr><td class="td">Cause & Effect Matrix</td><td class="td" style="text-align:center;">☐ Pending</td></tr>
    </tbody></table>
  </div>`;

  // Section 7: Certificates summary
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 7 — Test & Handover Certification</h2>
    <p>The following certificates have been issued. Full certificates are included in Appendix C.</p>
    <table class="tbl"><thead><tr><th class="th">Certificate</th><th class="th" style="width:100px;text-align:center;">Status</th></tr></thead><tbody>`;
  jobData.certificates.forEach(cert => {
    const st = cert.status === 'complete' ? '✓ Complete' : cert.status === 'inProgress' ? '◐ In Progress' : cert.status === 'notApplicable' ? 'N/A' : '☐ Pending';
    body += `<tr><td class="td">${CERTIFICATE_LABELS[cert.type]}</td><td class="td" style="text-align:center;">${st}</td></tr>`;
  });
  body += `</tbody></table></div>`;

  // Section 8: Commissioning Report
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 8 — Commissioning Report</h2>
    <h3 class="sub-title">Power Supply</h3>
    <table class="tbl"><tbody>
      <tr><td class="td-label">CIE Charge Voltage</td><td class="td">${cl.powerSupply.cieChargeVoltage || '—'}</td><td class="td-label">PSU Output</td><td class="td">${cl.powerSupply.ciePsuOutput || '—'}</td></tr>
      <tr><td class="td-label">Battery 1</td><td class="td">${cl.powerSupply.battery1Vdc || '—'} Vdc</td><td class="td-label">Battery 2</td><td class="td">${cl.powerSupply.battery2Vdc || '—'} Vdc</td></tr>
      <tr><td class="td-label">Standby Required</td><td class="td">${cl.powerSupply.standbyRequired || '—'} AHr</td><td class="td-label">Standby Fitted</td><td class="td">${cl.powerSupply.standbyFitted || '—'} AHr</td></tr>
      <tr><td class="td-label">Batteries Labelled</td><td class="td">${cl.powerSupply.batteriesLabelled ? '✓' : '✗'}</td><td class="td-label">Standby Confirmed</td><td class="td">${cl.powerSupply.standbyConfirmed ? '✓' : '✗'}</td></tr>
    </tbody></table>
    <h3 class="sub-title">Cable Test Records</h3>
    <table class="tbl"><tbody>
      <tr><td class="td">Insulation Resistance (IR) Tests Completed</td><td class="td" style="width:60px;text-align:center;">${cl.cableTests.irTested ? '✓' : '✗'}</td></tr>
      <tr><td class="td">Continuity (CCTR) Tests Completed</td><td class="td" style="text-align:center;">${cl.cableTests.cctrTested ? '✓' : '✗'}</td></tr>
      <tr><td class="td">Zs Tests Completed</td><td class="td" style="text-align:center;">${cl.cableTests.zsTested ? '✓' : '✗'}</td></tr>
      <tr><td class="td">Separate Cable Test Sheet Attached</td><td class="td" style="text-align:center;">${cl.cableTests.separateSheetAttached ? '✓' : '✗'}</td></tr>
    </tbody></table>`;
  if (cl.cableTests.circuits.length > 0) {
    body += `<h3 class="sub-title">Circuit Test Results</h3>
      <table class="tbl"><thead><tr><th class="th">Circuit</th><th class="th">Cable Type</th><th class="th">Cable Size</th><th class="th" style="text-align:center;">IR Result</th><th class="th" style="text-align:center;">Polarity OK</th></tr></thead><tbody>`;
    cl.cableTests.circuits.forEach(c => {
      body += `<tr><td class="td">${c.description}</td><td class="td">${c.cableType}</td><td class="td">${c.cableSize}</td><td class="td" style="text-align:center;">${c.irResult || '—'}</td><td class="td" style="text-align:center;">${c.polarityOk ? '✓' : '✗'}</td></tr>`;
    });
    body += `</tbody></table>`;
  }
  body += `<h3 class="sub-title">System Checks</h3>
    <table class="tbl"><tbody>
      <tr><td class="td">All equipment operates correctly</td><td class="td" style="width:60px;text-align:center;">${cl.systemChecks.allDevicesTested ? '✓' : '✗'}</td></tr>
      <tr><td class="td">All sounders/beacons verified</td><td class="td" style="text-align:center;">${cl.systemChecks.soundersVerified ? '✓' : '✗'}</td></tr>
      <tr><td class="td">Zone chart provided</td><td class="td" style="text-align:center;">${cl.systemChecks.zoneChartProvided ? '✓' : '✗'}</td></tr>
      <tr><td class="td">Cause &amp; effect tested</td><td class="td" style="text-align:center;">${cl.systemChecks.causeEffectTested ? '✓' : '✗'}</td></tr>
      <tr><td class="td">False alarm risk assessed</td><td class="td" style="text-align:center;">${cl.systemChecks.falseAlarmRiskAssessed ? '✓' : '✗'}</td></tr>
    </tbody></table>
    ${cl.systemChecks.soakTestWeeks ? `<p style="font-size:9pt;margin-top:8px;"><strong>Soak test period:</strong> ${cl.systemChecks.soakTestWeeks} week(s)</p>` : ''}
    ${cl.systemChecks.notes ? `<p style="font-size:9pt;margin-top:4px;"><strong>Notes:</strong> ${cl.systemChecks.notes}</p>` : ''}
  </div>`;

  // Section 9: Drawings summary
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 9 — System Drawings</h2>
    <p>The full drawing register with download links is provided in Appendix B. Summary:</p>
    <table class="tbl"><thead><tr><th class="th">Category</th><th class="th" style="text-align:center;">Count</th></tr></thead><tbody>
      <tr><td class="td">For Approval</td><td class="td" style="text-align:center;">${drawings.filter(d => d.category === 'forApproval' && d.status !== 'superseded').length}</td></tr>
      <tr><td class="td">For Installation</td><td class="td" style="text-align:center;">${drawings.filter(d => d.category === 'forInstallation' && d.status !== 'superseded').length}</td></tr>
      <tr><td class="td">As Fitted</td><td class="td" style="text-align:center;">${drawings.filter(d => d.category === 'asFitted' && d.status !== 'superseded').length}</td></tr>
    </tbody></table></div>`;

  // Section 10: Maintenance Procedures
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 10 — Maintenance Procedures</h2>
    <p>The fire detection and alarm system should be maintained in accordance with <strong>BS 5839-1:2025 Section 6</strong>. Routine inspections should be carried out at intervals not exceeding six months.</p>
    <h3 class="sub-title">Responsible Person Duties</h3>
    <p>The responsible person should ensure:</p>
    <ul style="padding-left:16px;margin-top:4px;font-size:9pt;">
      <li><strong>Daily:</strong> Visual check that the panel indicates normal operation (no fault or isolate indicators illuminated)</li>
      <li><strong>Weekly:</strong> Testing of the system using a different manual call point each week, rotating through all call points over a 13-week or 52-week cycle</li>
      <li><strong>Monthly:</strong> Check that all system documentation is up to date and the log book is being maintained</li>
      <li>All faults are reported and attended to promptly by the service organisation</li>
      <li>Records of all tests, faults and maintenance visits are kept in the Fire Log Book</li>
      <li>The ARC (if applicable) is notified before and after each test</li>
    </ul>
    <h3 class="sub-title">Periodic Inspection &amp; Service Schedule</h3>
    <table class="tbl"><thead><tr><th class="th">Activity</th><th class="th" style="width:120px;">Frequency</th><th class="th">By Whom</th></tr></thead><tbody>
      <tr><td class="td">Visual panel check</td><td class="td">Daily</td><td class="td">Responsible Person</td></tr>
      <tr><td class="td">Call point test (rotating)</td><td class="td">Weekly</td><td class="td">Responsible Person</td></tr>
      <tr><td class="td">Quarterly inspection</td><td class="td">Every 3 months</td><td class="td">Service Provider</td></tr>
      <tr><td class="td">Full periodic inspection &amp; test</td><td class="td">Every 6 months</td><td class="td">Service Provider</td></tr>
      <tr><td class="td">Annual review of system</td><td class="td">Annually</td><td class="td">Service Provider</td></tr>
    </tbody></table>
  </div>`;

  // Section 11: Warranty
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 11 — Warranty Information</h2>
    <table class="tbl"><tbody>
      <tr><td class="td-label">Warranty Start Date</td><td class="td">${jobData.warranty.startDate || '—'}</td></tr>
      <tr><td class="td-label">Warranty End Date</td><td class="td">${jobData.warranty.endDate || '—'}</td></tr>
      <tr><td class="td-label">Warranty Period</td><td class="td">12 months from date of commissioning</td></tr>
    </tbody></table>
    ${jobData.warranty.notes ? `<p style="font-size:9pt;margin-top:8px;"><strong>Notes:</strong> ${jobData.warranty.notes}</p>` : ''}
    <p style="font-size:9pt;margin-top:8px;">The system carries a warranty of twelve months from the date of commissioning, on the basis that the system will be maintained in accordance with the manufacturer's recommended standards and frequencies. The system must have been commissioned by Core Fire Protection for both parts and labour to be warranted.</p>
  </div>`;

  // Section 12: Health & Safety
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 12 — Health &amp; Safety Information</h2>
    <p>All works are carried out in accordance with current health and safety legislation including:</p>
    <ul style="padding-left:16px;margin-top:8px;font-size:9pt;">
      <li>Health and Safety at Work Act 1974</li>
      <li>Regulatory Reform (Fire Safety) Order 2005</li>
      <li>Fire (Scotland) Act 2005</li>
      <li>Fire Safety (Scotland) Regulations 2006</li>
      <li>CDM Regulations 2015</li>
      <li>Electricity at Work Regulations 1989</li>
    </ul>
    <p style="margin-top:8px;">Risk assessments and method statements are available upon request.</p>
    <h3 class="sub-title">Safety Notices</h3>
    <ul style="padding-left:16px;margin-top:4px;font-size:9pt;">
      <li>Do not attempt to repair or modify any part of the fire alarm system</li>
      <li>Do not paint over any detection devices</li>
      <li>Do not hang items from or obstruct any detection or alarm devices</li>
      <li>Ensure all fire alarm devices remain accessible at all times</li>
      <li>Report any damage to devices or cable routes immediately</li>
    </ul>
  </div>`;

  // Section 13: Fire Safety Log Book
  body += `<div style="margin-top:24px;"><h2 class="section-title">Section 13 — Fire Safety Log Book</h2>
    <p style="margin-bottom:12px;">A fire safety log book should be maintained in accordance with BS 5839-1:2025. The log book should be kept adjacent to the main control panel and should record:</p>
    <ul style="padding-left:16px;font-size:9pt;margin-bottom:16px;">
      <li>All routine testing carried out by the responsible person</li>
      <li>All faults and the action taken to rectify them</li>
      <li>All false alarms and the identified cause</li>
      <li>All service visits and findings</li>
      <li>Any modifications or additions to the system</li>
      <li>Changes in the responsible person or competent persons</li>
    </ul>`;
  if (jobData.logBook.competentPersons.length > 0) {
    body += `<h3 class="sub-title">Competent Persons</h3><table class="tbl"><thead><tr><th class="th">Name</th><th class="th">Department</th><th class="th">Telephone</th></tr></thead><tbody>`;
    jobData.logBook.competentPersons.forEach(p => { body += `<tr><td class="td">${p.name}</td><td class="td">${p.dept}</td><td class="td">${p.tel}</td></tr>`; });
    body += `</tbody></table>`;
  }
  body += `<h3 class="sub-title">Emergency Contacts</h3><table class="tbl"><tbody>
    <tr><td class="td-label">Fire Alarm Maintenance</td><td class="td">${jobData.logBook.emergencyContacts.fireAlarmMaintenance || 'Core Fire Protection — 0141 433 1934'}</td></tr>
    <tr><td class="td-label">Emergency Lighting</td><td class="td">${jobData.logBook.emergencyContacts.emergencyLighting || '—'}</td></tr>
    <tr><td class="td-label">Building Maintenance</td><td class="td">${jobData.logBook.emergencyContacts.buildingMaintenance || '—'}</td></tr>
  </tbody></table>
  <h3 class="sub-title">Weekly Test Record Template</h3>
  <table class="tbl"><thead><tr><th class="th">Date</th><th class="th">Device Tested</th><th class="th">Zone</th><th class="th" style="text-align:center;">Pass</th><th class="th">Tested By</th><th class="th">Notes</th></tr></thead><tbody>`;
  for (let i = 0; i < 5; i++) {
    body += `<tr><td class="td" style="height:24px;"></td><td class="td"></td><td class="td"></td><td class="td"></td><td class="td"></td><td class="td"></td></tr>`;
  }
  body += `</tbody></table></div>`;

  // Close main body div
  body += `</div>`;

  // APPENDICES
  if (spec) body += buildSpecSection(spec);
  body += buildDrawingRegister(drawings, urlMap);
  body += buildCertificatesAppendix(jobData);
  body += buildDatasheetsAppendix(jobData);

  // Footer
  body += `<div style="border-top:2px solid #0d0d0d;padding:12px 32px;margin-top:24px;font-size:8pt;color:#666;display:flex;justify-content:space-between;">
    <span>Core Fire Protection © ${new Date().getFullYear()}</span>
    <span>${jobData.jobReference || 'Draft'} — Complete Operating Manual</span>
  </div>`;

  return body;
}

/** Wrap body in a full HTML document. */
function wrapHtml(body: string, title: string): string {
  return `<!DOCTYPE html><html lang="en"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${MANUAL_CSS}</style>
  </head><body>${body}</body></html>`;
}

// ── Public exports ──

/** Download the complete manual as a PDF file directly. */
export async function exportOperatingManual(
  projectId: string,
  jobData: JobData,
  drawings: ProjectDrawing[]
): Promise<void> {
  const spec = loadSpec(projectId);
  const urlMap = await getDrawingUrls(drawings);
  const body = await buildManualBody(projectId, jobData, drawings, urlMap, spec);

  const safeName = (jobData.siteName || jobData.jobReference || 'Operating-Manual')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  // Build an off-screen container with styles + content
  const wrapper = document.createElement('div');
  const styleEl = document.createElement('style');
  styleEl.textContent = MANUAL_CSS;
  wrapper.appendChild(styleEl);
  const content = document.createElement('div');
  content.innerHTML = body;
  wrapper.appendChild(content);

  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  document.body.appendChild(wrapper);

  const html2pdf = (await import('html2pdf.js')).default;
  await html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: `${safeName}_Operating_Manual.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
    })
    .from(wrapper)
    .save();

  document.body.removeChild(wrapper);
}

/** Download the complete operating manual as a standalone .html file. */
export async function downloadOperatingManualHTML(
  projectId: string,
  jobData: JobData,
  drawings: ProjectDrawing[]
): Promise<void> {
  const spec = loadSpec(projectId);
  const urlMap = await getDrawingUrls(drawings);
  const body = await buildManualBody(projectId, jobData, drawings, urlMap, spec);
  const title = `Operating Manual - ${jobData.siteName || 'Draft'}`;
  const fullHtml = wrapHtml(body, title);

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (jobData.siteName || jobData.jobReference || 'Operating-Manual')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${safeName}_Operating_Manual.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
