import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Search, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const SLOT_LABELS: Record<string, string> = {
  "10:00": "Slot 1 · 10:00–12:00",
  "12:00": "Slot 2 · 12:00–14:00",
  "14:00": "Slot 3 · 14:00–16:00",
  "16:00": "Slot 4 · 16:00–18:00",
};

export default function AdminUpdatesPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-updates", date],
    queryFn: async () => {
      const res = await (api["work-updates"] as any).all.$get({ query: { date } });
      if (!res.ok) return { updates: [] };
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
  const updates: any[] = data?.updates ?? [];

  const enriched = updates.map((u: any) => ({ ...u, emp: empMap[u.employeeId] }));

  const filtered = enriched.filter((u: any) =>
    u.emp?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.emp?.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Work Updates</h1>
          <p className="page-sub">Slot-wise updates submitted by employees</p>
        </div>
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
          <div className="empty-state">No updates for {date}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Slot</th>
                  <th>Task / Project</th>
                  <th>Completion</th>
                  <th>Update</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <>
                    <tr key={u.id}>
                      <td>
                        <div className="fw600">{u.emp?.fullName ?? "Unknown"}</div>
                        <div className="text-muted small mono">{u.emp?.employeeId ?? "—"}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {SLOT_LABELS[u.slotStart] ?? `${u.slotStart}–${u.slotEnd}`}
                        </span>
                      </td>
                      <td>
                        <div className="fw600">{u.taskTitle ?? "—"}</div>
                        <div className="text-muted small">{u.projectName}</div>
                      </td>
                      <td>
                        {u.completionPct != null ? (
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${u.completionPct}%`, background: u.completionPct >= 80 ? "var(--success)" : "#f59e0b" }} />
                            </div>
                            <span>{u.completionPct}%</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="update-preview">
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{u.description?.substring(0, 60)}{(u.description?.length ?? 0) > 60 ? "…" : ""}</span>
                          {u.attachmentUrl && (
                            <a href={u.attachmentUrl} target="_blank" rel="noopener noreferrer" title="View attachment" onClick={e => e.stopPropagation()}>
                              <img
                                src={u.attachmentUrl}
                                alt="attachment"
                                style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0, cursor: "pointer" }}
                              />
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                          {expanded === u.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expanded === u.id && (
                      <tr key={`${u.id}-exp`} className="expanded-row">
                        <td colSpan={6}>
                          <div className="update-full-text">
                            <strong>Description:</strong> {u.description}<br />
                            {u.challenges && <><strong>Challenges:</strong> {u.challenges}<br /></>}
                            {u.notes && <><strong>Notes:</strong> {u.notes}<br /></>}
                            {u.attachmentUrl && (
                              <div style={{ marginTop: 10 }}>
                                <strong>Attachment:</strong>
                                <div style={{ marginTop: 6 }}>
                                  <a href={u.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={u.attachmentUrl}
                                      alt="Attachment"
                                      style={{
                                        maxWidth: 480, maxHeight: 320,
                                        borderRadius: 8, border: "1px solid var(--border)",
                                        objectFit: "contain", cursor: "pointer", display: "block",
                                      }}
                                    />
                                  </a>
                                  <div className="text-muted small" style={{ marginTop: 4 }}>Click to open full size</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
