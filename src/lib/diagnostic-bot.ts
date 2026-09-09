/**
 * Telegram bot logic for the $25 Online Diagnostic.
 *
 * Two responsibilities:
 *  1. sendDiagnosticNotification(order) — sends a short ping to the group chat
 *     ("new diagnostic received, check DMs") and posts the full rich message
 *     with an inline keyboard (Repairable / Unfixable / Need more photos /
 *     Book in-home / Custom verdict) to the admin's private DMs, storing the
 *     DM message id so it can be edited later.
 *  2. handleDiagnosticCallback(callbackQuery) — fired when the admin taps one of
 *     those buttons. Updates the DB, emails the customer the verdict, and edits
 *     the Telegram message to reflect the new state.
 *  3. handleDiagnosticMessage(message) — fired when the admin sends a text
 *     message. If there's an order awaiting custom verdict input, captures the
 *     text, deletes the admin's raw message, and shows a preview with
 *     confirm/rewrite/cancel buttons.
 *
 * Uses the Telegram Bot API directly via fetch (no extra polling bot instance
 * needed — the existing webhook route forwards updates here).
 */

import type { DiagnosticOrder, DiagnosticStatus, DiagnosticAction } from '@/types/diagnostic';
import {
  updateOrderVerdict,
  setAdminTelegramMessageId,
  getDiagnosticOrderById,
  setAwaitingCustomVerdict,
  setCustomVerdictText,
  confirmCustomVerdict,
  cancelCustomVerdict,
  getOrderByAwaitingCustomVerdict,
} from '@/lib/db';


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
/** Admin's personal Telegram user ID — diagnostic details are sent here via DM. */
const TELEGRAM_DIAGNOSTIC_ADMIN_ID = process.env.TELEGRAM_DIAGNOSTIC_ADMIN_ID || '';

/** callback_data format: `d:<action>:<orderId>` (well under the 64-byte limit). */
const CB_PREFIX = 'd:';

function isConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_DIAGNOSTIC_ADMIN_ID);
}

/** Format bytes as KB or MB (avoids "0.0 MB" for small files). */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Convert a US phone like "(980) 987-0005" to E.164 "+19809870005" for Telegram click-to-call. */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone; // fallback: show as-is
}

async function telegramApi<T = unknown>(method: string, payload: Record<string, unknown>): Promise<T> {
  if (!isConfigured()) throw new Error('Telegram bot credentials not configured');
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram ${method} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Build the rich HTML admin message body for a paid diagnostic order. */
function buildAdminMessage(order: DiagnosticOrder): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const tvLine = [order.tvBrand, order.tvModel].filter(Boolean).join(' ') || 'Not specified';
  const mediaLines = order.media.length
    ? order.media
        .map((m, i) => {
          const icon = m.mimeType.startsWith('video/') ? '🎬' : '🖼';
          return `<a href="${m.url}">${icon} File ${i + 1} (${formatFileSize(m.size)})</a>`;
        })
        .join('\n')
    : '<i>No media uploaded</i>';

  const hasValidEmail = Boolean(order.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail.trim()));
  let emailNote: string;
  if (hasValidEmail) {
    emailNote = '<i>Tap a button below to record your verdict. Then generate a PDF and email the customer from the portal.</i>';
  } else {
    emailNote = '<i>⚠️ Customer did not provide an email. Tap a button to record your verdict — you\'ll need to call them with the result.</i>';
  }

  return [
    `🔔 <b>New $25 Online Diagnostic</b>`,
    ``,
    `🆔 <b>Order:</b> #${shortId}`,
    `👤 <b>Name:</b> ${escapeHtml(order.customerName)}`,
    `📞 <b>Phone:</b> ${toE164(order.customerPhone)}`,
    `✉️ <b>Email:</b> ${order.customerEmail ? escapeHtml(order.customerEmail) : '<i>Not provided</i>'}`,
    `📺 <b>TV:</b> ${escapeHtml(tvLine)}`,
    `🛠 <b>Issue:</b> ${escapeHtml(order.issueDescription)}`,
    `🕐 <b>Paid at:</b> ${timestamp}`,
    ``,
    `📎 <b>Media (${order.media.length}):</b>`,
    mediaLines,
    ``,
    emailNote,
  ].join('\n');
}

