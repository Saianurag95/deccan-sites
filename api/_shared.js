import crypto from "node:crypto";

export const websiteTypes = [
  { label: "Landing page", price: 999 },
  { label: "Business website", price: 2499 },
  { label: "E-commerce catalog", price: 4999 },
  { label: "Custom web app", price: 7999 },
];

export const estimateAddOns = [
  { label: "Extra page", price: 350 },
  { label: "Logo refresh", price: 599 },
  { label: "Content writing", price: 799 },
  { label: "Booking / enquiry flow", price: 1299 },
  { label: "Payment-ready setup", price: 1999 },
  { label: "Admin dashboard", price: 3999 },
];

export const domainOptions = [
  { label: "Already have domain", price: 0 },
  { label: "Domain setup support", price: 599 },
  { label: "Hosting launch support", price: 999 },
  { label: "Domain + hosting support", price: 1499 },
];

export function json(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

export async function readJson(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 65_536) {
      throw new Error("Request body too large");
    }
  }
  return body ? JSON.parse(body) : {};
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function envValue(...names) {
  return names.map((name) => String(process.env[name] || "").trim()).find(Boolean) || "";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatRupees(amount) {
  return `Rs.${Number(amount || 0).toLocaleString("en-IN")}`;
}

function adminRecipients() {
  return envValue("ADMIN_NOTIFY_EMAIL", "NOTIFY_EMAIL")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(isValidEmail);
}

async function sendAdminEmail({ subject, text, html }) {
  const resendApiKey = envValue("RESEND_API_KEY");
  const recipients = adminRecipients();

  if (!resendApiKey || recipients.length === 0) {
    return { delivery: "disabled" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "DeccanSites/1.0",
    },
    body: JSON.stringify({
      from: envValue("NOTIFICATION_FROM_EMAIL", "OTP_FROM_EMAIL") || "Deccan Sites <onboarding@resend.dev>",
      to: recipients,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Admin notification failed: ${body || response.status}`);
  }

  return { delivery: "email" };
}

export async function notifyAdminProjectCreated(project) {
  const subject = `New Deccan Sites brief: ${project.businessName} (${project.projectId})`;
  const text = [
    `New project brief: ${project.projectId}`,
    `Client: ${project.name}`,
    `Email: ${project.email}`,
    `WhatsApp: ${project.phone}`,
    `Business: ${project.businessName}`,
    `Category: ${project.businessCategory}`,
    `Location: ${project.businessLocation || "Not provided"}`,
    `Website type: ${project.websiteType}`,
    `Pages: ${project.pages}`,
    `Domain: ${project.domainOption}`,
    `Add-ons: ${(project.addOns || []).join(", ") || "None"}`,
    `Preferred launch: ${project.launchDate || "Not provided"}`,
    `Estimate: ${formatRupees(project.estimatedAmount)}`,
    "",
    "Idea:",
    project.idea,
    "",
    "Notes:",
    project.notes || "None",
  ].join("\n");

  const html = `
    <div style="font-family:Manrope,Inter,Arial,sans-serif;line-height:1.6;color:#101415;background:#fbfbfa;padding:24px">
      <p style="margin:0 0 8px;color:#c5a059;font-weight:800;letter-spacing:.08em;text-transform:uppercase">New project brief</p>
      <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15">${escapeHtml(project.businessName)}</h1>
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:18px">
        <p><strong>Project ID:</strong> ${escapeHtml(project.projectId)}</p>
        <p><strong>Client:</strong> ${escapeHtml(project.name)} | ${escapeHtml(project.email)} | ${escapeHtml(project.phone)}</p>
        <p><strong>Business:</strong> ${escapeHtml(project.businessCategory)} in ${escapeHtml(project.businessLocation || "Not provided")}</p>
        <p><strong>Website:</strong> ${escapeHtml(project.websiteType)} | ${escapeHtml(project.pages)} page(s) | ${escapeHtml(project.domainOption)}</p>
        <p><strong>Add-ons:</strong> ${escapeHtml((project.addOns || []).join(", ") || "None")}</p>
        <p><strong>Preferred launch:</strong> ${escapeHtml(project.launchDate || "Not provided")}</p>
        <p><strong>Estimate:</strong> ${escapeHtml(formatRupees(project.estimatedAmount))}</p>
        <hr style="border:0;border-top:1px solid #e5e5e5;margin:18px 0" />
        <p><strong>Idea:</strong><br />${escapeHtml(project.idea)}</p>
        <p><strong>Notes:</strong><br />${escapeHtml(project.notes || "None")}</p>
      </div>
    </div>
  `;

  return sendAdminEmail({ subject, text, html });
}

export async function notifyAdminPaymentConfirmed({ projectId, orderId, paymentId, status }) {
  const subject = `Payment confirmed: ${projectId || orderId}`;
  const text = [
    "A Deccan Sites payment was confirmed.",
    `Project ID: ${projectId || "Not provided"}`,
    `Order ID: ${orderId}`,
    `Payment ID: ${paymentId}`,
    `Status: ${status}`,
  ].join("\n");

  const html = `
    <div style="font-family:Manrope,Inter,Arial,sans-serif;line-height:1.6;color:#101415;background:#fbfbfa;padding:24px">
      <p style="margin:0 0 8px;color:#c5a059;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Payment confirmed</p>
      <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15">${escapeHtml(projectId || orderId)}</h1>
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:18px">
        <p><strong>Project ID:</strong> ${escapeHtml(projectId || "Not provided")}</p>
        <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
        <p><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</p>
        <p><strong>Status:</strong> ${escapeHtml(status)}</p>
      </div>
    </div>
  `;

  return sendAdminEmail({ subject, text, html });
}

export function getOptionPrice(options, selectedLabel) {
  return options.find((item) => item.label === selectedLabel)?.price || 0;
}

export function calculateProjectEstimate(project) {
  const pages = Math.max(1, Math.min(20, Number(project.pages || 1)));
  const base = getOptionPrice(websiteTypes, project.websiteType);
  const extraPages = Math.max(0, pages - 1) * 350;
  const domain = getOptionPrice(domainOptions, project.domainOption);
  const selectedAddOns = Array.isArray(project.addOns) ? project.addOns : [];
  const addOns = selectedAddOns.reduce((total, label) => total + getOptionPrice(estimateAddOns, label), 0);
  return base + extraPages + domain + addOns;
}

export function createProjectId() {
  const stamp = Date.now().toString().slice(-6);
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `DS-${new Date().getFullYear()}-${stamp}${suffix}`;
}

export function clampPaymentAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function makeReceiptId() {
  return `ds_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

export function normalizeProjectId(projectId) {
  return String(projectId || "").trim().toUpperCase();
}

export function toSupabaseProject(project) {
  return {
    project_id: project.projectId,
    name: project.name,
    email: project.email,
    phone: project.phone,
    business_name: project.businessName,
    business_location: project.businessLocation,
    business_category: project.businessCategory,
    website_type: project.websiteType,
    pages: project.pages,
    domain_option: project.domainOption,
    add_ons: project.addOns || [],
    sections: project.sections || [],
    idea: project.idea,
    reference: project.references,
    content_readiness: project.contentReadiness,
    logo_readiness: project.logoReadiness,
    launch_date: project.launchDate,
    notes: project.notes,
    estimated_amount: project.estimatedAmount,
    payment_status: project.paymentStatus || "not_paid",
  };
}

export async function insertSupabaseProject(project) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(toSupabaseProject(project)),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase insert failed: ${text || response.status}`);
  }

  return text ? JSON.parse(text) : [];
}

export async function updateSupabasePayment(projectId, paymentId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || !projectId) {
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/projects?project_id=eq.${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      payment_status: "paid",
      payment_id: paymentId,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase payment update failed: ${text || response.status}`);
  }
}
