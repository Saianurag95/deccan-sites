import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Download, FileText, BarChart2, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

export default function AdminReportsPage() {
  const [tab, setTab] = useState<"attendance" | "productivity">("attendance");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [deptFilter, setDeptFilter] = useState("");

  const startDate = format(startOfMonth(new Date(month + "-01")), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-report", tab, month, deptFilter],
    queryFn: async () => {
      if (tab === "attendance") {
        const res = await (api.reports as any).attendance.$get({
          query: { startDate, endDate, departmentId: deptFilter || undefined },
        });
        if (!res.ok) return null;
        return res.json();
      } else {
        const res = await (api.reports as any).productivity.$get({
          query: { startDate, endDate, departmentId: deptFilter || undefined },
        });
        if (!res.ok) return null;
        return res.json();
      }
    },
  });

  const { data: depts = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await (api.departments as any).$get({});
      if (!res.ok) return [];
      const d = await res.json();
      return d.departments ?? [];
    },
  });

  // Normalize rows for both report types
  const rawRows: any[] = data?.records ?? [];

  const rows = tab === "attendance"
    ? rawRows.map((r: any) => ({
        employeeId: r.employee?.employeeId ?? "—",
        name: r.employee?.fullName ?? "Unknown",
        department: r.department?.name ?? "—",
        presentDays: r.status === "present" || r.status === "late" ? 1 : 0,
        absentDays: r.status === "absent" ? 1 : 0,
        lateDays: r.status === "late" ? 1 : 0,
        attendancePct: r.status === "present" || r.status === "late" ? 100 : 0,
      }))
    : rawRows.map((r: any) => ({
        employeeId: r.employee?.employeeId ?? "—",
        name: r.employee?.fullName ?? "Unknown",
        department: r.department?.name ?? "—",
        attendancePct: r.attendancePct,
        updatesPct: r.updatesPct,
        score: r.score,
      }));

  // Aggregate attendance rows by employee
  const aggregated = tab === "attendance"
    ? Object.values(
        rows.reduce((acc: any, r: any) => {
          const key = r.employeeId;
          if (!acc[key]) acc[key] = { ...r, presentDays: 0, absentDays: 0, lateDays: 0, total: 0 };
          acc[key].presentDays += r.presentDays;
          acc[key].absentDays += r.absentDays;
          acc[key].lateDays += r.lateDays;
          acc[key].total += 1;
          acc[key].attendancePct = acc[key].total > 0
            ? Math.round((acc[key].presentDays / acc[key].total) * 100)
            : 0;
          return acc;
        }, {})
      )
    : rows;

  async function exportCSV() {
    if (!aggregated.length) return;
    const headers = tab === "attendance"
      ? ["Employee ID", "Name", "Department", "Present Days", "Absent Days", "Late Days", "Attendance %"]
      : ["Employee ID", "Name", "Department", "Attendance %", "Updates %", "Productivity Score"];
    const csvRows = aggregated.map((r: any) =>
      tab === "attendance"
        ? [r.employeeId, r.name, r.department, r.presentDays, r.absentDays, r.lateDays, r.attendancePct + "%"]
        : [r.employeeId, r.name, r.department, r.attendancePct + "%", r.updatesPct + "%", r.score + "%"]
    );
    const csv = [headers, ...csvRows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${tab}-report-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const chartData = (aggregated as any[]).slice(0, 12).map((r: any) => ({
    name: r.name?.split(" ")[0],
    ...(tab === "attendance"
      ? { "Att %": r.attendancePct }
      : { "Att %": r.attendancePct, "Updates %": r.updatesPct, "Score": r.score }),
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Attendance &amp; productivity analytics</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV} disabled={!aggregated.length}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${tab === "attendance" ? "active" : ""}`} onClick={() => setTab("attendance")}>
          <Calendar size={15} /> Attendance
        </button>
        <button className={`tab-btn ${tab === "productivity" ? "active" : ""}`} onClick={() => setTab("productivity")}>
          <BarChart2 size={15} /> Productivity
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-toolbar">
          <div className="form-group-inline">
            <label>Month</label>
            <input className="input" type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>
          <div className="form-group-inline">
            <label>Department</label>
            <select className="input select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {(depts as any[]).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {chartData.length > 0 && (
          <div style={{ height: 260, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              {tab === "attendance" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => v + "%"} />
                  <Bar dataKey="Att %" fill="#E8501A" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => v + "%"} />
                  <Legend />
                  <Line type="monotone" dataKey="Att %" stroke="#E8501A" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Updates %" stroke="#2B3BA0" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Score" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : !aggregated.length ? (
          <div className="empty-state">
            <FileText size={36} style={{ opacity: 0.3, marginBottom: 8 }} /><br />
            No data for selected period
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  {tab === "attendance" ? (
                    <>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Late</th>
                      <th>Attendance %</th>
                    </>
                  ) : (
                    <>
                      <th>Attendance %</th>
                      <th>Updates %</th>
                      <th>Productivity Score</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(aggregated as any[]).map((r: any, i: number) => (
                  <tr key={r.employeeId + i}>
                    <td><span className="mono">{r.employeeId}</span></td>
                    <td className="fw600">{r.name}</td>
                    <td>{r.department}</td>
                    {tab === "attendance" ? (
                      <>
                        <td>{r.presentDays}</td>
                        <td>{r.absentDays}</td>
                        <td>{r.lateDays}</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{
                                width: `${r.attendancePct}%`,
                                background: r.attendancePct >= 75 ? "var(--success)" : r.attendancePct >= 50 ? "#f59e0b" : "var(--danger)"
                              }} />
                            </div>
                            <span>{r.attendancePct}%</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{r.attendancePct}%</td>
                        <td>{r.updatesPct}%</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{
                                width: `${r.score}%`,
                                background: r.score >= 75 ? "var(--success)" : r.score >= 50 ? "#f59e0b" : "var(--danger)"
                              }} />
                            </div>
                            <span className="fw600">{r.score}%</span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
