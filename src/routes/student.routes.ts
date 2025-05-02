// routes/student.routes.ts
import { Router } from 'express';
import { getAllStudents, togglePermission, removeBatch, removeStudent, getStudentClasses } from '../controllers';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, getAllStudents);
router.put('/:id/permission', authenticate, isAdmin, togglePermission);
router.delete('/:userId/batches/:batchId', authenticate, isAdmin, removeBatch);
router.delete('/:id', authenticate, isAdmin, removeStudent);
router.get('/course/:studentId', authenticate, getStudentClasses);

export default router;
