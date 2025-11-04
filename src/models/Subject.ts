import { Schema, model, Types } from 'mongoose';

export interface ISubject {
  name: string;           // "Toán", "Văn"...
  classId: Types.ObjectId;
  orderIndex: number;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

subjectSchema.index({ classId: 1, name: 1 }, { unique: true });

export const SubjectModel = model<ISubject>('Subject', subjectSchema);
