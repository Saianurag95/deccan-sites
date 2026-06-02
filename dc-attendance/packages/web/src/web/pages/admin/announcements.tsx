import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Pin, Megaphone } from "lucide-react";
import { format } from "date-fns";

const TYPE_OPTIONS = ["general", "meeting", "holiday", "update", "urgent"];

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    general: "badge-gray", meeting: "badge-blue", holiday: "badge-green",
    update: "badge-yellow", urgent: "badge-red",
  };
  return <span className={`badge ${map[type] ?? "badge-gray"}`}>{type}</span>;
};

interface AnnForm {
  title: string; content: string; type: string;
  isPinned: boolean; expiresAt: string;
}
const emptyForm: AnnForm = { title: "", content: "", type: "general", isPinned: false, expiresAt: "" };

export default function AdminAnnouncementsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<AnnForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const res = await (api as any).announcements.$get();
      if (!res.ok) return { announcements: [] };
      return res.json();
    },
  });

  const items: any[] = (data as any)?.announcements ?? [];

  const createMut = useMutation({
    mutationFn: async (d: AnnForm) => {
      const res = await (api as any).announcements.$post({ json: d });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AnnForm }) => {
      const res = await (api as any).announcements[":id"].$put({ param: { id: String(id) }, json: data });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await (api as any).announcements[":id"].$delete({ param: { id: String(id) } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); setDeleteId(null); },
  });

  function openCreate() { setForm(emptyForm); setEditItem(null); setShowModal(true); }
  function openEdit(a: any) {
    setEditItem(a);
    setForm({ title: a.title, content: a.content, type: a.type, isPinned: a.isPinned, expiresAt: a.expiresAt ?? "" });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditItem(null); setForm(emptyForm); }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) return;
    if (editItem) updateMut.mutate({ id: editItem.id, data: form });
    else createMut.mutate(form);
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">Post company-wide notices and updates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Post</button>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Megaphone size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p>No announcements yet. Post one to notify all employees.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((a: any) => (
            <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.type === "urgent" ? "#EF4444" : a.type === "meeting" ? "#3B82F6" : a.type === "holiday" ? "#10B981" : "var(--primary)"}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.isPinned && (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--primary)" }}>
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    {typeBadge(a.type)}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {a.createdAt ? format(new Date(a.createdAt), "dd MMM yyyy, hh:mm a") : ""}
                    </span>
                    {a.expiresAt && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        · Expires {format(new Date(a.expiresAt + "T00:00:00"), "dd MMM")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--text)" }}>{a.title}</h3>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-muted)" }}>{a.content}</p>
                </div>
                <div className="action-btns flex-shrink-0">
                  <button className="btn-icon" onClick={() => openEdit(a)}><Edit2 size={14} /></button>
                  <button className="btn-icon danger" onClick={() => setDeleteId(a.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? "Edit Announcement" : "New Announcement"}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body flex flex-col gap-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Office Closed on Friday" />
                </div>
                <div>
                  <label className="form-label">Content *</label>
                  <textarea className="input" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required placeholder="Write the full announcement here..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Category</label>
                    <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Expires On (optional)</label>
                    <input type="date" className="input" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} />
                    <div className="w-10 h-5 rounded-full transition-colors" style={{ background: form.isPinned ? "var(--primary)" : "var(--border)" }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: form.isPinned ? "1.3rem" : "0.1rem" }} />
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: "var(--text)" }}>Pin this announcement (shows at top)</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? "Posting…" : editItem ? "Update" : "Post Announcement"}
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
              <h2>Delete Announcement?</h2>
              <button className="btn-icon" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body"><p>This will remove the announcement from all employee feeds.</p></div>
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
