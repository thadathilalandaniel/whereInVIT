import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

const app: Application = express();

// Trust proxy for secure cookies behind Render/Heroku load balancers
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Serve uploads folder for images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
