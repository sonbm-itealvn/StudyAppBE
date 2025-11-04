// src/routes/classes.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ClassesController } from '../controllers/classes.controller';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(ClassesController.list));
router.get('/:id/roadmap', asyncHandler(ClassesController.roadmap));

export default router;
