# Employment History Backend

Backend API for managing employment history using Fastify, TypeScript, Drizzle ORM, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and update `.env` file with your database connection string:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/employment_history
PORT=5005
```

3. Generate and run migrations:
```bash
npm run db:generate
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5005`

## API Endpoints

- `GET /api/employment-history` - Get all employment history
- `GET /api/employment-history/:id` - Get single employment history
- `POST /api/employment-history` - Create new employment history
- `PUT /api/employment-history/:id` - Update employment history
- `DELETE /api/employment-history/:id` - Delete employment history

