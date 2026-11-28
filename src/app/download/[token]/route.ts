import { NextResponse } from "next/server";
import { presets } from "@/lib/content";
import { consumeDownloadToken } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token || !/^[a-f0-9]{48}$/i.test(token)) {
    return NextResponse.json(
      { error: "Invalid download token." },
      { status: 400 },
    );
  }

  const order = await consumeDownloadToken(token);
  if (!order) {
    return NextResponse.json(
      { error: "Download link not found." },
      { status: 404 },
    );
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Payment for this order is not completed yet." },
      { status: 403 },
    );
  }

  const preset = presets.find((item) => item.id === order.presetId);
  if (!preset) {
    return NextResponse.json(
      { error: "Preset pack no longer available." },
      { status: 404 },
    );
  }

  return NextResponse.redirect(preset.buyUrl, { status: 302 });
}
