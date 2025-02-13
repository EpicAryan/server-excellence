import { pgTable, serial, integer, varchar,timestamp } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Expiration timestamp
  createdAt: timestamp('created_at').defaultNow(), // Creation timestamp
});
