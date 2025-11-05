// src/routes/admin.lessons.routes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AdminLessonsController } from '../controllers/admin.lessons.controller';

const router = Router();

// Any authenticated role can list lessons
router.use(requireAuth);
router.get('/by-chapter/:chapterId', asyncHandler(AdminLessonsController.listByChapter));

// Admin-only mutations
router.use(requireAdmin);
router.post('/', asyncHandler(AdminLessonsController.create));
router.put('/:id', asyncHandler(AdminLessonsController.update));
router.delete('/:id', asyncHandler(AdminLessonsController.remove));

export default router;