/** Inline keyboard attached to the admin notification. */
function buildInlineKeyboard(orderId: string) {
  const cb = (action: DiagnosticAction) => `${CB_PREFIX}${action}:${orderId}`;
  return {
    inline_keyboard: [
      [
        { text: '✅ Repairable', callback_data: cb('repairable') },
        { text: '❌ Unfixable (cracked)', callback_data: cb('unfixable') },
      ],
      [
        { text: '📸 Need more photos', callback_data: cb('need_more') },
        { text: '🏠 Book in-home visit', callback_data: cb('book_in_home') },
      ],
      [
        { text: '✏️ Custom verdict', callback_data: cb('custom') },
      ],
    ],
  };
}

/**
 * Send the admin notification for a newly-paid diagnostic order.
 * - Sends a short ping to the group chat ("check your DMs").
 * - Sends the full message + inline keyboard to the admin's private DMs.
 * Stores the DM message id on the order for later editing.
 */
export async function sendDiagnosticNotification(order: DiagnosticOrder): Promise<void> {
  if (!isConfigured()) {
    console.error('Telegram not configured — skipping diagnostic notification for order', order.id);
    return;
  }

  const shortId = order.id.slice(0, 8).toUpperCase();

  // 1. Short ping to the group chat (if configured).
  if (TELEGRAM_CHAT_ID) {
    const adminMention = TELEGRAM_DIAGNOSTIC_ADMIN_ID
      ? `<a href="tg://user?id=${TELEGRAM_DIAGNOSTIC_ADMIN_ID}">nark0zz</a>`
      : 'Admin';
    const pingText = `🔔 ${adminMention}, new <b>$25 Online Diagnostic</b> received (#${shortId}). Check your DMs to review.`;
    await telegramApi('sendMessage', {
      chat_id: TELEGRAM_CHAT_ID,
      text: pingText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }).catch((err) => console.error('Group chat ping failed:', err));
  }

  // 2. Full notification + inline keyboard to the admin's DMs.
  const data = await telegramApi<{ result: { message_id: number } }>('sendMessage', {
    chat_id: TELEGRAM_DIAGNOSTIC_ADMIN_ID,
    text: buildAdminMessage(order),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: buildInlineKeyboard(order.id),
  });

  const messageId = data.result.message_id;
  await setAdminTelegramMessageId(order.id, messageId);
}

/**
 * Sync an order's state to the Telegram admin message.
 * Called from the portal dashboard when the admin edits an order.
 * Edits the original order message to reflect the current status/verdict.
 */
export async function syncOrderToTelegram(order: DiagnosticOrder): Promise<void> {
  if (!isConfigured() || !order.adminTelegramMessageId) return;

  // Don't touch messages for orders that are still awaiting custom verdict input
  // — the ask/preview message handles that flow.
  if (order.status === 'awaiting_custom_verdict') return;

  let statusLine = '';

  if (order.status === 'completed') {
    statusLine = '\n\n<b>✅ Order completed</b>\n<i>Customer has been emailed with the PDF conclusion statement.</i>';
  } else if (order.status === 'verdict_repairable' || order.status === 'verdict_unfixable' || order.status === 'verdict_custom' || order.status === 'need_more_info' || order.status === 'booked_in_home') {
    const label = order.status === 'verdict_repairable' ? '✅ Repairable'
      : order.status === 'verdict_unfixable' ? '❌ Unfixable (cracked panel)'
      : order.status === 'verdict_custom' ? '✏️ Custom verdict'
      : order.status === 'need_more_info' ? '📸 Need more photos'
      : '🏠 Book in-home visit';
    statusLine = `\n\n<b>✅ Verdict recorded:</b> ${label}`;
    if (order.verdictNote) {
      statusLine += `\n<b>Verdict:</b> ${escapeHtml(order.verdictNote)}`;
    }
    statusLine += '\n<i>Review on portal: ' + escapeHtml(`${process.env.PUBLIC_BASE_URL || ''}/portal/orders/${order.id}`) + '</i>';
  }

  // If no status line (e.g. order is just "paid"), just rebuild the message with the keyboard.
  const text = buildAdminMessage(order) + statusLine;

  await telegramApi('editMessageText', {
    chat_id: TELEGRAM_DIAGNOSTIC_ADMIN_ID,
    message_id: order.adminTelegramMessageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    // Keep the keyboard if the order isn't finalized yet.
    reply_markup: order.status === 'completed' ? undefined : buildInlineKeyboard(order.id),
  }).catch((err) => console.error('syncOrderToTelegram editMessageText failed:', err));
}

/* ----------------------------- Callback handling ----------------------------- */

/** Parse a callback_data string into an action + order id, or null if invalid. */
export function parseDiagnosticCallback(data: string): { action: DiagnosticAction; orderId: string } | null {
  if (!data.startsWith(CB_PREFIX)) return null;
  const rest = data.slice(CB_PREFIX.length);
  const sepIdx = rest.indexOf(':');
  if (sepIdx === -1) return null;
  const action = rest.slice(0, sepIdx) as DiagnosticAction;
  const orderId = rest.slice(sepIdx + 1);
  if (!orderId || !isValidAction(action)) return null;
  return { action, orderId };
}

