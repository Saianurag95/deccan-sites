import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, like, or } from "drizzle-orm";
import { requireAuth, requireAdmin, authMiddleware } from "../middleware/auth";
import { auth } from "../auth";

export const employees = new Hono()
  .use("*", authMiddleware)
  // List all employees (admin)
  .get("/", requireAdmin, async (c) => {
    const { search, department, status } = c.req.query();
    let query = db.select({
      id: schema.employees.id,
      userId: schema.employees.userId,
      employeeId: schema.employees.employeeId,
      fullName: schema.employees.fullName,
      email: schema.employees.email,
      mobile: schema.employees.mobile,
      departmentId: schema.employees.departmentId,
      designation: schema.employees.designation,
      joiningDate: schema.employees.joiningDate,
      role: schema.employees.role,
      status: schema.employees.status,
      createdAt: schema.employees.createdAt,
    }).from(schema.employees);

    const rows = await query;

    let result = rows;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(e =>
        e.fullName?.toLowerCase().includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.employeeId?.toLowerCase().includes(s)
      );
    }
    if (status) result = result.filter(e => e.status === status);
    if (department) result = result.filter(e => e.departmentId === Number(department));

    return c.json({ employees: result }, 200);
  })
  // Get single employee
  .get("/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    if (!emp) return c.json({ message: "Not found" }, 404);
    return c.json({ employee: emp }, 200);
  })
  // Create employee (admin only)
  .post("/", requireAdmin, async (c) => {
    const body = await c.req.json();
    const { fullName, email, password, employeeId, mobile, departmentId, designation, joiningDate } = body;

    // Create auth user via better-auth
    const ctx = auth as any;
    let authUser: any;
    try {
      const result = await ctx.api.signUpEmail({
        body: { name: fullName, email, password, role: "employee" },
        headers: new Headers(),
        request: new Request("http://localhost"),
      });
      authUser = result?.user;
    } catch (e: any) {
      return c.json({ message: e?.message ?? "Failed to create auth user" }, 400);
    }

    if (!authUser?.id) return c.json({ message: "Failed to create user" }, 400);

    const [emp] = await db.insert(schema.employees).values({
      userId: authUser.id,
      employeeId,
      fullName,
      email,
      mobile,
      departmentId: departmentId ? Number(departmentId) : null,
      designation,
      joiningDate,
      role: "employee",
      status: "active",
    }).returning();

    // Log audit
    const currentUser = c.get("user") as any;
    if (currentUser) {
      const [adminEmp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, currentUser.id));
      if (adminEmp) {
        await db.insert(schema.auditLogs).values({
          employeeId: adminEmp.id,
          action: "employee_created",
          entityType: "employee",
          entityId: String(emp.id),
          details: JSON.stringify({ fullName, email, employeeId }),
          ipAddress: c.req.header("x-forwarded-for") ?? "unknown",
        });
      }
    }

    return c.json({ employee: emp }, 201);
  })
  // Update employee
  .put("/:id", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { fullName, mobile, departmentId, designation, status, joiningDate } = body;

    const [emp] = await db.update(schema.employees)
      .set({ fullName, mobile, departmentId: departmentId ? Number(departmentId) : undefined, designation, status, joiningDate, updatedAt: new Date() })
      .where(eq(schema.employees.id, id))
      .returning();

    return c.json({ employee: emp }, 200);
  })
  // Get current employee profile
  .get("/me/profile", requireAuth, async (c) => {
    const user = c.get("user") as any;
    const [emp] = await db.select().from(schema.employees).where(eq(schema.employees.userId, user.id));
    if (!emp) return c.json({ message: "Profile not found" }, 404);
    return c.json({ employee: emp }, 200);
  });
