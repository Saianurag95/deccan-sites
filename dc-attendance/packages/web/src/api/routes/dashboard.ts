import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";

async function getEmployeeByUserId(userId: string) {
  const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, userId));
  return emp;
}

function todayStr() { return new Date().toISOString().split("T")[0]; }

function getMonthRange(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return { start: `${y}-${m}-01`, end: `${y}-${m}-31` };
}

export const dashboard = new Hono()
  .use("*", authMiddleware)
  // Employee dashboard stats
  .get("/employee", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const emp = await getEmployeeByUserId(user.id);
    if (!emp) return c.json({ message: "Profile not found" }, 404);

    const today = todayStr();
    const { start, end } = getMonthRange();

    const [todayAttendance] = await db.select().from(schema.attendance)
      .where(and(eq(schema.attendance.employeeId, emp.id), eq(schema.attendance.date, today)));

    const monthAttendance = await db.select().from(schema.attendance)
      .where(and(
        eq(schema.attendance.employeeId, emp.id),
        gte(schema.attendance.date, start),
        lte(schema.attendance.date, end)
      ));

    const todayUpdates = await db.select().from(schema.workUpdates)
      .where(and(eq(schema.workUpdates.employeeId, emp.id), eq(schema.workUpdates.date, today)));

    const SLOTS_COUNT = 5;
    const now = new Date();
    const passedSlots = [
      { start: "09:00", end: "11:00" },
      { start: "11:00", end: "13:00" },
      { start: "13:00", end: "15:00" },
      { start: "15:00", end: "17:00" },
      { start: "17:00", end: "19:00" },
    ].filter(slot => {
      const [sh] = slot.end.split(":").map(Number);
      return now.getHours() >= sh;
    });

    const submittedSlots = todayUpdates.map(u => u.slotStart);
    const missedUpdates = passedSlots.filter(s => !submittedSlots.includes(s.start));
    const presentDays = monthAttendance.filter(r => r.status === "present" || r.status === "late").length;

    // Productivity score: (presentDays / workingDays) * 50 + (submittedUpdates / totalDueUpdates) * 50
    const workingDays = Math.max(1, presentDays + monthAttendance.filter(r => r.status === "absent").length);
    const totalDueSlots = monthAttendance.length * SLOTS_COUNT;
    const monthUpdates = await db.select().from(schema.workUpdates)
      .where(and(
        eq(schema.workUpdates.employeeId, emp.id),
        gte(schema.workUpdates.date, start),
        lte(schema.workUpdates.date, end)
      ));
    const attendancePct = Math.round((presentDays / workingDays) * 100);
    const updatesPct = totalDueSlots > 0 ? Math.round((monthUpdates.length / totalDueSlots) * 100) : 0;
    const productivityScore = Math.round(attendancePct * 0.5 + updatesPct * 0.5);

    return c.json({
      employee: emp,
      today: {
        attendance: todayAttendance ?? null,
        updatesSubmitted: todayUpdates.length,
        updatesRemaining: Math.max(0, passedSlots.length - todayUpdates.length),
        missedUpdates: missedUpdates.length,
      },
      month: {
        presentDays,
        absentDays: monthAttendance.filter(r => r.status === "absent").length,
        lateDays: monthAttendance.filter(r => r.status === "late").length,
        halfDays: monthAttendance.filter(r => r.status === "half_day").length,
        productivityScore,
        attendancePct,
        updatesPct,
      },
    }, 200);
  })
  // Admin dashboard stats
  .get("/admin", requireAdmin, async (c) => {
    const today = todayStr();
    const { start, end } = getMonthRange();

    const allEmps = await db.select().from(schema.employees);
    const activeEmps = allEmps.filter(e => e.status === "active");
    const todayAttendance = await db.select().from(schema.attendance).where(eq(schema.attendance.date, today));
    const monthHolidays = await db.select().from(schema.holidays)
      .where(and(gte(schema.holidays.date, start), lte(schema.holidays.date, end)));

    const present = todayAttendance.filter(r => r.checkIn).length;
    const checkedOut = todayAttendance.filter(r => r.checkOut).length;
    const absent = activeEmps.length - present;

    // Missed updates today
    const now = new Date();
    const passedSlots = ["09:00", "11:00", "13:00", "15:00", "17:00"].filter(slot => {
      const [sh] = slot.split(":").map(Number);
      return now.getHours() >= sh + 2;
    });
    const todayUpdates = await db.select().from(schema.workUpdates).where(eq(schema.workUpdates.date, today));
    const submittedPairs = new Set(todayUpdates.map(u => `${u.employeeId}-${u.slotStart}`));
    let missedUpdates = 0;
    for (const emp of activeEmps) {
      for (const slot of passedSlots) {
        if (!submittedPairs.has(`${emp.id}-${slot}`)) missedUpdates++;
      }
    }

    // Attendance trends (last 7 days)
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRecords = await db.select().from(schema.attendance).where(eq(schema.attendance.date, dateStr));
      trends.push({
        date: dateStr,
        present: dayRecords.filter(r => r.checkIn).length,
        absent: activeEmps.length - dayRecords.filter(r => r.checkIn).length,
      });
    }

    return c.json({
      summary: {
        totalEmployees: allEmps.length,
        activeEmployees: activeEmps.length,
        presentToday: present,
        absentToday: absent,
        checkedOut,
        checkedIn: present - checkedOut,
        holidaysThisMonth: monthHolidays.length,
        missedUpdates,
      },
      attendanceTrends: trends,
      recentAttendance: todayAttendance.slice(0, 10),
    }, 200);
  })
  // Admin: Employee productivity rankings
  .get("/productivity", requireAdmin, async (c) => {
    const { start, end } = getMonthRange();
    const activeEmps = await db.select().from(schema.employees).where(eq(schema.employees.status, "active"));

    const results = await Promise.all(activeEmps.map(async (emp) => {
      const monthAttendance = await db.select().from(schema.attendance)
        .where(and(
          eq(schema.attendance.employeeId, emp.id),
          gte(schema.attendance.date, start),
          lte(schema.attendance.date, end)
        ));
      const monthUpdates = await db.select().from(schema.workUpdates)
        .where(and(
          eq(schema.workUpdates.employeeId, emp.id),
          gte(schema.workUpdates.date, start),
          lte(schema.workUpdates.date, end)
        ));
      const presentDays = monthAttendance.filter(r => r.status === "present" || r.status === "late").length;
      const workingDays = Math.max(1, monthAttendance.length);
      const attendancePct = Math.round((presentDays / workingDays) * 100);
      const expectedUpdates = presentDays * 5;
      const updatesPct = expectedUpdates > 0 ? Math.round((monthUpdates.length / expectedUpdates) * 100) : 0;
      const score = Math.round(attendancePct * 0.5 + updatesPct * 0.5);
      return { ...emp, score, attendancePct, updatesPct, presentDays, updatesCount: monthUpdates.length };
    }));

    results.sort((a, b) => b.score - a.score);
    return c.json({ rankings: results }, 200);
  });
