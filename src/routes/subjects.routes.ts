// src/routes/subjects.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { SubjectsController } from '../controllers/subjects.controller';

const router = Router();
router.use(requireAuth);

router.get('/by-class/:classId', asyncHandler(SubjectsController.listByClass));

export default router;
