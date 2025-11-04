// src/utils/audit.ts
import { Request } from 'express';
import { AuditLog, AuditAction, AuditResource } from '../models/AuditLog';
import { User } from '../models/User';
import { ClientSession } from 'mongoose';

interface AuditInput {
  action: AuditAction;
  resourceType: AuditResource;
  resourceId: string;
  before?: any;
  after?: any;
  meta?: any;
  session?: ClientSession; // để ghi log trong cùng transaction
}

/** Ghi audit. Nếu không phải admin thì vẫn ghi với actor hiện tại (tuỳ chính sách). */
export async function logAudit(req: Request, input: AuditInput) {
  const actorId = req.user?.userId;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  let actorEmail = '';
  if (actorId) {
    const u = await User.findById(actorId).select('email').session(input.session || null as any);
    actorEmail = u?.email || '';
  }

  await AuditLog.create(
    [{
      actorId,
      actorEmail,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      before: input.before,
      after: input.after,
      meta: input.meta,
      ip,
      userAgent
    }],
    { session: input.session }
  );
}
