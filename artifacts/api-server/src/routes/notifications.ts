import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  res.json({
    notifications: notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      relatedBookId: n.relatedBookId ?? null,
      relatedChapterId: n.relatedChapterId ?? null,
      actorName: n.actorName ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
});

router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.session.userId!));
  res.json({ ok: true });
});

router.delete("/notifications/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db
    .delete(notificationsTable)
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.session.userId!)));
  res.status(204).send();
});

export default router;

export async function createNotification(opts: {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedBookId?: number;
  relatedChapterId?: number;
  actorName?: string;
}) {
  try {
    await db.insert(notificationsTable).values({
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      relatedBookId: opts.relatedBookId,
      relatedChapterId: opts.relatedChapterId,
      actorName: opts.actorName,
    });
  } catch (_) {}
}
