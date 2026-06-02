import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Send, Paperclip, X } from "lucide-react";

interface UpdateForm {
  taskTitle: string;
  projectName: string;
  description: string;
  completionPct: number;
  currentStatus: string;
  challenges: string;
  notes: string;
  attachmentUrl: string;
}

const emptyForm: UpdateForm = {
  taskTitle: "", projectName: "", description: "",
  completionPct: 50, currentStatus: "in_progress",
  challenges: "", notes: "", attachmentUrl: "",
};

/** Resize + compress an image File to base64 JPEG (max 1280px, quality 0.72) */
function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1280;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function UpdatesPage() {
  const qc = useQueryClient();
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, UpdateForm>>({});
  const [successSlots, setSuccessSlots] = useState<Set<string>>(new Set());
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ["work-slots"],
    queryFn: async () => (await (api["work-updates"] as any).slots.$get()).json(),
    refetchInterval: 60000,
  });

  const submit = useMutation({
    mutationFn: async ({ slotStart, slotEnd, form }: { slotStart: string; slotEnd: string; form: UpdateForm }) => {
      const res = await (api["work-updates"] as any).$post({ json: { slotStart, slotEnd, ...form } });
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["work-slots"] });
      setSuccessSlots(prev => new Set([...prev, vars.slotStart]));
      setActiveSlot(null);
    },
  });

  const slots = (slotsData as any)?.slots ?? [];

  const getForm = (slotStart: string): UpdateForm => forms[slotStart] ?? emptyForm;
  const setForm = (slotStart: string, updates: Partial<UpdateForm>) => {
    setForms(prev => ({ ...prev, [slotStart]: { ...getForm(slotStart), ...updates } }));
  };

  const handleFileChange = async (slotStart: string, file: File | null) => {
    if (!file) return;
    setUploadingSlot(slotStart);
    try {
      const base64 = await resizeToBase64(file);
      setForm(slotStart, { attachmentUrl: base64 });
    } catch (e) {
      console.error("Image resize failed", e);
    } finally {
      setUploadingSlot(null);
    }
  };

  const clearAttachment = (slotStart: string) => {
    setForm(slotStart, { attachmentUrl: "" });
    const input = fileInputRefs.current[slotStart];
    if (input) input.value = "";
  };

  /** Format slot label from HH:MM string */
  const slotLabel = (start: string, end: string) => {
    const fmt = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Work Updates</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {format(new Date(), "EEEE, MMMM d, yyyy")} · Submit updates for each 2-hour slot
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {slots.map((slot: any) => {
              const isOpen = activeSlot === slot.start;
              const form = getForm(slot.start);
              const isSuccess = successSlots.has(slot.start);
              const isUploading = uploadingSlot === slot.start;

              return (
                <div key={slot.start} className="card" style={{
                  borderLeft: `4px solid ${slot.isSubmitted || isSuccess ? "#10B981" : slot.isMissed ? "#EF4444" : "var(--border)"}`,
                }}>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setActiveSlot(isOpen ? null : slot.start)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        slot.isSubmitted || isSuccess ? "bg-green-100" : slot.isMissed ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        {slot.isSubmitted || isSuccess
                          ? <CheckCircle size={16} color="#10B981" />
                          : slot.isMissed
                          ? <AlertCircle size={16} color="#EF4444" />
                          : <Clock size={16} color="var(--text-muted)" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm" style={{ color: "var(--text)" }}>
                          {slotLabel(slot.start, slot.end)}
                        </div>
                        {slot.update && (
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{slot.update.taskTitle}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {slot.isSubmitted || isSuccess ? (
                        <span className="badge badge-green text-xs">Submitted</span>
                      ) : slot.isMissed ? (
                        <span className="badge badge-red text-xs">Missed</span>
                      ) : (
                        <span className="badge badge-gray text-xs">Pending</span>
                      )}
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Existing update details */}
                  {slot.update && !isOpen && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs">
                          <span style={{ color: "var(--text-muted)" }}>Task: </span>
                          <span style={{ color: "var(--text)" }}>{slot.update.taskTitle}</span>
                        </div>
                        <div className="text-xs">
                          <span style={{ color: "var(--text-muted)" }}>Project: </span>
                          <span style={{ color: "var(--text)" }}>{slot.update.projectName || "—"}</span>
                        </div>
                        <div className="text-xs">
                          <span style={{ color: "var(--text-muted)" }}>Completion: </span>
                          <span style={{ color: "var(--text)" }}>{slot.update.completionPct}%</span>
                        </div>
                        <div className="text-xs">
                          <span style={{ color: "var(--text-muted)" }}>Status: </span>
                          <span style={{ color: "var(--text)" }}>{slot.update.currentStatus?.replace("_", " ")}</span>
                        </div>
                      </div>
                      {/* Attachment thumbnail */}
                      {slot.update.attachmentUrl && (
                        <div className="mt-2">
                          <a href={slot.update.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={slot.update.attachmentUrl}
                              alt="Attachment"
                              style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, border: "1px solid var(--border)", objectFit: "cover", cursor: "pointer" }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Task Title *</label>
                          <input className="input" placeholder="What did you work on?" value={form.taskTitle}
                            onChange={e => setForm(slot.start, { taskTitle: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Project Name</label>
                          <input className="input" placeholder="Project name" value={form.projectName}
                            onChange={e => setForm(slot.start, { projectName: e.target.value })} />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Description</label>
                        <textarea className="input" rows={3} placeholder="Describe what you accomplished..."
                          value={form.description} onChange={e => setForm(slot.start, { description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                            Completion: {form.completionPct}%
                          </label>
                          <input type="range" min={0} max={100} step={5}
                            className="w-full accent-orange-500"
                            value={form.completionPct}
                            onChange={e => setForm(slot.start, { completionPct: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Status</label>
                          <select className="input select" value={form.currentStatus}
                            onChange={e => setForm(slot.start, { currentStatus: e.target.value })}>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                            <option value="on_hold">On Hold</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Challenges/Blockers</label>
                          <textarea className="input" rows={2} placeholder="Any blockers?" value={form.challenges}
                            onChange={e => setForm(slot.start, { challenges: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Notes</label>
                          <textarea className="input" rows={2} placeholder="Additional notes..." value={form.notes}
                            onChange={e => setForm(slot.start, { notes: e.target.value })} />
                        </div>
                      </div>

                      {/* Photo attachment */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                          Screenshot / Photo
                        </label>
                        {form.attachmentUrl ? (
                          <div className="flex items-start gap-3">
                            <a href={form.attachmentUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={form.attachmentUrl}
                                alt="Preview"
                                style={{ maxHeight: 160, maxWidth: 280, borderRadius: 6, border: "1px solid var(--border)", objectFit: "cover" }}
                              />
                            </a>
                            <button
                              className="btn-icon"
                              onClick={() => clearAttachment(slot.start)}
                              title="Remove image"
                              style={{ marginTop: 2 }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 8,
                              padding: "8px 14px", borderRadius: 6, cursor: "pointer",
                              border: "1px dashed var(--border)", color: "var(--text-muted)",
                              fontSize: 13, opacity: isUploading ? 0.6 : 1,
                            }}
                          >
                            {isUploading
                              ? <><div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> Processing…</>
                              : <><Paperclip size={14} /> Attach screenshot</>
                            }
                            <input
                              ref={el => { fileInputRefs.current[slot.start] = el; }}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={isUploading}
                              onChange={e => handleFileChange(slot.start, e.target.files?.[0] ?? null)}
                            />
                          </label>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          Images are resized to max 1280px · JPEG
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="btn-primary flex items-center gap-2"
                          disabled={!form.taskTitle || submit.isPending || isUploading}
                          onClick={() => submit.mutate({ slotStart: slot.start, slotEnd: slot.end, form })}
                        >
                          {submit.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                          Submit Update
                        </button>
                        <button className="btn-outline" onClick={() => setActiveSlot(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
