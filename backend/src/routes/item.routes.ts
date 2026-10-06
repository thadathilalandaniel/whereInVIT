import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes for viewing items
router.get('/', ItemController.getItems);
router.get('/:id', ItemController.getItem);

// Protected routes for managing items
router.post('/', requireAuth, ItemController.createItem);
router.patch('/:id', requireAuth, ItemController.updateItem);
router.delete('/:id', requireAuth, ItemController.deleteItem);

export default router;
