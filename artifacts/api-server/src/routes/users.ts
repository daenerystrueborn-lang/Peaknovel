import { Router } from "express";
import { db, usersTable, booksTable, bookmarksTable, followsTable, readingHistoryTable, chaptersTable } from "@workspace/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { UpdateMeBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { formatBook } from "./home";
import { createNotification } from "./notifications";

const router = Router();

router.patch("/users/me", requireAuth, async (req, res) => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.username !== undefined) updates.username = parsed.data.username;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.avatar !== undefined) updates.avatar = parsed.data.avatar;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.session.userId!))
    .returning();

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    isPremium: user.isPremium,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    bookCount: user.bookCount,
    createdAt: user.createdAt.toISOString(),
  });
});

router.get("/users/me/library", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const bookmarks = await db
    .select()
    .from(bookmarksTable)
    .where(eq(bookmarksTable.userId, userId))
    .orderBy(desc(bookmarksTable.createdAt));

  if (bookmarks.length === 0) { res.json([]); return; }

  const bookIds = bookmarks.map(b => b.bookId);
  const books = await db.select().from(booksTable).where(inArray(booksTable.id, bookIds));

  const authorIds = [...new Set(books.map(b => b.authorId))];
  const authors =
    authorIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds))
      : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  res.json(books.map(b => ({ ...formatBook(b, authorMap.get(b.authorId)), isBookmarked: true })));
});

router.get("/users/me/reading-history", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const history = await db
    .select()
    .from(readingHistoryTable)
    .where(eq(readingHistoryTable.userId, userId))
    .orderBy(desc(readingHistoryTable.readAt))
    .limit(50);

  if (history.length === 0) { res.json([]); return; }

  const bookIds = [...new Set(history.map(h => h.bookId))];
  const chapterIds = [...new Set(history.map(h => h.chapterId))];

  const [books, chapters] = await Promise.all([
    db.select().from(booksTable).where(inArray(booksTable.id, bookIds)),
    db.select().from(chaptersTable).where(inArray(chaptersTable.id, chapterIds)),
  ]);

  const bookMap = new Map(books.map(b => [b.id, b]));
  const chapterMap = new Map(chapters.map(c => [c.id, c]));

  res.json(
    history.map(h => {
      const book = bookMap.get(h.bookId);
      const chapter = chapterMap.get(h.chapterId);
      return {
        bookId: h.bookId,
        bookTitle: book?.title ?? "",
        coverUrl: book?.coverUrl ?? null,
        chapterId: h.chapterId,
        chapterTitle: chapter?.title ?? "",
        readAt: h.readAt.toISOString(),
      };
    }),
  );
});

router.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user || user.isBanned) { res.status(404).json({ error: "Not found" }); return; }

  const books = await db
    .select()
    .from(booksTable)
    .where(and(eq(booksTable.authorId, id), eq(booksTable.isHidden, false)))
    .orderBy(desc(booksTable.viewCount))
    .limit(20);

  let isFollowing: boolean | null = null;
  const viewerId = req.session.userId;
  if (viewerId && viewerId !== id) {
    const [follow] = await db
      .select()
      .from(followsTable)
      .where(and(eq(followsTable.followerId, viewerId), eq(followsTable.followingId, id)))
      .limit(1);
    isFollowing = !!follow;
  }

  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    isPremium: user.isPremium,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    bookCount: user.bookCount,
    books: books.map(b => formatBook(b, user)),
    isFollowing,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const followerId = req.session.userId!;
  if (followerId === id) { res.status(400).json({ error: "Cannot follow yourself" }); return; }

  const [existing] = await db
    .select()
    .from(followsTable)
    .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, id)))
    .limit(1);

  if (existing) { res.json({ following: true }); return; }

  await db.insert(followsTable).values({ followerId, followingId: id });
  await db
    .update(usersTable)
    .set({ followerCount: sql`${usersTable.followerCount} + 1` })
    .where(eq(usersTable.id, id));
  await db
    .update(usersTable)
    .set({ followingCount: sql`${usersTable.followingCount} + 1` })
    .where(eq(usersTable.id, followerId));

  res.json({ following: true });

  setImmediate(async () => {
    try {
      const [follower] = await db.select().from(usersTable).where(eq(usersTable.id, followerId)).limit(1);
      await createNotification({
        userId: id,
        type: "follow",
        title: "New follower",
        message: `${follower?.username ?? "Someone"} started following you`,
        actorName: follower?.username,
      });
    } catch (_) {}
  });
});

router.delete("/users/:id/follow", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const followerId = req.session.userId!;
  const [existing] = await db
    .select()
    .from(followsTable)
    .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, id)))
    .limit(1);

  if (!existing) { res.json({ following: false }); return; }

  await db.delete(followsTable).where(eq(followsTable.id, existing.id));
  await db
    .update(usersTable)
    .set({ followerCount: sql`GREATEST(${usersTable.followerCount} - 1, 0)` })
    .where(eq(usersTable.id, id));
  await db
    .update(usersTable)
    .set({ followingCount: sql`GREATEST(${usersTable.followingCount} - 1, 0)` })
    .where(eq(usersTable.id, followerId));

  res.json({ following: false });
});

export default router;
