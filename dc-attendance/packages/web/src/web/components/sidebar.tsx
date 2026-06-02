import { Link, useLocation } from "wouter";
import { authClient, clearToken } from "../lib/auth";
import { useTheme } from "../hooks/useTheme";
import {
  LayoutDashboard, Clock, FileText, Users, Calendar, BarChart2,
  Settings, LogOut, Sun, Moon, Shield, Monitor, BookOpen, Megaphone,
  CheckSquare, Menu, X
} from "lucide-react";
import { useState } from "react";

interface NavItem { label: string; path: string; icon: React.ReactNode; }

const employeeNav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Attendance", path: "/attendance", icon: <Clock size={18} /> },
  { label: "Work Updates", path: "/updates", icon: <FileText size={18} /> },
  { label: "My Tasks", path: "/tasks", icon: <CheckSquare size={18} /> },
  { label: "My Reports", path: "/my-reports", icon: <BarChart2 size={18} /> },
  { label: "Holidays", path: "/holidays", icon: <Calendar size={18} /> },
  { label: "Profile", path: "/profile", icon: <Settings size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Employees", path: "/admin/employees", icon: <Users size={18} /> },
  { label: "Attendance", path: "/admin/attendance", icon: <Clock size={18} /> },
  { label: "Work Updates", path: "/admin/updates", icon: <FileText size={18} /> },
  { label: "Tasks", path: "/admin/tasks", icon: <CheckSquare size={18} /> },
  { label: "Announcements", path: "/admin/announcements", icon: <Megaphone size={18} /> },
  { label: "Holidays", path: "/admin/holidays", icon: <Calendar size={18} /> },
  { label: "Monitoring", path: "/admin/monitoring", icon: <Monitor size={18} /> },
  { label: "Reports", path: "/admin/reports", icon: <BarChart2 size={18} /> },
  { label: "Audit Logs", path: "/admin/audit", icon: <BookOpen size={18} /> },
];

export function Sidebar() {
  const { data: session } = authClient.useSession();
  const [location] = useLocation();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";
  const navItems = isAdmin ? adminNav : employeeNav;

  const handleLogout = async () => {
    await authClient.signOut();
    clearToken();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <img src="/dc_logo.jpg" alt="Digital Connect" className="w-10 h-10 rounded-lg object-contain bg-white p-1" />
          <div>
            <div className="font-700 text-sm" style={{ color: "var(--text)" }}>Digital Connect</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isAdmin ? "Admin Panel" : "Employee Portal"}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="px-5 py-3">
          <span className="badge badge-orange text-xs">
            <Shield size={10} className="mr-1" /> Super Admin
          </span>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(item => {
          const active = location === item.path || (item.path !== "/admin" && location.startsWith(item.path + "/"));
          return (
            <Link key={item.path} to={item.path}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: active ? "var(--primary)" : "transparent",
                  color: active ? "white" : "var(--text-muted)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{session?.user?.name}</div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{session?.user?.email}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} className="btn-outline flex-1 flex items-center justify-center gap-2 py-2 text-xs">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? "Light" : "Dark"}
          </button>
          <button onClick={handleLogout} className="btn-outline flex items-center justify-center gap-2 py-2 px-3 text-xs">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
