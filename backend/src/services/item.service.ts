import { ItemType, ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';

interface FindItemsParams {
  type?: ItemType;
  categoryId?: string;
  venueId?: string;
  status?: ItemStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class ItemService {
  static async findItems(params: FindItemsParams) {
    const {
      type,
      categoryId,
      venueId,
      status = ItemStatus.ACTIVE,
      search,
      page = 1,
      limit = 20
    } = params;

    const where: Prisma.ItemWhereInput = {
      status,
    };

    if (type) {
      where.type = type;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (venueId) {
      where.venueId = venueId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { venue: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          venue: true,
          reporter: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findItemById(id: string) {
    return prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        venue: true,
        reporter: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });
  }

  static async createItem(data: {
    reporterId: string;
    type: ItemType;
    title: string;
    categoryId: string;
    venueId: string;
    description: string;
    imageUrl?: string;
  }) {
    // Basic validation could also be done here or controller
    return prisma.item.create({
      data: {
        reporterId: data.reporterId,
        type: data.type,
        title: data.title,
        categoryId: data.categoryId,
        venueId: data.venueId,
        description: data.description,
        imageUrl: data.imageUrl,
        status: ItemStatus.ACTIVE,
      },
      include: {
        category: true,
        venue: true,
      }
    });
  }

  static async updateItem(id: string, reporterId: string, data: Partial<{
    title: string;
    categoryId: string;
    venueId: string;
    description: string;
    imageUrl: string;
    status: ItemStatus;
  }>) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new Error('Item not found');
    }
    if (item.reporterId !== reporterId) {
      throw new Error('Unauthorized');
    }

    // Only allow editing if item is ACTIVE, or allow resolve action
    if (item.status !== ItemStatus.ACTIVE && data.status !== ItemStatus.RESOLVED) {
      throw new Error('Cannot edit an item that is not active');
    }

    return prisma.item.update({
      where: { id },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        venueId: data.venueId,
        description: data.description,
        imageUrl: data.imageUrl,
        status: data.status,
      },
      include: {
        category: true,
        venue: true,
      }
    });
  }

  static async deleteItem(id: string, reporterId: string) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new Error('Item not found');
    }
    if (item.reporterId !== reporterId) {
      throw new Error('Unauthorized');
    }

    if (item.status !== ItemStatus.ACTIVE) {
      throw new Error('Cannot delete an item that is in progress');
    }

    // Since we don't want to physically delete records that might have relations
    // or we can soft-delete by setting status = RESOLVED or returning a safe delete.
    // Given the instructions: "Prefer a safe status transition or soft-delete strategy if appropriate."
    // Let's actually delete if there are no claims, or just transition to RESOLVED.
    // If it's active, there are probably no claims yet, but let's just physically delete if active.

    const claimsCount = await prisma.claim.count({ where: { itemId: id } });
    if (claimsCount > 0) {
      // Soft delete
      return prisma.item.update({
        where: { id },
        data: { status: ItemStatus.RESOLVED }
      });
    }

    return prisma.item.delete({
      where: { id }
    });
  }
}
