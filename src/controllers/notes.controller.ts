import { Request, Response } from 'express';
import { z } from 'zod';
import { Note } from '../models/Note';

const NoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(''),
});

function getUserIdOr401(req: Request, res: Response): string | undefined {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return undefined;
  }
  return userId;
}

export async function list(req: Request, res: Response) {
  const userId = getUserIdOr401(req, res);
  if (!userId) return;
  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  res.json(notes);
}

export async function create(req: Request, res: Response) {
  const userId = getUserIdOr401(req, res);
  if (!userId) return;
  const parsed = NoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
  const note = await Note.create({ ...parsed.data, userId });
  res.status(201).json(note);
}

export async function update(req: Request, res: Response) {
  const userId = getUserIdOr401(req, res);
  if (!userId) return;
  const parsed = NoteSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
  const note = await Note.findOneAndUpdate({ _id: req.params.id, userId }, parsed.data, { new: true });
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json(note);
}

export async function remove(req: Request, res: Response) {
  const userId = getUserIdOr401(req, res);
  if (!userId) return;
  const result = await Note.deleteOne({ _id: req.params.id, userId });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
}
