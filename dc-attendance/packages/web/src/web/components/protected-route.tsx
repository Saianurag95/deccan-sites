import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <img src="/dc_logo.jpg" alt="DC" className="w-16 h-16 rounded-xl object-contain" />
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) return <Redirect to="/login" />;
  if (adminOnly && (session.user as any).role !== "admin") return <Redirect to="/dashboard" />;

  return <>{children}</>;
}
