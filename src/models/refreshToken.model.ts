import { pgTable, serial, integer, varchar,timestamp, text } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 1000 }).notNull(),
  sessionId: text('session_id').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(), // Expiration timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(), // Creation timestamp
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
