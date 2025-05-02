// controllers/student.controller.ts
import { Request, Response } from 'express';
import { 
  getStudentsWithClasses, 
  updateStudentPermission, 
  removeStudentBatch,
  deleteStudent,
  getUserClasses
} from '../services';

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await getStudentsWithClasses();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const togglePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { hasPermission } = req.body;
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    if (typeof hasPermission !== 'boolean') {
      res.status(400).json({ message: 'hasPermission must be a boolean' });
      return;
    }
    
    await updateStudentPermission(userId, hasPermission);
    res.status(200).json({ message: 'Permission updated successfully' });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const batchId = parseInt(req.params.batchId, 10);
    
    if (isNaN(userId) || isNaN(batchId)) {
      res.status(400).json({ message: 'Invalid user ID or batch ID' });
      return;
    }
    
    await removeStudentBatch(userId, batchId);
    res.status(200).json({ message: 'Batch removed successfully' });
  } catch (error) {
    console.error('Error removing batch:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    await deleteStudent(userId);
    res.status(200).json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getStudentClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.studentId, 10);
    
    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    const userClassesData = await getUserClasses(userId);
   
    res.status(200).json(userClassesData);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
