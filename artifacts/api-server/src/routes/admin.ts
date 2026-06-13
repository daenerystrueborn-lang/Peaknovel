import { Router } from "express";
import { db, usersTable, booksTable, chaptersTable, commentsTable, subscriptionsTable } from "@workspace/db";
import { eq, ilike, and, sql, desc, inArray } from "drizzle-orm";
import { UpdateAdminUserBody, UpdateAdminBookBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { formatBook } from "./home";

const router = Router();

router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    userCount,
    bookCount,
    chapterCount,
    commentCount,
    premiumCount,
    revenueResult,
    newUsersToday,
    newBooksToday,
  ] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(usersTable),
    db.select({ count: sql<number>`COUNT(*)` }).from(booksTable),
    db.select({ count: sql<number>`COUNT(*)` }).from(chaptersTable),
    db.select({ count: sql<number>`COUNT(*)` }).from(commentsTable),
    db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(eq(usersTable.isPremium, true)),
    db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active")),
    db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(sql`created_at >= ${today}`),
    db.select({ count: sql<number>`COUNT(*)` }).from(booksTable).where(sql`created_at >= ${today}`),
  ]);

  res.json({
    totalUsers: Number(userCount[0]?.count ?? 0),
    totalBooks: Number(bookCount[0]?.count ?? 0),
    totalChapters: Number(chapterCount[0]?.count ?? 0),
    totalComments: Number(commentCount[0]?.count ?? 0),
    premiumUsers: Number(premiumCount[0]?.count ?? 0),
    totalRevenue: Number(revenueResult[0]?.total ?? 0),
    newUsersToday: Number(newUsersToday[0]?.count ?? 0),
    newBooksToday: Number(newBooksToday[0]?.count ?? 0),
  });
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (q) conditions.push(ilike(usersTable.username, `%${q}%`));

  const [users, countResult] = await Promise.all([
    db
      .select()
      .from(usersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(usersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isBanned: u.isBanned,
      isPremium: u.isPremium,
      bookCount: u.bookCount,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAdminUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.isBanned !== undefined) updates.isBanned = parsed.data.isBanned;
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;

  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

router.get("/admin/books", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (q) conditions.push(ilike(booksTable.title, `%${q}%`));

  const [books, countResult] = await Promise.all([
    db
      .select()
      .from(booksTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(booksTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(booksTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const authorIds = [...new Set(books.map(b => b.authorId))];
  const authors =
    authorIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds))
      : [];
  const authorMap = new Map(authors.map(a => [a.id, a]));

  const total = Number(countResult[0]?.count ?? 0);
  res.json({
    books: books.map(b => formatBook(b, authorMap.get(b.authorId))),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.patch("/admin/books/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAdminBookBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.isFeatured !== undefined) updates.isFeatured = parsed.data.isFeatured;
  if (parsed.data.isHidden !== undefined) updates.isHidden = parsed.data.isHidden;

  await db.update(booksTable).set(updates).where(eq(booksTable.id, id));
  res.json({ ok: true });
});

router.delete("/admin/books/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(booksTable).where(eq(booksTable.id, id));
  res.status(204).send();
});

export default router;
