import { json } from "../_shared.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    json(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  json(response, 200, {
    ok: true,
    enabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    keyId: process.env.RAZORPAY_KEY_ID || "",
    currency: "INR",
  });
}
