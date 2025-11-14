import { type Business, type InsertBusiness, type User, type UpsertUser, businesses, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Business operations
  getAllBusinesses(): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: string): Promise<boolean>;
  createBusinesses(businessList: InsertBusiness[]): Promise<Business[]>;
  
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Business operations
  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses);
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    const results = await db.select().from(businesses).where(eq(businesses.id, id));
    return results[0];
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const results = await db.insert(businesses).values(business).returning();
    return results[0];
  }

  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    const results = await db
      .update(businesses)
      .set(updates)
      .where(eq(businesses.id, id))
      .returning();
    return results[0];
  }

  async deleteBusiness(id: string): Promise<boolean> {
    const results = await db.delete(businesses).where(eq(businesses.id, id)).returning();
    return results.length > 0;
  }

  async createBusinesses(businessList: InsertBusiness[]): Promise<Business[]> {
    if (businessList.length === 0) return [];
    return await db.insert(businesses).values(businessList).returning();
  }

  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export class MemStorage implements IStorage {
  private businesses: Map<string, Business>;

  constructor() {
    this.businesses = new Map();
  }

  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const { randomUUID } = await import("crypto");
    const id = randomUUID();
    const newBusiness: Business = {
      id,
      name: business.name,
      streetName: business.streetName,
      zipcode: business.zipcode,
      city: business.city,
      email: business.email || '',
      phone: business.phone || '',
      tags: business.tags || [],
      comment: business.comment || '',
      isActive: business.isActive !== undefined ? business.isActive : true,
    };
    this.businesses.set(id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    const existing = this.businesses.get(id);
    if (!existing) return undefined;
    
    const updated: Business = {
      ...existing,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.streetName !== undefined && { streetName: updates.streetName }),
      ...(updates.zipcode !== undefined && { zipcode: updates.zipcode }),
      ...(updates.city !== undefined && { city: updates.city }),
      ...(updates.email !== undefined && { email: updates.email || '' }),
      ...(updates.phone !== undefined && { phone: updates.phone || '' }),
      ...(updates.tags !== undefined && { tags: updates.tags || [] }),
      ...(updates.comment !== undefined && { comment: updates.comment || '' }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
    };
    
    this.businesses.set(id, updated);
    return updated;
  }

  async deleteBusiness(id: string): Promise<boolean> {
    return this.businesses.delete(id);
  }

  async createBusinesses(businessList: InsertBusiness[]): Promise<Business[]> {
    const created: Business[] = [];
    for (const business of businessList) {
      const newBusiness = await this.createBusiness(business);
      created.push(newBusiness);
    }
    return created;
  }

  // User operations (not used with MemStorage)
  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    throw new Error("User storage not available in MemStorage mode");
  }
}

// Runtime storage selection based on database availability
async function createStorage(): Promise<IStorage> {
  // Check if database is available by trying an actual query
  if (process.env.DATABASE_URL) {
    try {
      const { pool } = await import("./db");
      if (!pool) {
        throw new Error("Database pool not initialized");
      }
      const client = await pool.connect();
      try {
        // Try a simple query to verify the database is actually working
        await client.query('SELECT 1');
        console.log("✅ Database available - using DatabaseStorage");
        return new DatabaseStorage();
      } finally {
        client.release();
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('endpoint has been disabled')) {
        databaseDisabled = true; // Mark that endpoint is not enabled yet
        console.warn("⚠️  Database endpoint is disabled - using MemStorage (data will be lost on restart)");
        console.warn("   To enable persistent storage and login features:");
        console.warn("   1. Open the Database tab in your Replit workspace");
        console.warn("   2. Click 'Enable' to activate the database endpoint");
      } else {
        console.warn("⚠️  Database not available - using MemStorage (data will be lost on restart)");
        console.warn("   Error:", errorMsg);
      }
    }
  } else {
    console.warn("⚠️  DATABASE_URL not set - using MemStorage (data will be lost on restart)");
  }
  return new MemStorage();
}

// Track database status
export let databaseIntended = false;  // Was DATABASE_URL set?
export let databaseAvailable = false; // Is database actually working?
export let databaseDisabled = false;  // Was database endpoint explicitly disabled?

// Export a promise that resolves to the storage instance
export const storagePromise = (async () => {
  const storageInstance = await createStorage();
  databaseIntended = !!process.env.DATABASE_URL;
  databaseAvailable = storageInstance.constructor.name === 'DatabaseStorage';
  // databaseDisabled is set by createStorage if it detects "endpoint has been disabled"
  return storageInstance;
})();

// For synchronous access (will throw if used before initialization)
export let storage: IStorage;
storagePromise.then(s => storage = s);
