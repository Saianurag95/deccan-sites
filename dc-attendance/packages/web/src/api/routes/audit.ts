import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin, authMiddleware } from "../middleware/auth";

export const audit = new Hono()
  .use("*", authMiddleware)
  .get("/", requireAdmin, async (c) => {
    const { employeeId, action } = c.req.query();
    let rows = await db.select().from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(200);

    if (employeeId) rows = rows.filter(r => r.employeeId === Number(employeeId));
    if (action) rows = rows.filter(r => r.action === action);

    return c.json({ logs: rows }, 200);
  });
