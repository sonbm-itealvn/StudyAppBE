import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';
import { User } from '../models/User';

export interface JwtUser {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: 'Unauthorized' });
    const u = await User.findById(req.user.userId).select('_id role');
    if (!u) return res.status(401).json({ message: 'Unauthorized' });
    if (u.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden: Admin only' });
    next();
  } catch (e) {
    next(e);
  }
}
