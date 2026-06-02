import { boolean, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export * from "./auth-schema";

// Departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee profiles (extends auth users)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  employeeId: text("employee_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile"),
  departmentId: integer("department_id"),
  designation: text("designation"),
  joiningDate: text("joining_date"),
  role: text("role").notNull().default("employee"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: text("date").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  totalHours: real("total_hours"),
  status: text("status").notNull().default("absent"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work Updates
export const workUpdates = pgTable("work_updates", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  date: text("date").notNull(),
  slotStart: text("slot_start").notNull(),
  slotEnd: text("slot_end").notNull(),
  taskTitle: text("task_title").notNull(),
  projectName: text("project_name"),
  description: text("description"),
  completionPct: integer("completion_pct").default(0),
  currentStatus: text("current_status"),
  challenges: text("challenges"),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Holidays
export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  description: text("description"),
  type: text("type").notNull().default("public"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks (Admin assigns to employees)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").notNull(), // employee.id
  assignedBy: integer("assigned_by").notNull(), // employee.id (admin)
  projectName: text("project_name"),
  priority: text("priority").notNull().default("medium"), // "low" | "medium" | "high" | "critical"
  status: text("status").notNull().default("pending"), // "pending" | "in_progress" | "completed" | "on_hold" | "cancelled"
  progress: integer("progress").notNull().default(0), // 0–100
  dueDate: text("due_date"), // YYYY-MM-DD
  completedAt: text("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcements (Admin posts, visible to all employees on login)
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("general"), // "general" | "meeting" | "holiday" | "update" | "urgent"
  imageUrl: text("image_url"),
  authorId: integer("author_id").notNull(), // employee.id
  isPinned: boolean("is_pinned").notNull().default(false),
  expiresAt: text("expires_at"), // YYYY-MM-DD optional expiry
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
