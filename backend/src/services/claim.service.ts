import { prisma } from '../utils/prisma';
import { ClaimStatus, ItemStatus, ItemType } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class ClaimService {
  static normalizeAnswer(answer: string): string {
    return answer.trim().toLowerCase();
  }

  static async setVerificationChallenge(
    itemId: string,
    reporterId: string,
    question: string,
    answer: string
  ) {
    // Verify item ownership
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new Error('Item not found');
    }
    if (item.type !== ItemType.FOUND) {
      throw new Error('Only FOUND items can have verification challenges');
    }
    if (item.reporterId !== reporterId) {
      throw new Error('Unauthorized');
    }

    const normalizedAnswer = this.normalizeAnswer(answer);
    const answerHash = await bcrypt.hash(normalizedAnswer, 10);

    return prisma.verificationChallenge.upsert({
      where: { itemId },
      create: {
        itemId,
        question,
        answerHash
      },
      update: {
        question,
        answerHash
      },
      select: {
        id: true,
        itemId: true,
        question: true,
        createdAt: true
      }
    });
  }

  static async getVerificationChallenge(itemId: string) {
    const challenge = await prisma.verificationChallenge.findUnique({
      where: { itemId },
      select: {
        id: true,
        itemId: true,
        question: true,
        createdAt: true
      }
    });
    return challenge;
  }

  static async getClaimsForItem(itemId: string, reporterId: string) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item not found');
    if (item.reporterId !== reporterId) throw new Error('Unauthorized');

    return prisma.claim.findMany({
      where: { itemId },
      include: {
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getMyClaim(itemId: string, claimantId: string) {
    return prisma.claim.findFirst({
      where: {
        itemId,
        claimantId
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async submitClaim(itemId: string, claimantId: string, answer: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { verificationChallenge: true }
    });

    if (!item) throw new Error('Item not found');
    if (item.type !== ItemType.FOUND) throw new Error('Only FOUND items can be claimed');
    if (item.status !== ItemStatus.ACTIVE) throw new Error('Item is no longer claimable');
    if (item.reporterId === claimantId) throw new Error('You cannot claim your own reported item');
    if (!item.verificationChallenge) throw new Error('No verification challenge configured for this item');

    const existingClaim = await prisma.claim.findFirst({
      where: {
        itemId,
        claimantId,
        status: { in: [ClaimStatus.PENDING, ClaimStatus.APPROVED] }
      }
    });

    if (existingClaim) {
      throw new Error('You already have an active claim for this item');
    }

    const normalizedAnswer = this.normalizeAnswer(answer);
    const isMatch = await bcrypt.compare(normalizedAnswer, item.verificationChallenge.answerHash);

    if (!isMatch) {
      throw new Error('Verification answer is incorrect');
    }

    // Hash the answer for storage (optional for audit, but requested by schema)
    const verificationAnswerHash = await bcrypt.hash(normalizedAnswer, 10);

    return prisma.$transaction(async (tx) => {
      const claim = await tx.claim.create({
        data: {
          itemId,
          claimantId,
          verificationAnswerHash,
          status: ClaimStatus.PENDING
        },
        include: {
          item: { select: { title: true } }
        }
      });

      // Update item status to CLAIM_PENDING to indicate there's at least one pending claim?
      // Wait, the prompt states: "The item should remain claimable if appropriate... 
      // Do NOT introduce arbitrary transitions... ACTIVE -> CLAIM_PENDING -> CLAIMED"
      // If there's a pending claim, it's CLAIM_PENDING.
      if (item.status === ItemStatus.ACTIVE) {
        await tx.item.update({
          where: { id: itemId },
          data: { status: ItemStatus.CLAIM_PENDING }
        });
      }

      return claim;
    });
  }

  static async getClaimDetails(claimId: string, userId: string) {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        item: true,
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNumber: true
          }
        }
      }
    });

    if (!claim) throw new Error('Claim not found');
    
    // Only claimant or reporter can view
    if (claim.claimantId !== userId && claim.item.reporterId !== userId) {
      throw new Error('Unauthorized');
    }

    return claim;
  }

  static async approveClaim(claimId: string, reporterId: string) {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({
        where: { id: claimId },
        include: { item: true }
      });

      if (!claim) throw new Error('Claim not found');
      if (claim.item.reporterId !== reporterId) throw new Error('Unauthorized');
      if (claim.status !== ClaimStatus.PENDING) throw new Error('Claim is not pending');
      if (claim.item.status !== ItemStatus.ACTIVE && claim.item.status !== ItemStatus.CLAIM_PENDING) {
        throw new Error('Item is no longer claimable');
      }

      // Check if there is already an approved claim
      const approvedClaim = await tx.claim.findFirst({
        where: { itemId: claim.itemId, status: ClaimStatus.APPROVED }
      });

      if (approvedClaim) {
        throw new Error('Another claim is already approved');
      }

      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: { status: ClaimStatus.APPROVED, reviewedAt: new Date() }
      });

      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: ItemStatus.CLAIMED }
      });

      // Reject all other pending claims automatically
      await tx.claim.updateMany({
        where: {
          itemId: claim.itemId,
          status: ClaimStatus.PENDING,
          id: { not: claimId }
        },
        data: {
          status: ClaimStatus.REJECTED,
          reviewedAt: new Date()
        }
      });

      return updatedClaim;
    });
  }

  static async rejectClaim(claimId: string, reporterId: string) {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({
        where: { id: claimId },
        include: { item: true }
      });

      if (!claim) throw new Error('Claim not found');
      if (claim.item.reporterId !== reporterId) throw new Error('Unauthorized');
      if (claim.status !== ClaimStatus.PENDING) throw new Error('Claim is not pending');

      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: { status: ClaimStatus.REJECTED, reviewedAt: new Date() }
      });

      // If no other pending claims, revert item status back to ACTIVE
      const otherPendingClaims = await tx.claim.count({
        where: {
          itemId: claim.itemId,
          status: ClaimStatus.PENDING
        }
      });

      if (otherPendingClaims === 0 && claim.item.status === ItemStatus.CLAIM_PENDING) {
        await tx.item.update({
          where: { id: claim.itemId },
          data: { status: ItemStatus.ACTIVE }
        });
      }

      return updatedClaim;
    });
  }

  static async cancelClaim(claimId: string, claimantId: string) {
    return prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({
        where: { id: claimId },
        include: { item: true }
      });

      if (!claim) throw new Error('Claim not found');
      if (claim.claimantId !== claimantId) throw new Error('Unauthorized');
      if (claim.status !== ClaimStatus.PENDING) throw new Error('Can only cancel pending claims');

      const updatedClaim = await tx.claim.update({
        where: { id: claimId },
        data: { status: ClaimStatus.CANCELLED }
      });

      // If no other pending claims, revert item status back to ACTIVE
      const otherPendingClaims = await tx.claim.count({
        where: {
          itemId: claim.itemId,
          status: ClaimStatus.PENDING
        }
      });

      if (otherPendingClaims === 0 && claim.item.status === ItemStatus.CLAIM_PENDING) {
        await tx.item.update({
          where: { id: claim.itemId },
          data: { status: ItemStatus.ACTIVE }
        });
      }

      return updatedClaim;
    });
  }
}
