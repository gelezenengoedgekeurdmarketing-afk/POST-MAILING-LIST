import { type Business, type InsertBusiness } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllBusinesses(): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: string): Promise<boolean>;
  createBusinesses(businessList: InsertBusiness[]): Promise<Business[]>;
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
    const id = randomUUID();
    const newBusiness: Business = {
      id,
      name: business.name,
      streetName: business.streetName,
      zipcode: business.zipcode,
      city: business.city,
      country: business.country,
      email: business.email,
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
    
    // Only update fields that are explicitly provided (not undefined)
    const updated: Business = {
      ...existing,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.streetName !== undefined && { streetName: updates.streetName }),
      ...(updates.zipcode !== undefined && { zipcode: updates.zipcode }),
      ...(updates.city !== undefined && { city: updates.city }),
      ...(updates.country !== undefined && { country: updates.country }),
      ...(updates.email !== undefined && { email: updates.email }),
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
}

export const storage = new MemStorage();
