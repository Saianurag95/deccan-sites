import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { authClient } from "../lib/auth";
import {
  Clock, CheckCircle, XCircle, TrendingUp, Calendar, AlertTriangle,
  Play, Square, FileText, Award, Megaphone, Pin, Flag
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "wouter";

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + "20" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
    </div>
  );
}

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    general: "badge-gray", meeting: "badge-blue", holiday: "badge-green",
    update: "badge-yellow", urgent: "badge-red",
  };
  return <span className={`badge ${map[type] ?? "badge-gray"}`}>{type}</span>;
};

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const [actionMsg, setActionMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-employee"],
    queryFn: async () => (await api.dashboard.employee.$get()).json(),
    refetchInterval: 30000,
  });

  const { data: todayAtt } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => (await api.attendance.today.$get()).json(),
    refetchInterval: 15000,
  });

  const { data: slotsData } = useQuery({
    queryKey: ["work-slots"],
    queryFn: async () => (await (api["work-updates"] as any).slots.$get()).json(),
    refetchInterval: 60000,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await (api as any).announcements.$get();
      if (!res.ok) return { announcements: [] };
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: tasksData } = useQuery({
    queryKey: ["my-tasks-summary"],
    queryFn: async () => {
      const res = await (api as any).tasks.my.$get({ query: {} });
      if (!res.ok) return { tasks: [] };
      return res.json();
    },
  });

  const checkIn = useMutation({
    mutationFn: async () => (await api.attendance.checkin.$post()).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance-today"] }); qc.invalidateQueries({ queryKey: ["dashboard-employee"] }); setActionMsg("Checked in successfully!"); },
  });

  const checkOut = useMutation({
    mutationFn: async () => (await api.attendance.checkout.$post()).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance-today"] }); qc.invalidateQueries({ queryKey: ["dashboard-employee"] }); setActionMsg("Checked out successfully!"); },
  });

  const att = todayAtt?.attendance;
  const isHoliday = todayAtt?.isHoliday;
  const stats = data as any;
  const slots = (slotsData as any)?.slots ?? [];
  const announcements: any[] = (announcementsData as any)?.announcements ?? [];
  const myTasks: any[] = (tasksData as any)?.tasks ?? [];

  const missedSlots = slots.filter((s: any) => s.isMissed);
  const pendingTasks = myTasks.filter((t: any) => t.status === "pending" || t.status === "in_progress");
  const criticalTasks = myTasks.filter((t: any) => t.priority === "critical" && t.status !== "completed");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},{" "}
              {session?.user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          {isHoliday && (
            <span className="badge badge-green text-sm">🎉 Holiday Today</span>
          )}
        </div>

        {actionMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46" }}>
            ✓ {actionMsg}
          </div>
        )}

        {/* Announcements Feed — shown on login */}
        {announcements.length > 0 && (
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={20} style={{ color: "var(--primary)" }} />
              <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>Company Announcements</h2>
            </div>
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="p-4 rounded-xl" style={{
                  background: "var(--bg)",
                  borderLeft: `3px solid ${a.type === "urgent" ? "#EF4444" : a.type === "meeting" ? "#3B82F6" : a.type === "holiday" ? "#10B981" : "var(--primary)"}`,
                }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.isPinned && <span className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--primary)" }}><Pin size={11} />Pinned</span>}
                    {typeBadge(a.type)}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {a.createdAt ? format(new Date(a.createdAt), "dd MMM, hh:mm a") : ""}
                    </span>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{a.title}</p>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>{a.content}</p>
                </div>
              ))}
              {announcements.length > 3 && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>+{announcements.length - 3} more announcements</p>
              )}
            </div>
          </div>
        )}

        {/* Critical Tasks Alert */}
        {criticalTasks.length > 0 && (
          <div className="card mb-6" style={{ borderLeft: "4px solid #EF4444" }}>
            <div className="flex items-center gap-2 mb-2">
              <Flag size={18} color="#EF4444" />
              <h3 className="font-semibold" style={{ color: "#EF4444" }}>Critical Tasks Pending</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {criticalTasks.map((t: any) => (
                <span key={t.id} className="badge badge-red">{t.title}</span>
              ))}
            </div>
            <Link to="/tasks">
              <a className="text-sm font-medium mt-3 block" style={{ color: "var(--primary)" }}>View all tasks →</a>
            </Link>
          </div>
        )}

        {/* Attendance Card */}
        <div className="card mb-6" style={{ borderLeft: "4px solid var(--primary)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>Today's Attendance</h2>
            {att?.status && (
              <span className={`badge ${att.status === "present" ? "badge-green" : att.status === "late" ? "badge-yellow" : att.status === "half_day" ? "badge-orange" : "badge-red"}`}>
                {att.status.replace("_", " ").toUpperCase()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Check In", value: att?.checkIn ? format(new Date(att.checkIn), "hh:mm a") : "--:--", icon: <Play size={14} /> },
              { label: "Check Out", value: att?.checkOut ? format(new Date(att.checkOut), "hh:mm a") : "--:--", icon: <Square size={14} /> },
              { label: "Total Hours", value: att?.totalHours ? `${att.totalHours}h` : "--", icon: <Clock size={14} /> },
              { label: "Status", value: att?.status?.replace("_", " ") ?? "Not started", icon: <CheckCircle size={14} /> },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: "var(--bg)" }}>
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {item.icon} {item.label}
                </div>
                <div className="font-semibold" style={{ color: "var(--text)" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {!isHoliday && (
            <div className="flex gap-3">
              {!att?.checkIn && (
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => checkIn.mutate()}
                  disabled={checkIn.isPending}
                >
                  {checkIn.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play size={16} />}
                  Start Day
                </button>
              )}
              {att?.checkIn && !att?.checkOut && (
                <button
                  className="btn-outline flex items-center gap-2"
                  onClick={() => checkOut.mutate()}
                  disabled={checkOut.isPending}
                  style={{ borderColor: "#EF4444", color: "#EF4444" }}
                >
                  {checkOut.isPending ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Square size={16} />}
                  End Day
                </button>
              )}
              {att?.checkOut && (
                <span className="badge badge-green text-sm">Day completed ✓</span>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="stat-card animate-pulse h-24 bg-gray-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<CheckCircle size={20} />} label="Present Days (Month)" value={stats?.month?.presentDays ?? 0} color="#10B981" />
            <StatCard icon={<XCircle size={20} />} label="Absent Days" value={stats?.month?.absentDays ?? 0} color="#EF4444" />
            <StatCard icon={<Award size={20} />} label="Productivity Score" value={`${stats?.month?.productivityScore ?? 0}%`} color="#E8501A" />
            <StatCard icon={<Flag size={20} />} label="Active Tasks" value={pendingTasks.length} color="#6366F1" />
          </div>
        )}

        {/* Alerts */}
        {missedSlots.length > 0 && (
          <div className="card mb-6" style={{ borderLeft: "4px solid #EF4444" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} color="#EF4444" />
              <h3 className="font-semibold" style={{ color: "#EF4444" }}>Missed Work Updates</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missedSlots.map((slot: any) => (
                <span key={slot.start} className="badge badge-red">
                  {slot.start} – {slot.end}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Update Slots */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg" style={{ color: "var(--text)" }}>Today's Work Updates</h2>
            <Link to="/updates">
              <a className="text-sm font-medium" style={{ color: "var(--primary)" }}>Submit Update →</a>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {slots.map((slot: any) => (
              <div
                key={slot.start}
                className="p-3 rounded-xl text-center"
                style={{
                  background: slot.isSubmitted ? "#D1FAE5" : slot.isMissed ? "#FEE2E2" : "var(--bg)",
                  border: `1px solid ${slot.isSubmitted ? "#10B981" : slot.isMissed ? "#EF4444" : "var(--border)"}`,
                }}
              >
                <div className="text-xs font-medium mb-1" style={{ color: slot.isSubmitted ? "#065F46" : slot.isMissed ? "#991B1B" : "var(--text-muted)" }}>
                  {slot.start} – {slot.end}
                </div>
                <div className="text-lg">
                  {slot.isSubmitted ? "✓" : slot.isMissed ? "✗" : "○"}
                </div>
                {slot.update && (
                  <div className="text-xs mt-1 truncate" style={{ color: "#065F46" }}>{slot.update.taskTitle}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Stats */}
        {stats?.month && (
          <div className="card">
            <h2 className="font-semibold text-lg mb-4" style={{ color: "var(--text)" }}>Monthly Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "var(--text-muted)" }}>Attendance</span>
                  <span style={{ color: "var(--text)" }}>{stats.month.attendancePct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-2 rounded-full" style={{ background: "#10B981", width: `${stats.month.attendancePct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "var(--text-muted)" }}>Updates</span>
                  <span style={{ color: "var(--text)" }}>{stats.month.updatesPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-2 rounded-full" style={{ background: "var(--primary)", width: `${Math.min(100, stats.month.updatesPct)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "var(--text-muted)" }}>Productivity</span>
                  <span style={{ color: "var(--text)" }}>{stats.month.productivityScore}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-2 rounded-full" style={{ background: "var(--secondary)", width: `${stats.month.productivityScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
