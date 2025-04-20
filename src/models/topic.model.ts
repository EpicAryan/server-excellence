// topic.model.ts
import { pgTable, serial, varchar, integer, boolean,timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { chapter } from "./chapter.model";

export const topic = pgTable("topic", {
  topicId: serial("topic_id").primaryKey(),
  topicName: varchar("topic_name", { length: 255 }).notNull(),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  chapterId: integer("chapter_id").notNull().references(() => chapter.chapterId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Topic Relations
export const topicRelations = relations(topic, ({ one }) => ({
  chapter: one(chapter, {
    fields: [topic.chapterId],
    references: [chapter.chapterId],
  }),
}));
