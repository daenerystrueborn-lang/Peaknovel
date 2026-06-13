import { Router } from "express";
import { db, booksTable, usersTable, bookmarksTable, ratingsTable, chaptersTable } from "@workspace/db";
import { eq, desc, asc, ilike, and, sql, inArray } from "drizzle-orm";
import { CreateBookBody, UpdateBookBody, RateBookBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { formatBook } from "./home";
import { createNotification } from "./notifications";

const router = Router();

router.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const genre = typeof req.query.genre === "string" ? req.query.genre : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "trending";
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(booksTable.isHidden, false)];
  if (q) conditions.push(ilike(booksTable.title, `%${q}%`));
  if (genre) conditions.push(eq(booksTable.genre, genre));
  if (status) conditions.push(eq(booksTable.status, status));

  const orderBy =
    sort === "rating"
      ? desc(booksTable.rating)
      : sort === "new"
        ? desc(booksTable.createdAt)
        : desc(booksTable.viewCount);

  const books = await db
    .select()
    .from(booksTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const authorIds = [...new Set(books.map(b => b.authorId))];
  const authors =
    authorIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds))
      : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  let matchingAuthors: typeof usersTable.$inferSelect[] = [];
  if (q) {
    matchingAuthors = await db
      .select()
      .from(usersTable)
      .where(and(ilike(usersTable.username, `%${q}%`), eq(usersTable.isBanned, false)))
      .limit(5);
  }

  res.json({
    books: books.map(b => formatBook(b, authorMap.get(b.authorId))),
    authors: matchingAuthors.map(a => ({
      id: a.id,
      username: a.username,
      avatar: a.avatar ?? null,
      bio: a.bio ?? null,
      followerCount: a.followerCount,
      bookCount: a.bookCount,
    })),
    total: books.length,
  });
});

router.get("/books", async (req, res) => {
  const genre = typeof req.query.genre === "string" ? req.query.genre : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "trending";
  const authorId = req.query.authorId ? parseInt(String(req.query.authorId), 10) : null;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(booksTable.isHidden, false)];
  if (genre) conditions.push(eq(booksTable.genre, genre));
  if (status) conditions.push(eq(booksTable.status, status));
  if (authorId) conditions.push(eq(booksTable.authorId, authorId));

  const orderBy =
    sort === "rating"
      ? desc(booksTable.rating)
      : sort === "new"
        ? desc(booksTable.createdAt)
        : desc(booksTable.viewCount);

  const [books, countResult] = await Promise.all([
    db
      .select()
      .from(booksTable)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(booksTable)
      .where(and(...conditions)),
  ]);

  const authorIds = [...new Set(books.map(b => b.authorId))];
  const authors =
    authorIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds))
      : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  const userId = req.session.userId;
  let bookmarkSet = new Set<number>();
  if (userId) {
    const bookmarks = await db
      .select({ bookId: bookmarksTable.bookId })
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, userId));
    bookmarkSet = new Set(bookmarks.map(b => b.bookId));
  }

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  res.json({
    books: books.map(b => ({
      ...formatBook(b, authorMap.get(b.authorId)),
      isBookmarked: userId ? bookmarkSet.has(b.id) : null,
    })),
    total,
    page,
    totalPages,
  });
});

router.post("/books", requireAuth, async (req, res) => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { title, genre, synopsis, coverUrl, tags, status, isPremium } = parsed.data;

  const [book] = await db
    .insert(booksTable)
    .values({
      title,
      genre,
      synopsis,
      coverUrl,
      tags: tags ?? [],
      status: status ?? "ongoing",
      isPremium: isPremium ?? false,
      authorId: req.session.userId!,
    })
    .returning();

  await db
    .update(usersTable)
    .set({ bookCount: sql`${usersTable.bookCount} + 1` })
    .where(eq(usersTable.id, req.session.userId!));

  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, book.authorId))
    .limit(1);

  res.status(201).json(formatBook(book, author));
});

