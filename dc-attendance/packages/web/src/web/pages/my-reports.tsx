import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart2 } from "lucide-react";

export default function MyReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const { data: attData } = useQuery({
    queryKey: ["my-attendance", month, year],
    queryFn: async () => {
      const res = await (api.attendance as any).my.$get({ query: { month, year } });
      return res.json();
    },
  });

  const records: any[] = (attData as any)?.records ?? [];
  const present = records.filter(r => r.status === "present").length;
  const late = records.filter(r => r.status === "late").length;
  const absent = records.filter(r => r.status === "absent").length;
  const halfDay = records.filter(r => r.status === "half_day").length;

  const pieData = [
    { name: "Present", value: present, color: "#10B981" },
    { name: "Late", value: late, color: "#F59E0B" },
    { name: "Absent", value: absent, color: "#EF4444" },
    { name: "Half Day", value: halfDay, color: "#F97316" },
  ].filter(d => d.value > 0);

  const barData = records.slice(0, 20).map(r => ({
    date: format(parseISO(r.date), "dd"),
    hours: r.totalHours ?? 0,
  }));

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Reports</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Personal attendance & productivity analytics</p>
          </div>
          <div className="flex gap-3">
            <select className="input w-36" value={month} onChange={e => setMonth(e.target.value)}>
              {months.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
            <select className="input w-28" value={year} onChange={e => setYear(e.target.value)}>
              {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Present", value: present, color: "#10B981" },
            { label: "Late", value: late, color: "#F59E0B" },
            { label: "Absent", value: absent, color: "#EF4444" },
            { label: "Total Hours", value: `${records.reduce((s, r) => s + (r.totalHours ?? 0), 0).toFixed(1)}h`, color: "#2B3BA0" },
          ].map(item => (
            <div key={item.label} className="card text-center py-4">
              <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Breakdown Pie */}
          {pieData.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Attendance Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Working Hours Bar */}
          {barData.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Daily Working Hours</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#E8501A" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {records.length === 0 && (
          <div className="card text-center py-16 mt-6">
            <BarChart2 size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)" }}>No records found for this period</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