function isValidAction(a: string): a is DiagnosticAction {
  return a === 'repairable' || a === 'unfixable' || a === 'need_more' || a === 'book_in_home'
    || a === 'custom' || a === 'cust_confirm' || a === 'cust_rewrite' || a === 'cust_cancel';
}

function actionToStatus(action: DiagnosticAction): DiagnosticStatus {
  switch (action) {
    case 'repairable':
      return 'verdict_repairable';
    case 'unfixable':
      return 'verdict_unfixable';
    case 'need_more':
      return 'need_more_info';
    case 'book_in_home':
      return 'booked_in_home';
    case 'custom':
    case 'cust_confirm':
    case 'cust_rewrite':
    case 'cust_cancel':
      return 'paid'; // placeholder — these are handled separately
  }
}

function actionLabel(action: DiagnosticAction): string {
  switch (action) {
    case 'repairable':
      return '✅ Repairable';
    case 'unfixable':
      return '❌ Unfixable (cracked panel)';
    case 'need_more':
      return '📸 Need more photos';
    case 'book_in_home':
      return '🏠 Book in-home visit';
    case 'custom':
      return '✏️ Custom verdict';
    case 'cust_confirm':
    case 'cust_rewrite':
    case 'cust_cancel':
      return 'Custom verdict';
  }
}

interface CallbackQuery {
  id: string;
  from?: { first_name?: string; id?: number };
  message?: { message_id: number; chat?: { id: number } };
  data?: string;
}

/** Keyboard for the custom verdict preview (confirm/rewrite/cancel). */
function buildCustomPreviewKeyboard(orderId: string) {
  const cb = (action: DiagnosticAction) => `${CB_PREFIX}${action}:${orderId}`;
  return {
    inline_keyboard: [
      [
        { text: '✅ Send to customer', callback_data: cb('cust_confirm') },
      ],
      [
        { text: '✏️ Rewrite', callback_data: cb('cust_rewrite') },
        { text: '❌ Cancel', callback_data: cb('cust_cancel') },
      ],
    ],
  };
}

/**
 * Handle a Telegram callback_query from an inline keyboard tap.
 * Routes to the appropriate handler based on the action.
 */
export async function handleDiagnosticCallback(query: CallbackQuery): Promise<boolean> {
  const parsed = parseDiagnosticCallback(query.data || '');
  if (!parsed) return false;

  const { action, orderId } = parsed;

  // Custom verdict flow actions
  if (action === 'custom') return handleCustomVerdictRequest(query, orderId);
  if (action === 'cust_confirm') return handleCustomConfirm(query, orderId);
  if (action === 'cust_rewrite') return handleCustomRewrite(query, orderId);
  if (action === 'cust_cancel') return handleCustomCancel(query, orderId);

  // Standard verdict actions
  return handleStandardVerdict(query, action, orderId);
}

/** Standard verdict: repairable / unfixable / need_more / book_in_home. */
async function handleStandardVerdict(query: CallbackQuery, action: DiagnosticAction, orderId: string): Promise<boolean> {
  const order = await getDiagnosticOrderById(orderId).catch(() => null);
  if (!order) {
    await answerCallback(query.id, 'Order not found.');
    return false;
  }

  const newStatus = actionToStatus(action);
  const updated = await updateOrderVerdict({ orderId, status: newStatus }).catch(() => null);
  if (!updated) {
    await answerCallback(query.id, 'Failed to update order.');
    return false;
  }

  // No longer email the customer here — the admin generates a PDF and
  // marks the order complete on the portal, which triggers the email.
  const portalUrl = `${process.env.PUBLIC_BASE_URL || ''}/portal/orders/${orderId}`;

  // Edit the original admin message: append the verdict + portal link.
  if (query.message?.chat?.id && query.message.message_id) {
    const verdictLine = `\n\n<b>✅ Verdict recorded:</b> ${actionLabel(action)}\n📋 <a href="${escapeHtml(portalUrl)}">Review & generate PDF on portal</a>`;
    await telegramApi('editMessageText', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: buildAdminMessage(updated) + verdictLine,
      parse_mode: `HTML`,
      disable_web_page_preview: true,
    }).catch((err) => console.error('editMessageText failed:', err));
  }

  await answerCallback(query.id, 'Verdict recorded. Generate PDF on portal.');
  return true;
}

