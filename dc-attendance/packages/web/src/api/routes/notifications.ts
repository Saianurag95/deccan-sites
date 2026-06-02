import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

export const notifications = new Hono()
  .use("*", authMiddleware)
  // Get my notifications
  .get("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ notifications: [] }, 200);

    const rows = await db.select().from(schema.notifications)
      .where(or(eq(schema.notifications.employeeId, emp.id), isNull(schema.notifications.employeeId)))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);

    return c.json({ notifications: rows }, 200);
  })
  // Mark read
  .put("/:id/read", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.id, id));
    return c.json({ message: "Marked as read" }, 200);
  })
  // Admin: broadcast notification
  .post("/broadcast", requireAdmin, async (c) => {
    const { title, message, type } = await c.req.json();
    const [row] = await db.insert(schema.notifications).values({ title, message, type: type ?? "info" }).returning();
    return c.json({ notification: row }, 201);
  });
