import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Calendar } from "lucide-react";


interface HolidayForm { name: string; date: string; type: string; }
const emptyForm: HolidayForm = { name: "", date: "", type: "public" };

export default function AdminHolidaysPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<HolidayForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ["admin-holidays"],
    queryFn: async () => {
      const res = await (api.holidays as any).$get();
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.holidays ?? data?.data ?? []);
    },
  });

  const createMut = useMutation({
    mutationFn: async (data: HolidayForm) => {
      const res = await (api.holidays as any).$post({ json: data });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-holidays"] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HolidayForm }) => {
      const res = await (api.holidays as any)[":id"].$put({ param: { id }, json: data });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-holidays"] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await (api.holidays as any)[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-holidays"] }); setDeleteId(null); },
  });

  function openCreate() { setForm(emptyForm); setEditId(null); setShowModal(true); }
  function openEdit(h: any) { setForm({ name: h.name, date: h.date, type: h.type }); setEditId(h.id); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditId(null); setForm(emptyForm); }

  function save() {
    if (!form.name || !form.date) return;
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  }

  const typeBadge = (type: string) => {
    const map: Record<string, string> = { public: "badge-green", optional: "badge-yellow", restricted: "badge-blue" };
    return <span className={`badge ${map[type] ?? "badge-gray"}`}>{type}</span>;
  };

  const sorted = Array.isArray(holidays) ? [...holidays].sort((a: any, b: any) => a.date.localeCompare(b.date)) : [];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Holidays</h1>
          <p className="page-sub">Manage company holidays</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Holiday</button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">No holidays added yet</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Holiday Name</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((h: any) => (
                  <tr key={h.id}>
                    <td><span className="mono">{h.date}</span></td>
                    <td>{(() => { try { const [y,m,d] = h.date.split("-").map(Number); return new Date(y,m-1,d).toLocaleString("en-IN",{weekday:"long"}); } catch { return h.date; } })()}</td>
                    <td className="fw600">{h.name}</td>
                    <td>{typeBadge(h.type)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(h)}><Edit2 size={15} /></button>
                        <button className="btn-icon danger" title="Delete" onClick={() => setDeleteId(h.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? "Edit Holiday" : "Add Holiday"}</h2>
              <button className="btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Holiday Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Diwali" />
              </div>
              <div className="form-group">
                <label>Date</label>
                <div className="input-icon">
                  <Calendar size={16} />
                  <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="input select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="public">Public</option>
                  <option value="optional">Optional</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? "Saving…" : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Holiday?</h2>
              <button className="btn-icon" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>This will permanently remove the holiday. Attendance records won't be affected.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
