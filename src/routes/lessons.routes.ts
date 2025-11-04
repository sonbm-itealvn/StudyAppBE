// src/routes/lessons.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { LessonsController } from '../controllers/lessons.controller';

const router = Router();
router.use(requireAuth);

router.get('/:id', asyncHandler(LessonsController.getOne));

export default router;
