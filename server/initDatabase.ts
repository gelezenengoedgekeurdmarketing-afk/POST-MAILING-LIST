import { pool } from "./db";

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Create sessions table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);

    // Create users table for authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        street_name TEXT NOT NULL,
        zipcode TEXT NOT NULL,
        city TEXT NOT NULL,
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        comment TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true
      );
    `);

    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}
