import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';

export class ConversationController {
  
  static async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const conversations = await ConversationService.getUserConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  static async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const conversation = await ConversationService.getConversation(id as string, userId);
      res.json(conversation);
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized' || error.message.includes('messaging is disabled')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const messages = await ConversationService.getMessages(id as string, userId);
      res.json(messages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized' || error.message.includes('messaging is disabled')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async sendMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { message } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const newMessage = await ConversationService.sendMessage(id as string, userId, message);
      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized' || error.message.includes('messaging is disabled')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Message cannot be empty') return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const result = await ConversationService.markMessagesAsRead(id as string, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized' || error.message.includes('messaging is disabled')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }

}
