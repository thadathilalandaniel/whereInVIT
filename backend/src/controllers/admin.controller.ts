import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ReportStatus } from '@prisma/client';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  }

  static async getItems(req: Request, res: Response) {
    try {
      const { page, limit, status, type } = req.query;
      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      const filter: any = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      const result = await AdminService.getItems(parsedPage, parsedLimit, filter);
      res.json(result);
    } catch (error) {
      console.error('Error fetching admin items:', error);
      res.status(500).json({ error: 'Failed to fetch admin items' });
    }
  }

  static async moderateItem(req: Request, res: Response) {
    try {
      const adminId = req.user.id;
      const itemId = req.params.itemId as string;
      const { action } = req.body;

      if (!['REMOVE', 'RESTORE'].includes(action)) {
        return res.status(400).json({ error: 'Invalid moderation action' });
      }

      const updatedItem = await AdminService.moderateItem(adminId, itemId, action);
      res.json(updatedItem);
    } catch (error: any) {
      console.error('Error moderating item:', error);
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      res.status(400).json({ error: error.message });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const { page, limit, status } = req.query;
      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      const filter: any = {};
      if (status) filter.status = status;

      const result = await AdminService.getReports(parsedPage, parsedLimit, filter);
      res.json(result);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  static async reviewReport(req: Request, res: Response) {
    try {
      const adminId = req.user.id;
      const reportId = req.params.reportId as string;
      const { status } = req.body;

      if (!Object.values(ReportStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid report status' });
      }

      const updatedReport = await AdminService.reviewReport(adminId, reportId, status as ReportStatus);
      res.json(updatedReport);
    } catch (error: any) {
      console.error('Error reviewing report:', error);
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      res.status(400).json({ error: error.message });
    }
  }

  static async getClaims(req: Request, res: Response) {
    try {
      const { page, limit, status } = req.query;
      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      const filter: any = {};
      if (status) filter.status = status;

      const result = await AdminService.getClaims(parsedPage, parsedLimit, filter);
      res.json(result);
    } catch (error) {
      console.error('Error fetching admin claims:', error);
      res.status(500).json({ error: 'Failed to fetch admin claims' });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query;
      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      const result = await AdminService.getUsers(parsedPage, parsedLimit, search as string);
      res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async changeUserRole(req: Request, res: Response) {
    try {
      const adminId = req.user.id;
      const userId = req.params.userId as string;
      const { role } = req.body;

      if (!['ADMIN', 'STUDENT'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const updatedUser = await AdminService.changeUserRole(adminId, userId, role);
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Error changing user role:', error);
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      res.status(400).json({ error: error.message });
    }
  }
}
