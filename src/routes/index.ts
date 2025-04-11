import express from 'express';
import authRouter from './auth.routes';
import boardRoutes from './board.routes';
import classRoutes from './class.routes';
import subjectRoutes from './subject.routes';
import chapterRoutes from './chapter.routes';
import topicRoutes from './topic.routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/boards', boardRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/topics', topicRoutes);


export default router;
