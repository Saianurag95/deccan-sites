import { json } from "../_shared.js";

function cashfreeValue(...names) {
  return names.map((name) => String(process.env[name] || "").trim()).find(Boolean) || "";
}

function getCashfreeMode() {
  return cashfreeValue("CASHFREE_ENV").toLowerCase() === "production" ? "production" : "sandbox";
}

export default function handler(request, response) {
  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  json(response, 200, {
    ok: true,
    provider: "cashfree",
    enabled: Boolean(cashfreeValue("CASHFREE_APP_ID", "CASHFREE_CLIENT_ID") && cashfreeValue("CASHFREE_SECRET_KEY", "CASHFREE_CLIENT_SECRET")),
    mode: getCashfreeMode(),
    currency: "INR",
  });
}
