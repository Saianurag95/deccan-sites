import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { employees } from "./routes/employees";
import { departments } from "./routes/departments";
import { attendance } from "./routes/attendance";
import { workUpdates } from "./routes/work-updates";
import { holidays } from "./routes/holidays";
import { notifications } from "./routes/notifications";
import { audit } from "./routes/audit";
import { dashboard } from "./routes/dashboard";
import { reports } from "./routes/reports";
import { tasks } from "./routes/tasks";
import { announcements } from "./routes/announcements";
import { db } from "./database";
import * as schema from "./database/schema";
import * as authSchema from "./database/auth-schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requireAdmin } from "./middleware/auth";

const app = new Hono()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .get("/health", (c) => c.json({ status: "ok" }, 200))
  .route("/employees", employees)
  .route("/departments", departments)
  .route("/attendance", attendance)
  .route("/work-updates", workUpdates)
  .route("/holidays", holidays)
  .route("/notifications", notifications)
  .route("/audit", audit)
  .route("/dashboard", dashboard)
  .route("/reports", reports)
  .route("/tasks", tasks)
  .route("/announcements", announcements)
  // Seed admin + departments (first-run) — not visible in UI, backend only
  .post("/seed", async (c) => {
    const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-before-seeding";
    const existing = await db.select().from(schema.employees);
    if (existing.length > 0) return c.json({ message: "Already seeded" }, 200);

    const deptNames = ["HR", "Sales", "Marketing", "Design", "Development", "AI Team", "Operations", "Administration"];
    for (const name of deptNames) {
      await db.insert(schema.departments).values({ name }).catch(() => {});
    }

    // Create admin auth user
    const ctx = auth as any;
    let adminAuthUser: any;
    try {
      const result = await ctx.api.signUpEmail({
        body: { name: "Super Admin", email: "admin@digitalconnect.com", password: adminPassword, role: "admin" },
        headers: new Headers(),
        request: new Request("http://localhost"),
      });
      adminAuthUser = result?.user;
    } catch {
      const existing = await db.select().from(authSchema.user).where(eq(authSchema.user.email, "admin@digitalconnect.com")).catch(() => []);
      adminAuthUser = existing[0];
    }

    if (adminAuthUser?.id) {
      await db.insert(schema.employees).values({
        userId: adminAuthUser.id,
        employeeId: "DC-ADMIN-001",
        fullName: "Super Admin",
        email: "admin@digitalconnect.com",
        role: "admin",
        status: "active",
        designation: "Super Administrator",
        joiningDate: new Date().toISOString().split("T")[0],
      }).catch(() => {});
      // Also set role on auth user table
      await db.update(authSchema.user).set({ role: "admin" } as any).where(eq(authSchema.user.id, adminAuthUser.id)).catch(() => {});
    }

    return c.json({ message: "Seeded successfully. Admin: admin@digitalconnect.com" }, 200);
  })
  // Fix admin role in auth user table (run once if role column was added after seeding)
  .post("/fix-admin-role", async (c) => {
    const adminUser = await db.select().from(authSchema.user).where(eq(authSchema.user.email, "admin@digitalconnect.com")).catch(() => []);
    if (!adminUser[0]) return c.json({ message: "Admin user not found" }, 404);
    await db.update(authSchema.user).set({ role: "admin" } as any).where(eq(authSchema.user.email, "admin@digitalconnect.com"));
    return c.json({ message: "Admin role fixed", userId: adminUser[0].id });
  })

  .use("*", authMiddleware)
  .get("/monitoring", requireAdmin, async (c) => {
    const today = new Date().toISOString().split("T")[0];
    const activeEmps = await db.select().from(schema.employees).where(eq(schema.employees.status, "active"));
    const todayAttendance = await db.select().from(schema.attendance).where(eq(schema.attendance.date, today));
    const recentUpdates = await db.select().from(schema.workUpdates).where(eq(schema.workUpdates.date, today));

    const attMap = Object.fromEntries(todayAttendance.map(a => [a.employeeId, a]));
    const updateMap: Record<number, any> = {};
    for (const u of recentUpdates) {
      if (!updateMap[u.employeeId] || (u.createdAt && updateMap[u.employeeId].createdAt < u.createdAt)) {
        updateMap[u.employeeId] = u;
      }
    }

    const result = activeEmps.map(emp => {
      const att = attMap[emp.id];
      const lastUpdate = updateMap[emp.id];
      let onlineStatus = "offline";
      if (att?.checkIn && !att.checkOut) {
        onlineStatus = lastUpdate ? "working" : "online";
      } else if (att?.checkOut) {
        onlineStatus = "logged_out";
      }
      return { employee: emp, attendance: att ?? null, lastUpdate: lastUpdate ?? null, onlineStatus };
    });

    return c.json({ employees: result }, 200);
  });

export type AppType = typeof app;
export default app;
