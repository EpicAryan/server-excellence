// services/student.service.ts
import { Chapter, ClassObj, Subject } from "../@types/types";
import db from "../config/db_connect";
import { users, classes, userClasses, board, subject, chapter, topic } from '../models';
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


export const getUserClasses = async (userId: number) => {
  const userClassesResult = await db.select({
    classId: userClasses.classId,
  })
    .from(userClasses)
    .where(eq(userClasses.userId, userId));
  
  if (userClassesResult.length === 0) {
    return [];
  }
  
  const classIds = userClassesResult.map(c => c.classId);
  
  const result = [];
  
  for (const classId of classIds) {
    const classData = await db.select({
      classId: classes.classId,
      className: classes.className,
      boardId: classes.boardId,
      boardName: board.boardName,
    })
      .from(classes)
      .innerJoin(board, eq(classes.boardId, board.boardId))
      .where(eq(classes.classId, classId))
      .limit(1);
    
    if (classData.length === 0) continue;
    
    const subjects = await db.select({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
    })
      .from(subject)
      .where(eq(subject.classId, classId));
    
    const classObj: ClassObj = {
      classId: classData[0].classId,
      className: classData[0].className,
      board: {
        boardId: classData[0].boardId,
        boardName: classData[0].boardName,
      },
      subjects: [],
    };
    

    for (const subjectItem of subjects) {
      const chapters = await db.select({
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
      })
        .from(chapter)
        .where(eq(chapter.subjectId, subjectItem.subjectId));
      
      const subjectObj: Subject  = {
        subjectId: subjectItem.subjectId,
        subjectName: subjectItem.subjectName,
        chapters: [],
      };

      for (const chapterItem of chapters) {
        const topics = await db.select({
          topicId: topic.topicId,
          topicName: topic.topicName,
          pdfUrl: topic.pdfUrl,
          isActive: topic.isActive,
        })
          .from(topic)
          .where(eq(topic.chapterId, chapterItem.chapterId));
        
        const chapterObj: Chapter = {
          chapterId: chapterItem.chapterId,
          chapterName: chapterItem.chapterName,
          topics: topics,
        };
        
        subjectObj.chapters.push(chapterObj);
      }
      
      classObj.subjects.push(subjectObj);
    }
    
    result.push(classObj);
  }
  
  return result;
};
