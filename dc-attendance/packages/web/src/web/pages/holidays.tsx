import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { Calendar } from "lucide-react";

const typeColors: Record<string, string> = {
  public: "badge-green", company: "badge-blue", festival: "badge-orange",
};

function fmtDate(dateStr: string, style: "MMM" | "dd" | "full"): string {
  try {
    // date is stored as YYYY-MM-DD — parse without timezone shift
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (isNaN(dt.getTime())) return dateStr;
    if (style === "MMM") return dt.toLocaleString("en-IN", { month: "short" });
    if (style === "dd") return String(d).padStart(2, "0");
    return dt.toLocaleString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function HolidaysPage() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => (await api.holidays.$get()).json(),
  });

  const holidays: any[] = (data as any)?.holidays ?? [];

  // Count Sundays for the year
  const year = now.getFullYear();
  let sundayCount = 0;
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    if (d.getDay() === 0) sundayCount++;
    d.setDate(d.getDate() + 1);
  }

  const upcoming = holidays
    .filter(h => h.date && h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = holidays
    .filter(h => h.date && h.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p style={{ color: "var(--text-muted)" }}>Failed to load holidays. Please refresh.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Holiday Calendar</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Company and public holidays for {year}</p>
        </div>

        {/* Info card */}
        <div className="card mb-6" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: "#1E40AF" }}>
            <Calendar size={16} />
            <span>All Sundays are automatically marked as holidays. There are {sundayCount} Sundays in {year}.</span>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="card mb-6">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Upcoming Holidays</h2>
            <div className="flex flex-col gap-3">
              {upcoming.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg)" }}>
                  <div className="flex items-center gap-3">
                    <div className="text-center w-12">
                      <div className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        {fmtDate(h.date, "MMM")}
                      </div>
                      <div className="text-xl font-bold" style={{ color: "var(--text)" }}>
                        {fmtDate(h.date, "dd")}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{h.name}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {fmtDate(h.date, "full")}
                        {h.description && ` · ${h.description}`}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${typeColors[h.type] ?? "badge-gray"} text-xs`}>
                    {h.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Past Holidays</h2>
            <div className="flex flex-col gap-3">
              {past.slice(0, 10).map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl opacity-60" style={{ background: "var(--bg)" }}>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{h.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {fmtDate(h.date, "full")}
                    </div>
                  </div>
                  <span className={`badge ${typeColors[h.type] ?? "badge-gray"} text-xs`}>{h.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {holidays.length === 0 && (
          <div className="card text-center py-12">
            <Calendar size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)" }}>No holidays have been added yet.</p>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Ask your admin to add holidays.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
