// controllers/subject.controller.ts
import {Request, Response } from 'express';
import { subjectSchema } from '../schemas/course.schema';
import { createSubject, findClassById, getSubjectsByClass } from '../services';

export const addSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const validationResult = subjectSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        errors: validationResult.error.format() 
      });
      return;
    }
    
    const { subjectName, classId } = req.body;
    
    // Verify class exists
    const existingClass = await findClassById(classId);
    if (existingClass.length === 0) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    
    // Insert subject
    const newSubject = await createSubject(subjectName, classId);
    
    res.status(201).json({
      message: 'Subject added successfully',
      data: newSubject[0]
    });
    return;
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};


export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const classId = parseInt(req.query.classId as string, 10);
    
    if (isNaN(classId)) {
      res.status(400).json({ message: 'Invalid class ID' });
      return;
    }
    
    const subjects = await getSubjectsByClass(classId);
      
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
