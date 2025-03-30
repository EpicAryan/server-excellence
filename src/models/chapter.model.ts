// chapter.model.ts
import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { subject } from "./subject.model";
import { topic } from "./topic.model";

export const chapter = pgTable("chapter", {
  chapterId: serial("chapter_id").primaryKey(),
  chapterName: varchar("chapter_name", { length: 255 }).notNull(),
  subjectId: integer("subject_id").notNull().references(() => subject.subjectId, { onDelete: "cascade" }),
});

// Chapter Relations
export const chapterRelations = relations(chapter, ({ one, many }) => ({
  subject: one(subject, {
    fields: [chapter.subjectId],
    references: [subject.subjectId],
  }),
  topics: many(topic),
}));
