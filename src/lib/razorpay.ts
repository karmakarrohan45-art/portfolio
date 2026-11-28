import crypto from "node:crypto";
import type { EditingPreset } from "./content";

export class RazorpayError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "RazorpayError";
    this.status = status;
  }
}

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

type RazorpayApiErrorResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

export function getRazorpayConfig(): { keyId: string; keySecret: string } {
  const keyId = (
    process.env.RAZORPAY_KEY_ID ??
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
    ""
  ).trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET ?? "").trim();

  if (!keyId || !keySecret) {
    throw new RazorpayError(
      "Razorpay keys are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel project settings.",
      500,
    );
  }

  return { keyId, keySecret };
}

export async function createRazorpayOrder(preset: EditingPreset): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const { keyId, keySecret } = getRazorpayConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const receipt = `rcpt_${Date.now()}`.slice(0, 40);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: preset.pricePaise,
      currency: "INR",
      receipt,
      notes: {
        presetId: preset.id,
        presetTitle: preset.title,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errBody = (await response
      .json()
      .catch(() => ({}))) as RazorpayApiErrorResponse;
    const message =
      errBody.error?.description ??
      `Razorpay order creation failed (${response.status}).`;
    throw new RazorpayError(message, 502);
  }

  const order = (await response.json()) as RazorpayOrderResponse;
  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  };
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayConfig();
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.signature.trim(), "utf8");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim();
  if (!webhookSecret) {
    throw new RazorpayError(
      "RAZORPAY_WEBHOOK_SECRET is not configured.",
      503,
    );
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature.trim(), "utf8");

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
