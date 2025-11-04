import { Schema, model, Types } from 'mongoose';

export interface IChapter {
  subjectId: Types.ObjectId;
  title: string;
  orderIndex: number;
}

const chapterSchema = new Schema<IChapter>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ subjectId: 1, orderIndex: 1 });

export const ChapterModel = model<IChapter>('Chapter', chapterSchema);
