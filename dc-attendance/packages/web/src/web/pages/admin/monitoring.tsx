import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Search, RefreshCw, Wifi } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  online:     { label: "Online",     cls: "badge-green"  },
  working:    { label: "Working",    cls: "badge-green"  },
  offline:    { label: "Offline",    cls: "badge-gray"   },
  logged_out: { label: "Logged Out", cls: "badge-yellow" },
};

function onlineBadge(status: string) {
  const b = STATUS_BADGE[status] ?? { label: status, cls: "badge-gray" };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

export default function AdminMonitoringPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: async () => {
      const res = await (api as any).monitoring.$get({});
      if (!res.ok) return { employees: [] };
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const entries: any[] = data?.employees ?? [];

  const filtered = entries.filter((e: any) =>
    e.employee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.employee?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    e.employee?.designation?.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = filtered.filter((e: any) => e.onlineStatus === "online" || e.onlineStatus === "working").length;

  const sorted = [
    ...filtered.filter(e => e.onlineStatus === "working"),
    ...filtered.filter(e => e.onlineStatus === "online"),
    ...filtered.filter(e => e.onlineStatus === "logged_out"),
    ...filtered.filter(e => e.onlineStatus === "offline"),
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Monitoring</h1>
          <p className="page-sub">Real-time employee online status</p>
        </div>
        <button className="btn btn-outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={15} className={isFetching ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>{onlineCount}</div>
          <div className="stat-label">Online Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--text-muted)" }}>{filtered.length - onlineCount}</div>
          <div className="stat-label">Offline / Out</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Total Active</div>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="input-icon">
            <Search size={16} />
            <input className="input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="text-muted small" style={{ alignSelf: "center" }}>
            <Wifi size={13} style={{ marginRight: 4 }} />
            Auto-refreshes every 30s
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">No active employees</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Last Update</th>
                  <th>Last Task</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e: any) => {
                  const emp = e.employee;
                  const att = e.attendance;
                  const upd = e.lastUpdate;
                  return (
                    <tr key={emp?.id}>
                      <td>
                        <div className="fw600">{emp?.fullName}</div>
                        <div className="text-muted small mono">{emp?.employeeId}</div>
                      </td>
                      <td>{emp?.designation ?? "—"}</td>
                      <td>{onlineBadge(e.onlineStatus)}</td>
                      <td>{att?.checkIn ? formatDistanceToNow(new Date(att.checkIn), { addSuffix: true }) : "—"}</td>
                      <td>{upd?.createdAt ? formatDistanceToNow(new Date(upd.createdAt), { addSuffix: true }) : "—"}</td>
                      <td className="text-muted small">{upd?.taskTitle ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