router.get("/books/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id)).limit(1);
  if (!book || book.isHidden) { res.status(404).json({ error: "Not found" }); return; }

  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, book.authorId)).limit(1);
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
    .where(eq(chaptersTable.bookId, id))
    .orderBy(asc(chaptersTable.order));

  const userId = req.session.userId;
  let isBookmarked: boolean | null = null;
  let userRating: number | null = null;
  let isFollowingAuthor: boolean | null = null;

  if (userId) {
    const [bm] = await db
      .select()
      .from(bookmarksTable)
      .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.bookId, id)))
      .limit(1);
    isBookmarked = !!bm;

    const [rating] = await db
      .select()
      .from(ratingsTable)
      .where(and(eq(ratingsTable.userId, userId), eq(ratingsTable.bookId, id)))
      .limit(1);
    userRating = rating?.score ?? null;

    if (author) {
      const [follow] = await db
        .select()
        .from(usersTable)
        .where(sql`EXISTS (SELECT 1 FROM follows WHERE follower_id = ${userId} AND following_id = ${author.id})`)
        .limit(1);
      isFollowingAuthor = !!follow;
    }
  }

  await db
    .update(booksTable)
    .set({ viewCount: sql`${booksTable.viewCount} + 1` })
    .where(eq(booksTable.id, id));

  res.json({
    ...formatBook(book, author),
    authorBio: author?.bio ?? null,
    authorFollowers: author?.followerCount ?? 0,
    isBookmarked,
    userRating,
    isFollowingAuthor,
    chapters: chapters.map(c => ({
      id: c.id,
      bookId: c.bookId,
      title: c.title,
      order: c.order,
      isPremium: c.isPremium,
      wordCount: c.wordCount,
      createdAt: c.createdAt.toISOString(),
    })),
  });
});

router.patch("/books/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id)).limit(1);
  if (!book) { res.status(404).json({ error: "Not found" }); return; }

  if (book.authorId !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = UpdateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db
    .update(booksTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(booksTable.id, id))
    .returning();

  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, updated.authorId)).limit(1);
  res.json(formatBook(updated, author));
});

router.delete("/books/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id)).limit(1);
  if (!book) { res.status(404).json({ error: "Not found" }); return; }

  if (book.authorId !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(booksTable).where(eq(booksTable.id, id));
  await db
    .update(usersTable)
    .set({ bookCount: sql`GREATEST(${usersTable.bookCount} - 1, 0)` })
    .where(eq(usersTable.id, book.authorId));

  res.status(204).send();
});

router.post("/books/:id/rate", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = RateBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const userId = req.session.userId!;
  const [existing] = await db
    .select()
    .from(ratingsTable)
    .where(and(eq(ratingsTable.userId, userId), eq(ratingsTable.bookId, id)))
    .limit(1);

  if (existing) {
    await db
      .update(ratingsTable)
      .set({ score: parsed.data.score, updatedAt: new Date() })
      .where(eq(ratingsTable.id, existing.id));
  } else {
    await db.insert(ratingsTable).values({ bookId: id, userId, score: parsed.data.score });
  }

  const [avgResult] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(score), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.bookId, id));

  await db
    .update(booksTable)
    .set({
      rating: parseFloat(String(avgResult?.avg ?? 0)),
      ratingCount: Number(avgResult?.count ?? 0),
    })
    .where(eq(booksTable.id, id));

  res.json({ ok: true });
});

router.post("/books/:id/bookmark", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = req.session.userId!;
  const [existing] = await db
    .select()
    .from(bookmarksTable)
    .where(and(eq(bookmarksTable.userId, userId), eq(bookmarksTable.bookId, id)))
    .limit(1);

  if (existing) {
    await db.delete(bookmarksTable).where(eq(bookmarksTable.id, existing.id));
    res.json({ bookmarked: false });
  } else {
    await db.insert(bookmarksTable).values({ userId, bookId: id });
    res.json({ bookmarked: true });

    setImmediate(async () => {
      try {
        const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id)).limit(1);
        if (!book || book.authorId === userId) return;
        const [reader] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await createNotification({
          userId: book.authorId,
          type: "bookmark",
          title: "New bookmark",
          message: `${reader?.username ?? "Someone"} bookmarked "${book.title}"`,
          relatedBookId: id,
          actorName: reader?.username,
        });
      } catch (_) {}
    });
  }
});

export default router;
