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

## Authentication Setup (Module 2)
The backend uses Google OAuth identity verification and session cookies.

### 1. Google Cloud Console
- Create an OAuth 2.0 Client ID in Google Cloud Console.
- Set Authorized JavaScript origins to `http://localhost:3000`.
- Only accounts ending in `@vitstudent.ac.in` are permitted.

### 2. Frontend Configuration
The frontend Next.js app needs the Client ID. Create `.env.local` in the project root:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

### 3. Backend Configuration
Update `backend/.env` with:
```env
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
CLIENT_URL="http://localhost:3000"
```

### 4. Running Both
- Backend: `npm run dev` in `backend/`
- Frontend: `npm run dev` in root directory
- Access frontend at `http://localhost:3000` to see the "Continue with Google" login page.

### 5. Testing Authentication
- Start backend: `cd backend && npm run dev`
- Start frontend: `npm run dev` in project root
- Open browser at `http://localhost:3000`
- Click **Continue with Google**
- Login with a valid `@vitstudent.ac.in` email to test success
- Login with a non-VIT email to verify it is rejected

## Security Notes
- **Do not commit `.env` files.**
- Database passwords and secrets should only be configured in local `.env` or production deployment environments.
