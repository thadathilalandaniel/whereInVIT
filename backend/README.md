# whereInVIT Backend

This is the backend service for the whereInVIT platform (Module 1).

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM

## Project Architecture
- `src/config/`: Environment configuration.
- `src/controllers/`: Request handling and API responses.
- `src/middleware/`: Express middlewares (error handling, 404).
- `src/routes/`: Express route definitions.
- `src/services/`: Business logic and database interactions.
- `src/utils/`: Shared utilities (Prisma client).
- `prisma/schema.prisma`: Database schema definition.
- `prisma/seed.ts`: Script to seed initial static data.

## Getting Started

### 1. Database Setup
Ensure you have PostgreSQL installed and running. Create a new database:
```bash
createdb whereinvit
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp .env.example .env
```
Update `DATABASE_URL` in `.env` with your actual PostgreSQL credentials if they differ from the defaults.

### 3. Install Dependencies
```bash
npm install
```

### 4. Prisma Setup
Generate the Prisma client:
```bash
npm run prisma:generate
```

Run database migrations to apply the schema:
```bash
npm run prisma:migrate
```

Seed the database with initial Categories and Venues:
```bash
npm run prisma:seed
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Available API Endpoints
- `GET /api/health` - Check if the backend is running.
- `GET /api/venues` - List all active venues.
- `GET /api/categories` - List all active categories.

## Security Notes
- **Do not commit `.env` files.**
- Database passwords and secrets should only be configured in local `.env` or production deployment environments.
