import { prisma } from '../utils/prisma';
import { ClaimStatus } from '@prisma/client';
import { NotificationService } from './notification.service';

export class ConversationService {
  /**
   * Ensure user is authorized to access the conversation (must be finder or approved claimant)
   */
  static async verifyConversationAccess(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        item: true,
        claim: true
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.claim.status !== ClaimStatus.APPROVED) {
      throw new Error('Claim is not approved, messaging is disabled');
    }

    const isFinder = conversation.item.reporterId === userId;
    const isClaimant = conversation.claim.claimantId === userId;

    if (!isFinder && !isClaimant) {
      throw new Error('Unauthorized');
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        claim: { status: ClaimStatus.APPROVED },
        OR: [
          { item: { reporterId: userId } },
          { claim: { claimantId: userId } }
        ]
      },
      include: {
        item: {
          select: { title: true, reporterId: true, imageUrl: true }
        },
        claim: {
          select: {
            claimantId: true,
            claimant: {
              select: { id: true, name: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Get single conversation details
   */
  static async getConversation(conversationId: string, userId: string) {
    await this.verifyConversationAccess(conversationId, userId);

    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            reporterId: true,
            reporter: { select: { id: true, name: true } },
            imageUrl: true
          }
        },
        claim: {
          select: {
            claimantId: true,
            claimant: { select: { id: true, name: true } }
          }
        }
      }
    });
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, userId: string) {
    await this.verifyConversationAccess(conversationId, userId);

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        message: true,
        createdAt: true,
        readAt: true,
        sender: {
          select: { id: true, name: true }
        }
      }
    });
  }

  /**
   * Send a message
   */
  static async sendMessage(conversationId: string, senderId: string, text: string) {
    await this.verifyConversationAccess(conversationId, senderId);

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length === 0) {
      throw new Error('Message cannot be empty');
    }

    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          message: trimmedText
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          message: true,
          createdAt: true,
          readAt: true,
          sender: { select: { id: true, name: true } }
        }
      });

      // Update conversation updatedAt
      const updatedConv = await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        include: { item: true, claim: true }
      });

      const recipientId = updatedConv.item.reporterId === senderId ? updatedConv.claim.claimantId : updatedConv.item.reporterId;

      await NotificationService.createNotification({
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You received a new message about '${updatedConv.item.title}'.`
      }, tx);

      return message;
    });
  }

  /**
   * Mark unread messages from the other user as read
   */
  static async markMessagesAsRead(conversationId: string, userId: string) {
    await this.verifyConversationAccess(conversationId, userId);

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId }, // messages sent by the OTHER person
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return { success: true };
  }
}
