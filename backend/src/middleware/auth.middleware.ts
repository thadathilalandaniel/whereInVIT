import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can type this to Profile from Prisma
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_session;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await AuthService.getProfileBySessionToken(token);
    if (!profile) {
      return res.status(401).json({ error: 'Authentication invalid or expired' });
    }

    req.user = profile;
    next();
  } catch (error) {
    next(error);
  }
};
