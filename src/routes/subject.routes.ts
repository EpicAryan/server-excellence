// routes/subject.routes.ts
import { Router } from 'express';
import { addSubject, getSubjects } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addSubject);
router.get('/', getSubjects);

export default router;
