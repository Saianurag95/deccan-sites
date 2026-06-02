import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Define 2-hour slots (10:00–18:00)
const SLOTS = [
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
];

export const workUpdates = new Hono()
  .use("*", authMiddleware)
  // Get slots info for today
  .get("/slots", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ slots: SLOTS, submitted: [] }, 200);

    const today = todayStr();
    const submitted = await db.select().from(schema.workUpdates)
      .where(and(eq(schema.workUpdates.employeeId, emp.id), eq(schema.workUpdates.date, today)));

    const submittedSlots = submitted.map(s => s.slotStart);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const slotsWithStatus = SLOTS.map(slot => {
      const [sh, sm] = slot.end.split(":").map(Number);
      const slotEndPassed = currentHour > sh || (currentHour === sh && currentMin >= sm);
      const isSubmitted = submittedSlots.includes(slot.start);
      const update = submitted.find(s => s.slotStart === slot.start);
      return {
        ...slot,
        isSubmitted,
        isMissed: slotEndPassed && !isSubmitted,
        isDue: slotEndPassed && !isSubmitted,
        update: update ?? null,
      };
    });

    return c.json({ slots: slotsWithStatus, submitted }, 200);
  })
  // Submit a work update
  .post("/", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ message: "Employee not found" }, 404);

    const body = await c.req.json();
    const { slotStart, slotEnd, taskTitle, projectName, description, completionPct, currentStatus, challenges, notes, attachmentUrl } = body;

    const today = todayStr();

    // Check if already submitted for this slot
    const [existing] = await db.select().from(schema.workUpdates)
      .where(and(
        eq(schema.workUpdates.employeeId, emp.id),
        eq(schema.workUpdates.date, today),
        eq(schema.workUpdates.slotStart, slotStart)
      ));

    let row;
    if (existing) {
      [row] = await db.update(schema.workUpdates)
        .set({ taskTitle, projectName, description, completionPct, currentStatus, challenges, notes, ...(attachmentUrl !== undefined ? { attachmentUrl } : {}) })
        .where(eq(schema.workUpdates.id, existing.id))
        .returning();
    } else {
      [row] = await db.insert(schema.workUpdates).values({
        employeeId: emp.id,
        date: today,
        slotStart,
        slotEnd: slotEnd || slotStart.replace(/(\d+):00/, (_, h) => `${String(parseInt(h) + 2).padStart(2, "0")}:00`),
        taskTitle,
        projectName,
        description,
        completionPct,
        currentStatus,
        challenges,
        notes,
        attachmentUrl: attachmentUrl ?? null,
      }).returning();
    }

    await db.insert(schema.auditLogs).values({
      employeeId: emp.id,
      action: "work_update_submitted",
      entityType: "work_update",
      entityId: String(row.id),
      details: JSON.stringify({ slotStart, taskTitle }),
      ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
    });

    return c.json({ update: row }, 201);
  })
  // Get my updates
  .get("/my", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ updates: [] }, 200);

    const { date, month, year } = c.req.query();
    let rows;
    if (date) {
      rows = await db.select().from(schema.workUpdates)
        .where(and(eq(schema.workUpdates.employeeId, emp.id), eq(schema.workUpdates.date, date)))
        .orderBy(schema.workUpdates.slotStart);
    } else if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      rows = await db.select().from(schema.workUpdates)
        .where(and(
          eq(schema.workUpdates.employeeId, emp.id),
          gte(schema.workUpdates.date, startDate),
          lte(schema.workUpdates.date, endDate)
        ))
        .orderBy(desc(schema.workUpdates.date));
    } else {
      const today = todayStr();
      rows = await db.select().from(schema.workUpdates)
        .where(and(eq(schema.workUpdates.employeeId, emp.id), eq(schema.workUpdates.date, today)))
        .orderBy(schema.workUpdates.slotStart);
    }

    return c.json({ updates: rows }, 200);
  })
  // Admin: Get all updates
  .get("/all", requireAdmin, async (c) => {
    const { date, employeeId } = c.req.query();
    let rows;
    if (date) {
      rows = await db.select().from(schema.workUpdates).where(eq(schema.workUpdates.date, date)).orderBy(desc(schema.workUpdates.createdAt));
    } else {
      const today = todayStr();
      rows = await db.select().from(schema.workUpdates).where(eq(schema.workUpdates.date, today)).orderBy(desc(schema.workUpdates.createdAt));
    }
    if (employeeId) rows = rows.filter(r => r.employeeId === Number(employeeId));
    return c.json({ updates: rows }, 200);
  })
  // Admin: Missed updates summary
  .get("/missed/today", requireAdmin, async (c) => {
    const today = todayStr();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const allEmps = await db.select().from(schema.employees).where(eq(schema.employees.status, "active"));
    const todayUpdates = await db.select().from(schema.workUpdates).where(eq(schema.workUpdates.date, today));

    const passedSlots = SLOTS.filter(slot => {
      const [sh, sm] = slot.end.split(":").map(Number);
      return currentHour > sh || (currentHour === sh && currentMin >= sm);
    });

    const missedCount = allEmps.reduce((count, emp) => {
      const empUpdates = todayUpdates.filter(u => u.employeeId === emp.id);
      const submittedSlots = empUpdates.map(u => u.slotStart);
      const missed = passedSlots.filter(s => !submittedSlots.includes(s.start));
      return count + missed.length;
    }, 0);

    return c.json({ missedCount, passedSlotsCount: passedSlots.length, totalEmployees: allEmps.length }, 200);
  });
