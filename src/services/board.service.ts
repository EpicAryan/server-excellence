import  db  from '../config/db_connect';
import { board, chapter, classes, subject } from '../models';
import { eq } from 'drizzle-orm';

export const createBoard = async (boardName: string) => {
  return db.insert(board).values({ boardName }).returning();
};

export const getAllBoards = async () => {
  return db.select().from(board);
}

export const deleteBoard = async (boardId: number) => {
  return db.delete(board).where(eq(board.boardId, boardId));
};

export const updateBoardInDB  = async (boardId: number, boardName: string) => {
  return db
    .update(board)
    .set({ boardName })
    .where(eq(board.boardId, boardId))
    .returning();
};

export const getBoardWithHierarchy = async (boardId?: number) => {
  const boards = await db.select().from(board);
  
  const filteredBoards = boardId ? boards.filter(b => b.boardId === boardId) : boards;
  
  const result = await Promise.all(filteredBoards.map(async (b) => {
    const boardClasses = await db.select().from(classes).where(eq(classes.boardId, b.boardId));
    
    const classesWithSubjects = await Promise.all(boardClasses.map(async (c) => {
      const classSubjects = await db.select().from(subject).where(eq(subject.classId, c.classId));
      const subjectsWithChapters = await Promise.all(classSubjects.map(async (s) => {
        const subjectChapters = await db.select().from(chapter).where(eq(chapter.subjectId, s.subjectId));
        
        return {
          ...s,
          chapters: subjectChapters
        };
      }));
      
      return {
        ...c,
        subjects: subjectsWithChapters
      };
    }));
    
    return {
      ...b,
      classes: classesWithSubjects
    };
  }));
  
  return result;
};
