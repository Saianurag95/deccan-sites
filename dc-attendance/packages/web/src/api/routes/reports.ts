import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAdmin, authMiddleware } from "../middleware/auth";

export const reports = new Hono()
  .use("*", authMiddleware)
  .get("/attendance", requireAdmin, async (c) => {
    const { startDate, endDate, employeeId, departmentId, status } = c.req.query();

    let records = await db.select().from(schema.attendance)
      .where(and(
        startDate ? gte(schema.attendance.date, startDate) : undefined,
        endDate ? lte(schema.attendance.date, endDate) : undefined,
      ));

    if (employeeId) records = records.filter(r => r.employeeId === Number(employeeId));
    if (status) records = records.filter(r => r.status === status);

    // Enrich with employee data
    const emps = await db.select().from(schema.employees);
    const depts = await db.select().from(schema.departments);
    const empMap = Object.fromEntries(emps.map(e => [e.id, e]));
    const deptMap = Object.fromEntries(depts.map(d => [d.id, d]));

    let enriched = records.map(r => ({
      ...r,
      employee: empMap[r.employeeId],
      department: empMap[r.employeeId]?.departmentId ? deptMap[empMap[r.employeeId].departmentId!] : null,
    }));

    if (departmentId) {
      enriched = enriched.filter(r => r.employee?.departmentId === Number(departmentId));
    }

    // Summary stats
    const total = enriched.length;
    const present = enriched.filter(r => r.status === "present").length;
    const late = enriched.filter(r => r.status === "late").length;
    const absent = enriched.filter(r => r.status === "absent").length;
    const halfDay = enriched.filter(r => r.status === "half_day").length;

    return c.json({ records: enriched, summary: { total, present, late, absent, halfDay } }, 200);
  })
  .get("/productivity", requireAdmin, async (c) => {
    const { startDate, endDate, employeeId, departmentId } = c.req.query();

    const emps = await db.select().from(schema.employees).where(eq(schema.employees.status, "active"));
    const depts = await db.select().from(schema.departments);
    const deptMap = Object.fromEntries(depts.map(d => [d.id, d]));

    let targetEmps = emps;
    if (employeeId) targetEmps = emps.filter(e => e.id === Number(employeeId));
    if (departmentId) targetEmps = emps.filter(e => e.departmentId === Number(departmentId));

    const result = await Promise.all(targetEmps.map(async (emp) => {
      const attendanceRows = await db.select().from(schema.attendance)
        .where(and(
          eq(schema.attendance.employeeId, emp.id),
          startDate ? gte(schema.attendance.date, startDate) : undefined,
          endDate ? lte(schema.attendance.date, endDate) : undefined,
        ));
      const updatesRows = await db.select().from(schema.workUpdates)
        .where(and(
          eq(schema.workUpdates.employeeId, emp.id),
          startDate ? gte(schema.workUpdates.date, startDate) : undefined,
          endDate ? lte(schema.workUpdates.date, endDate) : undefined,
        ));

      const presentDays = attendanceRows.filter(r => r.status === "present" || r.status === "late").length;
      const totalHours = attendanceRows.reduce((sum, r) => sum + (r.totalHours ?? 0), 0);
      const expectedUpdates = presentDays * 5;
      const updatesPct = expectedUpdates > 0 ? Math.round((updatesRows.length / expectedUpdates) * 100) : 0;
      const attendancePct = attendanceRows.length > 0 ? Math.round((presentDays / attendanceRows.length) * 100) : 0;
      const score = Math.round(attendancePct * 0.5 + updatesPct * 0.5);

      return {
        employee: emp,
        department: emp.departmentId ? deptMap[emp.departmentId] : null,
        presentDays,
        totalHours: Math.round(totalHours * 10) / 10,
        updatesSubmitted: updatesRows.length,
        expectedUpdates,
        attendancePct,
        updatesPct,
        score,
      };
    }));

    return c.json({ records: result }, 200);
  });
