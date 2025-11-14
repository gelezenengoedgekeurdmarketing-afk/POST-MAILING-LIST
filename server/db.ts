import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only initialize pool if DATABASE_URL is available
// If not available, app will fall back to in-memory storage
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - database features will be unavailable");
}

export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null as any; // Will not be used if DATABASE_URL is not set

// Add error handler to prevent unhandled pool errors
if (pool) {
  pool.on('error', (_err: any) => {
    // Silently ignore pool errors - they will be handled by the actual query attempts
    // This prevents unhandled error events from crashing the app
  });
}

export const db = process.env.DATABASE_URL 
  ? drizzle({ client: pool, schema })
  : null as any; // Will not be used if DATABASE_URL is not set
