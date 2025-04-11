import  db  from '../config/db_connect';
import { board, classes } from '../models';
import { eq } from 'drizzle-orm';

export const findBoardById = async (boardId: number) => {
  return db.select().from(board).where(eq(board.boardId, boardId)).limit(1);
};

export const createClass = async (className: string, boardId: number) => {
  return db.insert(classes).values({ className, boardId }).returning();
};

export const getClassesByBoard = async (boardId: number) => {
  return db.select()
  .from(classes)
  .where(
      eq(classes.boardId, boardId),
    )
}
