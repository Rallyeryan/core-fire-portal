import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
import { createAgreement, createEquipment } from './db';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'test-admin',
    email: 'admin@test.com',
    name: 'Test Admin',
    loginMethod: 'manus',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {} as any,
    res: {} as any,
  };

  return ctx;
}

describe('PDF Generation', () => {
  let testAgreementId: number;

  beforeAll(async () => {
    // Create a test agreement
    const agreementId = await createAgreement({
      contractReference: `TEST-${Date.now()}`,
      clientName: 'Test Company Ltd',
      companyRegistrationNo: '12345678',
      siteAddress: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      contactName: 'John Doe',
      position: 'Manager',
      telephone: '020 1234 5678',
      email: 'john@test.com',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      contractDuration: '12 Months',
      serviceFrequency: 'Annual',
      paymentTerms: 'Net 30 Days',
      billingCycle: 'Annually',
      accessRequirements: 'Standard access',
      servicesIncluded: 'PPM Test & Inspections',
      specialRequirements: 'None',
      immediateRectification: 1,
      onSiteAuthorization: 1,
      defectQuotation: 1,
      serviceFee: '500.00',
      maintenanceFee: '300.00',
      additionalFee: '100.00',
      subtotal: '900.00',
      vat: '180.00',
      total: '1080.00',
      paymentSchedule: 'Annual',
      clientSignatureUrl: 'https://example.com/signature1.png',
      clientPrintName: 'John Doe',
      clientSignedAt: new Date(),
      companySignatureUrl: 'https://example.com/signature2.png',
      companyPrintName: 'Core Fire Protection',
      companySignedAt: new Date(),
      termsAccepted: 1,
      status: 'active',
    });

    testAgreementId = Number(agreementId);

    // Create test equipment
    await createEquipment({
      agreementId: testAgreementId,
      quantity: 5,
      type: 'Fire Extinguisher - CO2',
    });

    await createEquipment({
      agreementId: testAgreementId,
      quantity: 3,
      type: 'Fire Alarm Panel',
    });
  });

  it('should generate PDF for an agreement', async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.agreements.downloadPDF({ id: testAgreementId });

    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
    expect(result.url).toContain('.pdf');
    expect(result.url).toContain('agreement-TEST-');
  });

  it('should fail for non-existent agreement', async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.agreements.downloadPDF({ id: 999999 })
    ).rejects.toThrow('Agreement not found');
  });
});
