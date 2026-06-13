import { Router } from "express";
import { db, booksTable, usersTable } from "@workspace/db";
import { desc, eq, sql, and, inArray } from "drizzle-orm";

const router = Router();

const GENRES = [
  "Fantasy", "Romance", "Action", "Sci-Fi", "Horror", "Mystery",
  "Martial Arts", "Xianxia", "System", "Isekai", "Slice of Life", "Comedy",
];

function formatBook(book: typeof booksTable.$inferSelect, author?: typeof usersTable.$inferSelect) {
  return {
    id: book.id,
    title: book.title,
    authorId: book.authorId,
    authorName: author?.username ?? "",
    authorAvatar: author?.avatar ?? null,
    genre: book.genre,
    tags: book.tags ?? [],
    synopsis: book.synopsis ?? null,
    coverUrl: book.coverUrl ?? null,
    status: book.status,
    viewCount: book.viewCount,
    chapterCount: book.chapterCount,
    rating: book.rating,
    ratingCount: book.ratingCount,
    isPremium: book.isPremium,
    isFeatured: book.isFeatured,
    isBookmarked: null,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
  };
}

router.get("/home", async (req, res) => {
  const visible = and(eq(booksTable.isHidden, false));

  const [trending, topRanked, newReleases, featuredBooks] = await Promise.all([
    db
      .select()
      .from(booksTable)
      .where(visible)
      .orderBy(desc(booksTable.viewCount))
      .limit(10),
    db
      .select()
      .from(booksTable)
      .where(visible)
      .orderBy(desc(booksTable.rating))
      .limit(10),
    db
      .select()
      .from(booksTable)
      .where(visible)
      .orderBy(desc(booksTable.createdAt))
      .limit(10),
    db
      .select()
      .from(booksTable)
      .where(and(visible, eq(booksTable.isFeatured, true)))
      .orderBy(desc(booksTable.viewCount))
      .limit(6),
  ]);

  const allBooks = [...new Map([...trending, ...topRanked, ...newReleases, ...featuredBooks].map(b => [b.id, b])).values()];
  const authorIds = [...new Set(allBooks.map(b => b.authorId))];

  const authors =
    authorIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds))
      : [];

  const authorMap = new Map(authors.map(a => [a.id, a]));

  const topAuthors = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.isBanned, false))
    .orderBy(desc(usersTable.followerCount))
    .limit(6);

  res.json({
    trending: trending.map(b => formatBook(b, authorMap.get(b.authorId))),
    topRanked: topRanked.map(b => formatBook(b, authorMap.get(b.authorId))),
    newReleases: newReleases.map(b => formatBook(b, authorMap.get(b.authorId))),
    featuredBooks: featuredBooks.map(b => formatBook(b, authorMap.get(b.authorId))),
    topAuthors: topAuthors.map(a => ({
      id: a.id,
      username: a.username,
      avatar: a.avatar ?? null,
      bio: a.bio ?? null,
      followerCount: a.followerCount,
      bookCount: a.bookCount,
    })),
    genres: GENRES,
  });
});

export default router;
export { formatBook };
