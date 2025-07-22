import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon SQL client
const sql = neon(databaseUrl);

// Create a Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Export the schema for migrations and type inference
export { schema };