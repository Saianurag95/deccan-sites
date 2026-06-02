import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

export const tasks = new Hono()
  .use("*", authMiddleware)

  // Admin: get all tasks
  .get("/all", requireAdmin, async (c) => {
    const { status, priority, assignedTo } = c.req.query();
    let rows = await db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt));
    if (status) rows = rows.filter(r => r.status === status);
    if (priority) rows = rows.filter(r => r.priority === priority);
    if (assignedTo) rows = rows.filter(r => r.assignedTo === Number(assignedTo));
    return c.json({ tasks: rows }, 200);
  })

  // Admin: create task
  .post("/", requireAdmin, async (c) => {
    const user = c.get("user") as any;
    const admin = await getEmployeeByUserId(user.id);
    if (!admin) return c.json({ message: "Admin employee not found" }, 404);

    const body = await c.req.json();
    const { title, description, assignedTo, projectName, priority, dueDate, notes } = body;
    if (!title || !assignedTo) return c.json({ message: "title and assignedTo required" }, 400);

    const [row] = await db.insert(schema.tasks).values({
      title,
      description: description ?? null,
      assignedTo: Number(assignedTo),
      assignedBy: admin.id,
      projectName: projectName ?? null,
      priority: priority ?? "medium",
      status: "pending",
      progress: 0,
      dueDate: dueDate ?? null,
      notes: notes ?? null,
    }).returning();

    await db.insert(schema.auditLogs).values({
      employeeId: admin.id,
      action: "task_created",
      entityType: "task",
      entityId: String(row.id),
      details: JSON.stringify({ title, assignedTo }),
      ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
    });

    // Notify assigned employee
    await db.insert(schema.notifications).values({
      employeeId: Number(assignedTo),
      title: "New Task Assigned",
      message: `You have been assigned a new task: "${title}"`,
      type: "info",
    });

    return c.json({ task: row }, 201);
  })

  // Admin: update task
  .put("/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const { title, description, assignedTo, projectName, priority, status, progress, dueDate, notes } = body;

    const [row] = await db.update(schema.tasks)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo && { assignedTo: Number(assignedTo) }),
        ...(projectName !== undefined && { projectName }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(dueDate !== undefined && { dueDate }),
        ...(notes !== undefined && { notes }),
        ...(status === "completed" && { completedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    if (!row) return c.json({ message: "Task not found" }, 404);
    return c.json({ task: row }, 200);
  })

  // Admin: delete task
  .delete("/:id", requireAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return c.json({ message: "Deleted" }, 200);
  })

  // Employee: get my tasks
  .get("/my", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ tasks: [] }, 200);

    const { status } = c.req.query();
    let rows = await db.select().from(schema.tasks)
      .where(eq(schema.tasks.assignedTo, emp.id))
      .orderBy(desc(schema.tasks.createdAt));
    if (status) rows = rows.filter(r => r.status === status);
    return c.json({ tasks: rows }, 200);
  })

  // Employee: update task progress/status
  .patch("/:id/progress", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ message: "Employee not found" }, 404);

    const id = Number(c.req.param("id"));
    const { progress, status, notes } = await c.req.json();

    const [existing] = await db.select().from(schema.tasks).where(
      and(eq(schema.tasks.id, id), eq(schema.tasks.assignedTo, emp.id))
    );
    if (!existing) return c.json({ message: "Task not found or not assigned to you" }, 404);

    const [row] = await db.update(schema.tasks)
      .set({
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === "completed" && { completedAt: new Date().toISOString() }),
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    return c.json({ task: row }, 200);
  });
