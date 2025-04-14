// routes/subject.routes.ts
import { Router } from 'express';
import { addSubject, getSubjects, removeSubject, updateSubject } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addSubject);
router.get('/', getSubjects);
router.delete('/:id', authenticate, isAdmin, removeSubject);
router.put('/:id', authenticate, isAdmin, updateSubject);

export default router;
