// src/routes/progress.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { ProgressController } from '../controllers/progress.controller';

const router = Router();
router.use(requireAuth);

router.post('/:lessonId', asyncHandler(ProgressController.upsert));
router.get('/my', asyncHandler(ProgressController.myProgress));

export default router;
