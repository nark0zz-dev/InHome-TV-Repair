/**
 * Postgres data access for diagnostic orders.
 *
 * Uses a single shared `pg.Pool` across hot-reloads in dev. The pool is lazy:
 * if `DATABASE_URL` is not set, every query throws a clear configuration error
 * so callers can surface a helpful message instead of crashing the app.
 */

import { Pool, PoolClient } from 'pg';
import type { DiagnosticMedia, DiagnosticOrder, DiagnosticStatus } from '@/types/diagnostic';

let pool: Pool | null = null;

/** True when a DATABASE_URL is configured. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Lazily create (or reuse) the connection pool. */
function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured. Provision Postgres on Railway and set DATABASE_URL.');
  }

  // Railway's public Postgres endpoint uses a self-signed cert, so we need
  // sslmode=no-verify there. But local tunnels (localhost) are plain TCP with
  // no SSL — appending sslmode would break them. Only add it for non-localhost.
  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  let finalUrl = connectionString;
  if (!isLocalhost && !connectionString.includes('sslmode=')) {
    finalUrl = connectionString.includes('?')
      ? `${connectionString}&sslmode=no-verify`
      : `${connectionString}?sslmode=no-verify`;
  }

  pool = new Pool({
    connectionString: finalUrl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected pg pool error:', err);
  });

  return pool;
}

/** Convert a raw pg row into a typed DiagnosticOrder. */
function rowToOrder(row: Record<string, unknown>): DiagnosticOrder {
  const mediaRaw = (row.media as Array<Record<string, unknown>>) ?? [];
  return {
    id: String(row.id),
    status: String(row.status) as DiagnosticStatus,
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    customerEmail: String(row.customer_email),
    tvBrand: (row.tv_brand as string | null) ?? null,
    tvModel: (row.tv_model as string | null) ?? null,
    issueDescription: String(row.issue_description),
    media: mediaRaw.map((m) => ({
      key: String(m.key),
      fileName: String(m.file_name),
      mimeType: String(m.mime_type),
      size: Number(m.size),
      url: String(m.url),
    })),
    stripeSessionId: (row.stripe_session_id as string | null) ?? null,
    stripePaymentIntent: (row.stripe_payment_intent as string | null) ?? null,
    amountCents: Number(row.amount_cents),
    verdictNote: (row.verdict_note as string | null) ?? null,
    adminTelegramMessageId: (row.admin_telegram_message_id as number | null) ?? null,
    customVerdictText: (row.custom_verdict_text as string | null) ?? null,
    customAskMessageId: (row.custom_ask_message_id as number | null) ?? null,
    pdfS3Key: (row.pdf_s3_key as string | null) ?? null,
    pdfGeneratedAt: (row.pdf_generated_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    notesData: (row.notes_data as Record<string, string> | null) ?? null,
    verdictCategory: (row.verdict_category as string | null) ?? null,
    createdAt: String(row.created_at),
    paidAt: (row.paid_at as string | null) ?? null,
    verdictAt: (row.verdict_at as string | null) ?? null,
  };
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  tvBrand?: string | null;
  tvModel?: string | null;
  issueDescription: string;
  media: DiagnosticMedia[];
  stripeSessionId?: string | null;
  amountCents: number;
}

/** Insert a new diagnostic order and return it. */
export async function createDiagnosticOrder(input: CreateOrderInput): Promise<DiagnosticOrder> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO diagnostic_orders
        (status, customer_name, customer_phone, customer_email, tv_brand, tv_model,
         issue_description, media, stripe_session_id, amount_cents)
       VALUES
        ('pending_payment', $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
       RETURNING *`,
      [
        input.customerName,
        input.customerPhone,
        input.customerEmail,
        input.tvBrand ?? null,
        input.tvModel ?? null,
        input.issueDescription,
        JSON.stringify(input.media),
        input.stripeSessionId ?? null,
        input.amountCents,
      ],
    );
    return rowToOrder(rows[0]);
  } finally {
    client.release();
  }
}

/** Find an order by its primary key. */
export async function getDiagnosticOrderById(id: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query('SELECT * FROM diagnostic_orders WHERE id = $1', [id]);
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Find an order by the Stripe Checkout Session id. */
export async function getDiagnosticOrderByStripeSession(sessionId: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      'SELECT * FROM diagnostic_orders WHERE stripe_session_id = $1',
      [sessionId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

export interface MarkPaidInput {
  orderId: string;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
}

/** Mark an order as paid after a successful Stripe checkout. */
export async function markOrderPaid(input: MarkPaidInput): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'paid',
           stripe_session_id = COALESCE($2, stripe_session_id),
           stripe_payment_intent = $3,
           paid_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [input.orderId, input.stripeSessionId, input.stripePaymentIntent],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

export interface UpdateVerdictInput {
  orderId: string;
  status: DiagnosticStatus;
  verdictNote?: string | null;
}

/** Apply an admin verdict (repairable / unfixable / need_more_info / booked_in_home). */
export async function updateOrderVerdict(input: UpdateVerdictInput): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = $2,
           verdict_note = COALESCE($3, verdict_note),
           verdict_at = CASE WHEN $2 IN ('verdict_repairable','verdict_unfixable','booked_in_home') THEN NOW() ELSE verdict_at END
       WHERE id = $1
       RETURNING *`,
      [input.orderId, input.status, input.verdictNote ?? null],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Update the customer email on an order (e.g. captured from Stripe checkout if not provided upfront). */
export async function updateOrderEmail(orderId: string, email: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      'UPDATE diagnostic_orders SET customer_email = $2 WHERE id = $1 AND customer_email IS NULL RETURNING *',
      [orderId, email],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Persist the Telegram message id that delivered the admin notification (for later editing). */
export async function setAdminTelegramMessageId(orderId: string, messageId: number): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(
      'UPDATE diagnostic_orders SET admin_telegram_message_id = $2 WHERE id = $1',
      [orderId, messageId],
    );
  } finally {
    client.release();
  }
}

/** Mark an order as awaiting the admin's custom verdict text. Stores the "ask" prompt message id. */
export async function setAwaitingCustomVerdict(orderId: string, askMessageId: number): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'awaiting_custom_verdict',
           custom_ask_message_id = $2,
           custom_verdict_text = NULL
       WHERE id = $1
       RETURNING *`,
      [orderId, askMessageId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Store the admin's custom verdict text (pending confirmation). Keeps status as awaiting_custom_verdict. */
export async function setCustomVerdictText(orderId: string, text: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      'UPDATE diagnostic_orders SET custom_verdict_text = $2 WHERE id = $1 RETURNING *',
      [orderId, text],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Confirm the custom verdict: set status to verdict_custom, set verdict_note, clear ask message id. */
export async function confirmCustomVerdict(orderId: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'verdict_custom',
           verdict_note = custom_verdict_text,
           verdict_at = NOW(),
           custom_ask_message_id = NULL
       WHERE id = $1
       RETURNING *`,
      [orderId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Cancel the custom verdict flow: revert to 'paid', clear custom fields. */
export async function cancelCustomVerdict(orderId: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'paid',
           custom_verdict_text = NULL,
           custom_ask_message_id = NULL
       WHERE id = $1
       RETURNING *`,
      [orderId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Find the order that is awaiting custom verdict input from the admin. */
export async function getOrderByAwaitingCustomVerdict(): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `SELECT * FROM diagnostic_orders WHERE status = 'awaiting_custom_verdict' ORDER BY created_at DESC LIMIT 1`,
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Run an arbitrary callback inside a single client transaction. */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/* ── Portal: 2FA codes ────────────────────────────────────────── */

/** Create a new 2FA code and return it with its DB id and the expiry time. */
export async function create2faCode(ttlSeconds: number = 60): Promise<{ id: string; code: string; expiresAt: Date } | null> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO admin_2fa_codes (code, expires_at)
       VALUES ($1, NOW() + ($2 || ' seconds')::interval)
       RETURNING id, code, expires_at`,
      [code, String(ttlSeconds)],
    );
    return rows.length ? { id: String(rows[0].id), code: String(rows[0].code), expiresAt: new Date(rows[0].expires_at) } : null;
  } finally {
    client.release();
  }
}

