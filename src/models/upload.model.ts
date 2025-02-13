import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.model";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // e.g., pdf, doc, image
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Relations
export const uploadsRelations = relations(uploads, ({ one }) => ({
  uploader: one(users, {
    fields: [uploads.uploadedBy],
    references: [users.id],
  }),
}));
