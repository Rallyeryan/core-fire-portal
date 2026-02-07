import { ENV } from "./_core/env";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email using Manus built-in email API
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          contentType: att.contentType || 'application/octet-stream',
          encoding: 'base64',
        })),
      }),
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Generate client confirmation email HTML
 */
export function generateClientEmail(data: {
  clientName: string;
  contractReference: string;
  startDate: string;
  total: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d4d4d 0%, #1a7a7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .highlight { background: #e0f2f1; padding: 15px; border-left: 4px solid #14b8a6; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Agreement Confirmed</h1>
      <p>Core Fire Protection Ltd</p>
    </div>
    <div class="content">
      <p>Dear ${data.clientName},</p>
      
      <p>Thank you for choosing Core Fire Protection Ltd. Your service agreement has been successfully submitted and confirmed.</p>
      
      <div class="highlight">
        <strong>Contract Reference:</strong> ${data.contractReference}<br>
        <strong>Start Date:</strong> ${data.startDate}<br>
        <strong>Annual Value:</strong> £${data.total}
      </div>
      
      <p>Your signed agreement is attached to this email for your records. We will contact you shortly to schedule your first service visit.</p>
      
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your agreement within 1 business day</li>
        <li>You'll receive a service schedule confirmation</li>
        <li>A dedicated engineer will be assigned to your account</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:info@corefireprotection.co.uk">info@corefireprotection.co.uk</a> or call 0800 123 4567.</p>
      
      <p>Best regards,<br>
      <strong>Core Fire Protection Team</strong></p>
    </div>
    <div class="footer">
      <p>Core Fire Protection Ltd | Professional Fire Safety Solutions<br>
      BS EN 3 Compliant | BS 5306-3:2017 | BAFE Certified</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate company notification email HTML
 */
export function generateCompanyEmail(data: {
  clientName: string;
  contractReference: string;
  email: string;
  telephone: string;
  total: string;
  equipment: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0d4d4d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
    .info-table td:first-child { font-weight: bold; width: 40%; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔔 New Agreement Submitted</h2>
    </div>
    <div class="content">
      <div class="alert">
        <strong>Action Required:</strong> A new service agreement has been submitted and requires review.
      </div>
      
      <table class="info-table">
        <tr>
          <td>Contract Reference</td>
          <td>${data.contractReference}</td>
        </tr>
        <tr>
          <td>Client Name</td>
          <td>${data.clientName}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td>Telephone</td>
          <td>${data.telephone}</td>
        </tr>
        <tr>
          <td>Annual Value</td>
          <td><strong>£${data.total}</strong></td>
        </tr>
        <tr>
          <td>Equipment Count</td>
          <td>${data.equipment}</td>
        </tr>
      </table>
      
      <p>The signed agreement PDF is attached. Please review and process this agreement in the admin dashboard.</p>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Review agreement details and equipment schedule</li>
        <li>Assign engineer and create service schedule</li>
        <li>Contact client to confirm first visit date</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `.trim();
}
