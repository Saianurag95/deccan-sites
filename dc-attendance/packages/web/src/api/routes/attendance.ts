import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function calcHours(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round((diff / 1000 / 60 / 60) * 100) / 100;
}

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

async function isHoliday(date: string): Promise<boolean> {
  const d = new Date(date);
  if (d.getDay() === 0) return true; // Sunday
  const [holiday] = await db.select().from(schema.holidays).where(eq(schema.holidays.date, date));
  return !!holiday;
}

export const attendance = new Hono()
  .use("*", authMiddleware)
  // Check-in
  .post("/checkin", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ message: "Employee not found" }, 404);

    const today = todayStr();
    if (await isHoliday(today)) return c.json({ message: "Cannot check in on a holiday" }, 400);

    // Check existing
    const [existing] = await db.select().from(schema.attendance)
      .where(and(eq(schema.attendance.employeeId, emp.id), eq(schema.attendance.date, today)));

    if (existing?.checkIn) return c.json({ message: "Already checked in today", attendance: existing }, 200);

    const now = new Date().toISOString();
    // Determine status: check-in after 10:30 = late
    const hour = new Date().getHours();
    const min = new Date().getMinutes();
    const isLate = hour > 10 || (hour === 10 && min > 30);

    let row;
    if (existing) {
      [row] = await db.update(schema.attendance)
        .set({ checkIn: now, status: isLate ? "late" : "present" })
        .where(eq(schema.attendance.id, existing.id))
        .returning();
    } else {
      [row] = await db.insert(schema.attendance).values({
        employeeId: emp.id,
        date: today,
        checkIn: now,
        status: isLate ? "late" : "present",
      }).returning();
    }

    await db.insert(schema.auditLogs).values({
      employeeId: emp.id,
      action: "check_in",
      entityType: "attendance",
      entityId: String(row.id),
      ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
    });

    return c.json({ attendance: row }, 200);
  })
  // Check-out
  .post("/checkout", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ message: "Employee not found" }, 404);

    const today = todayStr();
    const [existing] = await db.select().from(schema.attendance)
      .where(and(eq(schema.attendance.employeeId, emp.id), eq(schema.attendance.date, today)));

    if (!existing?.checkIn) return c.json({ message: "You haven't checked in yet" }, 400);
    if (existing.checkOut) return c.json({ message: "Already checked out today", attendance: existing }, 200);

    const now = new Date().toISOString();
    const hours = calcHours(existing.checkIn!, now);
    const status = hours < 4 ? "half_day" : existing.status;

    const [row] = await db.update(schema.attendance)
      .set({ checkOut: now, totalHours: hours, status })
      .where(eq(schema.attendance.id, existing.id))
      .returning();

    await db.insert(schema.auditLogs).values({
      employeeId: emp.id,
      action: "check_out",
      entityType: "attendance",
      entityId: String(row.id),
      ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
    });

    return c.json({ attendance: row }, 200);
  })
  // Get today's attendance
  .get("/today", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ attendance: null }, 200);

    const today = todayStr();
    const [row] = await db.select().from(schema.attendance)
      .where(and(eq(schema.attendance.employeeId, emp.id), eq(schema.attendance.date, today)));

    return c.json({ attendance: row ?? null, isHoliday: await isHoliday(today) }, 200);
  })
  // Get my attendance history
  .get("/my", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ records: [] }, 200);

    const { month, year } = c.req.query();
    let rows;
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      rows = await db.select().from(schema.attendance)
        .where(and(
          eq(schema.attendance.employeeId, emp.id),
          gte(schema.attendance.date, startDate),
          lte(schema.attendance.date, endDate)
        ))
        .orderBy(desc(schema.attendance.date));
    } else {
      rows = await db.select().from(schema.attendance)
        .where(eq(schema.attendance.employeeId, emp.id))
        .orderBy(desc(schema.attendance.date))
        .limit(30);
    }
    return c.json({ records: rows }, 200);
  })
  // Admin: Get all attendance
  .get("/all", requireAdmin, async (c) => {
    const { date, employeeId, month, year } = c.req.query();
    let rows;
    if (date) {
      rows = await db.select().from(schema.attendance).where(eq(schema.attendance.date, date));
    } else if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      rows = await db.select().from(schema.attendance)
        .where(and(
          gte(schema.attendance.date, startDate),
          lte(schema.attendance.date, endDate)
        ))
        .orderBy(desc(schema.attendance.date));
    } else {
      rows = await db.select().from(schema.attendance)
        .orderBy(desc(schema.attendance.date))
        .limit(100);
    }
    if (employeeId) rows = rows.filter(r => r.employeeId === Number(employeeId));
    return c.json({ records: rows }, 200);
  })
  // Admin: Summary for today
  .get("/summary/today", requireAdmin, async (c) => {
    const today = todayStr();
    const records = await db.select().from(schema.attendance).where(eq(schema.attendance.date, today));
    const allEmps = await db.select().from(schema.employees).where(eq(schema.employees.status, "active"));
    const totalEmployees = allEmps.length;
    const present = records.filter(r => r.status === "present" || r.status === "late").length;
    const absent = totalEmployees - records.length;
    const checkedOut = records.filter(r => r.checkOut).length;
    const checkedIn = records.filter(r => r.checkIn && !r.checkOut).length;
    const late = records.filter(r => r.status === "late").length;

    return c.json({ totalEmployees, present, absent, checkedIn, checkedOut, late, today }, 200);
  });
