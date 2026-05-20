import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

async function loadDotEnv() {
  try {
    const raw = await fs.readFile(path.join(root, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // Local .env is optional; production hosts usually inject env vars directly.
  }
}

await loadDotEnv();

const port = Number(process.env.PORT || 8000);
const dataDir = path.join(root, ".data");
const otpStorePath = path.join(dataDir, "auth-store.json");
const otpTtlMs = 10 * 60 * 1000;
const sessionTtlMs = 30 * 24 * 60 * 60 * 1000;
const otpSecret = process.env.OTP_SECRET || "deccan-sites-local-dev-secret";
const resendApiKey = process.env.RESEND_API_KEY || "";
const otpFromEmail = process.env.OTP_FROM_EMAIL || "Deccan Sites <onboarding@resend.dev>";
function envValue(...names) {
  return names.map((name) => String(process.env[name] || "").trim()).find(Boolean) || "";
}
const adminNotifyEmail = envValue("ADMIN_NOTIFY_EMAIL", "NOTIFY_EMAIL");
const notificationFromEmail = envValue("NOTIFICATION_FROM_EMAIL", "OTP_FROM_EMAIL") || "Deccan Sites <onboarding@resend.dev>";
const cashfreeAppId = envValue("CASHFREE_APP_ID", "CASHFREE_CLIENT_ID");
const cashfreeSecretKey = envValue("CASHFREE_SECRET_KEY", "CASHFREE_CLIENT_SECRET");
const cashfreeEnv = envValue("CASHFREE_ENV").toLowerCase() === "production" ? "production" : "sandbox";
const cashfreeApiVersion = envValue("CASHFREE_API_VERSION") || "2025-01-01";
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const isProduction = process.env.NODE_ENV === "production";
const host = process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".mp4": "video/mp4",
  ".json": "application/json; charset=utf-8",
};

async function readStore() {
  try {
    const raw = await fs.readFile(otpStorePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { otps: {}, sessions: {}, users: {}, projects: [], payments: [], projectCounter: 0 };
  }
}

function normalizeStore(store) {
  return {
    otps: store.otps || {},
    sessions: store.sessions || {},
    users: store.users || {},
    projects: Array.isArray(store.projects) ? store.projects : [],
    payments: Array.isArray(store.payments) ? store.payments : [],
    projectCounter: Number(store.projectCounter || 0),
  };
}

async function writeStore(store) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(otpStorePath, JSON.stringify(normalizeStore(store), null, 2));
}

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 65_536) {
      throw new Error("Request body too large");
    }
  }
  return body ? JSON.parse(body) : {};
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashOtp(email, code, salt) {
  return hashValue(`${email}:${code}:${salt}:${otpSecret}`);
}

function makeCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function makeToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function clampPaymentAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function normalizeProjectId(projectId) {
  return String(projectId || "").trim().toUpperCase();
}

function toSupabaseProject(project) {
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

function fromSupabaseProject(row) {
  return {
    projectId: row.project_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    businessName: row.business_name,
    businessLocation: row.business_location,
    businessCategory: row.business_category,
    websiteType: row.website_type,
    pages: row.pages,
    domainOption: row.domain_option,
    addOns: row.add_ons || [],
    sections: row.sections || [],
    idea: row.idea,
    references: row.reference,
    contentReadiness: row.content_readiness,
    logoReadiness: row.logo_readiness,
    launchDate: row.launch_date,
    notes: row.notes,
    estimatedAmount: row.estimated_amount,
    paymentStatus: row.payment_status,
    paymentId: row.payment_id,
  };
}

async function insertSupabaseProject(project) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
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

async function fetchSupabaseProject(projectId) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/projects?project_id=eq.${encodeURIComponent(projectId)}&select=*`, {
    method: "GET",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase project fetch failed: ${text || response.status}`);
  }

  const rows = text ? JSON.parse(text) : [];
  return rows[0] ? fromSupabaseProject(rows[0]) : null;
}

