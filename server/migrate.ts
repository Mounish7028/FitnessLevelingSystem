import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database migration script
async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Starting database migration...');
  
  // Create Neon SQL client
  const sql = neon(databaseUrl);
  // Create Drizzle instance
  const db = drizzle(sql);

  // Run migrations
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the migration script
runMigration();