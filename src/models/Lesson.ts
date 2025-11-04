import { Schema, model, Types } from 'mongoose';

export type LessonSectionType = 'THEORY' | 'EXERCISE' | 'VIDEO' | 'QUIZ';

export interface ILessonSection {
  type: LessonSectionType;
  title: string;
  text?: string;
  url?: string;
  orderIndex: number;
}

export interface ILesson {
  title: string;
  chapterId: Types.ObjectId;
  orderIndex: number;
  sections: ILessonSection[];
}

const sectionSchema = new Schema<ILessonSection>(
  {
    type: { type: String, enum: ['THEORY', 'EXERCISE', 'VIDEO', 'QUIZ'], required: true },
    title: { type: String, required: true },
    text: { type: String },
    url: { type: String },
    orderIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    orderIndex: { type: Number, default: 0 },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

lessonSchema.index({ chapterId: 1, orderIndex: 1 });

export const LessonModel = model<ILesson>('Lesson', lessonSchema);
