import { json } from "../_shared.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  json(response, 200, {
    ok: true,
    provider: "cashfree",
    enabled: Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY),
    mode: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
    currency: "INR",
  });
}
