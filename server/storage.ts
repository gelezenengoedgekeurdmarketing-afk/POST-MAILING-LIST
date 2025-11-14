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

export const storage = new DatabaseStorage();
