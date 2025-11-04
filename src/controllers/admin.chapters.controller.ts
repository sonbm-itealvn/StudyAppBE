// src/controllers/admin.chapters.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ChapterModel } from '../models/Chapter';
import { SubjectModel } from '../models/Subject';
import { LessonModel } from '../models/Lesson';
import { ProgressModel } from '../models/Progress';
import { logAudit } from '../utils/audit';

export class AdminChaptersController {
  static async listBySubject(req: Request, res: Response) {
    const { subjectId } = req.params;
    const subject = await SubjectModel.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const chapters = await ChapterModel.find({ subjectId }).sort({ orderIndex: 1, title: 1 }).lean();
    res.json(chapters);
  }

  static async create(req: Request, res: Response) {
    const { subjectId, title, orderIndex = 0 } = req.body || {};
    const chapter = await ChapterModel.create({ subjectId, title, orderIndex });
    await logAudit(req, {
      action: 'CREATE',
      resourceType: 'CHAPTER',
      resourceId: chapter._id.toString(),
      after: { subjectId, title, orderIndex },
    });
    res.status(201).json(chapter);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, orderIndex } = req.body || {};
    const chapter = await ChapterModel.findById(id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const before = { title: chapter.title, orderIndex: chapter.orderIndex };
    if (title) chapter.title = title;
    if (orderIndex !== undefined) chapter.orderIndex = Number(orderIndex);
    await chapter.save();

    await logAudit(req, {
      action: 'UPDATE',
      resourceType: 'CHAPTER',
      resourceId: id,
      before,
      after: { title: chapter.title, orderIndex: chapter.orderIndex },
    });

    res.json(chapter);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    const session = await mongoose.startSession();
    try {
      let deletedLessons = 0;
      let deletedProgress = 0;

      await session.withTransaction(async () => {
        const chapter = await ChapterModel.findById(id).session(session);
        if (!chapter) throw Object.assign(new Error('Chapter not found'), { status: 404 });

        const lessons = await LessonModel.find({ chapterId: id }).select('_id').session(session);
        const lessonIds = lessons.map((l) => l._id);
        deletedLessons = lessonIds.length;

        if (lessonIds.length) {
          const progDel = await ProgressModel.deleteMany({ lessonId: { $in: lessonIds } }).session(session);
          deletedProgress = progDel.deletedCount || 0;
          await LessonModel.deleteMany({ chapterId: id }).session(session);
        }

        await ChapterModel.deleteOne({ _id: id }).session(session);

        await logAudit(req, {
          action: 'DELETE',
          resourceType: 'CHAPTER',
          resourceId: id,
          meta: { cascade: { lessons: deletedLessons, progress: deletedProgress } },
          session,
        });
      });

      res.json({
        message: 'Chapter deleted with related data',
        deleted: { lessons: deletedLessons, progress: deletedProgress },
      });
    } catch (e: any) {
      const status = e?.status || 500;
      res.status(status).json({ message: e?.message || 'Delete chapter failed' });
    } finally {
      session.endSession();
    }
  }
}
