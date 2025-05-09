// routes/board.routes.ts
import { Router } from 'express';
import { addBoard,getBoardHierarchy,getBoards,removeBoard,updateBoard } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, addBoard);
router.get('/', getBoards);
router.delete('/:id', authenticate, isAdmin, removeBoard);
router.put('/:id', authenticate, isAdmin, updateBoard);
router.get('/hierarchy',authenticate, isAdmin, getBoardHierarchy);

export default router;