/** Find a valid (unused, not expired) 2FA code by its code string. */
export async function getValid2faCode(code: string): Promise<{ id: string; expiresAt: Date } | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `SELECT id, expires_at FROM admin_2fa_codes
       WHERE code = $1 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [code],
    );
    return rows.length ? { id: String(rows[0].id), expiresAt: new Date(rows[0].expires_at) } : null;
  } finally {
    client.release();
  }
}

/** Mark a 2FA code as used. */
export async function mark2faCodeUsed(codeId: string): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(
      'UPDATE admin_2fa_codes SET used = TRUE, used_at = NOW() WHERE id = $1',
      [codeId],
    );
  } finally {
    client.release();
  }
}

/** Store the Telegram message id for a 2FA code (so we can delete it after expiry). */
export async function set2faTelegramMessageId(codeId: string, messageId: number): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(
      'UPDATE admin_2fa_codes SET telegram_message_id = $2 WHERE id = $1',
      [codeId, messageId],
    );
  } finally {
    client.release();
  }
}

/** Get the Telegram message id for a 2FA code (for deletion). */
export async function get2faTelegramMessageId(codeId: string): Promise<number | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      'SELECT telegram_message_id FROM admin_2fa_codes WHERE id = $1',
      [codeId],
    );
    return rows.length ? (rows[0].telegram_message_id as number | null) ?? null : null;
  } finally {
    client.release();
  }
}

/* ── Portal: Sessions ─────────────────────────────────────────── */

/** Create a new session and return the raw token (store only the hash in DB). */
export async function createSession(ttlDays: number = 7): Promise<{ token: string; expiresAt: Date }> {
  const { randomBytes, createHash } = await import('node:crypto');
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const client = await getPool().connect();
  try {
    await client.query(
      `INSERT INTO admin_sessions (token_hash, expires_at)
       VALUES ($1, NOW() + ($2 || ' days')::interval)`,
      [tokenHash, String(ttlDays)],
    );
  } finally {
    client.release();
  }
  return { token, expiresAt: new Date(Date.now() + ttlDays * 86400000) };
}

/** Validate a session token. Returns true if valid and not expired. Updates last_used_at. */
export async function validateSession(token: string): Promise<boolean> {
  if (!token) return false;
  const { createHash } = await import('node:crypto');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE admin_sessions
       SET last_used_at = NOW()
       WHERE token_hash = $1 AND expires_at > NOW()
       RETURNING id`,
      [tokenHash],
    );
    return rows.length > 0;
  } finally {
    client.release();
  }
}

