import app from './app';
import { env } from './config/env';
import { prisma } from './utils/prisma';

const startServer = async () => {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');

    const port = env.PORT;
    app.listen(Number(port), '0.0.0.0', () => {
      console.log(`Server is running on port ${port} in ${env.NODE_ENV} mode`);
    }).on('error', (err) => {
      console.error('Express server error:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
