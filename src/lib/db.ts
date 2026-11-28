import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  return neon(databaseUrl);
}

let schemaPromise: Promise<void> | null = null;

async function ensureOrdersTable(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          order_id TEXT UNIQUE NOT NULL,
          payment_id TEXT,
          preset_id TEXT NOT NULL,
          preset_title TEXT NOT NULL,
          amount_paise INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'INR',
          status TEXT NOT NULL DEFAULT 'created',
          download_token TEXT UNIQUE NOT NULL,
          download_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          paid_at TIMESTAMPTZ
        )
      `;
    })().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }

  await schemaPromise;
}

export type OrderRecord = {
  order_id: string;
  payment_id: string | null;
  preset_id: string;
  preset_title: string;
  amount_paise: number;
  currency: string;
  status: string;
  download_token: string;
  download_count: number;
};

export async function createOrderRecord(params: {
  orderId: string;
  presetId: string;
  presetTitle: string;
  amountPaise: number;
  currency: string;
}): Promise<string> {
  await ensureOrdersTable();
  const sql = getSql();
  const downloadToken = crypto.randomBytes(24).toString("hex");

  await sql`
    INSERT INTO orders (
      order_id,
      preset_id,
      preset_title,
      amount_paise,
      currency,
      status,
      download_token
    )
    VALUES (
      ${params.orderId},
      ${params.presetId},
      ${params.presetTitle},
      ${params.amountPaise},
      ${params.currency},
      'created',
      ${downloadToken}
    )
    ON CONFLICT (order_id) DO NOTHING
  `;

  return downloadToken;
}

export async function markOrderPaid(params: {
  orderId: string;
  paymentId: string;
  presetId?: string;
  presetTitle?: string;
  amountPaise?: number;
  currency?: string;
}): Promise<string> {
  await ensureOrdersTable();
  const sql = getSql();
  const fallbackToken = crypto.randomBytes(24).toString("hex");

  const updated = (await sql`
    UPDATE orders
    SET
      status = 'paid',
      payment_id = ${params.paymentId},
      paid_at = COALESCE(paid_at, NOW())
    WHERE order_id = ${params.orderId}
    RETURNING download_token
  `) as Array<{ download_token: string }>;

  if (updated.length > 0) {
    return updated[0].download_token;
  }

  const inserted = (await sql`
    INSERT INTO orders (
      order_id,
      payment_id,
      preset_id,
      preset_title,
      amount_paise,
      currency,
      status,
      download_token,
      paid_at
    )
    VALUES (
      ${params.orderId},
      ${params.paymentId},
      ${params.presetId ?? "unknown"},
      ${params.presetTitle ?? "Preset Pack"},
      ${params.amountPaise ?? 0},
      ${params.currency ?? "INR"},
      'paid',
      ${fallbackToken},
      NOW()
    )
    ON CONFLICT (order_id) DO UPDATE
      SET status = 'paid',
          payment_id = EXCLUDED.payment_id,
          paid_at = COALESCE(orders.paid_at, NOW())
    RETURNING download_token
  `) as Array<{ download_token: string }>;

  return inserted[0].download_token;
}

export async function consumeDownloadToken(
  token: string,
): Promise<{ presetId: string; status: string } | null> {
  await ensureOrdersTable();
  const sql = getSql();

  const rows = (await sql`
    SELECT preset_id, status
    FROM orders
    WHERE download_token = ${token}
    LIMIT 1
  `) as Array<{ preset_id: string; status: string }>;

  if (rows.length === 0) {
    return null;
  }

  const record = rows[0];
  if (record.status === "paid") {
    await sql`
      UPDATE orders
      SET download_count = download_count + 1
      WHERE download_token = ${token}
    `;
  }

  return {
    presetId: record.preset_id,
    status: record.status,
  };
}
