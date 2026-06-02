import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { format } from "date-fns";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    present: "badge-green",
    absent: "badge-red",
    holiday: "badge-blue",
    half_day: "badge-yellow",
    late: "badge-yellow",
  };
  return <span className={`badge ${map[status] ?? "badge-gray"}`}>{status.replace("_", " ")}</span>;
}

export default function AdminAttendancePage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-attendance", date],
    queryFn: async () => {
      const res = await (api.attendance as any).all.$get({ query: { date } });
      if (!res.ok) return { records: [] };
      return res.json();
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await (api.employees as any).$get({});
      if (!res.ok) return [];
      const d = await res.json();
      return d.employees ?? [];
    },
  });

  const empMap = Object.fromEntries((employees as any[]).map((e: any) => [e.id, e]));
  const records: any[] = data?.records ?? [];

  const enriched = records.map((r: any) => ({
    ...r,
    emp: empMap[r.employeeId],
  }));

  const filtered = enriched.filter((r: any) =>
    r.emp?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.emp?.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const summary = {
    present: filtered.filter((r: any) => r.status === "present" || r.status === "late").length,
    absent: filtered.filter((r: any) => r.status === "absent").length,
    late: filtered.filter((r: any) => r.status === "late").length,
    halfDay: filtered.filter((r: any) => r.status === "half_day").length,
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-sub">Daily attendance records</p>
        </div>
      </div>

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-value" style={{ color: "var(--success)" }}>{summary.present}</div><div className="stat-label">Present</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "var(--danger)" }}>{summary.absent}</div><div className="stat-label">Absent</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "#f59e0b" }}>{summary.late}</div><div className="stat-label">Late</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "#8b5cf6" }}>{summary.halfDay}</div><div className="stat-label">Half Day</div></div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="input-icon">
            <Search size={16} />
            <input className="input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="input-icon">
            <Calendar size={16} />
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No attendance records for {date}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id}>
                    <td><span className="mono">{r.emp?.employeeId ?? "—"}</span></td>
                    <td className="fw600">{r.emp?.fullName ?? "Unknown"}</td>
                    <td>{r.emp?.department ?? "—"}</td>
                    <td>{r.checkIn ? format(new Date(r.checkIn), "hh:mm a") : "—"}</td>
                    <td>{r.checkOut ? format(new Date(r.checkOut), "hh:mm a") : "—"}</td>
                    <td>{r.totalHours ? `${r.totalHours}h` : "—"}</td>
                    <td>{statusBadge(r.status)}</td>
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
