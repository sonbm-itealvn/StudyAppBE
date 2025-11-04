// src/models/AuditLog.ts
import { Schema, model, Types, ClientSession } from 'mongoose';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditResource = 'CLASS' | 'SUBJECT' | 'CHAPTER' | 'LESSON';

export interface IAuditLog {
  actorId: Types.ObjectId;        // admin _id
  actorEmail: string;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId: string;
  before?: any;                   // dữ liệu trước (tuỳ chọn)
  after?: any;                    // dữ liệu sau (tuỳ chọn)
  meta?: any;                     // số liệu phụ/cascade
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorEmail: { type: String, required: true },
    action: { type: String, enum: ['CREATE','UPDATE','DELETE'], required: true, index: true },
    resourceType: { type: String, enum: ['CLASS','SUBJECT','CHAPTER','LESSON'], required: true, index: true },
    resourceId: { type: String, required: true, index: true },
    before: { type: Schema.Types.Mixed },
    after:  { type: Schema.Types.Mixed },
    meta:   { type: Schema.Types.Mixed },
    ip: String,
    userAgent: String
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
