import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useState } from "react";
import { CheckCircle2, Clock3, AlertCircle, Flag, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    low: "badge-green", medium: "badge-blue", high: "badge-yellow", critical: "badge-red",
  };
  return <span className={`badge ${map[p] ?? "badge-gray"}`}>{p}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pending: "badge-gray", in_progress: "badge-blue", completed: "badge-green",
    on_hold: "badge-yellow", cancelled: "badge-red",
  };
  return <span className={`badge ${map[s] ?? "badge-gray"}`}>{s.replace("_", " ")}</span>;
};

export default function TasksPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, { progress: number; status: string; notes: string }>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["my-tasks", filterStatus],
    queryFn: async () => {
      const res = await (api as any).tasks.my.$get({ query: filterStatus ? { status: filterStatus } : {} });
      return res.json();
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, progress, status, notes }: { id: number; progress: number; status: string; notes: string }) => {
      const res = await (api as any).tasks[":id"].progress.$patch({ param: { id: String(id) }, json: { progress, status, notes } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      setExpandedId(null);
      const updated = { ...progressMap };
      delete updated[vars.id];
      setProgressMap(updated);
    },
  });

  const tasks: any[] = (data as any)?.tasks ?? [];

  function startUpdate(t: any) {
    setProgressMap(m => ({ ...m, [t.id]: { progress: t.progress ?? 0, status: t.status, notes: t.notes ?? "" } }));
    setExpandedId(t.id);
  }

  function saveUpdate(id: number) {
    const u = progressMap[id];
    if (!u) return;
    updateMut.mutate({ id, ...u });
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-sub">Tasks assigned to you</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: <Flag size={18} />, color: "#6366F1" },
          { label: "Pending", value: stats.pending, icon: <Clock3 size={18} />, color: "#F59E0B" },
          { label: "In Progress", value: stats.inProgress, icon: <AlertCircle size={18} />, color: "#3B82F6" },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={18} />, color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + "20" }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <select className="input w-full md:w-64" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tasks */}
      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks assigned to you yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((t: any) => {
            const isExpanded = expandedId === t.id;
            const u = progressMap[t.id];
            const overdue = t.dueDate && t.status !== "completed" && t.dueDate < new Date().toISOString().split("T")[0];
            return (
              <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.priority === "critical" ? "#EF4444" : t.priority === "high" ? "#F59E0B" : "var(--primary)"}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {priorityBadge(t.priority)}
                      {statusBadge(t.status)}
                      {overdue && <span className="badge badge-red">Overdue</span>}
                    </div>
                    <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>{t.title}</h3>
                    {t.projectName && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{t.projectName}</p>}
                    {t.description && <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{t.description}</p>}

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                        <div className="h-2 rounded-full transition-all" style={{
                          width: `${t.progress ?? 0}%`,
                          background: t.progress >= 100 ? "#10B981" : t.progress >= 60 ? "#3B82F6" : "#F59E0B"
                        }} />
                      </div>
                      <span className="text-sm font-medium w-10 text-right" style={{ color: "var(--text-muted)" }}>{t.progress ?? 0}%</span>
                    </div>

                    {t.dueDate && (
                      <p className={`text-xs mt-2 ${overdue ? "text-red-500 font-medium" : ""}`} style={!overdue ? { color: "var(--text-muted)" } : {}}>
                        Due: {format(new Date(t.dueDate + "T00:00:00"), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>

                  {t.status !== "completed" && t.status !== "cancelled" && (
                    <button
                      className="btn btn-outline text-xs flex items-center gap-1 flex-shrink-0"
                      onClick={() => isExpanded ? setExpandedId(null) : startUpdate(t)}
                    >
                      Update <ChevronDown size={12} style={{ transform: isExpanded ? "rotate(180deg)" : "none" }} />
                    </button>
                  )}
                </div>

                {/* Inline update form */}
                {isExpanded && u && (
                  <div className="mt-4 pt-4 border-t flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Progress (%)</label>
                        <input
                          type="range" min={0} max={100} step={5}
                          value={u.progress}
                          onChange={e => setProgressMap(m => ({ ...m, [t.id]: { ...u, progress: Number(e.target.value) } }))}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-bold mt-1" style={{ color: "var(--primary)" }}>{u.progress}%</div>
                      </div>
                      <div>
                        <label className="form-label">Status</label>
                        <select className="input" value={u.status} onChange={e => setProgressMap(m => ({ ...m, [t.id]: { ...u, status: e.target.value } }))}>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Notes / Update</label>
                      <textarea className="input" rows={2} value={u.notes} onChange={e => setProgressMap(m => ({ ...m, [t.id]: { ...u, notes: e.target.value } }))} />
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary text-sm" onClick={() => saveUpdate(t.id)} disabled={updateMut.isPending}>
                        {updateMut.isPending ? "Saving…" : "Save Update"}
                      </button>
                      <button className="btn btn-outline text-sm" onClick={() => setExpandedId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
