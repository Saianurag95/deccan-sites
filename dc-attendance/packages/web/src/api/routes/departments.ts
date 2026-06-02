import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

export const departments = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const rows = await db.select().from(schema.departments);
    return c.json({ departments: rows }, 200);
  })
  .post("/", requireAdmin, async (c) => {
    const { name } = await c.req.json();
    const [dept] = await db.insert(schema.departments).values({ name }).returning();
    return c.json({ department: dept }, 201);
  })
  .put("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    const { name } = await c.req.json();
    const [dept] = await db.update(schema.departments).set({ name }).where(eq(schema.departments.id, id)).returning();
    return c.json({ department: dept }, 200);
  })
  .delete("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(schema.departments).where(eq(schema.departments.id, id));
    return c.json({ message: "Deleted" }, 200);
  });
