import { NextResponse } from "next/server";
import { presets } from "@/lib/content";
import {
  createShopifyCheckoutForPreset,
  ShopifyCheckoutError,
} from "@/lib/shopify";

type CheckoutRequestBody = {
  presetId?: string;
};

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
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
    const checkoutUrl = await createShopifyCheckoutForPreset(preset);
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    if (error instanceof ShopifyCheckoutError) {
      return NextResponse.json(
        {
          error: error.message,
          availableProducts: error.availableProducts,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to start Shopify checkout right now." },
      { status: 500 },
    );
  }
}
