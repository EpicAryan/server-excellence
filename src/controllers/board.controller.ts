// controllers/board.controller.ts
import {Request, Response } from 'express';
import { boardSchema } from '../schemas/course.schema';
import { createBoard, getAllBoards } from '../services';

export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const validationResult = boardSchema.safeParse(req.body);
    if (!validationResult.success) {
       res.status(400).json({ 
        errors: validationResult.error.format() 
      });
    }
    
    const { boardName } = req.body ;
    
    // Insert board
    const newBoard = await createBoard(boardName);
    
    res.status(201).json({
      message: 'Board added successfully',
      data: newBoard[0]
    });
  } catch (error) {
    console.error('Error adding board:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getBoards = async (_req: Request, res: Response): Promise<void> => {
  try {
    const boards = await getAllBoards();
    res.status(200).json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
