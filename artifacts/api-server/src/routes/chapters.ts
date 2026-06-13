import { Router } from "express";
import { db, chaptersTable, booksTable, usersTable, readingHistoryTable } from "@workspace/db";
import { eq, asc, sql, and } from "drizzle-orm";
import { CreateChapterBody, UpdateChapterBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/books/:bookId/chapters", async (req, res) => {
  const bookId = parseInt(req.params.bookId, 10);
  if (isNaN(bookId)) { res.status(400).json({ error: "Invalid bookId" }); return; }

  const chapters = await db
    .select({
      id: chaptersTable.id,
      bookId: chaptersTable.bookId,
      title: chaptersTable.title,
      order: chaptersTable.order,
      isPremium: chaptersTable.isPremium,
      wordCount: chaptersTable.wordCount,
      createdAt: chaptersTable.createdAt,
    })
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, bookId))
    .orderBy(asc(chaptersTable.order));

  res.json(
    chapters.map(c => ({
      id: c.id,
      bookId: c.bookId,
      title: c.title,
      order: c.order,
      isPremium: c.isPremium,
      wordCount: c.wordCount,
      createdAt: c.createdAt.toISOString(),
    })),
  );
});

router.post("/books/:bookId/chapters", requireAuth, async (req, res) => {
  const bookId = parseInt(req.params.bookId, 10);
  if (isNaN(bookId)) { res.status(400).json({ error: "Invalid bookId" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId)).limit(1);
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }

  if (book.authorId !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = CreateChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { title, content, isPremium, order } = parsed.data;
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;

  const maxOrderResult = await db
    .select({ max: sql<number>`COALESCE(MAX("order"), 0)` })
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, bookId));

  const nextOrder = order ?? (Number(maxOrderResult[0]?.max ?? 0) + 1);

  const [chapter] = await db
    .insert(chaptersTable)
    .values({ bookId, title, content, isPremium: isPremium ?? false, order: nextOrder, wordCount })
    .returning();

  await db
    .update(booksTable)
    .set({ chapterCount: sql`${booksTable.chapterCount} + 1`, updatedAt: new Date() })
    .where(eq(booksTable.id, bookId));

  res.status(201).json({
    id: chapter.id,
    bookId: chapter.bookId,
    title: chapter.title,
    content: chapter.content,
    order: chapter.order,
    isPremium: chapter.isPremium,
    wordCount: chapter.wordCount,
    createdAt: chapter.createdAt.toISOString(),
    updatedAt: chapter.updatedAt.toISOString(),
  });
});

router.get("/chapters/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, id)).limit(1);
  if (!chapter) { res.status(404).json({ error: "Not found" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, chapter.bookId)).limit(1);
  const [author] = book
    ? await db.select().from(usersTable).where(eq(usersTable.id, book.authorId)).limit(1)
    : [undefined];

  if (chapter.isPremium) {
    const userId = req.session.userId;
    if (!userId) {
      res.status(403).json({ error: "Premium chapter — please log in and subscribe" });
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user?.isPremium && req.session.userRole !== "admin" && book?.authorId !== userId) {
      res.status(403).json({ error: "Premium subscription required" });
      return;
    }
  }

  const allChapters = await db
    .select({ id: chaptersTable.id, order: chaptersTable.order })
    .from(chaptersTable)
    .where(eq(chaptersTable.bookId, chapter.bookId))
    .orderBy(asc(chaptersTable.order));

  const idx = allChapters.findIndex(c => c.id === id);
  const prevChapterId = idx > 0 ? (allChapters[idx - 1]?.id ?? null) : null;
  const nextChapterId = idx < allChapters.length - 1 ? (allChapters[idx + 1]?.id ?? null) : null;

  if (req.session.userId && book) {
    await db
      .insert(readingHistoryTable)
      .values({ userId: req.session.userId, bookId: book.id, chapterId: id })
      .onConflictDoNothing();
  }

  res.json({
    id: chapter.id,
    bookId: chapter.bookId,
    bookTitle: book?.title ?? "",
    authorId: book?.authorId ?? 0,
    authorName: author?.username ?? "",
    title: chapter.title,
    content: chapter.content ?? "",
    order: chapter.order,
    isPremium: chapter.isPremium,
    wordCount: chapter.wordCount,
    prevChapterId,
    nextChapterId,
    createdAt: chapter.createdAt.toISOString(),
  });
});

router.patch("/chapters/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, id)).limit(1);
  if (!chapter) { res.status(404).json({ error: "Not found" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, chapter.bookId)).limit(1);
  if (!book || (book.authorId !== req.session.userId && req.session.userRole !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = UpdateChapterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.content !== undefined) {
    updates.wordCount = parsed.data.content.split(/\s+/).filter(Boolean).length;
  }

  const [updated] = await db
    .update(chaptersTable)
    .set(updates)
    .where(eq(chaptersTable.id, id))
    .returning();

  res.json({
    id: updated.id,
    bookId: updated.bookId,
    title: updated.title,
    content: updated.content,
    order: updated.order,
    isPremium: updated.isPremium,
    wordCount: updated.wordCount,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.delete("/chapters/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, id)).limit(1);
  if (!chapter) { res.status(404).json({ error: "Not found" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, chapter.bookId)).limit(1);
  if (!book || (book.authorId !== req.session.userId && req.session.userRole !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(chaptersTable).where(eq(chaptersTable.id, id));
  await db
    .update(booksTable)
    .set({
      chapterCount: sql`GREATEST(${booksTable.chapterCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(booksTable.id, chapter.bookId));

  res.status(204).send();
});

export default router;
