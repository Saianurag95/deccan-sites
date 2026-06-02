import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  login: "badge-green",
  logout: "badge-gray",
  check_in: "badge-blue",
  check_out: "badge-blue",
  update_submitted: "badge-yellow",
  employee_created: "badge-green",
  employee_updated: "badge-yellow",
  employee_deactivated: "badge-red",
  holiday_created: "badge-green",
  holiday_deleted: "badge-red",
  password_changed: "badge-yellow",
};

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const res = await (api.audit as any).$get({});
      if (!res.ok) return { logs: [] };
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
  const logs: any[] = data?.logs ?? [];

  const enriched = logs.map((l: any) => ({
    ...l,
    emp: empMap[l.employeeId],
  }));

  const filtered = enriched.filter((l: any) => {
    const matchSearch = !search ||
      l.emp?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      l.emp?.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = [...new Set(logs.map((l: any) => l.action))].filter(Boolean) as string[];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-sub">System-wide activity trail</p>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="input-icon">
            <Search size={16} />
            <input className="input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input select" value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={36} style={{ opacity: 0.3, marginBottom: 8 }} /><br />
            No audit logs found
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Employee</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l: any) => (
                  <tr key={l.id}>
                    <td className="mono small">
                      {l.createdAt ? format(new Date(l.createdAt), "dd MMM, HH:mm:ss") : "—"}
                    </td>
                    <td>
                      <div className="fw600">{l.emp?.fullName ?? "System"}</div>
                      <div className="text-muted small mono">{l.emp?.employeeId ?? "—"}</div>
                    </td>
                    <td>
                      <span className={`badge ${ACTION_COLORS[l.action] ?? "badge-gray"}`}>
                        {l.action?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{l.entityType ? <span className="text-muted small">{l.entityType} #{l.entityId}</span> : "—"}</td>
                    <td className="mono small">{l.ipAddress ?? "—"}</td>
                    <td className="text-muted small">{l.notes ?? "—"}</td>
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
