// services/student.service.ts
import db from "../config/db_connect";
import { users, classes, userClasses, board } from '../models';
import { eq, and, desc } from 'drizzle-orm';

export const getStudentsWithClasses = async () => {
  const students = await db.select({
    id: users.id,
    name: users.username,
    email: users.email,
    enrolledDate: users.createdAt,
    hasPermission: users.hasPermission,
  })
  .from(users)
  .where(eq(users.role, 'user'))
  .orderBy(desc(users.createdAt));

  // For each student, get their assigned classes/batches
  const studentsWithClasses = await Promise.all(
    students.map(async (student) => {
      const userClassesResult = await db.select({
        classId: classes.classId,
        className: classes.className,
        boardName: board.boardName, 
      })
      .from(userClasses)
      .innerJoin(classes, eq(userClasses.classId, classes.classId))
      .innerJoin(board , eq(classes.boardId , board.boardId))
      .where(eq(userClasses.userId, student.id));

      return {
        ...student,
        id: student.id.toString(),
        batches: userClassesResult.map(c => ({
          id: c.classId.toString(),
          name: c.className,
          boardName: c.boardName,
        })),
      };
    })
  );

  return studentsWithClasses;
};

export const updateStudentPermission = async (userId: number, hasPermission: boolean) => {
  return db.update(users)
    .set({ hasPermission })
    .where(eq(users.id, userId));
};

export const removeStudentBatch = async (userId: number, batchId: number) => {
  return db.delete(userClasses)
    .where(
      and(
        eq(userClasses.userId, userId),
        eq(userClasses.classId, batchId)
      )
    );
};

export const deleteStudent = async (userId: number) => {
  // First remove all user class associations
  await db.delete(userClasses)
    .where(eq(userClasses.userId, userId));
  
  // Then delete the user
  return db.delete(users)
    .where(eq(users.id, userId));
};
