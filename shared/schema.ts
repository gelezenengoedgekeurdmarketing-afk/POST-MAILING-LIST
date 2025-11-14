import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  streetName: text("street_name").notNull(),
  zipcode: text("zipcode").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(''),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  comment: text("comment").default(''),
  isActive: boolean("is_active").default(true),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
