import { jsPDF } from "jspdf";
import type { Agreement } from "../drizzle/schema";

interface EquipmentItem {
  quantity: number;
  type: string;
}

export async function generateAgreementPDFBuffer(
  agreement: Agreement,
  equipment: EquipmentItem[]
): Promise<Buffer> {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Add watermark pattern to all pages
  const addWatermark = () => {
    const logoUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/yQArWlsWOllKvZBA.png';
    const logoWidth = 50;
    const logoHeight = 25;
    const spacing = 60;
    
    doc.saveGraphicsState();
    doc.setGState({ opacity: 0.03 });
    
    for (let x = 0; x < pageWidth; x += spacing) {
      for (let y = 0; y < pageHeight; y += spacing) {
        doc.addImage(logoUrl, 'PNG', x, y, logoWidth, logoHeight, undefined, 'NONE');
      }
    }
    
    doc.restoreGraphicsState();
  };
  
  addWatermark();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Core Fire Protection Ltd", margin, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Fire Safety Solutions", margin, yPos);
  
  // Contract Reference
  doc.setFontSize(9);
  doc.text(`Contract Reference: ${agreement.contractReference}`, pageWidth - margin - 60, 20, { align: "right" });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Fire & Security Systems Service Agreement", pageWidth / 2, yPos, { align: "center" });
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Systems Maintenance & Inspection Contract", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Services Schedule
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Services Included", margin, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  equipment.forEach((item, index) => {
    if (yPos > 270) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
    doc.text(`${index + 1}. ${item.type || 'N/A'} - Qty: ${item.quantity}`, margin, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Pricing Summary
  if (yPos > 250) {
    doc.addPage();
    addWatermark();
    yPos = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Pricing Summary", margin, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Subtotal: £${parseFloat(agreement.subtotal as string).toFixed(2)}`, margin, yPos);
  yPos += 6;
  doc.text(`VAT (20%): £${parseFloat(agreement.vat as string).toFixed(2)}`, margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Total: £${parseFloat(agreement.total as string).toFixed(2)}`, margin, yPos);
  yPos += 10;

  // Agreement Overview
  if (yPos > 230) {
    doc.addPage();
    addWatermark();
    yPos = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Agreement Overview", margin, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Company/Client Name: ${agreement.clientName}`, margin, yPos);
  yPos += 6;
  doc.text(`Address: ${agreement.siteAddress}, ${agreement.city}, ${agreement.postcode}`, margin, yPos);
  yPos += 6;
  doc.text(`Contact: ${agreement.contactName} (${agreement.position || 'N/A'})`, margin, yPos);
  yPos += 6;
  doc.text(`Email: ${agreement.email} | Phone: ${agreement.telephone}`, margin, yPos);
  yPos += 6;
  doc.text(`Contract Start: ${agreement.startDate.toISOString().split('T')[0]} | Duration: ${agreement.contractDuration}`, margin, yPos);
  yPos += 6;
  doc.text(`Service Frequency: ${agreement.serviceFrequency} | Payment Terms: ${agreement.paymentTerms}`, margin, yPos);
  yPos += 10;

  // Signatures
  if (yPos > 220) {
    doc.addPage();
    addWatermark();
    yPos = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. Signatures", margin, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  yPos += 25;
  doc.text(`Client: ${agreement.clientPrintName}`, margin, yPos);
  yPos += 6;
  doc.text(`Date: ${agreement.clientSignedAt.toISOString().split('T')[0]}`, margin, yPos);
  yPos += 15;

  yPos += 25;
  doc.text(`Company Representative: ${agreement.companyPrintName}`, margin, yPos);
  yPos += 6;
  doc.text(`Date: ${agreement.companySignedAt.toISOString().split('T')[0]}`, margin, yPos);
  yPos += 15;

  // Terms & Conditions
  if (yPos > 200) {
    doc.addPage();
    addWatermark();
    yPos = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("5. Terms & Conditions", margin, yPos);
  yPos += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  const terms = [
    { title: "1. Service Standards", text: "All services will be carried out in accordance with BS 5306-3:2017 (Code of practice for commissioning and maintenance of portable fire extinguishers) and by competent, trained engineers." },
    { title: "2. Access & Scheduling", text: "The Client agrees to provide reasonable access to all equipment during normal working hours. Service visits will be scheduled in advance with a minimum of 5 working days' notice. Emergency call-outs are available at additional cost." },
    { title: "3. Equipment Condition", text: "This agreement covers routine inspection and servicing only. Additional charges may apply for replacement of defective parts, equipment requiring extended service or refurbishment, and any equipment found to be beyond economical repair." },
    { title: "4. Payment Terms", text: "Payment is due as per the selected payment terms. Late payments may incur interest charges at 8% above Bank of England base rate. Core Fire Protection reserves the right to suspend services for accounts overdue by more than 30 days." },
    { title: "5. Liability & Insurance", text: "Core Fire Protection maintains full Public Liability Insurance (£5,000,000) and Professional Indemnity Insurance (£2,000,000). Our liability is limited to the annual contract value except in cases of proven negligence." },
    { title: "6. Contract Duration & Cancellation", text: "This agreement is for the duration specified above. Either party may terminate with 30 days' written notice. Early termination by the Client may result in charges for services already provided plus a cancellation fee of 25% of the remaining contract value." }
  ];

  terms.forEach((term) => {
    if (yPos > 270) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(term.title, margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(term.text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 4) + 3;
  });

  // Compliance Badges
  yPos += 5;
  if (yPos > 260) {
    doc.addPage();
    addWatermark();
    yPos = 20;
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("✓ BAFE SP203-1  ✓ NSI Gold  ✓ BSI Kitemark  ✓ BS 5839-1:2025  ✓ BS EN 12845  ✓ PD 6662", margin, yPos);

  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}
