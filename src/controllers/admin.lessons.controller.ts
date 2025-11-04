// src/controllers/admin.lessons.controller.ts
import { Request, Response } from 'express';
import { LessonModel } from '../models/Lesson';
import { ChapterModel } from '../models/Chapter';
import { ProgressModel } from '../models/Progress';
import { logAudit } from '../utils/audit';

export class AdminLessonsController {
  static async listByChapter(req: Request, res: Response) {
    const { chapterId } = req.params;
    const chapter = await ChapterModel.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const lessons = await LessonModel.find({ chapterId }).sort({ orderIndex: 1 }).lean();
    res.json(lessons);
  }

  static async create(req: Request, res: Response) {
    const { chapterId, title, orderIndex = 0, sections = [] } = req.body || {};
    const lesson = await LessonModel.create({ chapterId, title, orderIndex, sections });
    await logAudit(req, {
      action: 'CREATE',
      resourceType: 'LESSON',
      resourceId: lesson._id.toString(),
      after: { chapterId, title, orderIndex, sectionsCount: sections?.length || 0 },
    });
    res.status(201).json(lesson);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, orderIndex, sections } = req.body || {};
    const lesson = await LessonModel.findById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const before = {
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      sectionsCount: lesson.sections.length,
    };
    if (title) lesson.title = title;
    if (orderIndex !== undefined) lesson.orderIndex = Number(orderIndex);
    if (sections !== undefined) lesson.sections = sections;
    await lesson.save();

    await logAudit(req, {
      action: 'UPDATE',
      resourceType: 'LESSON',
      resourceId: id,
      before,
      after: { title: lesson.title, orderIndex: lesson.orderIndex, sectionsCount: lesson.sections.length },
    });

    res.json(lesson);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    const before = await LessonModel.findById(id).lean();
    if (!before) return res.status(404).json({ message: 'Lesson not found' });

    const progDel = await ProgressModel.deleteMany({ lessonId: id });
    await LessonModel.deleteOne({ _id: id });

    await logAudit(req, {
      action: 'DELETE',
      resourceType: 'LESSON',
      resourceId: id,
      before,
      meta: { deletedProgress: progDel.deletedCount || 0 },
    });

    res.json({ message: 'Lesson and related progress deleted' });
  }
}
