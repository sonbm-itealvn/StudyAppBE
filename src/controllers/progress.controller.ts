// src/controllers/progress.controller.ts
import { Request, Response } from 'express';
import { ProgressModel } from '../models/Progress';

const ALLOWED = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'] as const;

export class ProgressController {
  static async upsert(req: Request, res: Response) {
    const { lessonId } = req.params;
    const { status } = req.body || {};
    if (!ALLOWED.includes(status))
      return res.status(400).json({ message: 'status không hợp lệ' });

    const doc = await ProgressModel.findOneAndUpdate(
      { userId: req.user!.userId, lessonId },
      { status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(doc);
  }

  static async myProgress(req: Request, res: Response) {
    const docs = await ProgressModel.find({ userId: req.user!.userId }).lean();
    res.json(docs);
  }
}