async function updateSupabasePayment(projectId, paymentId) {
  if (!supabaseUrl || !supabaseServiceRoleKey || !projectId) {
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/projects?project_id=eq.${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
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

const websiteTypes = [
  { label: "Landing page", price: 999 },
  { label: "Business website", price: 2499 },
  { label: "E-commerce catalog", price: 4999 },
  { label: "Custom web app", price: 7999 },
];

const estimateAddOns = [
  { label: "Extra page", price: 350 },
  { label: "Logo refresh", price: 599 },
  { label: "Content writing", price: 799 },
  { label: "Booking / enquiry flow", price: 1299 },
  { label: "Payment-ready setup", price: 1999 },
  { label: "Admin dashboard", price: 3999 },
];

const domainOptions = [
  { label: "Already have domain", price: 0 },
  { label: "Domain setup support", price: 599 },
  { label: "Hosting launch support", price: 999 },
  { label: "Domain + hosting support", price: 1499 },
];

function getOptionPrice(options, selectedLabel) {
  return options.find((item) => item.label === selectedLabel)?.price || 0;
}

function calculateProjectEstimate(project) {
  const pages = Math.max(1, Math.min(20, Number(project.pages || 1)));
  const base = getOptionPrice(websiteTypes, project.websiteType);
  const extraPages = Math.max(0, pages - 1) * 350;
  const domain = getOptionPrice(domainOptions, project.domainOption);
  const selectedAddOns = Array.isArray(project.addOns) ? project.addOns : [];
  const addOns = selectedAddOns.reduce((total, label) => total + getOptionPrice(estimateAddOns, label), 0);
  return base + extraPages + domain + addOns;
}

function createProjectId(store) {
  store.projectCounter = Number(store.projectCounter || 0) + 1;
  return `DS-${new Date().getFullYear()}-${String(store.projectCounter).padStart(4, "0")}`;
}

function pruneStore(store) {
  const now = Date.now();
  for (const [email, record] of Object.entries(store.otps)) {
    if (!record.expiresAt || record.expiresAt < now) {
      delete store.otps[email];
    }
  }

  for (const [tokenHash, session] of Object.entries(store.sessions)) {
    if (!session.expiresAt || session.expiresAt < now) {
      delete store.sessions[tokenHash];
    }
  }
}

async function sendOtpEmail(email, code) {
  if (!resendApiKey) {
    if (isProduction) {
      throw new Error("RESEND_API_KEY is required in production");
    }

    console.log(`[Deccan Sites dev OTP] ${email}: ${code}`);
    return { delivery: "dev" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "DeccanSites/1.0",
    },
    body: JSON.stringify({
      from: otpFromEmail,
      to: [email],
      subject: "Your Deccan Sites login code",
      text: `Your Deccan Sites login code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
          <h1 style="margin:0 0 12px">Deccan Sites login code</h1>
          <p>Your login code is:</p>
          <p style="font-size:32px;font-weight:800;letter-spacing:6px;margin:18px 0">${code}</p>
          <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider error: ${text}`);
  }

  return { delivery: "email" };
}

function adminRecipients() {
  return adminNotifyEmail
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(isValidEmail);
}

async function sendAdminEmail({ subject, text, html }) {
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
      from: notificationFromEmail,
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

async function notifyAdminProjectCreated(project) {
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

async function notifyAdminPaymentConfirmed({ projectId, orderId, paymentId, status }) {
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

async function handleRequestOtp(request, response) {
  try {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      json(response, 400, { ok: false, error: "Enter a valid email address." });
      return;
    }

    const store = await readStore();
    pruneStore(store);

    const existing = store.otps[email];
    const now = Date.now();
    if (existing?.lastSentAt && now - existing.lastSentAt < 45_000) {
      json(response, 429, { ok: false, error: "Please wait before requesting another code." });
      return;
    }

    const code = makeCode();
    const salt = crypto.randomBytes(16).toString("hex");
    store.otps[email] = {
      hash: hashOtp(email, code, salt),
      salt,
      attempts: 0,
      createdAt: now,
      expiresAt: now + otpTtlMs,
      lastSentAt: now,
    };

    const result = await sendOtpEmail(email, code);
    await writeStore(store);

    json(response, 200, {
      ok: true,
      delivery: result.delivery,
      expiresInSeconds: otpTtlMs / 1000,
      devOtp: result.delivery === "dev" ? code : undefined,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not send login code." });
  }
}

async function handleVerifyOtp(request, response) {
  try {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const code = String(body.code || "").trim();

    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      json(response, 400, { ok: false, error: "Enter your email and 6-digit code." });
      return;
    }

    const store = await readStore();
    pruneStore(store);

    const record = store.otps[email];
    if (!record) {
      json(response, 400, { ok: false, error: "Code expired or was not requested." });
      return;
    }

    if (record.attempts >= 5) {
      delete store.otps[email];
      await writeStore(store);
      json(response, 429, { ok: false, error: "Too many attempts. Request a new code." });
      return;
    }

    const submittedHash = hashOtp(email, code, record.salt);
    if (submittedHash !== record.hash) {
      record.attempts += 1;
      await writeStore(store);
      json(response, 400, { ok: false, error: "Incorrect code." });
      return;
    }

    delete store.otps[email];
    store.users[email] = {
      email,
      lastLoginAt: new Date().toISOString(),
      createdAt: store.users[email]?.createdAt || new Date().toISOString(),
    };

    const token = makeToken();
    const tokenHash = hashValue(token);
    store.sessions[tokenHash] = {
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + sessionTtlMs,
    };

    await writeStore(store);

    json(
      response,
      200,
      { ok: true, email },
      {
        "Set-Cookie": `deccan_sites_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(
          sessionTtlMs / 1000,
        )}`,
      },
    );
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not verify login code." });
  }
}

function handlePaymentConfig(response) {
  json(response, 200, {
    ok: true,
    provider: "cashfree",
    enabled: Boolean(cashfreeAppId && cashfreeSecretKey),
    mode: cashfreeEnv,
    currency: "INR",
  });
}

async function handleCreateProject(request, response) {
  try {
    const body = await readJson(request);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 16);
    const businessName = String(body.businessName || "").trim();
    const businessLocation = String(body.businessLocation || "").trim();
    const businessCategory = String(body.businessCategory || "").trim();
    const websiteType = String(body.websiteType || "").trim();
    const pages = Math.max(1, Math.min(20, Number(body.pages || 1)));
    const domainOption = String(body.domainOption || "").trim();
    const addOns = Array.isArray(body.addOns) ? body.addOns.map(String) : [];
    const sections = Array.isArray(body.sections) ? body.sections.map(String) : [];
    const idea = String(body.idea || "").trim();
    const references = String(body.references || "").trim();
    const contentReadiness = String(body.contentReadiness || "").trim();
    const logoReadiness = String(body.logoReadiness || "").trim();
    const launchDate = String(body.launchDate || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || !isValidEmail(email) || phone.length < 10 || !businessName || !businessCategory || !idea) {
      json(response, 400, {
        ok: false,
        error: "Enter name, email, WhatsApp, business name, business category, and website idea.",
      });
      return;
    }

    if (!websiteTypes.some((item) => item.label === websiteType) || !domainOptions.some((item) => item.label === domainOption)) {
      json(response, 400, { ok: false, error: "Choose a valid website type and domain option." });
      return;
    }

    const store = normalizeStore(await readStore());
    const project = {
      projectId: createProjectId(store),
      status: "estimate_created",
      estimatedAmount: calculateProjectEstimate({ websiteType, pages, domainOption, addOns }),
      currency: "INR",
      name,
      email,
      phone,
      businessName,
      businessLocation,
      businessCategory,
      websiteType,
      pages,
      domainOption,
      addOns,
      sections,
      idea,
      references,
      contentReadiness,
      logoReadiness,
      launchDate,
      notes,
      createdAt: new Date().toISOString(),
    };

    await insertSupabaseProject(project);

    store.projects.push(project);
    await writeStore(store);
    await notifyAdminProjectCreated(project).catch((error) => {
      console.error(error.message || error);
    });

    json(response, 200, {
      ok: true,
      projectId: project.projectId,
      estimatedAmount: project.estimatedAmount,
      project,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not save project requirement." });
  }
}

async function handleGetProject(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    const projectId = normalizeProjectId(url.searchParams.get("projectId"));

    if (!projectId.startsWith("DS-")) {
      json(response, 400, { ok: false, error: "Enter a valid project ID." });
      return;
    }

    const store = normalizeStore(await readStore());
    const localProject = store.projects.find((item) => item.projectId === projectId);
    if (localProject) {
      json(response, 200, { ok: true, project: localProject });
      return;
    }

    const project = await fetchSupabaseProject(projectId);
    if (!project) {
      json(response, 404, { ok: false, error: "Project was not found." });
      return;
    }

    json(response, 200, { ok: true, project });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not fetch project details." });
  }
}

function getCashfreeBaseUrl() {
  return cashfreeEnv === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}

function createCashfreeOrderId(projectId) {
  const safeProjectId = projectId.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return `${safeProjectId}_${Date.now()}`;
}

async function createCashfreeOrder({ amount, projectId, name, email, phone, origin }) {
  const orderId = createCashfreeOrderId(projectId);
  const orderResponse = await fetch(`${getCashfreeBaseUrl()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": cashfreeApiVersion,
      "x-client-id": cashfreeAppId,
      "x-client-secret": cashfreeSecretKey,
      "x-idempotency-key": orderId,
      "User-Agent": "DeccanSites/1.0",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: projectId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${origin || "http://127.0.0.1:8030"}/confirmation.html?projectId=${encodeURIComponent(projectId)}&orderId={order_id}`,
      },
      order_note: `Website project payment - ${projectId}`,
      order_tags: {
        project_id: projectId,
        source: "deccan-sites-local",
      },
    }),
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    const message = body.message || body.error?.message || "Could not create Cashfree payment order.";
    if (/auth/i.test(message)) {
      throw new Error(`Cashfree rejected the Payment Gateway credentials for ${cashfreeEnv} mode. Use matching Payment Gateway keys.`);
    }
    throw new Error(message);
  }

  return body;
}

async function fetchCashfreeOrder(orderId) {
  const orderResponse = await fetch(`${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-api-version": cashfreeApiVersion,
      "x-client-id": cashfreeAppId,
      "x-client-secret": cashfreeSecretKey,
      "User-Agent": "DeccanSites/1.0",
    },
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    const message = body.message || body.error?.message || "Could not confirm Cashfree payment status.";
    if (/auth/i.test(message)) {
      throw new Error(`Cashfree rejected the Payment Gateway credentials for ${cashfreeEnv} mode. Use matching Payment Gateway keys.`);
    }
    throw new Error(message);
  }

  return body;
}

async function handleCreatePaymentOrder(request, response) {
  try {
    const body = await readJson(request);
    const amountRupees = clampPaymentAmount(body.amount);
    const projectId = normalizeProjectId(body.projectId);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone || "").replace(/[^\d+]/g, "").slice(0, 16);

    if (amountRupees < 100 || amountRupees > 200000) {
      json(response, 400, { ok: false, error: "Payment amount must be between Rs.100 and Rs.2,00,000." });
      return;
    }

    if (!projectId.startsWith("DS-")) {
      json(response, 400, { ok: false, error: "Save the project details before payment." });
      return;
    }

    if (!name || !isValidEmail(email) || phone.length < 10) {
      json(response, 400, { ok: false, error: "Enter name, valid email, and WhatsApp number." });
      return;
    }

    const store = normalizeStore(await readStore());
    const project = store.projects.find((item) => item.projectId === projectId);
    if (!project) {
      json(response, 404, { ok: false, error: "Project ID was not found. Submit the portal form first." });
      return;
    }

    if (!cashfreeAppId || !cashfreeSecretKey) {
      json(response, 503, {
        ok: false,
        error: "Payment gateway is not configured yet. Add Cashfree keys to the server environment.",
      });
      return;
    }

    const origin = request.headers.origin || `http://${request.headers.host}`;
    const order = await createCashfreeOrder({ amount: amountRupees, projectId, name, email, phone, origin });

    store.payments.push({
      status: "created",
      projectId,
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      amount: order.order_amount,
      currency: "INR",
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    });
    project.status = "payment_started";
    project.paymentAmount = amountRupees;
    project.paymentOrderId = order.order_id;
    await writeStore(store);

    json(response, 200, {
      ok: true,
      provider: "cashfree",
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      paymentSessionId: order.payment_session_id,
      amount: order.order_amount,
      currency: order.order_currency,
      mode: cashfreeEnv,
      name: "Deccan Sites",
      description: `Website project payment - ${projectId}`,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not create payment order." });
  }
}

async function handleVerifyPayment(request, response) {
  try {
    if (!cashfreeAppId || !cashfreeSecretKey) {
      json(response, 503, { ok: false, error: "Payment verification is not configured yet." });
      return;
    }

    const body = await readJson(request);
    const orderId = String(body.orderId || body.order_id || "").trim();
    const projectId = normalizeProjectId(body.projectId);

    if (!orderId) {
      json(response, 400, { ok: false, error: "Missing payment verification details." });
      return;
    }

    const order = await fetchCashfreeOrder(orderId);
    const status = String(order.order_status || "").toUpperCase();

    if (status !== "PAID") {
      json(response, 200, {
        ok: false,
        orderId,
        status,
        error: "Payment is not confirmed yet. Please complete payment or try again.",
      });
      return;
    }

    const paymentId = order.cf_order_id || order.order_id || orderId;
    const store = normalizeStore(await readStore());
    const payment = store.payments.find((item) => item.orderId === orderId);
    let resolvedProjectId = projectId;
    if (payment) {
      payment.status = "paid";
      payment.paymentId = paymentId;
      payment.verifiedAt = new Date().toISOString();
      resolvedProjectId = resolvedProjectId || payment.projectId;
      const project = store.projects.find((item) => item.projectId === payment.projectId);
      if (project) {
        project.status = "paid";
        project.paymentId = paymentId;
        project.paidAt = payment.verifiedAt;
      }
    } else {
      store.payments.push({
        status: "paid",
        orderId,
        paymentId,
        verifiedAt: new Date().toISOString(),
      });
    }

    await writeStore(store);
    await updateSupabasePayment(resolvedProjectId, paymentId);
    await notifyAdminPaymentConfirmed({
      projectId: resolvedProjectId,
      orderId,
      paymentId,
      status,
    }).catch((error) => {
      console.error(error.message || error);
    });

    json(response, 200, { ok: true, provider: "cashfree", orderId, paymentId, status });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not verify payment." });
  }
}

async function handleApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/projects") {
    await handleGetProject(request, response);
    return true;
  }

  if (request.method === "POST" && pathname === "/api/projects") {
    await handleCreateProject(request, response);
    return true;
  }

  if (request.method === "GET" && pathname === "/api/payments/config") {
    handlePaymentConfig(response);
    return true;
  }

  if (request.method === "POST" && pathname === "/api/payments/create-order") {
    await handleCreatePaymentOrder(request, response);
    return true;
  }

  if (request.method === "POST" && pathname === "/api/payments/verify") {
    await handleVerifyPayment(request, response);
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/request-otp") {
    await handleRequestOtp(request, response);
    return true;
  }

  if (request.method === "POST" && pathname === "/api/auth/verify-otp") {
    await handleVerifyOtp(request, response);
    return true;
  }

  return false;
}

async function handleStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const file = path.resolve(root, `.${safePath}`);
  const rootPath = path.resolve(root);

  if (!file.startsWith(rootPath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(file);
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

http
  .createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (await handleApi(request, response, url.pathname)) {
      return;
    }

    await handleStatic(response, url.pathname);
  })
  .listen(port, host, () => {
    console.log(`Deccan Sites preview: http://${host}:${port}`);
  });
