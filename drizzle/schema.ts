import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Service agreements table
 */
export const agreements = mysqlTable("agreements", {
  id: int("id").autoincrement().primaryKey(),
  contractReference: varchar("contractReference", { length: 64 }).notNull().unique(),
  
  // Client Information
  clientName: text("clientName").notNull(),
  companyRegistrationNo: varchar("companyRegistrationNo", { length: 100 }),
  siteAddress: text("siteAddress").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  postcode: varchar("postcode", { length: 20 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  telephone: varchar("telephone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  
  // Contract Details
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  contractDuration: varchar("contractDuration", { length: 50 }).notNull(),
  serviceFrequency: varchar("serviceFrequency", { length: 50 }).notNull(),
  paymentTerms: varchar("paymentTerms", { length: 50 }).notNull(),
  billingCycle: varchar("billingCycle", { length: 50 }).notNull(),
  accessRequirements: text("accessRequirements"),
  
  // Services
  servicesIncluded: text("servicesIncluded").notNull(),
  specialRequirements: text("specialRequirements"),
  
  // Remedial Work Authorization
  immediateRectification: int("immediateRectification").default(0).notNull(),
  onSiteAuthorization: int("onSiteAuthorization").default(0).notNull(),
  defectQuotation: int("defectQuotation").default(0).notNull(),
  
  // Pricing
  serviceFee: decimal("serviceFee", { precision: 10, scale: 2 }).notNull(),
  maintenanceFee: decimal("maintenanceFee", { precision: 10, scale: 2 }).notNull(),
  additionalFee: decimal("additionalFee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vat: decimal("vat", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentSchedule: varchar("paymentSchedule", { length: 50 }).notNull(),
  
  // Signatures (S3 URLs)
  clientSignatureUrl: text("clientSignatureUrl").notNull(),
  clientPrintName: varchar("clientPrintName", { length: 255 }).notNull(),
  clientSignedAt: timestamp("clientSignedAt").notNull(),
  companySignatureUrl: text("companySignatureUrl").notNull(),
  companyPrintName: varchar("companyPrintName", { length: 255 }).notNull(),
  companySignedAt: timestamp("companySignedAt").notNull(),
  
  // Terms acceptance
  termsAccepted: int("termsAccepted").notNull().default(1),
  
  // Metadata
  status: mysqlEnum("status", ["draft", "pending", "active", "completed", "cancelled"]).default("active").notNull(),
  draftToken: varchar("draftToken", { length: 64 }).unique(),
  pdfUrl: text("pdfUrl"),
  emailSentAt: timestamp("emailSentAt"),
  emailSentTo: text("emailSentTo"),
  renewalDate: timestamp("renewalDate"),
  reminderSentAt: timestamp("reminderSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  submittedBy: int("submittedBy"),
});

export type Agreement = typeof agreements.$inferSelect;
export type InsertAgreement = typeof agreements.$inferInsert;

/**
 * Equipment items for each agreement
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  agreementId: int("agreementId").notNull(),
  quantity: int("quantity").notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;
