// src/routes/admin.chapters.routes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AdminChaptersController } from '../controllers/admin.chapters.controller';

const router = Router();
router.use(requireAuth, requireAdmin);

// List chapters by subject
router.get('/by-subject/:subjectId', asyncHandler(AdminChaptersController.listBySubject));

// CRUD
router.post('/', asyncHandler(AdminChaptersController.create));
router.put('/:id', asyncHandler(AdminChaptersController.update));
router.delete('/:id', asyncHandler(AdminChaptersController.remove));

export default router;
