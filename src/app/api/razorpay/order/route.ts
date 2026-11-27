import { NextResponse } from "next/server";
import { presets } from "@/lib/content";
import { createRazorpayOrder, RazorpayError } from "@/lib/razorpay";

type OrderRequestBody = {
  presetId?: string;
};

export async function POST(request: Request) {
  let body: OrderRequestBody;

  try {
    body = (await request.json()) as OrderRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const preset = presets.find((item) => item.id === body.presetId);
  if (!preset) {
    return NextResponse.json(
      { error: "Unknown preset pack requested." },
      { status: 400 },
    );
  }

  try {
    const order = await createRazorpayOrder(preset);
    return NextResponse.json({
      ...order,
      presetTitle: preset.title,
    });
  } catch (error) {
    if (error instanceof RazorpayError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to create Razorpay order right now." },
      { status: 500 },
    );
  }
}
