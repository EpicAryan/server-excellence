import { pgTable, serial, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.model";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(), // UploadThing URL
  teacherId: integer("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isHidden: boolean("is_hidden").default(false), // Allow hiding notes
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const notesRelations = relations(notes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [notes.teacherId],
    references: [users.id],
  }),
}));
