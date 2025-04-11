import  db  from '../config/db_connect';
import { subject, chapter } from '../models';
import { eq } from 'drizzle-orm';

export const findSubjectById = async (subjectId: number) => {
  return db.select().from(subject).where(eq(subject.subjectId, subjectId)).limit(1);
};

export const createChapter = async (chapterName: string, subjectId: number) => {
  return db.insert(chapter).values({ chapterName, subjectId }).returning();
};

export const getChaptersBySubject = async (subjectId: number) => {
  return db.select()
  .from(chapter)
  .where(
      eq(chapter.subjectId, subjectId),
    )
}
