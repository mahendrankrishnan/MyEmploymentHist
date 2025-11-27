# My Employment History

A full-stack application for managing employment history built with Angular (latest version) and Node.js with Fastify, TypeScript, PostgreSQL, and Drizzle ORM.

## Features

- ✅ Secure login with username, password, and phone validation
- ✅ List all employment history records with sorting and filtering
- ✅ Add new employment history
- ✅ Edit existing employment history
- ✅ Delete employment history
- ✅ Track current employment with "Till" boolean field
- ✅ Header and Footer with copyright and contact information

## Tech Stack

### Frontend
- Angular 18
- TypeScript
- Standalone Components
- Reactive Forms

### Backend
- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM

## Architecture Diagram
```mermaid
flowchart LR
    subgraph Frontend [Frontend - Angular App]
        A["Angular 18\nTypeScript\nVite\nAxios"]
    end

    subgraph Backend [Backend - Node.js Server]
        B["Fastify API\nTypeScript"]
        C["Drizzle ORM"]
    end

    subgraph Database [Database Layer]
        D[(PostgreSQL)]
    end

    A -->|HTTP Requests| B
    B -->|ORM Queries| C
    C -->|SQL| D
```
## Project Structure

```
MyEmployeementHist/
├── backend/          # Node.js + Fastify backend
│   ├── src/
│   │   ├── db/      # Database schema and connection
│   │   ├── routes/  # API routes
│   │   └── index.ts # Server entry point
│   └── package.json
├── frontend/         # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   ├── login/
│   │   │   │   ├── employment-history-list/
│   │   │   │   └── employment-history-form/
│   │   │   └── services/
│   │   └── main.ts
│   └── package.json
└── README.md
```


## Database ERD and Schema 
```mermaid
erDiagram
    EMPLOYMENT_HISTORY {
        int id PK
        varchar employer
        date from
        date to
        text desc
        varchar client
        varchar position
        boolean till
        timestamp created_at
        timestamp updated_at
    }
```
The `employment_history` table includes:
- `id` - Primary key
- `employer` - Employer name (required)
- `from` - Start date (required)
- `to` - End date (optional)
- `desc` - Job description (optional)
- `client` - Client name (optional)
- `position` - Job position (required)
- `till` - Boolean flag for current employment
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Deployment Options

### Docker Deployment (Recommended)

The easiest way to run the entire application is using Docker Compose:

**Quick Start:**
```bash
# On Linux/Mac
chmod +x docker-setup.sh
./docker-setup.sh

# On Windows (PowerShell)
.\docker-setup.ps1

# Or manually:
docker-compose up --build
```

**Access the application:**
- Frontend UI: http://localhost:5003
- Backend API: http://localhost:5005

**Environment Variables for Docker:**

To set custom login credentials, create a `.env` file in the project :

```bash

# Edit .env and set your credentials
LOGIN_USERNAME=your_username
LOGIN_PASSWORD=your_password
LOGIN_PHONE=your_phone_number
```

**Important:** The `.env` file must be in the project root (same directory as `docker-compose.yml`) for Docker to read it. After creating/updating `.env`, restart the containers:

```bash
docker-compose down
docker-compose up -d
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)

### Manual Setup

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database and create a `.env` file:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/db_employment_history
PORT=5005

# Login credentials
LOGIN_USERNAME=test
LOGIN_PASSWORD=test
LOGIN_PHONE=1234567890
```

4. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Do Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5005`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:5003`

## Here are the API Endpoints , add if needed additional 

### Authentication
- `POST /api/auth/login` - Login with username, password, and phone
- `GET /api/auth/verify` - Verify authentication token

### Employment History
- `GET /api/employment-history` - Get all employment history records
- `GET /api/employment-history/:id` - Get a single employment history record
- `POST /api/employment-history` - Create a new employment history record
- `PUT /api/employment-history/:id` - Update an employment history record
- `DELETE /api/employment-history/:id` - Delete an employment history record

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:5003` in your browser
3. Login with your credentials (default: admin/admin123/1234567890)
4. View, add, edit, or delete employment history records
5. Use sorting and filtering to find specific records
6. Use the "Till Present" checkbox to mark current employment

## Default Login Credentials

- **Username**: test
- **Password**: test
- **Phone**: 1234567890

**Note**: Change these in your `.env` file or `docker-compose.yml` for production use.

## License

Copyright © 2025 My Employment History. All rights reserved.
