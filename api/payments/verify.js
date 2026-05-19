import crypto from "node:crypto";
import { json, normalizeProjectId, readJson, updateSupabasePayment } from "../_shared.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      json(response, 503, { ok: false, error: "Payment verification is not configured yet." });
      return;
    }

    const body = await readJson(request);
    const orderId = String(body.razorpay_order_id || "").trim();
    const paymentId = String(body.razorpay_payment_id || "").trim();
    const signature = String(body.razorpay_signature || "").trim();
    const projectId = normalizeProjectId(body.projectId);

    if (!orderId || !paymentId || !signature) {
      json(response, 400, { ok: false, error: "Missing payment verification details." });
      return;
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      json(response, 400, { ok: false, error: "Payment signature verification failed." });
      return;
    }

    await updateSupabasePayment(projectId, paymentId);

    json(response, 200, { ok: true, orderId, paymentId });
  } catch (error) {
    json(response, 500, { ok: false, error: error.message || "Could not verify payment." });
  }
}
