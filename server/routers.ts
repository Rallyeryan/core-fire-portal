import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createAgreement, createEquipment, getAllAgreements, getAgreementById, getEquipmentByAgreementId, searchAgreements, saveDraft, getDraftByToken, updateAgreementEmailStatus, updateAgreementPdfUrl } from "./db";
import { sendEmail, generateClientEmail, generateCompanyEmail } from "./emailService";
import { generateAgreementPDFBuffer } from "./pdfGeneratorEmail";
import { downloadPDFProcedure } from "./pdfProcedure";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { getAssistantResponse, getFieldGuidance, type AssistantMessage, type FormContext } from "./formAssistant";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agreements: router({
    submit: publicProcedure
      .input(z.object({
        clientName: z.string(),
        companyRegistrationNo: z.string().optional(),
        siteAddress: z.string(),
        city: z.string(),
        postcode: z.string(),
        contactName: z.string(),
        position: z.string(),
        telephone: z.string(),
        email: z.string().email(),
        startDate: z.date(),
        endDate: z.date(),
        contractDuration: z.string(),
        serviceFrequency: z.string(),
        paymentTerms: z.string(),
        billingCycle: z.string(),
        accessRequirements: z.string(),
        servicesIncluded: z.string(),
        specialRequirements: z.string(),
        immediateRectification: z.boolean(),
        onSiteAuthorization: z.boolean(),
        defectQuotation: z.boolean(),
        serviceFee: z.number(),
        maintenanceFee: z.number(),
        additionalFee: z.number(),
        subtotal: z.number(),
        vat: z.number(),
        total: z.number(),
        paymentSchedule: z.string(),
        equipment: z.array(z.object({
          id: z.string(),
          quantity: z.number(),
          type: z.string(),
        })),
        clientSignature: z.string(),
        clientPrintName: z.string(),
        companySignature: z.string(),
        companyPrintName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Generate contract reference
        const contractReference = `CFP-SYS-${nanoid(8).toUpperCase()}`;

        // Upload signatures to S3
        const clientSignatureBuffer = Buffer.from(input.clientSignature.split(',')[1], 'base64');
        const companySignatureBuffer = Buffer.from(input.companySignature.split(',')[1], 'base64');

        const clientSignatureKey = `signatures/${contractReference}-client-${nanoid(6)}.png`;
        const companySignatureKey = `signatures/${contractReference}-company-${nanoid(6)}.png`;

        const clientSignatureResult = await storagePut(clientSignatureKey, clientSignatureBuffer, 'image/png');
        const companySignatureResult = await storagePut(companySignatureKey, companySignatureBuffer, 'image/png');

        // Create agreement
        const agreementId = await createAgreement({
          contractReference,
          clientName: input.clientName,
          companyRegistrationNo: input.companyRegistrationNo || undefined,
          siteAddress: input.siteAddress,
          city: input.city,
          postcode: input.postcode,
          contactName: input.contactName,
          position: input.position || undefined,
          telephone: input.telephone,
          email: input.email,
          startDate: input.startDate,
          endDate: input.endDate,
          contractDuration: input.contractDuration,
          serviceFrequency: input.serviceFrequency,
          paymentTerms: input.paymentTerms,
          billingCycle: input.billingCycle,
          accessRequirements: input.accessRequirements || undefined,
          servicesIncluded: input.servicesIncluded,
          specialRequirements: input.specialRequirements || undefined,
          immediateRectification: input.immediateRectification ? 1 : 0,
          onSiteAuthorization: input.onSiteAuthorization ? 1 : 0,
          defectQuotation: input.defectQuotation ? 1 : 0,
          serviceFee: input.serviceFee.toString(),
          maintenanceFee: input.maintenanceFee.toString(),
          additionalFee: input.additionalFee.toString(),
          subtotal: input.subtotal.toString(),
          vat: input.vat.toString(),
          total: input.total.toString(),
          paymentSchedule: input.paymentSchedule,
          clientSignatureUrl: clientSignatureResult.url,
          clientPrintName: input.clientPrintName,
          clientSignedAt: new Date(),
          companySignatureUrl: companySignatureResult.url,
          companyPrintName: input.companyPrintName,
          companySignedAt: new Date(),
          termsAccepted: 1,
          status: "active",
        });

        // Create equipment records
        for (const item of input.equipment) {
          await createEquipment({
            agreementId: Number(agreementId),
            quantity: item.quantity,
            type: item.type,
          });
        }

        return {
          success: true,
          contractReference,
          agreementId,
        };
      }),

    list: protectedProcedure.query(async () => {
      return await getAllAgreements();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const agreement = await getAgreementById(input.id);
        if (!agreement) {
          throw new Error("Agreement not found");
        }
        const equipmentList = await getEquipmentByAgreementId(input.id);
        return {
          agreement,
          equipment: equipmentList,
        };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchAgreements(input.query);
      }),

    downloadPDF: downloadPDFProcedure,

    saveDraft: publicProcedure
      .input(z.object({
        draftToken: z.string(),
        clientName: z.string().optional(),
        siteAddress: z.string().optional(),
        city: z.string().optional(),
        postcode: z.string().optional(),
        contactName: z.string().optional(),
        position: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().optional(),
        startDate: z.date().optional(),
        contractDuration: z.string().optional(),
        serviceFrequency: z.string().optional(),
        paymentTerms: z.string().optional(),
        billingCycle: z.string().optional(),
        equipmentData: z.string().optional(), // JSON string of equipment
      }))
      .mutation(async ({ input }) => {
        const draftId = await saveDraft({
          draftToken: input.draftToken,
          clientName: input.clientName || '',
          siteAddress: input.siteAddress || '',
          city: input.city || '',
          postcode: input.postcode || '',
          contactName: input.contactName || '',
          position: input.position,
          telephone: input.telephone || '',
          email: input.email || '',
          startDate: input.startDate || new Date(),
          endDate: input.startDate || new Date(),
          contractDuration: input.contractDuration || '',
          serviceFrequency: input.serviceFrequency || '',
          paymentTerms: input.paymentTerms || '',
          billingCycle: input.billingCycle || '',
          accessRequirements: '',
          servicesIncluded: '',
          serviceFee: '0',
          maintenanceFee: '0',
          subtotal: '0',
          vat: '0',
          total: '0',
          paymentSchedule: '',
          clientSignatureUrl: '',
          clientPrintName: '',
          clientSignedAt: new Date(),
          companySignatureUrl: '',
          companyPrintName: '',
          companySignedAt: new Date(),
          status: "draft",
        });

        return {
          success: true,
          draftId,
          draftUrl: `/agreement?draft=${input.draftToken}`,
        };
      }),

    getDraft: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const draft = await getDraftByToken(input.token);
        if (!draft) {
          throw new Error("Draft not found");
        }
        const equipmentList = await getEquipmentByAgreementId(draft.id);
        return {
          draft,
          equipment: equipmentList,
        };
      }),

    sendEmails: protectedProcedure
      .input(z.object({ agreementId: z.number() }))
      .mutation(async ({ input }) => {
        const agreement = await getAgreementById(input.agreementId);
        if (!agreement) {
          throw new Error("Agreement not found");
        }

        const equipmentList = await getEquipmentByAgreementId(input.agreementId);

        // Generate PDF
        const pdfBuffer = await generateAgreementPDFBuffer(agreement, equipmentList);

        // Send client email
        const clientEmailSent = await sendEmail({
          to: agreement.email,
          subject: `Service Agreement Confirmed - ${agreement.contractReference}`,
          html: generateClientEmail({
            clientName: agreement.clientName,
            contractReference: agreement.contractReference,
            startDate: agreement.startDate.toISOString().split('T')[0],
            total: parseFloat(agreement.total as string).toFixed(2),
          }),
          attachments: [{
            filename: `Agreement-${agreement.contractReference}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }],
        });

        // Send company email
        const companyEmailSent = await sendEmail({
          to: 'info@corefireprotection.co.uk',
          subject: `New Agreement Submitted - ${agreement.contractReference}`,
          html: generateCompanyEmail({
            clientName: agreement.clientName,
            contractReference: agreement.contractReference,
            email: agreement.email,
            telephone: agreement.telephone,
            total: parseFloat(agreement.total as string).toFixed(2),
            equipment: `${equipmentList.length} items`,
          }),
          attachments: [{
            filename: `Agreement-${agreement.contractReference}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }],
        });

        if (clientEmailSent && companyEmailSent) {
          await updateAgreementEmailStatus(input.agreementId, `${agreement.email}, info@corefireprotection.co.uk`);
        }

        return {
          success: clientEmailSent && companyEmailSent,
          clientEmailSent,
          companyEmailSent,
        };
      }),
  }),

  assistant: router({
    chat: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })),
        context: z.object({
          currentSection: z.string().optional(),
          completedFields: z.array(z.string()).optional(),
          formData: z.record(z.string(), z.any()).optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await getAssistantResponse(
          input.messages as AssistantMessage[],
          input.context as FormContext
        );
        return { message: response };
      }),

    getFieldHelp: publicProcedure
      .input(z.object({ fieldName: z.string() }))
      .query(({ input }) => {
        return { guidance: getFieldGuidance(input.fieldName) };
      }),
  }),
});

export type AppRouter = typeof appRouter;
