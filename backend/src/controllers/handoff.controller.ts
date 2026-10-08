import { Request, Response } from 'express';
import { HandoffService } from '../services/handoff.service';
import { HandoffCheckpoint } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class HandoffController {
  static async createHandoff(req: Request, res: Response) {
    try {
      const claimId = req.params.claimId as string;
      const { checkpoint, handoffDate, handoffTime } = req.body;
      const userId = req.user.id;

      if (!checkpoint || !Object.values(HandoffCheckpoint).includes(checkpoint)) {
        return res.status(400).json({ error: 'Invalid handoff checkpoint' });
      }

      if (!handoffDate || isNaN(new Date(handoffDate).getTime())) {
        return res.status(400).json({ error: 'Invalid handoff date' });
      }

      if (!handoffTime) {
        return res.status(400).json({ error: 'Handoff time is required' });
      }

      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        include: { item: true },
      });

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      if (claim.claimantId !== userId && claim.item.reporterId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to schedule handoff for this claim' });
      }

      const parsedDate = new Date(handoffDate);
      const handoff = await HandoffService.createHandoff(claimId, checkpoint, parsedDate, handoffTime, userId);

      res.status(201).json(handoff);
    } catch (error: any) {
      console.error('Error creating handoff:', error);
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      if (error.message.includes('An active handoff already exists') || error.message.includes('Handoff can only be created') || error.message.includes('Claim is not approved') || error.message.includes('Item must be CLAIMED')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to create handoff' });
    }
  }

  static async getHandoff(req: Request, res: Response) {
    try {
      const claimId = req.params.claimId as string;
      const userId = req.user.id;

      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        include: { item: true },
      });

      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      if (claim.claimantId !== userId && claim.item.reporterId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to view this handoff' });
      }

      const handoff = await HandoffService.getHandoffByClaimId(claimId);
      
      // We don't throw 404 here, just return null if no handoff exists
      res.json(handoff);
    } catch (error: any) {
      console.error('Error fetching handoff:', error);
      res.status(500).json({ error: 'Failed to fetch handoff' });
    }
  }

  static async confirmHandoff(req: Request, res: Response) {
    try {
      const handoffId = req.params.handoffId as string;
      const userId = req.user.id;

      const handoff = await prisma.handoff.findUnique({
        where: { id: handoffId },
        include: { claim: { include: { item: true } } },
      });

      if (!handoff) {
        return res.status(404).json({ error: 'Handoff not found' });
      }

      if (handoff.claim.claimantId !== userId && handoff.claim.item.reporterId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to confirm this handoff' });
      }

      const updatedHandoff = await HandoffService.confirmHandoff(handoffId);
      res.json(updatedHandoff);
    } catch (error: any) {
      console.error('Error confirming handoff:', error);
      if (error.message === 'Handoff not found') return res.status(404).json({ error: error.message });
      if (error.message.includes('must be PENDING')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to confirm handoff' });
    }
  }

  static async completeHandoff(req: Request, res: Response) {
    try {
      const handoffId = req.params.handoffId as string;
      const userId = req.user.id;

      const handoff = await prisma.handoff.findUnique({
        where: { id: handoffId },
        include: { claim: { include: { item: true } } },
      });

      if (!handoff) {
        return res.status(404).json({ error: 'Handoff not found' });
      }

      if (handoff.claim.claimantId !== userId && handoff.claim.item.reporterId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to complete this handoff' });
      }

      const updatedHandoff = await HandoffService.completeHandoff(handoffId, userId);
      res.json(updatedHandoff);
    } catch (error: any) {
      console.error('Error completing handoff:', error);
      if (error.message === 'Handoff not found') return res.status(404).json({ error: error.message });
      if (error.message.includes('must be CONFIRMED')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to complete handoff' });
    }
  }

  static async cancelHandoff(req: Request, res: Response) {
    try {
      const handoffId = req.params.handoffId as string;
      const userId = req.user.id;

      const handoff = await prisma.handoff.findUnique({
        where: { id: handoffId },
        include: { claim: { include: { item: true } } },
      });

      if (!handoff) {
        return res.status(404).json({ error: 'Handoff not found' });
      }

      if (handoff.claim.claimantId !== userId && handoff.claim.item.reporterId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to cancel this handoff' });
      }

      const updatedHandoff = await HandoffService.cancelHandoff(handoffId);
      res.json(updatedHandoff);
    } catch (error: any) {
      console.error('Error cancelling handoff:', error);
      if (error.message === 'Handoff not found') return res.status(404).json({ error: error.message });
      if (error.message.includes('Cannot cancel')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to cancel handoff' });
    }
  }

  static async resolveItem(req: Request, res: Response) {
    try {
      const itemId = req.params.id as string;
      const userId = req.user.id;

      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // We only allow the reporter to resolve the item, or maybe both? Let's allow either if they are part of the returned process.
      // Usually, only the finder (reporter) resolves a found item after returning it. 
      // But let's check if the user is authorized: reporter of the item or claimant of the approved claim.
      
      const claim = await prisma.claim.findFirst({
        where: { itemId: itemId, status: 'APPROVED' }
      });
      
      const isReporter = item.reporterId === userId;
      const isClaimant = claim && claim.claimantId === userId;
      
      if (!isReporter && !isClaimant) {
        return res.status(403).json({ error: 'Unauthorized to resolve this item' });
      }

      const resolvedItem = await HandoffService.resolveItem(itemId);
      res.json(resolvedItem);
    } catch (error: any) {
      console.error('Error resolving item:', error);
      if (error.message === 'Item not found') return res.status(404).json({ error: error.message });
      if (error.message.includes('must be RETURNED')) return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to resolve item' });
    }
  }
}
