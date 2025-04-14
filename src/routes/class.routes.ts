// routes/class.routes.ts
import { Router } from 'express';
import { addClass, getClasses, removeClass, updateClass } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addClass);
router.get('/', getClasses);
router.delete('/:id', authenticate, isAdmin, removeClass);
router.put('/:id', authenticate, isAdmin, updateClass);

export default router;
