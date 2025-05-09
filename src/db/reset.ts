import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset } from 'drizzle-seed';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Drizzle instance
  const db = drizzle(pool, { schema });

  console.log('🗑️  Resetting database...');
  
  // Reset all tables
  await reset(db, schema);
  
  console.log('✨ Database reset successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Failed to reset database:', err);
  process.exit(1);
}); 