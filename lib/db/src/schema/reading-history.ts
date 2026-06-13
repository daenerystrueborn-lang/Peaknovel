import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { booksTable } from "./books";
import { chaptersTable } from "./chapters";

export const readingHistoryTable = pgTable("reading_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  bookId: integer("book_id").notNull().references(() => booksTable.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").notNull().references(() => chaptersTable.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at").notNull().defaultNow(),
});

export type ReadingHistory = typeof readingHistoryTable.$inferSelect;
