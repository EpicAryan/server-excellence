// class.model.ts
import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { board } from "./board.model";
import { subject } from "./subject.model";

export const classes = pgTable("class", {
  classId: serial("class_id").primaryKey(),
  className: varchar("class_name", { length: 255 }).notNull(),
  boardId: integer("board_id").notNull().references(() => board.boardId, { onDelete: "cascade" }),
});

// Class Relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  board: one(board, {
    fields: [classes.boardId],
    references: [board.boardId],
  }),
  subjects: many(subject),
}));
