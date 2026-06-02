import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Flag, CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS = ["pending", "in_progress", "completed", "on_hold", "cancelled"];

const priorityBadge = (p: string) => {
  const map: Record<string, { cls: string; icon: string }> = {
    low: { cls: "badge-green", icon: "↓" },
    medium: { cls: "badge-blue", icon: "→" },
    high: { cls: "badge-yellow", icon: "↑" },
    critical: { cls: "badge-red", icon: "⚡" },
  };
  const { cls, icon } = map[p] ?? { cls: "badge-gray", icon: "" };
  return <span className={`badge ${cls}`}>{icon} {p}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pending: "badge-gray", in_progress: "badge-blue", completed: "badge-green",
    on_hold: "badge-yellow", cancelled: "badge-red",
  };
  return <span className={`badge ${map[s] ?? "badge-gray"}`}>{s.replace("_", " ")}</span>;
};

interface TaskForm {
  title: string; description: string; assignedTo: string; projectName: string;
  priority: string; dueDate: string; notes: string;
}
const emptyForm: TaskForm = { title: "", description: "", assignedTo: "", projectName: "", priority: "medium", dueDate: "", notes: "" };

export default function AdminTasksPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterEmp, setFilterEmp] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["admin-tasks", filterStatus, filterPriority, filterEmp],
    queryFn: async () => {
      const res = await (api as any).tasks.all.$get({
        query: {
          ...(filterStatus && { status: filterStatus }),
          ...(filterPriority && { priority: filterPriority }),
          ...(filterEmp && { assignedTo: filterEmp }),
        },
      });
      return res.json();
    },
  });

  const { data: empsData } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => (await api.employees.$get({ query: {} })).json(),
  });

  const employees: any[] = (empsData as any)?.employees ?? [];
  const taskList: any[] = (tasksData as any)?.tasks ?? [];

  const empMap = Object.fromEntries(employees.map((e: any) => [e.id, e]));

  const createMut = useMutation({
    mutationFn: async (data: TaskForm) => {
      const res = await (api as any).tasks.$post({ json: data });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await (api as any).tasks[":id"].$put({ param: { id: String(id) }, json: data });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await (api as any).tasks[":id"].$delete({ param: { id: String(id) } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); setDeleteId(null); },
  });

  function openCreate() { setForm(emptyForm); setEditTask(null); setShowModal(true); }
  function openEdit(t: any) {
    setEditTask(t);
    setForm({
      title: t.title, description: t.description ?? "", assignedTo: String(t.assignedTo),
      projectName: t.projectName ?? "", priority: t.priority, dueDate: t.dueDate ?? "", notes: t.notes ?? "",
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditTask(null); setForm(emptyForm); }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.assignedTo) return;
    if (editTask) updateMut.mutate({ id: editTask.id, data: form });
    else createMut.mutate(form);
  }

  const stats = {
    total: taskList.length,
    pending: taskList.filter(t => t.status === "pending").length,
    inProgress: taskList.filter(t => t.status === "in_progress").length,
    completed: taskList.filter(t => t.status === "completed").length,
    critical: taskList.filter(t => t.priority === "critical").length,
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-sub">Assign and track employee tasks</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Assign Task</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: <Flag size={18} />, color: "#6366F1" },
          { label: "Pending", value: stats.pending, icon: <Clock3 size={18} />, color: "#F59E0B" },
          { label: "In Progress", value: stats.inProgress, icon: <AlertCircle size={18} />, color: "#3B82F6" },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={18} />, color: "#10B981" },
          { label: "Critical", value: stats.critical, icon: <Flag size={18} />, color: "#EF4444" },
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

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
            <option value="">All Employees</option>
            {employees.filter((e: any) => e.role !== "admin").map((e: any) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : taskList.length === 0 ? (
          <div className="empty-state">No tasks found. Create one to get started.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th><th>Assigned To</th><th>Priority</th><th>Status</th>
                  <th>Progress</th><th>Due Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {taskList.map((t: any) => {
                  const emp = empMap[t.assignedTo];
                  const overdue = t.dueDate && t.status !== "completed" && t.dueDate < new Date().toISOString().split("T")[0];
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{t.title}</div>
                        {t.projectName && <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.projectName}</div>}
                      </td>
                      <td>
                        {emp ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {emp.fullName?.[0]}
                            </div>
                            <span className="text-sm" style={{ color: "var(--text)" }}>{emp.fullName}</span>
                          </div>
                        ) : <span className="text-sm" style={{ color: "var(--text-muted)" }}>ID:{t.assignedTo}</span>}
                      </td>
                      <td>{priorityBadge(t.priority)}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)", minWidth: 60 }}>
                            <div className="h-2 rounded-full transition-all" style={{
                              width: `${t.progress ?? 0}%`,
                              background: t.progress >= 100 ? "#10B981" : t.progress >= 60 ? "#3B82F6" : "#F59E0B"
                            }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t.progress ?? 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`text-sm ${overdue ? "text-red-500 font-medium" : ""}`} style={!overdue ? { color: "var(--text-muted)" } : {}}>
                          {t.dueDate ? format(new Date(t.dueDate + "T00:00:00"), "dd MMM yyyy") : "—"}
                          {overdue && " ⚠"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" onClick={() => openEdit(t)}><Edit2 size={14} /></button>
                          <button className="btn-icon danger" onClick={() => setDeleteId(t.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? "Edit Task" : "Assign New Task"}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Task Title *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Assign To *</label>
                  <select className="input" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} required>
                    <option value="">Select employee...</option>
                    {employees.filter((e: any) => e.role !== "admin").map((e: any) => (
                      <option key={e.id} value={e.id}>{e.fullName} — {e.employeeId}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Project / Client</label>
                  <input className="input" value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} placeholder="e.g. Client XYZ" />
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                {editTask && (
                  <>
                    <div>
                      <label className="form-label">Status</label>
                      <select className="input" value={(editTask as any).status} onChange={e => setEditTask((t: any) => ({ ...t, status: e.target.value }))}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Progress (%)</label>
                      <input type="number" min={0} max={100} className="input" value={(editTask as any).progress ?? 0}
                        onChange={e => setEditTask((t: any) => ({ ...t, progress: Number(e.target.value) }))} />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? "Saving…" : editTask ? "Update Task" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task?</h2>
              <button className="btn-icon" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body"><p>This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
