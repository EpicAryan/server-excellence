import  db  from '../config/db_connect';
import { topic, chapter, subject, classes, board } from '../models';
import { eq, and, or, ilike, SQL, sql, desc   } from 'drizzle-orm';
import { TopicInput } from '../schemas/course.schema'


export const findChapterById = async (chapterId: number) => {
  return db.select().from(chapter).where(eq(chapter.chapterId, chapterId)).limit(1);
};

export const createTopic = async (topicData: TopicInput) => {
  return db.insert(topic).values(topicData).returning();
};

export const getTopicsByChapterId = async (chapterId: number) => {
  return db.select().from(topic).where(eq(topic.chapterId, chapterId));
};

export const deleteTopic = async (topicId: number) => {
  return db.delete(topic).where(eq(topic.topicId, topicId)).returning();
};

export const updateTopic = async (topicId: number, topicData: Partial<TopicInput>) => {
  return db.update(topic)
    .set(topicData)
    .where(eq(topic.topicId, topicId))
    .returning();
};

export const getTopicById = async (topicId: number) => {
  return db.select().from(topic).where(eq(topic.topicId, topicId)).limit(1);
};

export const getTopicsFiltered = async (options: {
  search?: string;
  chapterId?: number;
  boardId?: number;
  classId?: number;
  subjectId?: number;
  page?: number;
  limit?: number;
}) => {
  const { search, chapterId, boardId, classId, subjectId, page = 1, limit = 3 } = options;

  // Start with a base condition that's always true
  const baseCondition = sql`1 = 1`;
  const conditions: SQL[] = [baseCondition];

  // Add filter conditions using SQL wrapper for type safety
  if (chapterId) conditions.push(sql`${eq(topic.chapterId, chapterId)}`);
  if (boardId) conditions.push(sql`${eq(board.boardId, boardId)}`);
  if (classId) conditions.push(sql`${eq(classes.classId, classId)}`);
  if (subjectId) conditions.push(sql`${eq(subject.subjectId, subjectId)}`);
  if (search) {
    conditions.push(
      sql`${or(
        ilike(topic.topicName, `%${search}%`),
        ilike(chapter.chapterName, `%${search}%`)
      )}`
    );
  }


  // Build main query with guaranteed WHERE clause
  const query = db
    .select({
      topicId: topic.topicId,
      topicName: topic.topicName,
      chapterId: topic.chapterId,
      pdfUrl: topic.pdfUrl,
      isActive: topic.isActive,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      chapterName: chapter.chapterName,
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      classId: classes.classId,
      className: classes.className,
      boardId: board.boardId,
      boardName: board.boardName
    })
    .from(topic)
    .leftJoin(chapter, eq(topic.chapterId, chapter.chapterId))
    .leftJoin(subject, eq(chapter.subjectId, subject.subjectId))
    .leftJoin(classes, eq(subject.classId, classes.classId))
    .leftJoin(board, eq(classes.boardId, board.boardId))
    .where(and(...conditions)) // Always applied
    .orderBy(desc(topic.updatedAt))
    .limit(limit)
    .offset((page - 1) * limit);

  // Build count query with same WHERE conditions
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(topic)
    .leftJoin(chapter, eq(topic.chapterId, chapter.chapterId))
    .leftJoin(subject, eq(chapter.subjectId, subject.subjectId))
    .leftJoin(classes, eq(subject.classId, classes.classId))
    .leftJoin(board, eq(classes.boardId, board.boardId))
    .where(and(...conditions)); // Always applied

  const [{ count }] = await countQuery;
  const results = await query;

  return {
    data: results,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

export const updateTopicStatusById = async (topicId: number, isActive: boolean) => {
  return db
    .update(topic)
    .set({ isActive })
    .where(eq(topic.topicId, topicId))
    .returning();
};
