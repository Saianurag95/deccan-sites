import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, gte } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

export const announcements = new Hono()
  .use("*", authMiddleware)

  // All authenticated users: list announcements (non-expired, newest first, pinned on top)
  .get("/", requireAuth, async (c) => {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db.select().from(schema.announcements)
      .orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.createdAt))
      .limit(50);
    // Filter out expired
    const active = rows.filter(a => !a.expiresAt || a.expiresAt >= today);
    return c.json({ announcements: active }, 200);
  })

  // Admin: create announcement
  .post("/", requireAdmin, async (c) => {
    const user = c.get("user") as any;
    const author = await getEmployeeByUserId(user.id);
    if (!author) return c.json({ message: "Author not found" }, 404);

    const body = await c.req.json();
    const { title, content, type, imageUrl, isPinned, expiresAt } = body;
    if (!title || !content) return c.json({ message: "title and content required" }, 400);

    const [row] = await db.insert(schema.announcements).values({
      title,
      content,
      type: type ?? "general",
      imageUrl: imageUrl ?? null,
      authorId: author.id,
      isPinned: isPinned ?? false,
      expiresAt: expiresAt ?? null,
    }).returning();

    await db.insert(schema.auditLogs).values({
      employeeId: author.id,
      action: "announcement_created",
      entityType: "announcement",
      entityId: String(row.id),
      details: JSON.stringify({ title }),
      ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
    });

    return c.json({ announcement: row }, 201);
  })

  // Admin: update announcement
  .put("/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const { title, content, type, imageUrl, isPinned, expiresAt } = body;

    const [row] = await db.update(schema.announcements)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isPinned !== undefined && { isPinned }),
        ...(expiresAt !== undefined && { expiresAt }),
        updatedAt: new Date(),
      })
      .where(eq(schema.announcements.id, id))
      .returning();

    if (!row) return c.json({ message: "Announcement not found" }, 404);
    return c.json({ announcement: row }, 200);
  })

  // Admin: delete announcement
  .delete("/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
    return c.json({ message: "Deleted" }, 200);
  });
