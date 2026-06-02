import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

export const holidays = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAuth, async (c) => {
    const { month, year } = c.req.query();
    let rows;
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      rows = await db.select().from(schema.holidays)
        .where(and(gte(schema.holidays.date, startDate), lte(schema.holidays.date, endDate)));
    } else {
      rows = await db.select().from(schema.holidays);
    }
    return c.json({ holidays: rows }, 200);
  })
  .post("/", requireAdmin, async (c) => {
    const body = await c.req.json();
    const { name, date, description, type } = body;
    const [row] = await db.insert(schema.holidays).values({ name, date, description, type }).returning();
    return c.json({ holiday: row }, 201);
  })
  .put("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { name, date, description, type } = body;
    const [row] = await db.update(schema.holidays)
      .set({ name, date, description, type })
      .where(eq(schema.holidays.id, id))
      .returning();
    return c.json({ holiday: row }, 200);
  })
  .delete("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(schema.holidays).where(eq(schema.holidays.id, id));
    return c.json({ message: "Deleted" }, 200);
  });
