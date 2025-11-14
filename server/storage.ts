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

// Using MemStorage until database is enabled
// To use DatabaseStorage, enable the database endpoint in Replit workspace
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

export const storage = new MemStorage();
