import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5435/employment_history';

// Log the database URL (without password for security)
const dbUrlForLogging = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log('Database connection string:', dbUrlForLogging);

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Connection pool settings for better reliability
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection with retry logic
async function testConnection(retries = 10, delay = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✓ Database connection successful');
      client.release();
      return;
    } catch (error) {
      const attempt = i + 1;
      if (attempt >= retries) {
        console.error(`✗ Database connection failed after ${retries} attempts`);
        throw error;
      }
      console.log(`Database connection attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`);
      console.error('Connection error:', error instanceof Error ? error.message : error);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff with max delay of 10 seconds
      delay = Math.min(delay * 1.5, 10000);
    }
  }
}

// Initialize connection test (non-blocking for module load)
// The connection will be tested when first used, but we can also test it here
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  testConnection().catch((error) => {
    console.error('Failed to establish database connection:', error);
    // Don't exit immediately - let the app try to connect when needed
  });
}

export const db = drizzle(pool, { schema });
export { pool };

