import { HandoffStatus, ItemStatus, Prisma, HandoffCheckpoint } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class HandoffService {
  static async createHandoff(claimId: string, checkpoint: HandoffCheckpoint, handoffDate: Date, handoffTime: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: true },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== 'APPROVED') {
      throw new Error('Claim is not approved');
    }

    if (claim.item.type !== 'FOUND') {
      throw new Error('Handoff can only be created for FOUND items');
    }

    if (claim.item.status !== 'CLAIMED') {
      throw new Error('Item must be CLAIMED to schedule a handoff');
    }

    const existingHandoff = await prisma.handoff.findUnique({
      where: { claimId },
    });

    if (existingHandoff) {
      if (existingHandoff.status !== 'CANCELLED') {
        throw new Error('An active handoff already exists for this claim');
      }
    }

    return prisma.$transaction(async (tx) => {
      const handoff = await tx.handoff.upsert({
        where: { claimId },
        update: {
          checkpoint,
          handoffDate,
          handoffTime,
          status: 'PENDING',
        },
        create: {
          claimId,
          checkpoint,
          handoffDate,
          handoffTime,
          status: 'PENDING',
        },
      });

      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: 'HANDOFF_PENDING' },
      });

      return handoff;
    });
  }

  static async getHandoffByClaimId(claimId: string) {
    return prisma.handoff.findUnique({
      where: { claimId },
    });
  }

  static async confirmHandoff(handoffId: string) {
    const handoff = await prisma.handoff.findUnique({
      where: { id: handoffId },
    });

    if (!handoff) {
      throw new Error('Handoff not found');
    }

    if (handoff.status !== 'PENDING') {
      throw new Error('Handoff must be PENDING to confirm');
    }

    return prisma.handoff.update({
      where: { id: handoffId },
      data: { status: 'CONFIRMED' },
    });
  }

  static async completeHandoff(handoffId: string) {
    const handoff = await prisma.handoff.findUnique({
      where: { id: handoffId },
      include: { claim: true },
    });

    if (!handoff) {
      throw new Error('Handoff not found');
    }

    if (handoff.status !== 'CONFIRMED') {
      throw new Error('Handoff must be CONFIRMED to complete');
    }

    return prisma.$transaction(async (tx) => {
      const updatedHandoff = await tx.handoff.update({
        where: { id: handoffId },
        data: { status: 'COMPLETED' },
      });

      await tx.item.update({
        where: { id: handoff.claim.itemId },
        data: { status: 'RETURNED' },
      });

      return updatedHandoff;
    });
  }

  static async cancelHandoff(handoffId: string) {
    const handoff = await prisma.handoff.findUnique({
      where: { id: handoffId },
      include: { claim: true },
    });

    if (!handoff) {
      throw new Error('Handoff not found');
    }

    if (handoff.status === 'COMPLETED' || handoff.status === 'CANCELLED') {
      throw new Error('Cannot cancel a completed or already cancelled handoff');
    }

    return prisma.$transaction(async (tx) => {
      const updatedHandoff = await tx.handoff.update({
        where: { id: handoffId },
        data: { status: 'CANCELLED' },
      });

      await tx.item.update({
        where: { id: handoff.claim.itemId },
        data: { status: 'CLAIMED' },
      });

      return updatedHandoff;
    });
  }

  static async resolveItem(itemId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    if (item.status !== 'RETURNED') {
      throw new Error('Item must be RETURNED to resolve');
    }

    return prisma.item.update({
      where: { id: itemId },
      data: { status: 'RESOLVED' },
    });
  }
}
