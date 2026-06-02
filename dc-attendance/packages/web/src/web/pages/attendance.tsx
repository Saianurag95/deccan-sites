import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, TrendingUp } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    present: "badge-green", late: "badge-yellow",
    half_day: "badge-orange", absent: "badge-red", holiday: "badge-blue",
  };
  return <span className={`badge ${map[status] ?? "badge-gray"}`}>{status.replace("_", " ").toUpperCase()}</span>;
}

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const { data, isLoading } = useQuery({
    queryKey: ["my-attendance", month, year],
    queryFn: async () => {
      const res = await (api.attendance as any).my.$get({ query: { month, year } });
      return res.json();
    },
  });

  const records: any[] = (data as any)?.records ?? [];

  const present = records.filter(r => r.status === "present").length;
  const late = records.filter(r => r.status === "late").length;
  const absent = records.filter(r => r.status === "absent").length;
  const halfDay = records.filter(r => r.status === "half_day").length;
  const totalHours = records.reduce((sum, r) => sum + (r.totalHours ?? 0), 0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Attendance</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Track your attendance history</p>
          </div>
          <div className="flex gap-3">
            <select className="input w-36" value={month} onChange={e => setMonth(e.target.value)}>
              {months.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
            <select className="input w-28" value={year} onChange={e => setYear(e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Present", value: present, color: "#10B981" },
            { label: "Late", value: late, color: "#F59E0B" },
            { label: "Absent", value: absent, color: "#EF4444" },
            { label: "Half Day", value: halfDay, color: "#F97316" },
            { label: "Total Hours", value: `${Math.round(totalHours)}h`, color: "#2B3BA0" },
          ].map(item => (
            <div key={item.label} className="card text-center py-4">
              <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance Table */}
        <div className="card overflow-hidden p-0">
          <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <Calendar size={18} style={{ color: "var(--primary)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Attendance Records</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
              No attendance records for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id}>
                      <td className="font-medium" style={{ color: "var(--text)" }}>
                        {format(parseISO(r.date), "MMM d, yyyy")}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{format(parseISO(r.date), "EEEE")}</td>
                      <td style={{ color: "var(--text)" }}>
                        {r.checkIn ? format(new Date(r.checkIn), "hh:mm a") : "—"}
                      </td>
                      <td style={{ color: "var(--text)" }}>
                        {r.checkOut ? format(new Date(r.checkOut), "hh:mm a") : "—"}
                      </td>
                      <td style={{ color: "var(--text)" }}>
                        {r.totalHours ? `${r.totalHours}h` : "—"}
                      </td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
