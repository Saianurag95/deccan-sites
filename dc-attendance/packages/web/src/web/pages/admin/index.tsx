import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { format } from "date-fns";
import {
  Users, CheckCircle, XCircle, Clock, Calendar, AlertTriangle,
  TrendingUp, Award, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + "20" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await (api.dashboard as any).admin.$get()).json(),
    refetchInterval: 30000,
  });

  const { data: rankData } = useQuery({
    queryKey: ["productivity-rankings"],
    queryFn: async () => (await (api.dashboard as any).productivity.$get()).json(),
  });

  const stats = (data as any)?.summary;
  const trends = (data as any)?.attendanceTrends ?? [];
  const rankings: any[] = ((rankData as any)?.rankings ?? []).slice(0, 5);

  const pieData = stats ? [
    { name: "Present", value: stats.presentToday, color: "#10B981" },
    { name: "Absent", value: Math.max(0, stats.absentToday), color: "#EF4444" },
  ] : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Admin Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")} · Real-time overview
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#D1FAE5", color: "#065F46" }}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="stat-card animate-pulse h-20" style={{ background: "var(--border)" }} />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<Users size={20} />} label="Total Employees" value={stats.totalEmployees} color="#2B3BA0" />
            <StatCard icon={<CheckCircle size={20} />} label="Present Today" value={stats.presentToday} color="#10B981" sub={`${stats.checkedIn} still working`} />
            <StatCard icon={<XCircle size={20} />} label="Absent Today" value={Math.max(0, stats.absentToday)} color="#EF4444" />
            <StatCard icon={<Clock size={20} />} label="Checked Out" value={stats.checkedOut} color="#F59E0B" />
            <StatCard icon={<Activity size={20} />} label="Active Employees" value={stats.activeEmployees} color="#8B5CF6" />
            <StatCard icon={<Calendar size={20} />} label="Holidays This Month" value={stats.holidaysThisMonth} color="#6366F1" />
            <StatCard icon={<AlertTriangle size={20} />} label="Missed Updates" value={stats.missedUpdates} color="#EF4444" />
            <StatCard icon={<TrendingUp size={20} />} label="On Track Today" value={`${stats.presentToday}/${stats.activeEmployees}`} color="#E8501A" />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Attendance trend */}
          <div className="card md:col-span-2">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>7-Day Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickFormatter={v => format(new Date(v), "dd MMM")} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip labelFormatter={v => format(new Date(v), "MMM d, yyyy")} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" fill="url(#presentGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" fill="url(#absentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Today Pie */}
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Today's Snapshot</h3>
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-52 text-sm" style={{ color: "var(--text-muted)" }}>
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>Top Performers This Month</h3>
            <Award size={18} style={{ color: "#E8501A" }} />
          </div>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>No data yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {rankings.map((emp: any, i) => (
                <div key={emp.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#CD7F32" : "var(--secondary)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{emp.fullName}</span>
                      <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{emp.score}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-2 rounded-full" style={{
                        background: i === 0 ? "#F59E0B" : "var(--primary)",
                        width: `${emp.score}%`,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <div className="flex gap-3 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>Attendance: {emp.attendancePct}%</span>
                      <span>Updates: {emp.updatesPct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
