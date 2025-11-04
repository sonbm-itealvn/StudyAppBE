// src/controllers/lessons.controller.ts
import { Request, Response } from 'express';
import { LessonModel } from '../models/Lesson';

export class LessonsController {
  static async getOne(req: Request, res: Response) {
    const lesson = await LessonModel.findById(req.params.id).lean();
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  }
}
