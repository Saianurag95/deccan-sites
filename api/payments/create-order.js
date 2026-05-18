import {
  clampPaymentAmount,
  isValidEmail,
  json,
  makeReceiptId,
  normalizeEmail,
  normalizeProjectId,
  readJson,
} from "../_shared.js";

async function createRazorpayOrder({ amount, projectId, name, email, phone }) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "User-Agent": "DeccanSites/1.0",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: makeReceiptId(),
      notes: {
        customer_name: name || "",
        customer_email: email || "",
        customer_phone: phone || "",
        project_id: projectId || "",
        source: "deccan-sites-vercel",
      },
    }),
  });

  const body = await orderResponse.json().catch(() => ({}));
  if (!orderResponse.ok) {
    throw new Error(body.error?.description || "Could not create payment order.");
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

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      json(response, 503, {
        ok: false,
        error: "Payment gateway is not configured yet. Add Razorpay keys to the server environment.",
      });
      return;
    }

    const order = await createRazorpayOrder({ amount: amountRupees * 100, projectId, name, email, phone });

    json(response, 200, {
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      name: "Deccan Sites",
      description: `Website project payment - ${projectId}`,
      prefill: { name, email, contact: phone },
    });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not create payment order." });
  }
}
