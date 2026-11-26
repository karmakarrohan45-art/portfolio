import type { EditingPreset } from "./content";

const SHOPIFY_API_VERSION = "2025-01";

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  variants: {
    nodes: ShopifyVariant[];
  };
};

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ProductsQueryData = {
  products: {
    nodes: ShopifyProduct[];
  };
};

type CartCreateData = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
};

export class ShopifyCheckoutError extends Error {
  readonly status: number;
  readonly availableProducts?: string[];

  constructor(message: string, status = 500, availableProducts?: string[]) {
    super(message);
    this.name = "ShopifyCheckoutError";
    this.status = status;
    this.availableProducts = availableProducts;
  }
}

function getShopifyConfig(): { storeDomain: string; storefrontToken: string } {
  const rawDomain =
    process.env.SHOPIFY_STORE_DOMAIN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
    "";
  const storefrontToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    "";

  const storeDomain = rawDomain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  if (!storeDomain || !storefrontToken) {
    throw new ShopifyCheckoutError(
      "Shopify environment variables are not configured.",
      500,
    );
  }

  return { storeDomain, storefrontToken };
}

async function shopifyStorefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { storeDomain, storefrontToken } = getShopifyConfig();
  const endpoint = `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ShopifyCheckoutError(
      `Shopify Storefront API request failed (${response.status}).`,
      502,
    );
  }

  const json = (await response.json()) as ShopifyGraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new ShopifyCheckoutError(
      json.errors.map((e) => e.message).join("; "),
      502,
    );
  }

  if (!json.data) {
    throw new ShopifyCheckoutError(
      "Empty response from Shopify Storefront API.",
      502,
    );
  }

  return json.data;
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query PresetsCatalog {
    products(first: 25) {
      nodes {
        id
        title
        handle
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CreatePresetCheckout($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findMatchingProduct(
  preset: EditingPreset,
  products: ShopifyProduct[],
): ShopifyProduct | undefined {
  const candidateHandles = [
    preset.shopifyHandle,
    ...(preset.shopifyHandles ?? []),
    preset.id,
  ]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.toLowerCase());

  const byHandle = products.find((p) =>
    candidateHandles.includes(p.handle.toLowerCase()),
  );
  if (byHandle) return byHandle;

  const targetTitle = normalizeText(preset.title);
  const byTitle = products.find((p) => normalizeText(p.title) === targetTitle);
  if (byTitle) return byTitle;

  const keywords = targetTitle.split(" ").filter((word) => word.length >= 4);
  return products.find((p) => {
    const normalized = normalizeText(p.title);
    return keywords.some((kw) => normalized.includes(kw));
  });
}

async function resolveVariantId(preset: EditingPreset): Promise<string> {
  if (preset.shopifyVariantId) {
    return preset.shopifyVariantId;
  }

  const data = await shopifyStorefrontFetch<ProductsQueryData>(PRODUCTS_QUERY);
  const products = data.products.nodes;
  const matched = findMatchingProduct(preset, products);

  if (!matched) {
    const available = products.map((p) => `${p.title} (${p.handle})`);
    const handleHint = preset.shopifyHandle ?? preset.id;
    const storeSummary =
      available.length > 0
        ? `Found in store: ${available.join(", ")}.`
        : "Storefront API returned 0 products (check that the product is published to your Storefront/Headless sales channel).";
    throw new ShopifyCheckoutError(
      `Product "${preset.title}" (handle: "${handleHint}") was not found. ${storeSummary}`,
      404,
      available,
    );
  }

  const variant =
    matched.variants.nodes.find((v) => v.availableForSale) ??
    matched.variants.nodes[0];

  if (!variant) {
    throw new ShopifyCheckoutError(
      `No purchasable variant found for "${matched.title}" in Shopify.`,
      404,
    );
  }

  return variant.id;
}

export async function createShopifyCheckoutForPreset(
  preset: EditingPreset,
): Promise<string> {
  const variantId = await resolveVariantId(preset);

  const data = await shopifyStorefrontFetch<CartCreateData>(
    CART_CREATE_MUTATION,
    {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    },
  );

  const userErrors = data.cartCreate.userErrors;
  if (userErrors.length > 0) {
    throw new ShopifyCheckoutError(
      userErrors.map((e) => e.message).join("; "),
      400,
    );
  }

  const checkoutUrl = data.cartCreate.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new ShopifyCheckoutError(
      "Shopify did not return a checkout URL.",
      502,
    );
  }

  return checkoutUrl;
}
