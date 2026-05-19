import { clampPaymentAmount, isValidEmail, json, normalizeEmail, normalizeProjectId, readJson } from "../_shared.js";

function getCashfreeBaseUrl() {
  return process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
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
      "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
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
        return_url: `${origin || "https://deccan-sites.vercel.app"}/?cashfree_order_id={order_id}`,
      },
      order_note: `Website project payment - ${projectId}`,
      order_tags: {
        project_id: projectId,
        source: "deccan-sites-vercel",
      },
    }),
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    throw new Error(body.message || body.error?.message || "Could not create Cashfree payment order.");
  }

  return body;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

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

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      json(response, 503, {
        ok: false,
        error: "Payment gateway is not configured yet. Add Cashfree keys to the server environment.",
      });
      return;
    }

    const origin = request.headers.origin || `https://${request.headers.host}`;
    const order = await createCashfreeOrder({ amount: amountRupees, projectId, name, email, phone, origin });

    json(response, 200, {
      ok: true,
      provider: "cashfree",
      orderId: order.order_id,
      cfOrderId: order.cf_order_id,
      paymentSessionId: order.payment_session_id,
      amount: order.order_amount,
      currency: order.order_currency,
      mode: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
      name: "Deccan Sites",
      description: `Website project payment - ${projectId}`,
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not create payment order." });
  }
}
