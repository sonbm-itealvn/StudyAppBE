// src/controllers/admin.classes.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ClassModel } from '../models/Class';
import { SubjectModel } from '../models/Subject';
import { ChapterModel } from '../models/Chapter';
import { LessonModel } from '../models/Lesson';
import { ProgressModel } from '../models/Progress';
import { logAudit } from '../utils/audit';

export class AdminClassesController {
  static async list(req: Request, res: Response) {
    const classes = await ClassModel.find().select('_id name').sort({ name: 1 });
    res.json(classes);
  }

  static async create(req: Request, res: Response) {
    const { name } = req.body || {};
    const cls = await ClassModel.create({ name });
    await logAudit(req, {
      action: 'CREATE',
      resourceType: 'CLASS',
      resourceId: cls._id.toString(),
      after: { name: cls.name },
    });
    res.status(201).json(cls);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body || {};
    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const before = { name: cls.name };
    if (name) cls.name = name;
    await cls.save();

    await logAudit(req, {
      action: 'UPDATE',
      resourceType: 'CLASS',
      resourceId: id,
      before,
      after: { name: cls.name },
    });

    res.json(cls);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    const session = await mongoose.startSession();
    try {
      let deletedSubjects = 0;
      let deletedChapters = 0;
      let deletedLessons = 0;
      let deletedProgress = 0;

      await session.withTransaction(async () => {
        const cls = await ClassModel.findById(id).session(session);
        if (!cls) throw Object.assign(new Error('Class not found'), { status: 404 });

        const subjects = await SubjectModel.find({ classId: id }).select('_id').session(session);
        const subjectIds = subjects.map((s) => s._id);
        deletedSubjects = subjectIds.length;

        const chapters = await ChapterModel.find({ subjectId: { $in: subjectIds } })
          .select('_id')
          .session(session);
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

        await SubjectModel.deleteMany({ classId: id }).session(session);
        await ClassModel.deleteOne({ _id: id }).session(session);

        await logAudit(req, {
          action: 'DELETE',
          resourceType: 'CLASS',
          resourceId: id,
          meta: {
            cascade: {
              subjects: deletedSubjects,
              chapters: deletedChapters,
              lessons: deletedLessons,
              progress: deletedProgress,
            },
          },
          session,
        });
      });

      res.json({
        message: 'Class deleted with related data (atomic)',
        deleted: {
          subjects: deletedSubjects,
          chapters: deletedChapters,
          lessons: deletedLessons,
          progress: deletedProgress,
        },
      });
    } catch (e: any) {
      const status = e?.status || 500;
      res.status(status).json({ message: e?.message || 'Delete class failed' });
    } finally {
      session.endSession();
    }
  }
}
