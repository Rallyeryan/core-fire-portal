import { eq, desc, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agreements, equipment, InsertAgreement, InsertEquipment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Agreement functions
export async function createAgreement(agreement: InsertAgreement) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(agreements).values(agreement);
  return result[0].insertId;
}

export async function createEquipment(equipmentItem: InsertEquipment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(equipment).values(equipmentItem);
}

export async function getAllAgreements() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(agreements).orderBy(desc(agreements.createdAt));
}

export async function getAgreementById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(agreements).where(eq(agreements.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEquipmentByAgreementId(agreementId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(equipment).where(eq(equipment.agreementId, agreementId));
}

export async function searchAgreements(query: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(agreements)
    .where(
      or(
        like(agreements.clientName, `%${query}%`),
        like(agreements.contractReference, `%${query}%`),
        like(agreements.email, `%${query}%`)
      )
    )
    .orderBy(desc(agreements.createdAt));
}

// Draft functions
export async function saveDraft(draftData: Partial<InsertAgreement> & { draftToken: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if draft exists
  const existing = await db.select().from(agreements).where(eq(agreements.draftToken, draftData.draftToken)).limit(1);
  
  if (existing.length > 0) {
    // Update existing draft
    await db.update(agreements)
      .set({ ...draftData, updatedAt: new Date() })
      .where(eq(agreements.draftToken, draftData.draftToken));
    return existing[0].id;
  } else {
    // Create new draft
    const result = await db.insert(agreements).values({ ...draftData, status: "draft" } as InsertAgreement);
    return result[0].insertId;
  }
}

export async function getDraftByToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(agreements).where(eq(agreements.draftToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgreementStatus(id: number, status: "draft" | "pending" | "active" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(agreements).set({ status }).where(eq(agreements.id, id));
}

export async function updateAgreementEmailStatus(id: number, emailSentTo: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(agreements)
    .set({ emailSentAt: new Date(), emailSentTo })
    .where(eq(agreements.id, id));
}

export async function updateAgreementPdfUrl(id: number, pdfUrl: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(agreements).set({ pdfUrl }).where(eq(agreements.id, id));
}

// Get agreements needing renewal reminders (within 30 days of renewal date)
export async function getAgreementsNeedingReminder() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const result = await db
    .select()
    .from(agreements)
    .where(eq(agreements.status, "active"))
    .orderBy(desc(agreements.renewalDate));

  // Filter in JavaScript since MySQL date comparison can be complex
  return result.filter(agreement => {
    if (!agreement.renewalDate || agreement.reminderSentAt) return false;
    return agreement.renewalDate <= thirtyDaysFromNow;
  });
}
