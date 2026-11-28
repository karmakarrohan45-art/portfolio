import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/db";
import { RazorpayError, verifyRazorpayWebhookSignature } from "@/lib/razorpay";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Razorpay webhook signature." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  try {
    const valid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 },
      );
    }
  } catch (error) {
    if (error instanceof RazorpayError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Webhook verification failed." },
      { status: 500 },
    );
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook JSON payload." },
      { status: 400 },
    );
  }

  const event = body.event ?? "";
  if (event === "payment.captured" || event === "order.paid") {
    const payment = body.payload?.payment?.entity;
    const order = body.payload?.order?.entity;
    const orderId = payment?.order_id ?? order?.id;
    const paymentId = payment?.id ?? "";
    const notes = payment?.notes ?? order?.notes ?? {};

    if (orderId && paymentId) {
      await markOrderPaid({
        orderId,
        paymentId,
        presetId: notes.presetId,
        presetTitle: notes.presetTitle,
        amountPaise: payment?.amount ?? order?.amount,
        currency: payment?.currency ?? order?.currency ?? "INR",
      });
    }
  }

  return NextResponse.json({ received: true });
}
