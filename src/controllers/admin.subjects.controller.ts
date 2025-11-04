// src/controllers/admin.subjects.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SubjectModel } from '../models/Subject';
import { ClassModel } from '../models/Class';
import { ChapterModel } from '../models/Chapter';
import { LessonModel } from '../models/Lesson';
import { ProgressModel } from '../models/Progress';
import { logAudit } from '../utils/audit';

export class AdminSubjectsController {
  static async listByClass(req: Request, res: Response) {
    const { classId } = req.params;
    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const subjects = await SubjectModel.find({ classId }).sort({ orderIndex: 1, name: 1 }).lean();
    res.json(subjects);
  }

  static async create(req: Request, res: Response) {
    const { classId, name, orderIndex = 0 } = req.body || {};
    const subject = await SubjectModel.create({ classId, name, orderIndex });
    await logAudit(req, {
      action: 'CREATE',
      resourceType: 'SUBJECT',
      resourceId: subject._id.toString(),
      after: { classId, name, orderIndex },
    });
    res.status(201).json(subject);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, orderIndex } = req.body || {};
    const subject = await SubjectModel.findById(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const before = { name: subject.name, orderIndex: subject.orderIndex };
    if (name) subject.name = name;
    if (orderIndex !== undefined) subject.orderIndex = Number(orderIndex);
    await subject.save();

    await logAudit(req, {
      action: 'UPDATE',
      resourceType: 'SUBJECT',
      resourceId: id,
      before,
      after: { name: subject.name, orderIndex: subject.orderIndex },
    });

    res.json(subject);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    const session = await mongoose.startSession();
    try {
      let deletedChapters = 0;
      let deletedLessons = 0;
      let deletedProgress = 0;

      await session.withTransaction(async () => {
        const subject = await SubjectModel.findById(id).session(session);
        if (!subject) throw Object.assign(new Error('Subject not found'), { status: 404 });

        const chapters = await ChapterModel.find({ subjectId: id }).select('_id').session(session);
        const chapterIds = chapters.map((c) => c._id);
        deletedChapters = chapterIds.length;

        const lessons = await LessonModel.find({ chapterId: { $in: chapterIds } })
          .select('_id')
          .session(session);
        const lessonIds = lessons.map((l) => l._id);
        deletedLessons = lessonIds.length;

        if (lessonIds.length) {
          const progDel = await ProgressModel.deleteMany({ lessonId: { $in: lessonIds } }).session(session);
          deletedProgress = progDel.deletedCount || 0;
          await LessonModel.deleteMany({ chapterId: { $in: chapterIds } }).session(session);
        }

        if (chapterIds.length) {
          await ChapterModel.deleteMany({ _id: { $in: chapterIds } }).session(session);
        }

        await SubjectModel.deleteOne({ _id: id }).session(session);

        await logAudit(req, {
          action: 'DELETE',
          resourceType: 'SUBJECT',
          resourceId: id,
          meta: { cascade: { chapters: deletedChapters, lessons: deletedLessons, progress: deletedProgress } },
          session,
        });
      });

      res.json({
        message: 'Subject deleted with related data (atomic)',
        deleted: { chapters: deletedChapters, lessons: deletedLessons, progress: deletedProgress },
      });
    } catch (e: any) {
      const status = e?.status || 500;
      res.status(status).json({ message: e?.message || 'Delete subject failed' });
    } finally {
      session.endSession();
    }
  }
}