/** Delete a session by token (logout). */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  const { createHash } = await import('node:crypto');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const client = await getPool().connect();
  try {
    await client.query('DELETE FROM admin_sessions WHERE token_hash = $1', [tokenHash]);
  } finally {
    client.release();
  }
}

/* ── Portal: Order management ─────────────────────────────────── */

/** Mark an order as abandoned (soft delete — Stripe session expired, customer never paid). */
export async function abandonOrder(orderId: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'abandoned'
       WHERE id = $1 AND status = 'pending_payment' RETURNING *`,
      [orderId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Find pending_payment orders older than the given number of hours (for cleanup). */
export async function findStalePendingOrders(olderThanHours: number): Promise<DiagnosticOrder[]> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `SELECT * FROM diagnostic_orders
       WHERE status = 'pending_payment'
         AND created_at < NOW() - ($1 || ' hours')::interval
       ORDER BY created_at ASC`,
      [String(olderThanHours)],
    );
    return rows.map(rowToOrder);
  } finally {
    client.release();
  }
}

/** List all diagnostic orders, most recent first. Optional status filter. */
export async function listDiagnosticOrders(statusFilter?: DiagnosticStatus): Promise<DiagnosticOrder[]> {
  const client = await getPool().connect();
  try {
    if (statusFilter) {
      const { rows } = await client.query(
        'SELECT * FROM diagnostic_orders WHERE status = $1 ORDER BY created_at DESC LIMIT 200',
        [statusFilter],
      );
      return rows.map(rowToOrder);
    }
    // By default, exclude abandoned orders from the dashboard.
    const { rows } = await client.query(
      "SELECT * FROM diagnostic_orders WHERE status != 'abandoned' ORDER BY created_at DESC LIMIT 200",
    );
    return rows.map(rowToOrder);
  } finally {
    client.release();
  }
}

/** Update the PDF S3 key and set pdf_generated_at. */
export async function setOrderPdfKey(orderId: string, s3Key: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET pdf_s3_key = $2, pdf_generated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [orderId, s3Key],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Mark an order as completed (email sent, PDF attached). */
export async function markOrderCompleted(orderId: string): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    // Only update if not already completed — prevents duplicate completion
    // (and thus duplicate emails) from concurrent/retried requests.
    const { rows } = await client.query(
      `UPDATE diagnostic_orders
       SET status = 'completed', completed_at = NOW()
       WHERE id = $1 AND status != 'completed' RETURNING *`,
      [orderId],
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}

/** Update verdict note, status, notes data, and/or verdict category from the portal dashboard. */
export async function updateOrderFromPortal(
  orderId: string,
  updates: { status?: DiagnosticStatus; verdictNote?: string | null; notesData?: Record<string, string> | null; verdictCategory?: string | null },
): Promise<DiagnosticOrder | null> {
  const client = await getPool().connect();
  try {
    const sets: string[] = [];
    const vals: unknown[] = [orderId];
    let paramIdx = 2;

    if (updates.status !== undefined) {
      sets.push(`status = $${paramIdx++}`);
      vals.push(updates.status);
    }
    if (updates.verdictNote !== undefined) {
      sets.push(`verdict_note = $${paramIdx++}`);
      vals.push(updates.verdictNote);
    }
    if (updates.notesData !== undefined) {
      sets.push(`notes_data = $${paramIdx++}::jsonb`);
      vals.push(JSON.stringify(updates.notesData || {}));
    }
    if (updates.verdictCategory !== undefined) {
      sets.push(`verdict_category = $${paramIdx++}`);
      vals.push(updates.verdictCategory);
    }
    if (sets.length === 0) {
      const { rows } = await client.query('SELECT * FROM diagnostic_orders WHERE id = $1', [orderId]);
      return rows.length ? rowToOrder(rows[0]) : null;
    }

    const { rows } = await client.query(
      `UPDATE diagnostic_orders SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      vals,
    );
    return rows.length ? rowToOrder(rows[0]) : null;
  } finally {
    client.release();
  }
}
