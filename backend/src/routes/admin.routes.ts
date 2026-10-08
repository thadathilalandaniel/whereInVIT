import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Apply auth and admin middlewares to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', AdminController.getStats);
router.get('/items', AdminController.getItems);
router.patch('/items/:itemId/moderate', AdminController.moderateItem);
router.get('/reports', AdminController.getReports);
router.patch('/reports/:reportId/review', AdminController.reviewReport);
router.get('/claims', AdminController.getClaims);
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId/role', AdminController.changeUserRole);

export default router;
