import { NextResponse } from "next/server";
import { presets } from "@/lib/content";
import { RazorpayError, verifyRazorpaySignature } from "@/lib/razorpay";

type VerifyRequestBody = {
  presetId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  let body: VerifyRequestBody;

  try {
    body = (await request.json()) as VerifyRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid verification payload." },
      { status: 400 },
    );
  }

  const preset = presets.find((item) => item.id === body.presetId);
  if (!preset) {
    return NextResponse.json(
      { error: "Unknown preset pack." },
      { status: 400 },
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing Razorpay payment confirmation fields." },
      { status: 400 },
    );
  }

  try {
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
      downloadUrl: preset.buyUrl,
    });
  } catch (error) {
    if (error instanceof RazorpayError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to verify Razorpay payment." },
      { status: 500 },
    );
  }
}
