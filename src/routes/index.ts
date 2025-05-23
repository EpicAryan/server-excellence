import express from 'express';
import authRouter from './auth.routes';
import boardRoutes from './board.routes';
import classRoutes from './class.routes';
import subjectRoutes from './subject.routes';
import chapterRoutes from './chapter.routes';
import topicRoutes from './topic.routes';
import assignClassRoutes from './assignClass.routes';
import studentRoutes from './student.routes';
import cloudinaryRoutes from './cloudinary.routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/boards', boardRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/topics', topicRoutes);
router.use('/users', assignClassRoutes);
router.use('/students', studentRoutes);
router.use('/cloudinary', cloudinaryRoutes);


export default router;
