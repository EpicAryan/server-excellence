// controllers/class.controller.ts
import {Request, Response } from 'express';
import { classSchema } from '../schemas/course.schema';
import { findBoardById, createClass, getClassesByBoard } from '../services';

export const addClass = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const parsedBody = {
      ...req.body,
      boardId: Number(req.body.boardId), 
    };
    
    const validationResult = classSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      res.status(400).json({ 
        errors: validationResult.error.format() 
      });
      return;
    }
    
    const { className, boardId } = req.body;
    
    // Verify board exists
    const existingBoard = await findBoardById(boardId);
    if (existingBoard.length === 0) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }
    
    // Insert class
    const newClass = await createClass(className, boardId);
    
    res.status(201).json({
      message: 'Class added successfully',
      data: newClass[0]
    });
    return;
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const boardId = parseInt(req.query.boardId as string, 10);
    
    if (isNaN(boardId)) {
      res.status(400).json({ message: 'Invalid board ID' });
      return;
    }
    
    const classes = await getClassesByBoard(boardId); 
      
    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
