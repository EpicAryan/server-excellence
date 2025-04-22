import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  hasPermission: boolean("has_permission").default(true).notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
