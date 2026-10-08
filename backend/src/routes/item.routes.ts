import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { ClaimController } from '../controllers/claim.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadItemImage } from '../middleware/upload.middleware';

const router = Router();

// Public routes for viewing items
// Public routes for viewing items
router.get('/', ItemController.getItems);
router.get('/:id', ItemController.getItem);

// Protected routes for managing items
router.post('/', requireAuth, uploadItemImage.single('image'), ItemController.createItem);
router.patch('/:id', requireAuth, uploadItemImage.single('image'), ItemController.updateItem);
router.delete('/:id', requireAuth, ItemController.deleteItem);

// Item specific claim routes
router.post('/:itemId/verification-challenge', requireAuth, ClaimController.setVerificationChallenge);
router.get('/:itemId/verification-challenge', ClaimController.getVerificationChallenge);
router.post('/:itemId/claims', requireAuth, ClaimController.submitClaim);
router.get('/:itemId/claims', requireAuth, ClaimController.getClaimsForItem);
router.get('/:itemId/my-claim', requireAuth, ClaimController.getMyClaim);

// Item resolution
import { HandoffController } from '../controllers/handoff.controller';
router.patch('/:id/resolve', requireAuth, HandoffController.resolveItem);

// Report item
router.post('/:id/report', requireAuth, ItemController.reportItem);

export default router;
