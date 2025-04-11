import  db  from '../config/db_connect';
import { topic, chapter } from '../models';
import { eq } from 'drizzle-orm';
import { TopicInput } from '../schemas/course.schema'

export const findChapterById = async (chapterId: number) => {
  return db.select().from(chapter).where(eq(chapter.chapterId, chapterId)).limit(1);
};

// export const createTopic = async (topicName: string, chapterId: number, pdfUrl: string, isActive: boolean) => {
//   return db.insert(topic).values({ topicName, chapterId, pdfUrl, isActive }).returning();
// };

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
