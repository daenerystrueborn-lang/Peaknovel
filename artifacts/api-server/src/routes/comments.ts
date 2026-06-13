import { Router } from "express";
import { db, commentsTable, commentLikesTable, usersTable, chaptersTable, booksTable } from "@workspace/db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { CreateCommentBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { containsProfanity, filterProfanity } from "../lib/profanity";
import { createNotification } from "./notifications";

const router = Router();

router.get("/chapters/:chapterId/comments", async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  if (isNaN(chapterId)) { res.status(400).json({ error: "Invalid chapterId" }); return; }

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.chapterId, chapterId))
    .orderBy(desc(commentsTable.createdAt))
    .limit(100);

  const userIds = [...new Set(comments.map(c => c.userId))];
  const users =
    userIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, userIds))
      : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  const userId = req.session.userId;
  let likedSet = new Set<number>();
  if (userId) {
    const likes = await db
      .select({ commentId: commentLikesTable.commentId })
      .from(commentLikesTable)
      .where(eq(commentLikesTable.userId, userId));
    likedSet = new Set(likes.map(l => l.commentId));
  }

  res.json(
    comments.map(c => {
      const user = userMap.get(c.userId);
      return {
        id: c.id,
        chapterId: c.chapterId,
        userId: c.userId,
        username: user?.username ?? "Unknown",
        userAvatar: user?.avatar ?? null,
        content: c.content,
        likeCount: c.likes,
        isLiked: userId ? likedSet.has(c.id) : null,
        createdAt: c.createdAt.toISOString(),
      };
    }),
  );
});

router.post("/chapters/:chapterId/comments", requireAuth, async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  if (isNaN(chapterId)) { res.status(400).json({ error: "Invalid chapterId" }); return; }

  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const content = filterProfanity(parsed.data.content);

  const [comment] = await db
    .insert(commentsTable)
    .values({ chapterId, userId: req.session.userId!, content })
    .returning();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!))
    .limit(1);

  res.status(201).json({
    id: comment.id,
    chapterId: comment.chapterId,
    userId: comment.userId,
    username: user?.username ?? "Unknown",
    userAvatar: user?.avatar ?? null,
    content: comment.content,
    likeCount: comment.likes,
    isLiked: false,
    createdAt: comment.createdAt.toISOString(),
  });

  setImmediate(async () => {
    try {
      const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, chapterId)).limit(1);
      if (!chapter) return;
      const [book] = await db.select().from(booksTable).where(eq(booksTable.id, chapter.bookId)).limit(1);
      if (!book || book.authorId === req.session.userId) return;
      await createNotification({
        userId: book.authorId,
        type: "comment",
        title: "New comment on your chapter",
        message: `${user?.username ?? "Someone"} commented on "${chapter.title}"`,
        relatedBookId: book.id,
        relatedChapterId: chapterId,
        actorName: user?.username ?? "Someone",
      });
    } catch (_) {}
  });
});

router.delete("/comments/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, id)).limit(1);
  if (!comment) { res.status(404).json({ error: "Not found" }); return; }

  if (comment.userId !== req.session.userId && req.session.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, id));
  res.status(204).send();
});

router.post("/comments/:id/like", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = req.session.userId!;
  const [existing] = await db
    .select()
    .from(commentLikesTable)
    .where(and(eq(commentLikesTable.commentId, id), eq(commentLikesTable.userId, userId)))
    .limit(1);

  if (existing) {
    await db.delete(commentLikesTable).where(eq(commentLikesTable.id, existing.id));
    await db
      .update(commentsTable)
      .set({ likes: sql`GREATEST(${commentsTable.likes} - 1, 0)` })
      .where(eq(commentsTable.id, id));
    res.json({ liked: false });
  } else {
    await db.insert(commentLikesTable).values({ commentId: id, userId });
    await db
      .update(commentsTable)
      .set({ likes: sql`${commentsTable.likes} + 1` })
      .where(eq(commentsTable.id, id));
    res.json({ liked: true });
  }
});

export default router;
