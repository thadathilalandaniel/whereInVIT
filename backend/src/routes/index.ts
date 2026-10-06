import { Router } from 'express';
import healthRoutes from './health.routes';
import venueRoutes from './venue.routes';
import categoryRoutes from './category.routes';
import itemRoutes from './item.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/health', healthRoutes);
router.use('/venues', venueRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);

export default router;
