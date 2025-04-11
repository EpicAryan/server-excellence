// controllers/chapter.controller.ts
import { Request, Response } from 'express';
import { chapterSchema } from '../schemas/course.schema';
import { createChapter, findSubjectById, getChaptersBySubject } from '../services';


export const addChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const validationResult = chapterSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        errors: validationResult.error.format() 
      });
      return;
    }
    
    const { chapterName, subjectId } = req.body;
    
    // Verify subject exists
    const existingSubject = await findSubjectById(subjectId);
    if (existingSubject.length === 0) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }
    
    // Insert chapter
    const newChapter = await createChapter(chapterName, subjectId);
    
    res.status(201).json({
      message: 'Chapter added successfully',
      data: newChapter[0]
    });
    return;
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const getChapters = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjectId = parseInt(req.query.subjectId as string, 10);
    
    if (isNaN(subjectId)) {
      res.status(400).json({ message: 'Invalid subject ID' });
      return;
    }
    
    const chapters = await getChaptersBySubject(subjectId);
      
    res.status(200).json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
