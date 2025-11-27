import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint
  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const body = request.body as {
        username: string;
        password: string;
        phone: string;
      };

      if (!body.username || !body.password || !body.phone) {
        return reply.status(400).send({ error: 'Username, password, and phone are required' });
      }

      // Validate against environment variables
      const validUsername = process.env.LOGIN_USERNAME || 'admin';
      const validPassword = process.env.LOGIN_PASSWORD || 'admin';
      const validPhone = process.env.LOGIN_PHONE || '1234567890';

      // Debug logging (remove in production)
      console.log('=== Login Attempt ===');
      console.log('Environment variables from process.env:');
      console.log('  LOGIN_USERNAME:', process.env.LOGIN_USERNAME || 'NOT SET (using default: admin)');
      console.log('  LOGIN_PASSWORD:', process.env.LOGIN_PASSWORD ? '***SET***' : 'NOT SET (using default: admin123)');
      console.log('  LOGIN_PHONE:', process.env.LOGIN_PHONE || 'NOT SET (using default: 1234567890)');
      console.log('Valid credentials (after fallback):');
      console.log('  Username:', validUsername);
      console.log('  Password:', '***');
      console.log('  Phone:', validPhone);
      console.log('Received credentials:');
      console.log('  Username:', body.username);
      console.log('  Password:', '***');
      console.log('  Phone:', body.phone);
      console.log('Validation result:', {
        usernameMatch: body.username === validUsername,
        passwordMatch: body.password === validPassword,
        phoneMatch: body.phone === validPhone
      });

      if (
        body.username === validUsername &&
        body.password === validPassword &&
        body.phone === validPhone
      ) {
        // Generate a simple token (in production, use JWT)
        const token = Buffer.from(`${body.username}:${Date.now()}`).toString('base64');
        
        return reply.send({
          success: true,
          token,
          username: body.username,
          message: 'Login successful'
        });
      } else {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({ error: 'Login failed' });
    }
  });

  // Verify token endpoint
  fastify.get('/api/auth/verify', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      // Simple token validation (in production, use proper JWT validation)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username] = decoded.split(':');

      if (username) {
        return reply.send({ valid: true, username });
      } else {
        return reply.status(401).send({ error: 'Invalid token' });
      }
    } catch (error) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });
}

