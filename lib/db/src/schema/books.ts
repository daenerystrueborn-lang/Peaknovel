import { pgTable, serial, text, boolean, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  genre: text("genre").notNull(),
  synopsis: text("synopsis"),
  coverUrl: text("cover_url"),
  tags: text("tags").array().default([]),
  status: text("status").notNull().default("ongoing"),
  viewCount: integer("view_count").notNull().default(0),
  chapterCount: integer("chapter_count").notNull().default(0),
  rating: real("rating").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  isPremium: boolean("is_premium").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({
  id: true,
  viewCount: true,
  chapterCount: true,
  rating: true,
  ratingCount: true,
  isFeatured: true,
  isHidden: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
