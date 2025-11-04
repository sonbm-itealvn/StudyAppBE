// src/routes/auth.routes.ts
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));

export default router;
