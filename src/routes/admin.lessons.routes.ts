// src/routes/admin.lessons.routes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AdminLessonsController } from '../controllers/admin.lessons.controller';

const router = Router();
router.use(requireAuth, requireAdmin);

// List lessons by chapter
router.get('/by-chapter/:chapterId', asyncHandler(AdminLessonsController.listByChapter));

// CRUD
router.post('/', asyncHandler(AdminLessonsController.create));
router.put('/:id', asyncHandler(AdminLessonsController.update));
router.delete('/:id', asyncHandler(AdminLessonsController.remove));

export default router;
