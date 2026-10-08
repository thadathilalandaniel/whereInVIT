import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      if (parsedLimit > 50) {
        return res.status(400).json({ error: 'Limit cannot exceed 50' });
      }

      const result = await NotificationService.getUserNotifications(userId, parsedPage, parsedLimit);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const result = await NotificationService.getUnreadNotificationCount(userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread notification count' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const notificationId = req.params.notificationId as string;

      const result = await NotificationService.markNotificationAsRead(userId, notificationId);
      res.json(result);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      if (error.message === 'Notification not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      await NotificationService.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }
}
