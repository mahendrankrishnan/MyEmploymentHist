import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5435/employment_history';

// Log the database URL (without password for security)
const dbUrlForLogging = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log('Migration script - Database connection string:', dbUrlForLogging);

const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);

// Test database connection with retry logic
async function waitForDatabase(retries = 15, delay = 2000): Promise<void> {
  for (let count = 0; count < retries; count++) {
    try {
      const client = await pool.connect();
      console.log('✓ Database connection successful for migrations');
      client.release();
      return;
    } catch (error) {
      const attempt = count + 1;
      if (attempt >= retries) {
        console.error(`✗ Database connection failed after ${retries} attempts`);
        throw new Error(`Cannot connect to database after ${retries} attempts: ${error instanceof Error ? error.message : String(error)}`);
      }
      console.log(`Database connection attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`);
      console.error('Connection error:', error instanceof Error ? error.message : error);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff with max delay of 10 seconds
      delay = Math.min(delay * 1.5, 10000);
    }
  }
}

async function main() {
  console.log('Running migrations...');
  
  // Wait for database to be ready
  await waitForDatabase();
  
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

