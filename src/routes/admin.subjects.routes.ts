// src/routes/admin.subjects.routes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AdminSubjectsController } from '../controllers/admin.subjects.controller';

const router = Router();

// Any authenticated role can list subjects
router.use(requireAuth);
router.get('/by-class/:classId', asyncHandler(AdminSubjectsController.listByClass));

// Admin-only mutations
router.use(requireAdmin);
router.post('/', asyncHandler(AdminSubjectsController.create));
router.put('/:id', asyncHandler(AdminSubjectsController.update));
router.delete('/:id', asyncHandler(AdminSubjectsController.remove));

export default router;
