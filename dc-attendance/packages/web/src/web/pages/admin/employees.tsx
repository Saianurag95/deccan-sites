import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Layout } from "../../components/layout";
import { useState } from "react";
import { Plus, Search, Edit2, UserX, UserCheck, X } from "lucide-react";

interface EmpForm {
  fullName: string; email: string; password: string; employeeId: string;
  mobile: string; departmentId: string; designation: string; joiningDate: string;
}
const emptyForm: EmpForm = {
  fullName: "", email: "", password: "", employeeId: "",
  mobile: "", departmentId: "", designation: "", joiningDate: "",
};

const DEPTS = [
  { id: 1, name: "HR" }, { id: 2, name: "Sales" }, { id: 3, name: "Marketing" },
  { id: 4, name: "Design" }, { id: 5, name: "Development" }, { id: 6, name: "AI Team" },
  { id: 7, name: "Operations" }, { id: 8, name: "Administration" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = { active: "badge-green", inactive: "badge-gray", suspended: "badge-red" };
  return <span className={`badge ${map[status] ?? "badge-gray"}`}>{status}</span>;
}

export default function AdminEmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState<any>(null);
  const [form, setForm] = useState<EmpForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["employees", search, statusFilter, deptFilter],
    queryFn: async () => {
      const res = await api.employees.$get({ query: { search, status: statusFilter, department: deptFilter } });
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (data: EmpForm) => {
      const res = await api.employees.$post({ json: data });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); setShowModal(false); setForm(emptyForm); setSuccess("Employee created successfully"); setTimeout(() => setSuccess(""), 3000); },
    onError: (e: any) => setError(e.message ?? "Failed to create employee"),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmpForm & { status: string }> }) => {
      const res = await api.employees[":id"].$put({ param: { id: String(id) }, json: data });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); setShowModal(false); setEditEmp(null); },
  });

  const employees: any[] = (data as any)?.employees ?? [];

  const openCreate = () => { setEditEmp(null); setForm(emptyForm); setError(""); setShowModal(true); };
  const openEdit = (emp: any) => {
    setEditEmp(emp);
    setForm({ fullName: emp.fullName, email: emp.email, password: "", employeeId: emp.employeeId, mobile: emp.mobile ?? "", departmentId: String(emp.departmentId ?? ""), designation: emp.designation ?? "", joiningDate: emp.joiningDate ?? "" });
    setError(""); setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (editEmp) {
      update.mutate({ id: editEmp.id, data: { fullName: form.fullName, mobile: form.mobile, departmentId: form.departmentId, designation: form.designation, joiningDate: form.joiningDate } });
    } else {
      if (!form.password) { setError("Password is required"); return; }
      create.mutate(form);
    }
  };

  const toggleStatus = (emp: any) => {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    update.mutate({ id: emp.id, data: { status: newStatus } });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Employee Management</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{employees.length} employees total</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Add Employee
          </button>
        </div>

        {success && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46" }}>{success}</div>}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input className="input pl-9" placeholder="Search by name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select className="input" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {DEPTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>No employees found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {emp.fullName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{emp.fullName}</div>
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-muted)" }}>{emp.employeeId}</td>
                      <td className="text-sm" style={{ color: "var(--text)" }}>
                        {DEPTS.find(d => d.id === emp.departmentId)?.name ?? "—"}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text)" }}>{emp.designation ?? "—"}</td>
                      <td>{statusBadge(emp.status)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => openEdit(emp)}>
                            <Edit2 size={14} style={{ color: "var(--text-muted)" }} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => toggleStatus(emp)}
                          >
                            {emp.status === "active"
                              ? <UserX size={14} color="#EF4444" />
                              : <UserCheck size={14} color="#10B981" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {editEmp ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Full Name *</label>
                <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Employee ID *</label>
                <input className="input" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} disabled={!!editEmp} required={!editEmp} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Email *</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!!editEmp} required={!editEmp} />
              </div>
              {!editEmp && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Password *</label>
                  <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Mobile</label>
                <input className="input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Department</label>
                <select className="input" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
                  <option value="">Select...</option>
                  {DEPTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Designation</label>
                <input className="input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Joining Date</label>
                <input type="date" className="input" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={create.isPending || update.isPending}>
                  {(create.isPending || update.isPending) ? "Saving..." : editEmp ? "Update Employee" : "Create Employee"}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
