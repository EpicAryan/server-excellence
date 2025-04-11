import  db  from '../config/db_connect';
import { classes, subject } from '../models';
import { eq } from 'drizzle-orm';


export const findClassById = async (classId: number) => {
  return db.select().from(classes).where(eq(classes.classId, classId)).limit(1);
};

export const createSubject = async (subjectName: string, classId: number) => {
    return db.insert(subject).values({
      subjectName,
      classId
    }).returning();
}

export const getSubjectsByClass = async (classId: number) => {
  return db.select()
  .from(subject)
  .where(
      eq(subject.classId, classId)
    )
}
