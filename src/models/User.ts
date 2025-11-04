import { Schema, model, Types } from 'mongoose';

export type Role = 'STUDENT' | 'ADMIN';
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  classId?: Types.ObjectId; // user thuộc lớp nào
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
