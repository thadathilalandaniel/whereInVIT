import { Router } from 'express';
import healthRoutes from './health.routes';
import venueRoutes from './venue.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/venues', venueRoutes);
router.use('/categories', categoryRoutes);

export default router;
