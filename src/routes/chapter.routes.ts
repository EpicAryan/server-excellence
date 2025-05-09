// routes/chapter.routes.ts
import { Router } from 'express';
import { addChapter, getChapters, removeChapter, updateChapter } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addChapter);
router.get('/', getChapters);
router.delete('/:id', authenticate, isAdmin, removeChapter);
router.put('/:id', authenticate, isAdmin, updateChapter);

export default router;
