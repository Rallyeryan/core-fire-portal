import { z } from "zod";
import { protectedProcedure } from "./_core/trpc";
import { getAgreementById, getEquipmentByAgreementId } from "./db";
import { generateAgreementPDF } from "./pdfGenerator";
import { storagePut } from "./storage";

export const downloadPDFProcedure = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    const agreement = await getAgreementById(input.id);
    if (!agreement) {
      throw new Error("Agreement not found");
    }
    const equipmentList = await getEquipmentByAgreementId(input.id);

    // Transform database data to PDF format
    const pdfData = {
      id: agreement.id,
      recipientName: agreement.contactName,
      senderName: agreement.companyPrintName || "Core Fire Protection",
      companyName: agreement.clientName,
      address: agreement.siteAddress,
      city: agreement.city,
      postcode: agreement.postcode,
      contactName: agreement.contactName,
      contactPosition: agreement.position || 'N/A',
      telephone: agreement.telephone,
      email: agreement.email,
      companyRegistrationNo: agreement.companyRegistrationNo || undefined,
      contractStartDate: new Date(agreement.startDate).toLocaleDateString('en-GB'),
      contractEndDate: agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('en-GB') : undefined,
      contractDuration: agreement.contractDuration,
      rollingContract: false,
      serviceFrequency: agreement.serviceFrequency,
      paymentTerms: agreement.paymentTerms,
      billingCycle: agreement.billingCycle,
      equipment: equipmentList.map(item => ({
        type: item.type,
        quantity: item.quantity,
        location: agreement.siteAddress,
        unitPrice: 0,
      })),
      subtotal: parseFloat(agreement.subtotal),
      vatRate: 20,
      vatAmount: parseFloat(agreement.vat),
      totalAmount: parseFloat(agreement.total),
      termsAccepted: agreement.termsAccepted === 1,
      clientSignature: agreement.clientPrintName,
      clientSignedAt: agreement.clientSignedAt ? new Date(agreement.clientSignedAt).toLocaleDateString('en-GB') : undefined,
      providerSignature: agreement.companyPrintName,
      providerSignedAt: agreement.companySignedAt ? new Date(agreement.companySignedAt).toLocaleDateString('en-GB') : undefined,
      createdAt: new Date(agreement.createdAt).toLocaleDateString('en-GB'),
    };

    const pdfBuffer = await generateAgreementPDF(pdfData);
    
    // Upload PDF to S3
    const fileName = `agreement-${agreement.contractReference}-${Date.now()}.pdf`;
    const { url } = await storagePut(fileName, pdfBuffer, "application/pdf");

    return {
      success: true,
      url,
    };
  });
