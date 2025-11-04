// src/controllers/classes.controller.ts
import { Request, Response } from 'express';
import { ClassModel } from '../models/Class';
import { SubjectModel } from '../models/Subject';
import { ChapterModel } from '../models/Chapter';
import { LessonModel } from '../models/Lesson';

export class ClassesController {
  static async list(req: Request, res: Response) {
    const classes = await ClassModel.find().select('_id name').sort({ name: 1 });
    res.json(classes);
  }

  static async roadmap(req: Request, res: Response) {
    const classId = req.params.id;
    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const subjects = await SubjectModel.find({ classId }).sort({ orderIndex: 1, name: 1 }).lean();
    const subjectIds = subjects.map((s) => s._id);

    const chapters = await ChapterModel.find({ subjectId: { $in: subjectIds } })
      .sort({ subjectId: 1, orderIndex: 1 })
      .lean();
    const chapterIds = chapters.map((c) => c._id);

    const lessons = await LessonModel.find({ chapterId: { $in: chapterIds } })
      .sort({ chapterId: 1, orderIndex: 1 })
      .lean();

    const lessonsByChapter = new Map<string, any[]>();
    for (const lesson of lessons) {
      const key = lesson.chapterId.toString();
      if (!lessonsByChapter.has(key)) lessonsByChapter.set(key, []);
      lessonsByChapter.get(key)!.push({
        ...lesson,
        sections: [...(lesson.sections || [])].sort((a, b) => a.orderIndex - b.orderIndex),
      });
    }

    const chaptersBySubject = new Map<string, any[]>();
    for (const chapter of chapters) {
      const key = chapter.subjectId.toString();
      if (!chaptersBySubject.has(key)) chaptersBySubject.set(key, []);
      chaptersBySubject.get(key)!.push({
        ...chapter,
        lessons: lessonsByChapter.get(chapter._id.toString()) || [],
      });
    }

    res.json({
      _id: cls._id,
      name: cls.name,
      subjects: subjects.map((subject) => ({
        _id: subject._id,
        name: subject.name,
        orderIndex: subject.orderIndex,
        chapters: (chaptersBySubject.get(subject._id.toString()) || []).map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons,
        })),
      })),
    });
  }
}
