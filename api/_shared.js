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
