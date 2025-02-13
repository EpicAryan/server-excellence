import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.model";
import { notes } from "./note.model";

export const access = pgTable("access", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  noteId: integer("note_id").notNull().references(() => notes.id, { onDelete: "cascade" }),
  grantedAt: timestamp("granted_at").defaultNow(),
});

// Relations
export const accessRelations = relations(access, ({ one }) => ({
  student: one(users, {
    fields: [access.studentId],
    references: [users.id],
  }),
  note: one(notes, {
    fields: [access.noteId],
    references: [notes.id],
  }),
}));
