import  db  from '../config/db_connect';
import { board } from '../models';
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
