import { Router } from 'express';
import { HandoffController } from '../controllers/handoff.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Routes mapped to /api/handoffs
router.patch('/:handoffId/confirm', requireAuth, HandoffController.confirmHandoff);
router.patch('/:handoffId/complete', requireAuth, HandoffController.completeHandoff);
router.patch('/:handoffId/cancel', requireAuth, HandoffController.cancelHandoff);

export default router;
