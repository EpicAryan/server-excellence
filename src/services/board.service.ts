import  db  from '../config/db_connect';
import { board } from '../models';
import { eq } from 'drizzle-orm';

export const createBoard = async (boardName: string) => {
  return db.insert(board).values({ boardName }).returning();
};

export const getAllBoards = async () => {
  return db.select().from(board);
}
