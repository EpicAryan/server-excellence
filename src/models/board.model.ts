// board.model.ts
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { classes } from "./class.model";

export const board = pgTable("board", {
  boardId: serial("board_id").primaryKey(),
  boardName: varchar("board_name", { length: 255 }).notNull(),
});

// Board Relations
export const boardRelations = relations(board, ({ many }) => ({
  classes: many(classes),
}));
