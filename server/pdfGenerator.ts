import PDFDocument from 'pdfkit';
import type { Readable } from 'stream';

const LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663328149057/uDFETZFVxbCIzEhV.png';

export interface AgreementData {
  id: number;
  recipientName: string;
  senderName: string;
  companyName: string;
  address: string;
  city: string;
  postcode: string;
  contactName: string;
  contactPosition: string;
  telephone: string;
  email: string;
  tradingName?: string;
  companyRegistrationNo?: string;
  registeredAt?: string;
  registeredAddress?: string;
  contractStartDate: string;
  contractEndDate?: string;
  contractDuration: string;
  rollingContract: boolean;
  serviceFrequency: string;
  paymentTerms: string;
  billingCycle: string;
  equipment: Array<{
    type: string;
    quantity: number;
    location: string;
    unitPrice: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  termsAccepted: boolean;
  clientSignature?: string;
  clientSignedAt?: string;
  providerSignature?: string;
  providerSignedAt?: string;
  createdAt: string;
}

export async function generateAgreementPDF(data: AgreementData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Fetch logo
      let logoBuffer: Buffer | null = null;
      try {
        const logoResponse = await fetch(LOGO_URL);
        if (logoResponse.ok) {
          logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
        }
      } catch (err) {
        console.error('Failed to fetch logo:', err);
      }

      // Add watermark pattern function
      const addWatermarkPattern = () => {
        if (!logoBuffer) return;
        
        doc.save();
        doc.opacity(0.04); // Very light watermark (4% opacity)
        
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const watermarkSize = 80;
        const spacing = 150;
        
        // Create repeating pattern across the page
        for (let y = 0; y < pageHeight; y += spacing) {
          for (let x = 0; x < pageWidth; x += spacing) {
            try {
              doc.image(logoBuffer, x, y, { width: watermarkSize });
            } catch (e) {
              // Skip if image placement fails
            }
          }
        }
        
        doc.restore();
      };

      // Add watermark pattern to first page
      addWatermarkPattern();
      
      // Header with logo
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 45, { width: 150 });
      }
      
      doc.fontSize(20).font('Helvetica-Bold')
        .text('FIRE EQUIPMENT SERVICE AGREEMENT', 220, 60, { align: 'right' });
      
      doc.moveDown(3);

      // Proposal Letter Section
      doc.fontSize(14).font('Helvetica-Bold')
        .text('FIRE EQUIPMENT SERVICE AGREEMENT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(11).font('Helvetica')
        .text(`Dear ${data.recipientName},`, { align: 'left' });
      doc.moveDown(0.5);

      const proposalText = `On behalf of Core Fire Protection, I am pleased to present our service agreement proposal for the planned preventative maintenance of Fire, Security, and Safety systems.

This agreement is proposed between Core Fire Ltd T/A Core Fire Protection ("The Service Provider") and ${data.companyName} ("the Customer") for the service and maintenance of the systems specified within this document.

Our proposal includes scheduled preventative maintenance visits per annum, in line with the recommendations set out in the latest British Standards in accordance to the provided schedule of rates that presents the frequency of visits and associated annual costs.

This agreement provides a structured service framework that outlines expectations and service delivery programs for both parties. It is intended as a working document that may evolve to accommodate changing needs.

The agreement covers a 12-month period from the date of acceptance on a rolling basis. Our estimate assumes unrestricted access to all relevant areas for our engineers, ensuring continuous and uninterrupted work. We will make every effort to coordinate with other suppliers and trades; any delays or disruptions caused by third parties may result in additional charges.

Unless otherwise agreed, all work will be carried out during our standard business hours. Any services required outside these hours, including overtime, weekends, or bank holidays, can be arranged but may be subject to additional costs.

This document and its terms are directly linked to the systems covered under this agreement, incorporating the relevant terms and conditions for the duration of the Service Level Agreement.

Should you require any further information or clarification, please do not hesitate to contact me.`;

      doc.fontSize(10).text(proposalText, { align: 'justify', lineGap: 4 });
      doc.moveDown();

      doc.text('Yours sincerely,');
      doc.moveDown(0.5);
      doc.text(data.senderName);
      doc.fontSize(9).fillColor('#666').text('Core Fire Protection');
      doc.fillColor('#000');

      // New page for agreement details
      doc.addPage();
      addWatermarkPattern();

      // Section 1: Equipment Schedule
      doc.fontSize(16).font('Helvetica-Bold')
        .text('1. Equipment Schedule', { underline: true });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      data.equipment.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.type}`, { continued: false });
        doc.fontSize(9).fillColor('#666');
        doc.text(`   Quantity: ${item.quantity} | Location: ${item.location} | Unit Price: £${item.unitPrice.toFixed(2)}`);
        doc.fillColor('#000').fontSize(10);
        doc.moveDown(0.5);
      });

      doc.moveDown();

      // Section 2: Pricing Summary
      doc.fontSize(16).font('Helvetica-Bold')
        .text('2. Pricing Summary', { underline: true });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      doc.text(`Subtotal: £${data.subtotal.toFixed(2)}`);
      doc.text(`VAT (${data.vatRate}%): £${data.vatAmount.toFixed(2)}`);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Amount: £${data.totalAmount.toFixed(2)}`);
      doc.moveDown();

      // Section 3: Agreement Overview
      doc.addPage();
      addWatermarkPattern();
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#00ff00')
        .text('3. AGREEMENT OVERVIEW', { underline: true });
      doc.fillColor('#000');
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Agreement Parties');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      
      const overviewText = `This following is a proposed mutual agreement between Core Fire Ltd T/A Core Fire Protection ("Core") and ${data.companyName}${data.tradingName ? ` T/A ${data.tradingName}` : ''}.

Full Address: ${data.address}, ${data.city}, ${data.postcode}
${data.companyRegistrationNo ? `Company No.: ${data.companyRegistrationNo}${data.registeredAt ? ` - Registered at ${data.registeredAt}` : ''}` : ''}
${data.registeredAddress ? `Registered Address: ${data.registeredAddress}` : ''}

Contact: ${data.contactName} (${data.contactPosition})
Telephone: ${data.telephone}
Email: ${data.email}

(defined as "The Customer") for the Inspection and Maintenance of Systems listed within this agreement.`;

      doc.text(overviewText, { lineGap: 3 });
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Services Provided');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`The Service Provider will perform maintenance services at ${data.address}, ${data.city} in accordance to the schedule of rates. These services include, but are not limited to, PPM Test & Inspections, System Support and Service and necessary repairs or replacements in accordance to service schedule.`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Duration of Agreement');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      
      const durationText = `The term of this Agreement shall commence is effective for an initial term of ${data.contractDuration} from ${data.contractStartDate}${data.rollingContract ? ' (Rolling Contract - No fixed end date)' : data.contractEndDate ? ` to ${data.contractEndDate}` : ''}. Upon expiration, the Agreement will automatically renew for subsequent 12-month terms. To terminate, either party must provide written notice of cancellation to the other party at least ninety (90) days before the end of the current term. This Agreement may be renewed upon mutual written agreement of the Parties.

Service Frequency: ${data.serviceFrequency}
Payment Terms: ${data.paymentTerms}
Billing Cycle: ${data.billingCycle}`;

      doc.text(durationText, { lineGap: 3 });
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Client Acceptance');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text('I, the Customer accept/s the above Agreement for the provision of the Services at the Sites subject to the following Terms and Conditions: Core Fire Ltd Service and Maintenance Terms and Conditions 2023.');

      // Section 4: Terms & Conditions
      doc.addPage();
      addWatermarkPattern();
      doc.fontSize(16).font('Helvetica-Bold')
        .text('4. Terms & Conditions', { underline: true });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      const termsText = `By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by the Core Fire Ltd Service and Maintenance Terms and Conditions 2023.

Key terms include:
• Service delivery will be conducted during standard business hours unless otherwise arranged
• Payment terms as specified in the agreement overview
• Cancellation policy requires 90 days written notice
• All work complies with current British Standards and regulations
• Additional charges may apply for out-of-hours work or third-party delays

For full terms and conditions, please visit: https://corefire.co.uk/terms

Terms Accepted: ${data.termsAccepted ? 'Yes' : 'No'}`;

      doc.text(termsText, { lineGap: 4 });

      // Section 5: Signatures
      doc.addPage();
      addWatermarkPattern();
      doc.fontSize(16).font('Helvetica-Bold')
        .text('5. Signatures', { underline: true });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      doc.text('Please sign below to confirm your agreement to the terms and conditions');
      doc.moveDown(2);

      // Client Signature
      doc.fontSize(12).font('Helvetica-Bold').text('Client Signature');
      doc.moveDown(0.5);
      if (data.clientSignature) {
        doc.fontSize(10).font('Helvetica');
        doc.text(`Signed by: ${data.companyName}`);
        doc.text(`Date: ${data.clientSignedAt || 'Not signed'}`);
        doc.text(`Signature: ${data.clientSignature}`);
      } else {
        doc.fontSize(10).font('Helvetica').fillColor('#999');
        doc.text('Not yet signed');
        doc.fillColor('#000');
      }
      doc.moveDown(2);

      // Provider Signature
      doc.fontSize(12).font('Helvetica-Bold').text('Service Provider Signature');
      doc.moveDown(0.5);
      if (data.providerSignature) {
        doc.fontSize(10).font('Helvetica');
        doc.text('Signed by: Core Fire Protection');
        doc.text(`Date: ${data.providerSignedAt || 'Not signed'}`);
        doc.text(`Signature: ${data.providerSignature}`);
      } else {
        doc.fontSize(10).font('Helvetica').fillColor('#999');
        doc.text('Not yet signed');
        doc.fillColor('#000');
      }

      // Footer
      doc.fontSize(8).fillColor('#666');
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-GB')} | Agreement ID: ${data.id}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
