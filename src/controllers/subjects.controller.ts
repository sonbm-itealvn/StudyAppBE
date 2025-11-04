// src/controllers/subjects.controller.ts
import { Request, Response } from 'express';
import { SubjectModel } from '../models/Subject';

export class SubjectsController {
  static async listByClass(req: Request, res: Response) {
    const { classId } = req.params;
    const subjects = await SubjectModel.find({ classId })
      .select('_id name orderIndex')
      .sort({ orderIndex: 1, name: 1 });
    res.json(subjects);
  }
}
