import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';

const COOKIE_NAME = 'auth_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ error: 'Missing credential' });
      }

      const { email, name } = await AuthService.verifyGoogleToken(credential);
      const profile = await AuthService.findOrCreateProfile(email, name);
      const { rawToken } = await AuthService.createSession(profile.id);

      res.cookie(COOKIE_NAME, rawToken, COOKIE_OPTIONS);

      return res.status(200).json({
        message: 'Login successful',
        profile,
      });
    } catch (error: any) {
      if (error.message === 'Only @vitstudent.ac.in emails are allowed') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await AuthService.getProfileBySessionToken(token);
      if (!profile) {
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (token) {
        await AuthService.deleteSession(token);
      }
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}
