import { useState } from "react";
import { useLocation } from "wouter";
import { authClient, captureToken } from "../lib/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authClient.signIn.email(
        { email, password },
        { onSuccess: captureToken }
      );
      if (res.error) {
        setError(res.error.message ?? "Invalid credentials");
      } else {
        const role = (res.data?.user as any)?.role;
        navigate(role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #E8501A 0%, #2B3BA0 100%)" }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white">
        <img src="/dc_logo.jpg" alt="Digital Connect" className="w-24 h-24 rounded-2xl object-contain bg-white/10 p-3 mb-8" />
        <h1 className="text-4xl font-bold mb-4 text-center">Digital Connect</h1>
        <p className="text-xl text-white/80 text-center mb-8">Employee Tracking & Attendance Management</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { label: "Track Attendance", desc: "Daily check-in/out" },
            { label: "Work Updates", desc: "2-hour slot logging" },
            { label: "Task Management", desc: "Assigned tasks tracker" },
            { label: "Announcements", desc: "Company updates feed" },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-white/70 text-xs mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <img src="/dc_logo.jpg" alt="DC" className="w-12 h-12 rounded-xl object-contain" />
              <div>
                <div className="font-bold text-lg" style={{ color: "var(--text)" }}>Digital Connect</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Employee Portal</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Welcome back</h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>Sign in to your account to continue</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@digitalconnect.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Contact your administrator if you don't have access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
