import { json, normalizeProjectId, readJson, updateSupabasePayment } from "../_shared.js";

function getCashfreeBaseUrl() {
  return process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}

async function fetchCashfreeOrder(orderId) {
  const orderResponse = await fetch(`${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "User-Agent": "DeccanSites/1.0",
    },
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    throw new Error(body.message || body.error?.message || "Could not confirm Cashfree payment status.");
  }

  return body;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
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

    await updateSupabasePayment(projectId, order.cf_order_id || order.order_id || orderId);

    json(response, 200, {
      ok: true,
      provider: "cashfree",
      orderId,
      paymentId: order.cf_order_id || order.order_id || orderId,
      status,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not verify payment." });
  }
}
