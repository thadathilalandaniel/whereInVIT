import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { env } from '../config/env';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async verifyGoogleToken(token: string) {
    if (!env.GOOGLE_CLIENT_ID) {
      console.warn('GOOGLE_CLIENT_ID is not set in env variables. Bypassing verification for development.');
      // Fallback for dev if needed, or throw error
      // return { email: 'test@vitstudent.ac.in', name: 'Test User' };
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    const email = payload.email || '';
    if (!email.endsWith('@vitstudent.ac.in')) {
      throw new Error('Only @vitstudent.ac.in emails are allowed');
    }

    return {
      email,
      name: payload.name || email.split('@')[0],
    };
  }

  static async findOrCreateProfile(email: string, name: string) {
    let profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          email,
          name,
        },
      });
    }

    return profile;
  }

  static async createSession(profileId: string) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await prisma.session.create({
      data: {
        profileId,
        tokenHash,
        expiresAt,
      },
    });

    return { rawToken, session };
  }

  static async getProfileBySessionToken(rawToken: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { profile: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.profile;
  }

  static async deleteSession(rawToken: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.session.deleteMany({
      where: { tokenHash },
    });
  }
}