/** Admin tapped "✏️ Custom verdict" — send a reply asking for text. */
async function handleCustomVerdictRequest(query: CallbackQuery, orderId: string): Promise<boolean> {
  const order = await getDiagnosticOrderById(orderId).catch(() => null);
  if (!order) {
    await answerCallback(query.id, 'Order not found.');
    return false;
  }

  if (!query.message?.chat?.id || !query.message.message_id) {
    await answerCallback(query.id, 'Cannot start custom verdict here.');
    return false;
  }

  // If already awaiting custom verdict (e.g. Telegram retried the webhook),
  // don't send a duplicate ask message — just answer the callback.
  if (order.status === 'awaiting_custom_verdict') {
    await answerCallback(query.id, 'Already waiting for your custom verdict text.');
    return true;
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const askText = `✏️ <b>Custom verdict for order #${shortId}</b>\n\nSend a message with your custom verdict text now. I'll capture your next message.`;

  // Send the ask message as a reply to the original order message.
  const data = await telegramApi<{ result: { message_id: number } }>('sendMessage', {
    chat_id: query.message.chat.id,
    text: askText,
    parse_mode: 'HTML',
    reply_parameters: { message_id: query.message.message_id },
  }).catch((err) => {
    console.error('Failed to send custom verdict ask:', err);
    return null;
  });

  if (!data) {
    await answerCallback(query.id, 'Failed to start custom verdict.');
    return false;
  }

  const askMessageId = data.result.message_id;
  await setAwaitingCustomVerdict(orderId, askMessageId).catch((err) =>
    console.error('Failed to set awaiting custom verdict:', err),
  );

  await answerCallback(query.id, 'Waiting for your custom verdict text...');
  return true;
}

/** Admin tapped "✅ Send to customer" — confirm the custom verdict (no email yet). */
async function handleCustomConfirm(query: CallbackQuery, orderId: string): Promise<boolean> {
  const order = await getDiagnosticOrderById(orderId).catch(() => null);
  if (!order || order.status !== 'awaiting_custom_verdict' || !order.customVerdictText) {
    await answerCallback(query.id, 'No pending custom verdict found.');
    return false;
  }

  const updated = await confirmCustomVerdict(orderId).catch(() => null);
  if (!updated) {
    await answerCallback(query.id, 'Failed to confirm verdict.');
    return false;
  }

  // No longer email the customer here — the admin generates a PDF and
  // marks the order complete on the portal, which triggers the email.
  const portalUrl = `${process.env.PUBLIC_BASE_URL || ''}/portal/orders/${orderId}`;

  // Delete the ask/preview message — the verdict lives on the original order message now.
  if (query.message?.chat?.id && query.message.message_id) {
    await telegramApi('deleteMessage', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
    }).catch((err) => console.error('deleteMessage (ask) failed:', err));
  }

  // Edit the ORIGINAL order message to append the verdict + custom text + portal link.
  if (updated.adminTelegramMessageId && query.message?.chat?.id) {
    const verdictLine = `\n\n<b>✅ Verdict recorded:</b> ${actionLabel('custom')}\n<b>Verdict:</b> ${escapeHtml(updated.customVerdictText || '')}\n📋 <a href="${escapeHtml(portalUrl)}">Review & generate PDF on portal</a>`;
    await telegramApi('editMessageText', {
      chat_id: query.message.chat.id,
      message_id: updated.adminTelegramMessageId,
      text: buildAdminMessage(updated) + verdictLine,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }).catch((err) => console.error('editMessageText (original) failed:', err));
  }

  await answerCallback(query.id, 'Verdict recorded. Generate PDF on portal.');
  return true;
}

/** Admin tapped "✏️ Rewrite" — go back to waiting for text. */
async function handleCustomRewrite(query: CallbackQuery, orderId: string): Promise<boolean> {
  const order = await getDiagnosticOrderById(orderId).catch(() => null);
  if (!order || order.status !== 'awaiting_custom_verdict') {
    await answerCallback(query.id, 'No pending custom verdict found.');
    return false;
  }

  // Clear the stored text.
  await setCustomVerdictText(orderId, '').catch(() => null);

  // Edit the ask message back to the waiting state.
  if (query.message?.chat?.id && query.message.message_id) {
    const shortId = order.id.slice(0, 8).toUpperCase();
    const askText = `✏️ <b>Custom verdict for order #${shortId}</b>\n\nSend a message with your custom verdict text now. I'll capture your next message.`;
    await telegramApi('editMessageText', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: askText,
      parse_mode: 'HTML',
    }).catch((err) => console.error('editMessageText failed:', err));
  }

  await answerCallback(query.id, 'Waiting for your new text...');
  return true;
}

