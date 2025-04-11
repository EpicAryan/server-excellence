// routes/chapter.routes.ts
import { Router } from 'express';
import { addChapter, getChapters } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addChapter);
router.get('/', getChapters)

export default router;
