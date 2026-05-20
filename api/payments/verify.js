import { json, normalizeProjectId, notifyAdminPaymentConfirmed, readJson, updateSupabasePayment } from "../_shared.js";

function cashfreeValue(...names) {
  return names.map((name) => String(process.env[name] || "").trim()).find(Boolean) || "";
}

function getCashfreeMode() {
  return cashfreeValue("CASHFREE_ENV").toLowerCase() === "production" ? "production" : "sandbox";
}

function getCashfreeBaseUrl() {
  return getCashfreeMode() === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}

async function fetchCashfreeOrder(orderId) {
  const orderResponse = await fetch(`${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-api-version": cashfreeValue("CASHFREE_API_VERSION") || "2025-01-01",
      "x-client-id": cashfreeValue("CASHFREE_APP_ID", "CASHFREE_CLIENT_ID"),
      "x-client-secret": cashfreeValue("CASHFREE_SECRET_KEY", "CASHFREE_CLIENT_SECRET"),
      "User-Agent": "DeccanSites/1.0",
    },
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    const message = body.message || body.error?.message || "Could not confirm Cashfree payment status.";
    if (/auth/i.test(message)) {
      throw new Error(`Cashfree rejected the Payment Gateway credentials for ${getCashfreeMode()} mode. Use matching Payment Gateway keys in Vercel.`);
    }
    throw new Error(message);
  }

  return body;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    if (!cashfreeValue("CASHFREE_APP_ID", "CASHFREE_CLIENT_ID") || !cashfreeValue("CASHFREE_SECRET_KEY", "CASHFREE_CLIENT_SECRET")) {
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
    await notifyAdminPaymentConfirmed({
      projectId,
      orderId,
      paymentId: order.cf_order_id || order.order_id || orderId,
      status,
    }).catch((error) => {
      console.error(error.message || error);
    });

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
