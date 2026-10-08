import { Router } from 'express';
import healthRoutes from './health.routes';
import venueRoutes from './venue.routes';
import categoryRoutes from './category.routes';
import itemRoutes from './item.routes';
import authRoutes from './auth.routes';
import claimRoutes from './claim.routes';
import handoffRoutes from './handoff.routes';
import conversationRoutes from './conversation.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/health', healthRoutes);
router.use('/venues', venueRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);
router.use('/claims', claimRoutes);
router.use('/handoffs', handoffRoutes);
router.use('/conversations', conversationRoutes);
router.use('/notifications', notificationRoutes);

export default router;
