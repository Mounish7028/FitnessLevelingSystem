const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../shared/schema');
const dotenv = require('dotenv');

dotenv.config();

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon SQL client
const sql = neon(databaseUrl);

// Create a Drizzle ORM instance
const db = drizzle(sql, { schema });

// Export the schema for migrations and type inference
module.exports = { db, schema, sql };