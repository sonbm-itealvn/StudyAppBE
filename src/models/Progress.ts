import { Schema, model, Types } from 'mongoose';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';

export interface IProgress {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: ProgressStatus;
  updatedAt: Date;
  createdAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'DONE'], default: 'NOT_STARTED' }
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const ProgressModel = model<IProgress>('Progress', progressSchema);
