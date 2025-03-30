// subject.model.ts
import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { classes } from "./class.model";
import { chapter } from "./chapter.model";

export const subject = pgTable("subject", {
  subjectId: serial("subject_id").primaryKey(),
  subjectName: varchar("subject_name", { length: 255 }).notNull(),
  classId: integer("class_id").notNull().references(() => classes.classId, { onDelete: "cascade" }),
});

// Subject Relations
export const subjectRelations = relations(subject, ({ one, many }) => ({
  class: one(classes, {
    fields: [subject.classId],
    references: [classes.classId],
  }),
  chapters: many(chapter),
}));
