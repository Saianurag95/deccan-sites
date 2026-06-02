import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { authClient } from "../lib/auth";
import { useState } from "react";
import { User, Lock, Save, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => (await (api.employees as any).me.profile.$get()).json(),
  });

  const emp: any = (data as any)?.employee;

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });

  const changePw = useMutation({
    mutationFn: async () => {
      const res = await authClient.changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      return res;
    },
    onSuccess: () => { setMsg("Password changed successfully"); setPwForm({ current: "", newPw: "", confirm: "" }); },
    onError: (e: any) => setErr(e.message ?? "Failed to change password"),
  });

  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setErr("");
    if (pwForm.newPw !== pwForm.confirm) { setErr("Passwords do not match"); return; }
    if (pwForm.newPw.length < 6) { setErr("Password must be at least 6 characters"); return; }
    changePw.mutate();
  };

  const depts: Record<number, string> = { 1: "HR", 2: "Sales", 3: "Marketing", 4: "Design", 5: "Development", 6: "AI Team", 7: "Operations", 8: "Administration" };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Profile</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>View and manage your account</p>
        </div>

        {/* Avatar + name */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {session?.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{session?.user?.name}</h2>
              <p style={{ color: "var(--text-muted)" }}>{emp?.designation ?? "—"}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-blue text-xs">{emp?.employeeId ?? "—"}</span>
                <span className="badge badge-orange text-xs">{emp?.role === "admin" ? "Super Admin" : emp?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["profile", "password"] as const).map(t => (
            <button
              key={t}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? "var(--primary)" : "var(--card)",
                color: tab === t ? "white" : "var(--text-muted)",
                border: `1px solid ${tab === t ? "var(--primary)" : "var(--border)"}`,
              }}
              onClick={() => setTab(t)}
            >
              {t === "profile" ? <><User size={14} className="inline mr-1" />Profile</> : <><Lock size={14} className="inline mr-1" />Password</>}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="card">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Full Name", value: emp?.fullName },
                  { label: "Employee ID", value: emp?.employeeId },
                  { label: "Email", value: emp?.email },
                  { label: "Mobile", value: emp?.mobile ?? "—" },
                  { label: "Department", value: emp?.departmentId ? depts[emp.departmentId] ?? `Dept #${emp.departmentId}` : "—" },
                  { label: "Designation", value: emp?.designation ?? "—" },
                  { label: "Joining Date", value: emp?.joiningDate ?? "—" },
                  { label: "Status", value: emp?.status },
                ].map(item => (
                  <div key={item.label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</label>
                    <div className="input text-sm cursor-default" style={{ color: "var(--text)" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "password" && (
          <div className="card">
            <h3 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Change Password</h3>
            {msg && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#D1FAE5", color: "#065F46" }}>{msg}</div>}
            {err && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>{err}</div>}
            <form onSubmit={handleChangePw} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Current Password</label>
                <input type="password" className="input" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>New Password</label>
                <input type="password" className="input" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Confirm New Password</label>
                <input type="password" className="input" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 w-fit" disabled={changePw.isPending}>
                {changePw.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
