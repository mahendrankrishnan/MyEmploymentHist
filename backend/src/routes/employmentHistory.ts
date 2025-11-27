import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { employmentHistory } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function employmentHistoryRoutes(fastify: FastifyInstance) {
  // Get all employment history
  fastify.get('/api/employment-history', async (request, reply) => {
    try {
      const histories = await db.select().from(employmentHistory).orderBy(desc(employmentHistory.from));
      return reply.send(histories);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch employment history' });
    }
  });

  // Get single employment history by ID
  fastify.get('/api/employment-history/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const history = await db
        .select()
        .from(employmentHistory)
        .where(eq(employmentHistory.id, parseInt(id)))
        .limit(1);

      if (history.length === 0) {
        return reply.status(404).send({ error: 'Employment history not found' });
      }

      return reply.send(history[0]);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch employment history' });
    }
  });

  // Create new employment history
  fastify.post('/api/employment-history', async (request, reply) => {
    try {
      const body = request.body as {
        employer: string;
        from: string;
        to?: string;
        desc?: string;
        client?: string;
        position: string;
        till?: boolean;
      };

      if (!body.employer || !body.from || !body.position) {
        return reply.status(400).send({ error: 'Missing required fields: employer, from, position' });
      }

      const [newHistory] = await db
        .insert(employmentHistory)
        .values({
          employer: body.employer,
          from: body.from,
          to: body.to || null,
          desc: body.desc || null,
          client: body.client || null,
          position: body.position,
          till: body.till || false,
        })
        .returning();

      return reply.status(201).send(newHistory);
    } catch (error) {
      console.error('Error creating employment history:', error);
      return reply.status(500).send({ error: 'Failed to create employment history' });
    }
  });

  // Update employment history
  fastify.put('/api/employment-history/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as {
        employer?: string;
        from?: string;
        to?: string;
        desc?: string;
        client?: string;
        position?: string;
        till?: boolean;
      };

      const [updatedHistory] = await db
        .update(employmentHistory)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(employmentHistory.id, parseInt(id)))
        .returning();

      if (!updatedHistory) {
        return reply.status(404).send({ error: 'Employment history not found' });
      }

      return reply.send(updatedHistory);
    } catch (error) {
      console.error('Error updating employment history:', error);
      return reply.status(500).send({ error: 'Failed to update employment history' });
    }
  });

  // Delete employment history
  fastify.delete('/api/employment-history/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const [deletedHistory] = await db
        .delete(employmentHistory)
        .where(eq(employmentHistory.id, parseInt(id)))
        .returning();

      if (!deletedHistory) {
        return reply.status(404).send({ error: 'Employment history not found' });
      }

      return reply.send({ message: 'Employment history deleted successfully' });
    } catch (error) {
      console.error('Error deleting employment history:', error);
      return reply.status(500).send({ error: 'Failed to delete employment history' });
    }
  });
}

