
import { z } from 'zod';

export const boardSchema = z.object({
  boardId: z.number().optional(),
  boardName: z.string().min(1, "Board name is required"),
});

export const classSchema = z.object({
  classId: z.number().optional(),
  className: z.string().min(1, "Class name is required"),
  boardId: z.number(),
});

export const subjectSchema = z.object({
  subjectId: z.number().optional(),
  subjectName: z.string().min(1, "Subject name is required"),
  classId: z.number(),
});

export const chapterSchema = z.object({
  chapterId: z.number().optional(),
  chapterName: z.string().min(1, "Chapter name is required"),
  subjectId: z.number(),
});

export const topicSchema = z.object({
  topicId: z.number().optional(),
  topicName: z.string().min(1, "Topic name is required"),
  pdfUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  chapterId: z.number(),
});

export type Board = z.infer<typeof boardSchema>;
export type Class = z.infer<typeof classSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type TopicInput = z.infer<typeof topicSchema>;
