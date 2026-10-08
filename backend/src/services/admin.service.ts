import { Prisma, AdminActionType, ItemStatus, ReportStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class AdminService {
  static async getStats() {
    const [
      totalUsers,
      totalActiveLost,
      totalActiveFound,
      totalClaimed,
      totalResolved,
      pendingClaims,
      pendingHandoffs,
      pendingReports
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.item.count({ where: { status: 'ACTIVE', type: 'LOST' } }),
      prisma.item.count({ where: { status: 'ACTIVE', type: 'FOUND' } }),
      prisma.item.count({ where: { status: 'CLAIMED' } }),
      prisma.item.count({ where: { status: 'RESOLVED' } }),
      prisma.claim.count({ where: { status: 'PENDING' } }),
      prisma.handoff.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } })
    ]);

    return {
      totalUsers,
      totalActiveLost,
      totalActiveFound,
      totalClaimed,
      totalResolved,
      pendingClaims,
      pendingHandoffs,
      pendingReports
    };
  }

  static async getItems(page: number, limit: number, filter?: any) {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};
    if (filter?.status) whereClause.status = filter.status;
    if (filter?.type) whereClause.type = filter.type;
    
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          venue: { select: { id: true, name: true } },
          _count: { select: { reports: true, claims: true } }
        }
      }),
      prisma.item.count({ where: whereClause })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async moderateItem(adminId: string, itemId: string, action: 'REMOVE' | 'RESTORE') {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    
    if (!item) {
      throw new Error('Item not found');
    }

    // Business rules for removal: don't mess up active handoffs/claims lightly.
    // Assuming REMOVE just sets status to REMOVED if it's ACTIVE or CLAIM_PENDING. 
    // If it's already CLAIMED or beyond, we might need a more complex operation.
    // For this module, we'll allow removing ACTIVE and CLAIM_PENDING.
    if (action === 'REMOVE') {
      if (!['ACTIVE', 'CLAIM_PENDING'].includes(item.status)) {
        throw new Error('Cannot remove an item that is already claimed or resolved.');
      }
    } else if (action === 'RESTORE') {
      if (item.status !== 'REMOVED') {
        throw new Error('Item is not removed.');
      }
    }

    const newStatus = action === 'REMOVE' ? ItemStatus.REMOVED : ItemStatus.ACTIVE;
    const actionType = action === 'REMOVE' ? AdminActionType.ITEM_REMOVED : AdminActionType.ITEM_RESTORED;

    return prisma.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: { status: newStatus }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: actionType,
          targetType: 'Item',
          targetId: itemId
        }
      });

      return updatedItem;
    });
  }

  static async getReports(page: number, limit: number, filter?: any) {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};
    if (filter?.status) whereClause.status = filter.status;
    
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          item: { select: { id: true, title: true, status: true, type: true } }
        }
      }),
      prisma.report.count({ where: whereClause })
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async reviewReport(adminId: string, reportId: string, status: ReportStatus) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found');

    return prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: { status }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: AdminActionType.REPORT_REVIEWED,
          targetType: 'Report',
          targetId: reportId,
          metadata: JSON.stringify({ newStatus: status })
        }
      });

      return updatedReport;
    });
  }

  static async getClaims(page: number, limit: number, filter?: any) {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};
    if (filter?.status) whereClause.status = filter.status;
    
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          claimant: { select: { id: true, name: true, email: true, registrationNumber: true } },
          item: { select: { id: true, title: true, status: true } }
        }
      }),
      prisma.claim.count({ where: whereClause })
    ]);

    return {
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    let whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          registrationNumber: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.profile.count({ where: whereClause })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async changeUserRole(adminId: string, userId: string, newRole: 'ADMIN' | 'STUDENT') {
    const user = await prisma.profile.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    if (adminId === userId && newRole === 'STUDENT') {
      throw new Error('You cannot remove your own admin access');
    }

    return prisma.$transaction(async (tx) => {
      const updatedUser = await tx.profile.update({
        where: { id: userId },
        data: { role: newRole },
        select: { id: true, name: true, email: true, role: true }
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: AdminActionType.USER_ROLE_CHANGED,
          targetType: 'Profile',
          targetId: userId,
          metadata: JSON.stringify({ newRole })
        }
      });

      return updatedUser;
    });
  }
}
