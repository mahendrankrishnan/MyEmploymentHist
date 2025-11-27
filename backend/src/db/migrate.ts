import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5435/employment_history',
});

const db = drizzle(pool);

async function main() {
  console.log('Running migrations...');
  
  // Check if migrations directory exists and has content
  const migrationsPath = path.join(process.cwd(), 'drizzle');
  const metaPath = path.join(migrationsPath, 'meta', '_journal.json');
  
  if (!fs.existsSync(metaPath)) {
    console.log('No migrations found. Skipping migration step.');
    console.log('To generate migrations, run: npm run db:generate');
    await pool.end();
    return;
  }

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed!');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't exit on migration error - allow app to start
    console.log('Continuing despite migration error...');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration script error:', err);
  // Exit with 0 to allow container to continue
  process.exit(0);
});

