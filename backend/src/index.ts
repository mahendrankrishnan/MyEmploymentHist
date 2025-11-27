import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import { employmentHistoryRoutes } from './routes/employmentHistory';
import { authRoutes } from './routes/auth';

// Load environment variables from .env file if it exists
// In Docker, environment variables from docker-compose.yml will override .env file
dotenv.config();

// Log environment variables status (for debugging)
console.log('=== Environment Variables Status ===');
console.log('LOGIN_USERNAME:', process.env.LOGIN_USERNAME || 'NOT SET (will use default: admin)');
console.log('LOGIN_PASSWORD:', process.env.LOGIN_PASSWORD ? 'SET' : 'NOT SET (will use default: admin123)');
console.log('LOGIN_PHONE:', process.env.LOGIN_PHONE || 'NOT SET (will use default: 1234567890)');
console.log('=====================================');

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Register routes
    await fastify.register(authRoutes);
    await fastify.register(employmentHistoryRoutes);

    // Start server
    const port = parseInt(process.env.PORT || '5005');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

