import { Request, Response } from 'express';
import { ClaimService } from '../services/claim.service';

export class ClaimController {
  static async setVerificationChallenge(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const { itemId } = req.params;
      const { question, answer } = req.body;

      if (!question || question.trim().length < 5 || question.length > 250) {
        return res.status(400).json({ error: 'Question must be between 5 and 250 characters' });
      }
      if (!answer || answer.trim().length < 1 || answer.length > 100) {
        return res.status(400).json({ error: 'Answer must be between 1 and 100 characters' });
      }

      const challenge = await ClaimService.setVerificationChallenge(itemId as string, reporterId, question, answer);
      res.status(201).json({ success: true, data: { question: challenge.question } });
    } catch (error: any) {
      console.error('Error setting verification challenge:', error);
      if (error.message === 'Item not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(400).json({ error: error.message || 'Failed to set verification challenge' });
    }
  }

  static async getVerificationChallenge(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const challenge = await ClaimService.getVerificationChallenge(itemId as string);
      
      if (!challenge) {
        return res.status(404).json({ error: 'Verification challenge not found for this item' });
      }

      res.json({ question: challenge.question });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get verification challenge' });
    }
  }

  static async submitClaim(req: Request, res: Response) {
    try {
      const claimantId = req.user.id;
      const { itemId } = req.params;
      const { answer } = req.body;

      if (!answer || answer.trim().length === 0) {
        return res.status(400).json({ error: 'Answer is required' });
      }

      const claim = await ClaimService.submitClaim(itemId as string, claimantId, answer);
      res.status(201).json({ success: true, data: { id: claim.id, status: claim.status } });
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      res.status(400).json({ error: error.message || 'Failed to submit claim' });
    }
  }

  static async getClaimsForItem(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const { itemId } = req.params;

      const claims = await ClaimService.getClaimsForItem(itemId as string, reporterId);
      res.json(claims);
    } catch (error: any) {
      console.error('Error getting claims:', error);
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(400).json({ error: 'Failed to get claims' });
    }
  }

  static async getMyClaim(req: Request, res: Response) {
    try {
      const claimantId = req.user.id;
      const { itemId } = req.params;

      const claim = await ClaimService.getMyClaim(itemId as string, claimantId);
      if (!claim) {
        return res.status(404).json({ error: 'No claim found' });
      }
      res.json(claim);
    } catch (error: any) {
      console.error('Error getting my claim:', error);
      res.status(400).json({ error: 'Failed to get claim' });
    }
  }

  static async getClaimDetails(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { claimId } = req.params;

      const claim = await ClaimService.getClaimDetails(claimId as string, userId);
      res.json(claim);
    } catch (error: any) {
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(404).json({ error: 'Claim not found' });
    }
  }

  static async approveClaim(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const { claimId } = req.params;

      const claim = await ClaimService.approveClaim(claimId as string, reporterId);
      res.json(claim);
    } catch (error: any) {
      console.error('Error approving claim:', error);
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(400).json({ error: error.message || 'Failed to approve claim' });
    }
  }

  static async rejectClaim(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const { claimId } = req.params;

      const claim = await ClaimService.rejectClaim(claimId as string, reporterId);
      res.json(claim);
    } catch (error: any) {
      console.error('Error rejecting claim:', error);
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(400).json({ error: error.message || 'Failed to reject claim' });
    }
  }

  static async cancelClaim(req: Request, res: Response) {
    try {
      const claimantId = req.user.id;
      const { claimId } = req.params;

      const claim = await ClaimService.cancelClaim(claimId as string, claimantId);
      res.json(claim);
    } catch (error: any) {
      console.error('Error cancelling claim:', error);
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(400).json({ error: error.message || 'Failed to cancel claim' });
    }
  }
}
