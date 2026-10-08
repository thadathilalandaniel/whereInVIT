import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    if (profile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Administrator access required' });
    }

    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
