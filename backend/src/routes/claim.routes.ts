import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';
import { HandoffController } from '../controllers/handoff.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Routes mapped to /api/claims
router.get('/:claimId', requireAuth, ClaimController.getClaimDetails);
router.patch('/:claimId/approve', requireAuth, ClaimController.approveClaim);
router.patch('/:claimId/reject', requireAuth, ClaimController.rejectClaim);
router.patch('/:claimId/cancel', requireAuth, ClaimController.cancelClaim);

// Handoff routes
router.post('/:claimId/handoff', requireAuth, HandoffController.createHandoff);
router.get('/:claimId/handoff', requireAuth, HandoffController.getHandoff);

export default router;
