// controllers/board.controller.ts
import {Request, Response } from 'express';
import { boardSchema } from '../schemas/course.schema';
import { createBoard, getAllBoards, deleteBoard, updateBoardInDB, getBoardWithHierarchy  } from '../services';

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

export const removeBoard = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ message: "Invalid board ID" });
      return;
    }

    await deleteBoard(boardId);
    res.status(200).json({ message: "Board and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const boardId = parseInt(req.params.id);
    if (isNaN(boardId)) {
      res.status(400).json({ message: "Invalid board ID" });
      return;
    }

    const { boardName } = req.body;

    if (!boardName || typeof boardName !== 'string') {
      res.status(400).json({ message: "Invalid board name" });
      return;
    }

    const updated = await updateBoardInDB(boardId, boardName);

    if (!updated || updated.length === 0) {
      res.status(404).json({ message: "Board not found" });
      return;
    }

    res.status(200).json({
      message: "Board updated successfully",
      data: updated[0]
    });
  } catch (error) {
    console.error("Error updating board:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBoardHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const boardId = req.query.boardId ? parseInt(req.query.boardId as string) : undefined;
    
    const hierarchy = await getBoardWithHierarchy(boardId);
    
    res.status(200).json(hierarchy);
  } catch (error) {
    console.error('Error fetching board hierarchy:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
