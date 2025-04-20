import { Request, Response } from 'express';
import {  
  searchUsersByEmail, 
  getUserById,
  assignClassesToUser 
} from '../services';




// User controllers
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.query.email as string;
    
    if (!email || email.length < 3) {
      res.status(400).json({ message: 'Search query must be at least 3 characters' });
      return;
    }
    
    const users = await searchUsersByEmail(email);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    const { classIds } = req.body;
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    if (!Array.isArray(classIds) || classIds.length === 0) {
      res.status(400).json({ message: 'Class IDs must be a non-empty array' });
      return;
    }
    
    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Assign classes to user
    await assignClassesToUser(userId, classIds);
    
    res.status(200).json({ message: 'Classes assigned successfully' });
  } catch (error) {
    console.error('Error assigning classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
