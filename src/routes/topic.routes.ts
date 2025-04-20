import { Router } from 'express';
import { addTopic,  getTopics, updateTopicById, deleteTopicById, toggleTopicStatus } from '../controllers/topic.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.post('/', authenticate, isAdmin, uploadMiddleware, addTopic); // Removed multer upload
router.get('/', getTopics);
router.put('/:id', authenticate, isAdmin, updateTopicById);
router.delete('/:id', authenticate, isAdmin, deleteTopicById);
router.patch('/:topicId/status',authenticate,isAdmin,toggleTopicStatus)

export default router;
