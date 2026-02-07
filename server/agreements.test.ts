import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("agreements.submit", () => {
  it("should validate required fields", async () => {
    const ctx = createTestContext();
    ctx.user = null; // Public procedure
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.agreements.submit({
        clientName: "",
        companyRegistrationNo: "12345678",
        siteAddress: "123 Test St",
        city: "Glasgow",
        postcode: "G51 2RL",
        contactName: "John Doe",
        position: "Manager",
        telephone: "0141 433 1934",
        email: "invalid-email",
        startDate: new Date(),
        endDate: new Date(),
        contractDuration: "12",
        serviceFrequency: "annual",
        paymentTerms: "30",
        billingCycle: "annually",
        accessRequirements: "open",
        servicesIncluded: "Testing",
        specialRequirements: "",
        serviceFee: 100,
        maintenanceFee: 50,
        additionalFee: 0,
        subtotal: 150,
        vat: 30,
        total: 180,
        paymentSchedule: "full",
        equipment: [
          {
            id: "1",
            quantity: 1,
            type: "CO2",
          },
        ],
        clientSignature: "data:image/png;base64,test",
        clientPrintName: "John Doe",
        companySignature: "data:image/png;base64,test",
        companyPrintName: "Core Fire Rep",
      })
    ).rejects.toThrow();
  });
});

describe("agreements.list", () => {
  it("should require authentication", async () => {
    const ctx = createTestContext();
    ctx.user = null;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.agreements.list()).rejects.toThrow();
  });

  it("should return agreements for authenticated users", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agreements.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("agreements.get", () => {
  it("should require authentication", async () => {
    const ctx = createTestContext();
    ctx.user = null;
    const caller = appRouter.createCaller(ctx);

    await expect(caller.agreements.get({ id: 1 })).rejects.toThrow();
  });
});