/** Admin tapped "❌ Cancel" — revert to paid, clear custom state. */
async function handleCustomCancel(query: CallbackQuery, orderId: string): Promise<boolean> {
  const order = await getDiagnosticOrderById(orderId).catch(() => null);
  if (!order) {
    await answerCallback(query.id, 'Order not found.');
    return false;
  }

  await cancelCustomVerdict(orderId).catch(() => null);

  // Edit the ask message to show cancelled.
  if (query.message?.chat?.id && query.message.message_id) {
    const shortId = order.id.slice(0, 8).toUpperCase();
    await telegramApi('editMessageText', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text: `❌ <b>Custom verdict cancelled for #${shortId}.</b>`,
      parse_mode: 'HTML',
    }).catch((err) => console.error('editMessageText failed:', err));
  }

  await answerCallback(query.id, 'Custom verdict cancelled.');
  return true;
}

/* --------------------------- Message handling --------------------------- */

interface TelegramMessage {
  message_id: number;
  from?: { id: number };
  chat?: { id: number };
  text?: string;
}

/**
 * Handle an incoming text message from the admin.
 * If there's an order awaiting custom verdict input, capture the text,
 * delete the admin's message, and edit the ask message to show a preview
 * with confirm/rewrite/cancel buttons.
 */
export async function handleDiagnosticMessage(msg: TelegramMessage): Promise<boolean> {
  // Only accept messages from the admin.
  if (!msg.from?.id || String(msg.from.id) !== TELEGRAM_DIAGNOSTIC_ADMIN_ID) return false;
  if (!msg.text || !msg.chat?.id) return false;

  // Find the order awaiting custom verdict.
  const order = await getOrderByAwaitingCustomVerdict().catch(() => null);
  if (!order) return false;

  const text = msg.text.trim();
  if (!text) return false;

  // Store the custom verdict text.
  await setCustomVerdictText(order.id, text).catch(() => null);

  // Delete the admin's raw message (best-effort).
  await telegramApi('deleteMessage', {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  }).catch((err) => console.error('deleteMessage failed (admin raw text):', err));

  // Edit the ask message to show the preview + buttons.
  // If the ask message was deleted, fall back to sending a new message.
  const shortId = order.id.slice(0, 8).toUpperCase();
  const previewText = `✏️ <b>Custom verdict for order #${shortId}</b>\n\n<b>Preview:</b>\n${escapeHtml(text)}\n\n<i>Review your verdict above. Send to customer, rewrite, or cancel?</i>`;
  const previewMarkup = buildCustomPreviewKeyboard(order.id);

  if (order.customAskMessageId) {
    const edited = await telegramApi('editMessageText', {
      chat_id: msg.chat.id,
      message_id: order.customAskMessageId,
      text: previewText,
      parse_mode: 'HTML',
      reply_markup: previewMarkup,
    }).then(() => true).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('message to edit not found')) {
        console.log('Ask message not found — sending new preview message.');
        return false;
      }
      console.error('editMessageText (preview) failed:', err);
      return false;
    });

    if (!edited) {
      // Ask message was deleted — send a new message with the preview.
      const data = await telegramApi<{ result: { message_id: number } }>('sendMessage', {
        chat_id: msg.chat.id,
        text: previewText,
        parse_mode: 'HTML',
        reply_markup: previewMarkup,
      }).catch((err) => console.error('sendMessage (preview fallback) failed:', err));

      if (data) {
        // Update the stored ask message id so confirm/rewrite/cancel can edit it.
        await setAwaitingCustomVerdict(order.id, data.result.message_id).catch(() => null);
      }
    }
  } else {
    // No ask message id stored — send a new preview message.
    const data = await telegramApi<{ result: { message_id: number } }>('sendMessage', {
      chat_id: msg.chat.id,
      text: previewText,
      parse_mode: 'HTML',
      reply_markup: previewMarkup,
    }).catch((err) => console.error('sendMessage (preview) failed:', err));

    if (data) {
      await setAwaitingCustomVerdict(order.id, data.result.message_id).catch(() => null);
    }
  }

  return true;
}

async function answerCallback(callbackId: string, text: string): Promise<void> {
  await telegramApi('answerCallbackQuery', { callback_query_id: callbackId, text }).catch((err) => {
    // "query is too old" happens when the admin taps a button on an old notification.
    // The DB update and message edit still succeed — this is not a real error.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('query is too old') || msg.includes('query ID is invalid')) {
      console.log('answerCallbackQuery skipped (stale query):', msg);
    } else {
      console.error('answerCallbackQuery failed:', err);
    }
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
