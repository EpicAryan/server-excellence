import { pgTable, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import {users, classes} from "./index"

export const userClasses = pgTable("user_classes", {
    userId: integer("user_id").references(() => users.id).notNull(),
    classId: integer("class_id").references(() => classes.classId).notNull(),
    assignedAt: timestamp("assigned_at").defaultNow(),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.classId] }),
    };
  });

  export type UserClass = typeof userClasses.$inferSelect;
