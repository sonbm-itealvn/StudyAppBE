import { Schema, model } from 'mongoose';

export interface IClass {
  name: string; // "Lớp 8"
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

export const ClassModel = model<IClass>('Class', classSchema);
