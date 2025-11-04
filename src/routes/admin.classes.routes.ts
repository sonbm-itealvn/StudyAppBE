// src/routes/admin.classes.routes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AdminClassesController } from '../controllers/admin.classes.controller';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', asyncHandler(AdminClassesController.list));
router.post('/', asyncHandler(AdminClassesController.create));
router.put('/:id', asyncHandler(AdminClassesController.update));
router.delete('/:id', asyncHandler(AdminClassesController.remove));

export default router;
