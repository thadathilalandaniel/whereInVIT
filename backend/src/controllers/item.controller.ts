import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { ItemType, ItemStatus, ReportReason } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class ItemController {
  static async getItems(req: Request, res: Response) {
    try {
      const { type, categoryId, venueId, status, search, page, limit } = req.query;

      const parsedPage = page ? parseInt(page as string) : 1;
      const parsedLimit = limit ? parseInt(limit as string) : 20;

      if (parsedLimit > 50) {
        return res.status(400).json({ error: 'Limit cannot exceed 50' });
      }

      if (type && type !== ItemType.LOST && type !== ItemType.FOUND) {
        return res.status(400).json({ error: 'Invalid item type' });
      }

      if (status && !Object.values(ItemStatus).includes(status as ItemStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await ItemService.findItems({
        type: type as ItemType,
        categoryId: categoryId as string,
        venueId: venueId as string,
        status: status as ItemStatus,
        search: search as string,
        page: parsedPage,
        limit: parsedLimit,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  static async getItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await ItemService.findItemById(id as string);

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(item);
    } catch (error: any) {
      console.error('Error fetching item:', error);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }

  static async createItem(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const { type, title, categoryId, venueId, description } = req.body;
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        const baseUrl = req.protocol + '://' + req.get('host');
        imageUrl = baseUrl + '/uploads/items/' + req.file.filename;
      }

      if (!type || (type !== ItemType.LOST && type !== ItemType.FOUND)) {
        return res.status(400).json({ error: 'Valid type (LOST or FOUND) is required' });
      }
      if (!title || title.trim().length === 0 || title.length > 100) {
        return res.status(400).json({ error: 'Title is required and must be under 100 characters' });
      }
      if (!description || description.trim().length === 0 || description.length > 1000) {
        return res.status(400).json({ error: 'Description is required and must be under 1000 characters' });
      }
      if (!categoryId) {
        return res.status(400).json({ error: 'Category ID is required' });
      }
      if (!venueId) {
        return res.status(400).json({ error: 'Venue ID is required' });
      }

      // Check if category and venue exist
      const [category, venue] = await Promise.all([
        prisma.category.findUnique({ where: { id: categoryId } }),
        prisma.venue.findUnique({ where: { id: venueId } })
      ]);

      if (!category || !category.isActive) {
        return res.status(400).json({ error: 'Invalid or inactive category' });
      }
      if (!venue || !venue.isActive) {
        return res.status(400).json({ error: 'Invalid or inactive venue' });
      }

      const item = await ItemService.createItem({
        reporterId,
        type,
        title,
        categoryId,
        venueId,
        description,
        imageUrl,
      });

      res.status(201).json(item);
    } catch (error: any) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reporterId = req.user.id;
      let imageUrl = req.body.imageUrl;
      const { title, categoryId, venueId, description, status } = req.body;
      if (req.file) {
        const baseUrl = req.protocol + '://' + req.get('host');
        imageUrl = baseUrl + '/uploads/items/' + req.file.filename;
      }
      
      // Allow removing the image explicitly if client passes imageUrl = 'null' or empty string
      if (req.body.imageUrl === 'null' || req.body.imageUrl === '') {
        imageUrl = null;
      }

      if (title && (title.trim().length === 0 || title.length > 100)) {
        return res.status(400).json({ error: 'Title must be under 100 characters' });
      }
      if (description && (description.trim().length === 0 || description.length > 1000)) {
        return res.status(400).json({ error: 'Description must be under 1000 characters' });
      }
      if (status && !Object.values(ItemStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (categoryId) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category || !category.isActive) return res.status(400).json({ error: 'Invalid category' });
      }

      if (venueId) {
        const venue = await prisma.venue.findUnique({ where: { id: venueId } });
        if (!venue || !venue.isActive) return res.status(400).json({ error: 'Invalid venue' });
      }

      const item = await ItemService.updateItem(id as string, reporterId, {
        title, categoryId, venueId, description, imageUrl, status
      });

      res.json(item);
    } catch (error: any) {
      console.error('Error updating item:', error);
      if (error.message === 'Item not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      if (error.message === 'Cannot edit an item that is not active') return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to update item' });
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reporterId = req.user.id;

      await ItemService.deleteItem(id as string, reporterId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      if (error.message === 'Item not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
      if (error.message === 'Cannot delete an item that is in progress') return res.status(400).json({ error: error.message });
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  static async reportItem(req: Request, res: Response) {
    try {
      const reporterId = req.user.id;
      const itemId = req.params.id as string;
      const { reason, description } = req.body;

      if (!Object.values(ReportReason).includes(reason as ReportReason)) {
        return res.status(400).json({ error: 'Invalid report reason' });
      }
      if (!description || description.trim().length === 0) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const report = await ItemService.reportItem(reporterId, itemId, reason as ReportReason, description);
      res.status(201).json(report);
    } catch (error: any) {
      console.error('Error reporting item:', error);
      if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
      res.status(400).json({ error: error.message });
    }
  }
}
