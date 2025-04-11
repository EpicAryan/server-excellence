// routes/board.routes.ts
import { Router } from 'express';
import { addBoard,getBoards } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addBoard);
router.get('/', getBoards);

export default router;
