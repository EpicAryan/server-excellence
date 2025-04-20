// routes/assignClass.routes.ts
import { Router } from 'express';
import { searchUsers, assignClasses } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', authenticate, isAdmin, searchUsers);
router.post('/:userId/classes', authenticate, isAdmin, assignClasses);

export default router;
