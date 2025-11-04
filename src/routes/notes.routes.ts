import { Router } from 'express';
import * as ctrl from '../controllers/notes.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
