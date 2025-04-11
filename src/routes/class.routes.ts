// routes/class.routes.ts
import { Router } from 'express';
import { addClass, getClasses } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addClass);
router.get('/', getClasses)

export default router;
